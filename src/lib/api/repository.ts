/**
 * Generic Entity Repository for Google Sheets
 * 
 * Provides CRUD operations for any entity type stored in a Google Sheet.
 * Supports optimistic locking with version fields.
 */

import { SheetsAPIClient } from './sheets-client';

export interface Entity {
  id: string;
  createdAt: string;
  updatedAt: string;
  version?: number;
}

export interface Serializer<T extends Entity> {
  /** Convert entity to row array for storage */
  toRow(entity: T): (string | number | boolean | null)[];
  /** Convert row array to entity */
  fromRow(row: (string | number | boolean | null)[], rowIndex: number): T;
  /** Get header column names */
  getHeaders(): string[];
  /** Get the column index for the ID field (0-based) */
  getIdColumnIndex(): number;
  /** Generate a new unique ID */
  generateId(): string;
}

export interface Filter<T> {
  (entity: T): boolean;
}

export interface RepositoryOptions {
  /** Enable optimistic locking (requires version field) */
  optimisticLocking?: boolean;
  /** Auto-generate IDs for new entities */
  autoGenerateId?: boolean;
  /** Cache TTL in milliseconds */
  cacheTtlMs?: number;
}

export interface FindOptions {
  /** Include soft-deleted entities */
  includeDeleted?: boolean;
  /** Limit number of results */
  limit?: number;
  /** Sort comparator function */
  sort?: <T>(a: T, b: T) => number;
}

export class EntityRepository<T extends Entity> {
  private client: SheetsAPIClient;
  private spreadsheetId: string;
  private sheetName: string;
  private serializer: Serializer<T>;
  private options: Required<RepositoryOptions>;
  private headerRowCount: number = 1;

  constructor(
    client: SheetsAPIClient,
    spreadsheetId: string,
    sheetName: string,
    serializer: Serializer<T>,
    options: RepositoryOptions = {}
  ) {
    this.client = client;
    this.spreadsheetId = spreadsheetId;
    this.sheetName = sheetName;
    this.serializer = serializer;
    this.options = {
      optimisticLocking: options.optimisticLocking ?? true,
      autoGenerateId: options.autoGenerateId ?? true,
      cacheTtlMs: options.cacheTtlMs ?? 5 * 60 * 1000, // 5 minutes
    };
  }

  /**
   * Find an entity by its ID.
   */
  async findById(id: string): Promise<T | null> {
    const entities = await this.findAll(entity => entity.id === id);
    return entities[0] || null;
  }

  /**
   * Find all entities, optionally filtered.
   */
  async findAll(filter?: Filter<T>, options: FindOptions = {}): Promise<T[]> {
    const range = `${this.sheetName}!A:Z`;
    const rows = await this.client.readRange(this.spreadsheetId, range);

    // Skip header row
    const dataRows = rows.slice(this.headerRowCount);

    // Convert rows to entities
    let entities: T[] = dataRows
      .map((row, index) => {
        try {
          return this.serializer.fromRow(row, index + this.headerRowCount + 1);
        } catch (error) {
          console.warn(`Failed to parse row ${index + this.headerRowCount + 1}:`, error);
          return null;
        }
      })
      .filter((entity): entity is T => entity !== null);

    // Apply filter if provided
    if (filter) {
      entities = entities.filter(filter);
    }

    // Apply options
    if (!options.includeDeleted) {
      entities = entities.filter(entity => !(entity as unknown as { deletedAt?: string }).deletedAt);
    }

    if (options.sort) {
      entities = entities.sort(options.sort as (a: T, b: T) => number);
    }

    if (options.limit && options.limit > 0) {
      entities = entities.slice(0, options.limit);
    }

    return entities;
  }

