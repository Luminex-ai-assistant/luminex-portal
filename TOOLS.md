# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

## Apartment Hunting Sheet

**Sheet URL:** https://docs.google.com/spreadsheets/d/1qgj7OBu9RYT60jq_ZnG5EFQjKrJ4JonKkmeXwVunHfc/edit
**Location:** `/root/.openclaw/workspace/google-assistant/`
**Scripts:** `read_sheet.py`, `update_sheet.py`, `maintain_sheet.py`

### Review Column Workflow (Column A)

When Tag marks Review Result:
- **"No"** → Copy to **Archive** sheet + **Delete** from Options
- **"Maybe"** → Move row to **bottom** of Options sheet
- **Blank or other** → Leave in place on Options sheet

### Maintenance Tasks

- Calculate missing `Total_CAD` = Rent_CAD + Parking_CAD + Utilities_CAD
- Ensure no empty critical fields (Title, Rent_CAD)
- Run maintenance script when new listings added

### Sheet Tabs

- **Options** — Active listings under consideration
- **Parameters** — Search criteria (max rent, areas, etc.)
- **Archive** — Rejected listings (created 2026-02-14)

### Data Sources

| Source | Status | Script |
|--------|--------|--------|
| Kijiji | Manual entry | — |
| Rentals.ca | Manual entry | — |
| Facebook Marketplace | **Automated** (new) | `fb_marketplace_scraper.py` |
| Property management sites | Manual entry | — |

### Facebook Marketplace Scraper

**Setup:**
```bash
cd /root/.openclaw/workspace/google-assistant
.venv/bin/pip install playwright
.venv/bin/playwright install chromium
```

**Run manually:**
```bash
.venv/bin/python fb_marketplace_scraper.py --limit 20
```

**Note:** Facebook Marketplace requires authentication and has anti-bot measures. The scraper uses Playwright (headless browser) and maintains a deduplication cache in `existing_links.json`.

**Limitations:**
- May require manual login session (headed mode) if Facebook challenges
- Rate limiting applies
- Structure changes may break parser

---

Add whatever helps you do your job. This is your cheat sheet.
