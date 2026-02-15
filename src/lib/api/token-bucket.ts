/**
 * Token Bucket Rate Limiter
 * 
 * Google Sheets API Limits:
 * - 300 read requests per minute per user
 * - 60 write requests per minute per user
 * 
 * This implementation provides smooth rate limiting with burst capacity.
 */

export interface TokenBucketConfig {
  /** Maximum number of tokens in the bucket */
  capacity: number;
  /** Tokens added per minute */
  refillRate: number;
}

export interface TokenBucketState {
  tokens: number;
  lastRefill: number;
}

export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private readonly capacity: number;
  private readonly refillRate: number; // tokens per millisecond
  // Lock mechanism for async operations (reserved for future use)
  // private readonly lock: Promise<void> = Promise.resolve();

  constructor(config: TokenBucketConfig) {
    this.capacity = config.capacity;
    this.refillRate = config.refillRate / (60 * 1000); // Convert to tokens per ms
    this.tokens = config.capacity;
    this.lastRefill = Date.now();
  }

  /**
   * Attempt to consume tokens from the bucket.
   * Returns true if tokens were consumed, false otherwise.
   */
  consume(count: number = 1): boolean {
    this.refill();
    
    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }
    
    return false;
  }

  /**
   * Consume tokens, waiting if necessary.
   * Returns a promise that resolves when tokens are available.
   */
  async consumeAsync(count: number = 1): Promise<void> {
    while (!this.consume(count)) {
      const waitTime = this.estimateWaitTime(count);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Refill the bucket based on elapsed time.
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;
    
    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Estimate the wait time needed to consume the specified number of tokens.
   */
  estimateWaitTime(count: number = 1): number {
    this.refill();
    
    if (this.tokens >= count) {
      return 0;
    }
    
    const tokensNeeded = count - this.tokens;
    return Math.ceil(tokensNeeded / this.refillRate);
  }

  /**
   * Get current token count (for debugging/monitoring).
   */
  getTokenCount(): number {
    this.refill();
    return Math.floor(this.tokens);
  }

  /**
   * Get bucket state for persistence.
   */
  getState(): TokenBucketState {
    return {
      tokens: this.tokens,
      lastRefill: this.lastRefill,
    };
  }

  /**
   * Restore bucket state (e.g., from sessionStorage).
   */
  restoreState(state: TokenBucketState): void {
    this.tokens = Math.min(this.capacity, state.tokens);
    this.lastRefill = state.lastRefill;
    this.refill(); // Apply elapsed time since state was saved
  }
}

// Pre-configured buckets for Google Sheets API
export const readBucket = new TokenBucket({
  capacity: 300,
  refillRate: 300, // 300 per minute
});

export const writeBucket = new TokenBucket({
  capacity: 60,
  refillRate: 60, // 60 per minute
});