  /**
   * Create a new entity.
   */
  async create(
    entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<T> {
    const now = new Date().toISOString();
    const id = this.options.autoGenerateId 
      ? this.serializer.generateId() 
      : (entity as unknown as { id?: string }).id || this.serializer.generateId();

    const newEntity = {
      ...entity,
      id,
      createdAt: now,
      updatedAt: now,
      ...(this.options.optimisticLocking ? { version: 1 } : {}),
    } as T;

    const row = this.serializer.toRow(newEntity);
    await this.client.appendRows(this.spreadsheetId, this.sheetName, [row]);

    return newEntity;
  }

  /**
   * Update an existing entity.
   * Supports optimistic locking if version field is present.
   */
  async update(id: string, updates: Partial<T>): Promise<T> {
    // Find the entity and its row index
    const { entity, rowIndex } = await this.findWithRowIndex(id);
    
    if (!entity) {
      throw new RepositoryError(`Entity with id "${id}" not found`, 'NOT_FOUND');
    }

    // Check optimistic locking
    if (this.options.optimisticLocking) {
      const currentVersion = (entity as unknown as { version?: number }).version || 0;
      const updateVersion = (updates as unknown as { version?: number }).version;
      
      if (updateVersion !== undefined && updateVersion !== currentVersion) {
        throw new RepositoryError(
          `Optimistic lock failed. Expected version ${currentVersion}, got ${updateVersion}`,
          'CONFLICT'
        );
      }
    }

    // Apply updates
    const updatedEntity = {
      ...entity,
      ...updates,
      id: entity.id, // Prevent ID changes
      createdAt: entity.createdAt, // Prevent creation time changes
      updatedAt: new Date().toISOString(),
      ...(this.options.optimisticLocking 
        ? { version: ((entity as unknown as { version?: number }).version || 0) + 1 }
        : {}
      ),
    } as T;

    // Write back to sheet
    const row = this.serializer.toRow(updatedEntity);
    const range = `${this.sheetName}!A${rowIndex}:${this.columnToLetter(row.length)}${rowIndex}`;
    await this.client.writeRange(this.spreadsheetId, range, [row]);

    return updatedEntity;
  }

  /**
   * Delete an entity by ID.
   * Uses soft delete by default (adds deletedAt timestamp).
   * For hard delete, use batchUpdate with deleteDimension request.
   */
  async delete(id: string, hardDelete: boolean = false): Promise<void> {
    if (hardDelete) {
      // Find row index and delete the entire row
      const { rowIndex } = await this.findWithRowIndex(id);
      
      if (!rowIndex) {
        throw new RepositoryError(`Entity with id "${id}" not found`, 'NOT_FOUND');
      }

      // Use batchUpdate to delete the row
      await this.client.batchUpdate(this.spreadsheetId, [
        {
          deleteDimension: {
            range: {
              sheetId: await this.getSheetId(),
              dimension: 'ROWS',
              startIndex: rowIndex - 1, // 0-based
              endIndex: rowIndex,
            },
          },
        },
      ]);
    } else {
      // Soft delete - update with deletedAt timestamp
      await this.update(id, { deletedAt: new Date().toISOString() } as unknown as Partial<T>);
    }
  }

  /**
   * Batch update multiple entities efficiently.
   */
  async batchUpdate(
    updates: Array<{ id: string; changes: Partial<T> }>
  ): Promise<T[]> {
    if (updates.length === 0) return [];

    // Find all entities first
    const entities = await this.findAll();
    const entityMap = new Map(entities.map(e => [e.id, e]));

    const rowUpdates: Array<{ rowIndex: number; entity: T }> = [];
    const results: T[] = [];

    for (const { id, changes } of updates) {
      const entity = entityMap.get(id);
      
      if (!entity) {
        throw new RepositoryError(`Entity with id "${id}" not found`, 'NOT_FOUND');
      }

      // Find row index
      const range = `${this.sheetName}!A:Z`;
      const rows = await this.client.readRange(this.spreadsheetId, range);
      const rowIndex = this.findRowIndexById(rows, id);

      if (rowIndex === -1) {
        throw new RepositoryError(`Entity with id "${id}" not found in sheet`, 'NOT_FOUND');
      }

      const updatedEntity = {
        ...entity,
        ...changes,
        id: entity.id,
        createdAt: entity.createdAt,
        updatedAt: new Date().toISOString(),
      } as T;

      rowUpdates.push({ rowIndex: rowIndex + 1, entity: updatedEntity });
      results.push(updatedEntity);
    }

    // Batch write all updates
    if (rowUpdates.length > 0) {
      const requests = rowUpdates.map(({ rowIndex, entity }) => {
        const row = this.serializer.toRow(entity);
        return {
          updateCells: {
            range: {
              sheetId: 0, // Will be resolved
              startRowIndex: rowIndex - 1,
              endRowIndex: rowIndex,
              startColumnIndex: 0,
              endColumnIndex: row.length,
            },
            rows: [{
              values: row.map(cell => ({
                userEnteredValue: this.cellToValue(cell),
              })),
            }],
            fields: 'userEnteredValue',
          },
        };
      });

      await this.client.batchUpdate(this.spreadsheetId, requests);
    }

    return results;
  }

  /**
   * Ensure headers exist in the sheet.
   */
  async initializeHeaders(): Promise<void> {
    const headers = this.serializer.getHeaders();
    const range = `${this.sheetName}!A1:${this.columnToLetter(headers.length)}1`;
    
    try {
      await this.client.writeRange(this.spreadsheetId, range, [headers]);
    } catch (error) {
      console.warn('Failed to initialize headers:', error);
    }
  }

  /**
   * Find entity with its row index for updates.
   */
  private async findWithRowIndex(
    id: string
  ): Promise<{ entity: T | null; rowIndex: number }> {
    const range = `${this.sheetName}!A:Z`;
    const rows = await this.client.readRange(this.spreadsheetId, range);

    for (let i = this.headerRowCount; i < rows.length; i++) {
      const row = rows[i];
      const rowId = row[this.serializer.getIdColumnIndex()];
      
      if (rowId === id) {
        try {
          const entity = this.serializer.fromRow(row, i + 1);
          return { entity, rowIndex: i + 1 };
        } catch (error) {
          console.warn(`Failed to parse row ${i + 1}:`, error);
        }
      }
    }

    return { entity: null, rowIndex: -1 };
  }

  /**
   * Find row index by ID from cached rows.
   */
  private findRowIndexById(rows: any[][], id: string): number {
    for (let i = this.headerRowCount; i < rows.length; i++) {
      const row = rows[i];
      if (row[this.serializer.getIdColumnIndex()] === id) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Get the sheet ID (for batch operations).
   */
  private async getSheetId(): Promise<number> {
    // Default to 0 for first sheet
    // In a full implementation, this would fetch from spreadsheet metadata
    return 0;
  }

  /**
   * Convert column number to letter (1 -> A, 2 -> B, etc.)
   */
  private columnToLetter(column: number): string {
    let result = '';
    let n = column;
    
    while (n > 0) {
      n--;
      result = String.fromCharCode(65 + (n % 26)) + result;
      n = Math.floor(n / 26);
    }
    
    return result;
  }

  /**
   * Convert cell value to Google Sheets API value format.
   */
  private cellToValue(cell: string | number | boolean | null): { stringValue?: string; numberValue?: number; boolValue?: boolean } {
    if (cell === null || cell === undefined) {
      return { stringValue: '' };
    }
    if (typeof cell === 'boolean') {
      return { boolValue: cell };
    }
    if (typeof cell === 'number') {
      return { numberValue: cell };
    }
    return { stringValue: String(cell) };
  }
}

/**
 * Repository-specific error class.
 */
export class RepositoryError extends Error {
  code: string;
  
  constructor(message: string, code: string) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
  }
}

// Utility type for soft-delete entities
export type SoftDeletable = {
  deletedAt?: string;
};
