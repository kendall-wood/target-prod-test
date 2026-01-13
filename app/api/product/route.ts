import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

let browser: any = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  return browser;
}

export async function GET() {
  try {
    console.log('Fetching random product from Target...');
    
    const browser = await getBrowser();
    const page = await browser.newPage();
    
    // Random offset to get different products each time
    const randomOffset = Math.floor(Math.random() * 20) * 24; // 0, 24, 48, 72... up to 456
    const url = `https://www.target.com/c/beauty/-/N-55r1x?Nao=${randomOffset}`;
    
    console.log(`Loading: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get all product links and images from the page
    const products = await page.evaluate(() => {
      const productCards = document.querySelectorAll('[data-test*="product"]');
      const results: any[] = [];
      
      productCards.forEach((card: any) => {
        try {
          const link = card.querySelector('a[href*="/p/"]');
          const img = card.querySelector('img[src*="scene7"]');
          
          if (link && img && img.src && img.src.includes('GUEST_')) {
            results.push({
              url: link.href,
              image: img.src.split('?')[0] + '?wid=800&hei=800&qlt=80',
              name: img.alt || 'Target Product'
            });
          }
        } catch (e) {
          // Skip
        }
      });
      
      return results;
    });
    
    await page.close();
    
    console.log(`Found ${products.length} products`);
    
    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found' }, { status: 500 });
    }
    
    // Pick a random product from the page
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    
    console.log(`Returning: ${randomProduct.name}`);
    return NextResponse.json(randomProduct);
    
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
