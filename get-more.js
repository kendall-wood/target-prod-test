const puppeteer = require('puppeteer');
const fs = require('fs');

async function main() {
  const existingProducts = JSON.parse(fs.readFileSync('./public/products.json'));
  const existingImages = new Set(existingProducts.map(p => p.image.split('?')[0]));
  
  const products = [
    { name: 'Olay Total Effects Moisturizer', url: 'https://www.target.com/p/olay-total-effects-7-in-1-anti-aging-moisturizer/-/A-12197053' },
    { name: 'Dove DermaSeries Body Lotion', url: 'https://www.target.com/p/dove-dermaseries-dry-skin-relief-body-lotion/-/A-52661653' },
    { name: 'Eucerin Advanced Repair Lotion', url: 'https://www.target.com/p/eucerin-advanced-repair-lotion/-/A-51549086' },
    { name: 'CeraVe SA Cleanser', url: 'https://www.target.com/p/cerave-renewing-sa-cleanser/-/A-15066599' },
    { name: 'Neutrogena Rapid Wrinkle Repair', url: 'https://www.target.com/p/neutrogena-rapid-wrinkle-repair-regenerating-cream/-/A-47086838' },
    { name: 'Olay Regenerist Micro-Sculpting Cream', url: 'https://www.target.com/p/olay-regenerist-micro-sculpting-cream-face-moisturizer/-/A-12197049' },
    { name: 'CeraVe PM Facial Moisturizing Lotion', url: 'https://www.target.com/p/cerave-pm-facial-moisturizing-lotion/-/A-13977971' },
    { name: 'Vanicream Moisturizing Cream', url: 'https://www.target.com/p/vanicream-moisturizing-skin-cream-for-sensitive-skin/-/A-49112119' },
    { name: 'La Roche-Posay Effaclar Cleanser', url: 'https://www.target.com/p/la-roche-posay-effaclar-medicated-gel-cleanser/-/A-14505061' },
    { name: 'Bioderma Sensibio H2O', url: 'https://www.target.com/p/bioderma-sensibio-h2o-micellar-water/-/A-53353606' },
  ];

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const newProducts = [];

  for (let i = 0; i < products.length; i++) {
    console.log(`[${i + 1}/${products.length}] ${products[i].name}`);
    
    try {
      await page.goto(products[i].url, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
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
      
      if (allImages.length > 0) {
        const mainImage = allImages.sort((a, b) => (b.width * b.height) - (a.width * a.height))[0];
        const cleanUrl = mainImage.src.split('?')[0];
        
        if (!existingImages.has(cleanUrl)) {
          const fullUrl = cleanUrl + '?wid=800&hei=800&qlt=80';
          console.log(`  ✅ NEW: ${fullUrl}`);
          newProducts.push({
            name: products[i].name,
            image: fullUrl,
            url: products[i].url
          });
          existingImages.add(cleanUrl);
        } else {
          console.log(`  ⚠️  Duplicate image`);
        }
      } else {
        console.log(`  ❌ No images`);
      }
      
    } catch (error) {
      console.log(`  ❌ Error: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  await browser.close();

  const allProducts = [...existingProducts, ...newProducts];
  fs.writeFileSync('./public/products.json', JSON.stringify(allProducts, null, 2));
  
  console.log(`\n✅ Added ${newProducts.length} new products. Total: ${allProducts.length}`);
}

main();
