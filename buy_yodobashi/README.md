# Auto Form Filler

Automatically fills forms on logoform.jp using Puppeteer/Playwright.

## Features
- Reads data from CSV file
- Uploads multiple files
- Fills text fields
- Handles radio buttons
- Submits forms and returns to start

## Setup
1. Install Node.js (v14+)
2. Clone this repository
3. Install dependencies:
   ```bash
   npm install
   ```
4. Place your CSV file in `data/` folder
5. Place assets (images) in `assets/` folder

## Configuration
Edit `config.js` to:
- Set target URL
- Configure browser behavior
- Adjust timing delays

## Usage
Run with Puppeteer:
```bash
node indexPlaywright.js
```

Or with Playwright:
```bash
node playwright-version.js
```

## File Structure
```
data/       - CSV data files
assets/     - Files to upload
config.js   - Configuration
indexPlaywright.js    - Main Puppeteer script
playwright-version.js - Playwright alternative
```