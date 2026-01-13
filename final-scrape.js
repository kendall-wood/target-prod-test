const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeProduct(page, url, name) {
  try {
    console.log(`  Loading page...`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get all image URLs from the page
    const imageData = await page.evaluate(() => {
      const images = [];
      document.querySelectorAll('img').forEach(img => {
        if (img.src && img.src.includes('scene7') && !img.src.includes('wid=48')) {
          images.push({
            src: img.src,
            width: img.width,
            height: img.height,
            alt: img.alt || ''
          });
        }
      });
      return images;
    });
    
    console.log(`  Found ${imageData.length} scene7 images`);
    
    if (imageData.length > 0) {
      // Get the largest image (likely the product image)
      const mainImage = imageData.reduce((prev, current) => 
        (current.width * current.height) > (prev.width * prev.height) ? current : prev
      );
      
      // Extract clean URL and add parameters
      let cleanUrl = mainImage.src.split('?')[0];
      if (cleanUrl.includes('/is/image/Target/GUEST_') || cleanUrl.includes('/is/content/Target/GUEST_')) {
        cleanUrl = cleanUrl + '?wid=800&hei=800&qlt=80';
        console.log(`  ✅ ${cleanUrl}`);
        return { name, image: cleanUrl, url };
      }
    }
    
    console.log(`  ❌ No valid image found`);
    return null;
    
  } catch (error) {
    console.log(`  ❌ Error: ${error.message}`);
    return null;
  }
}

async function main() {
  const products = [
    { name: 'CeraVe Foaming Facial Cleanser', url: 'https://www.target.com/p/cerave-foaming-facial-cleanser/-/A-13977969' },
    { name: 'CeraVe Hydrating Facial Cleanser', url: 'https://www.target.com/p/cerave-hydrating-facial-cleanser/-/A-13977967' },
    { name: 'CeraVe Moisturizing Cream', url: 'https://www.target.com/p/cerave-moisturizing-cream-19oz/-/A-51372909' },
    { name: 'Maybelline Sky High Mascara', url: 'https://www.target.com/p/maybelline-lash-sensational-sky-high-mascara/-/A-80165627' },
    { name: 'Maybelline Fit Me Matte + Poreless Foundation', url: 'https://www.target.com/p/maybelline-fit-me-matte-poreless-foundation/-/A-11537871' },
    { name: 'Maybelline SuperStay Matte Ink', url: 'https://www.target.com/p/maybelline-superstay-matte-ink-liquid-lipstick/-/A-52963541' },
    { name: 'e.l.f. Halo Glow Liquid Filter', url: 'https://www.target.com/p/e-l-f-halo-glow-liquid-filter/-/A-83973001' },
    { name: 'e.l.f. Power Grip Primer', url: 'https://www.target.com/p/e-l-f-power-grip-primer/-/A-76151665' },
    { name: 'e.l.f. Camo Concealer', url: 'https://www.target.com/p/e-l-f-camo-liquid-concealer/-/A-75572568' },
    { name: 'e.l.f. Poreless Putty Primer', url: 'https://www.target.com/p/e-l-f-poreless-putty-primer/-/A-76151667' },
    { name: 'Neutrogena Hydro Boost Water Gel', url: 'https://www.target.com/p/neutrogena-hydro-boost-water-gel/-/A-49112116' },
    { name: 'Neutrogena Makeup Remover Wipes', url: 'https://www.target.com/p/neutrogena-makeup-remover-cleansing-towelettes/-/A-13977951' },
    { name: 'Cetaphil Daily Facial Cleanser', url: 'https://www.target.com/p/cetaphil-daily-facial-cleanser/-/A-13977935' },
    { name: 'Garnier SkinActive Micellar Water', url: 'https://www.target.com/p/garnier-skinactive-micellar-cleansing-water/-/A-49114606' },
    { name: 'NYX Professional Makeup Epic Ink Liner', url: 'https://www.target.com/p/nyx-professional-makeup-epic-ink-liner/-/A-52504182' },
    { name: 'NYX Butter Gloss', url: 'https://www.target.com/p/nyx-professional-makeup-butter-gloss/-/A-14352862' },
    { name: 'Revlon ColorStay Longwear Foundation', url: 'https://www.target.com/p/revlon-colorstay-longwear-makeup/-/A-14497580' },
    { name: 'Aveeno Daily Moisturizing Lotion', url: 'https://www.target.com/p/aveeno-daily-moisturizing-lotion/-/A-11537908' },
    { name: 'L\'Oreal Paris Voluminous Mascara', url: 'https://www.target.com/p/l-oreal-paris-voluminous-mascara/-/A-13917233' },
    { name: 'The Ordinary Niacinamide 10% + Zinc 1%', url: 'https://www.target.com/p/the-ordinary-niacinamide-10-zinc-1/-/A-75563065' },
  ];

  console.log('🎯 Final scrape - getting correct product images\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const results = [];

  for (let i = 0; i < products.length; i++) {
    console.log(`\n[${i + 1}/${products.length}] ${products[i].name}`);
    const result = await scrapeProduct(page, products[i].url, products[i].name);
    if (result) {
      results.push(result);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  await browser.close();

  console.log(`\n\n✅ Successfully scraped ${results.length}/${products.length} products\n`);

  fs.writeFileSync('./public/products.json', JSON.stringify(results, null, 2));
  console.log('💾 Saved to public/products.json');
}

main();
