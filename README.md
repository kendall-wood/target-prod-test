# Target Beauty Product Viewer

A simple web app that displays random beauty products from Target for testing purposes.

## Features

- Displays a random beauty product image from Target
- Shows product name
- "Next" button to load another random product
- Clean, simple UI with Target's red branding

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

The app reads from a JSON file (`public/products.json`) containing 20 curated Target beauty products. Each click of the "Next" button displays a random product from this list.

## Adding More Products

### Option 1: Manual Addition

Edit `public/products.json` and add products in this format:

```json
{
  "name": "Product Name",
  "image": "https://target.scene7.com/is/image/Target/GUEST_xxx",
  "url": "https://www.target.com/p/product-url/-/A-xxxxx"
}
```

### Option 2: Use the Scraper (Advanced)

The included `scraper.js` uses Puppeteer to scrape individual Target product pages:

1. Edit `scraper.js` and add Target product URLs to the `productUrls` array
2. Run: `node scraper.js`
3. The scraper will update `public/products.json`

**Note:** Target's website structure may change, requiring scraper updates.

## Tech Stack

- **Frontend:** Next.js 16 + React + TypeScript
- **Styling:** Tailwind CSS
- **Scraping:** Puppeteer (optional, for gathering products)

## API Endpoint

`GET /api/product` - Returns a random product as JSON

Example response:
```json
{
  "name": "Maybelline Lash Sensational Sky High Mascara",
  "image": "https://target.scene7.com/is/image/Target/GUEST_xxx",
  "url": "https://www.target.com/p/maybelline-lash-sensational-sky-high-mascara/-/A-80165627"
}
```

## Use Case

This tool is designed for testing other products (like BlackScan) that need realistic product images from a major retailer.
