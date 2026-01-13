const puppeteer = require('puppeteer');
const fs = require('fs');

async function main() {
  console.log('🎯 Getting real Target product images (non-headless for debugging)...\n');
  
  const products = [
    { name: 'CeraVe Foaming Facial Cleanser', url: 'https://www.target.com/p/cerave-foaming-facial-cleanser/-/A-13977969' },
    { name: 'CeraVe Hydrating Facial Cleanser', url: 'https://www.target.com/p/cerave-hydrating-facial-cleanser/-/A-13977967' },
    { name: 'Maybelline Sky High Mascara', url: 'https://www.target.com/p/maybelline-lash-sensational-sky-high-mascara/-/A-80165627' },
    { name: 'Neutrogena Hydro Boost', url: 'https://www.target.com/p/neutrogena-hydro-boost-water-gel/-/A-49112116' },
    { name: 'e.l.f. Power Grip Primer', url: 'https://www.target.com/p/e-l-f-power-grip-primer/-/A-76151665' },
    { name: 'Cetaphil Facial Cleanser', url: 'https://www.target.com/p/cetaphil-daily-facial-cleanser/-/A-13977935' },
    { name: 'Maybelline Fit Me Foundation', url: 'https://www.target.com/p/maybelline-fit-me-matte-poreless-foundation/-/A-11537871' },
    { name: 'NYX Epic Ink Liner', url: 'https://www.target.com/p/nyx-professional-makeup-epic-ink-liner/-/A-52504182' },
    { name: 'L\'Oreal Voluminous Mascara', url: 'https://www.target.com/p/l-oreal-paris-voluminous-mascara/-/A-13917233' },
    { name: 'Garnier Micellar Water', url: 'https://www.target.com/p/garnier-skinactive-micellar-cleansing-water/-/A-49114606' },
  ];

  const browser = await puppeteer.launch({
    headless: false, // Show browser so we can see what's happening
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  const results = [];

  for (let i = 0; i < products.length; i++) {
    console.log(`\n[${i + 1}/${products.length}] ${products[i].name}`);
    console.log(`  URL: ${products[i].url}`);
    
    try {
      await page.goto(products[i].url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for images to load
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Get ALL scene7 image URLs from the page
      const allImages = await page.evaluate(() => {
        const imgs = [];
        document.querySelectorAll('img').forEach(img => {
          if (img.src && img.src.includes('scene7.com/is/image/Target/GUEST_')) {
            imgs.push({
              src: img.src,
              width: img.naturalWidth || img.width,
              height: img.naturalHeight || img.height
            });
          }
        });
        return imgs;
      });
      
      console.log(`  Found ${allImages.length} product images`);
      
      if (allImages.length > 0) {
        // Get the largest image
        const mainImage = allImages.sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
        const cleanUrl = mainImage.src.split('?')[0] + '?wid=800&hei=800&qlt=80';
        
        console.log(`  ✅ ${cleanUrl}`);
        results.push({
          name: products[i].name,
          image: cleanUrl,
          url: products[i].url
        });
      } else {
        console.log(`  ❌ No images found`);
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
  }

  console.log(`\n\n✅ Got ${results.length}/${products.length} products\n`);
  
  fs.writeFileSync('./public/products.json', JSON.stringify(results, null, 2));
  console.log('💾 Saved to public/products.json');
  console.log('\nClosing browser in 5 seconds...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));
  await browser.close();
}

main();
