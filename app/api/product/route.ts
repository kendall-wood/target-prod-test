import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    console.log('Fetching random product from Target...');
    
    // Read products from JSON file
    const filePath = path.join(process.cwd(), 'public', 'products.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const products = JSON.parse(fileContents);
    
    if (products.length === 0) {
      return NextResponse.json({ error: 'No products found' }, { status: 500 });
    }
    
    // Pick a random product
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    
    console.log(`Returning: ${randomProduct.name}`);
    return NextResponse.json(randomProduct);
    
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
