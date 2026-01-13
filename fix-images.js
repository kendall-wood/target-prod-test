const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function getProductImageUrl(browser, url) {
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get the high-quality image URL
    const imageUrl = await page.evaluate(() => {
      // Look for the main product image
      const img = document.querySelector('[data-test="product-image"]') || 
                  document.querySelector('picture img') ||
                  document.querySelector('img[src*="scene7"]');
      
      let src = img?.src || img?.currentSrc || '';
      
      // Clean up the URL and ensure high quality
      if (src && src.includes('scene7')) {
        // Extract the base URL and GUEST ID
        const match = src.match(/(https:\/\/target\.scene7\.com\/is\/image\/Target\/GUEST_[a-f0-9-]+)/i);
        if (match) {
          // Add high quality parameters
          return match[1] + '?wid=800&hei=800&qlt=80';
        }
      }
      
      return src;
    });
    
    await page.close();
    return imageUrl;
  } catch (error) {
    console.error(`  Error: ${error.message}`);
    await page.close();
    return null;
  }
}

async function main() {
  console.log('🔧 Fixing product image URLs...\n');
  
  const products = [
    { name: 'OLLY Calm Mood and Skin Vitamin-Infused Body Wash - Eucalyptus Amber - 17 fl oz', url: 'https://www.target.com/p/olly-calm-mood-and-skin-vitamin-infused-body-wash-eucalyptus-amber-17-fl-oz/-/A-94705063' },
    { name: 'e.l.f. Cosmetics Power Grip Primer - 0.811 fl oz', url: 'https://www.target.com/p/e-l-f-power-grip-primer/-/A-76151665' },
    { name: 'Maybelline Lash Sensational Sky High Mascara - 0.24 fl oz', url: 'https://www.target.com/p/maybelline-lash-sensational-sky-high-mascara/-/A-80165627' },
    { name: 'CeraVe Hydrating Facial Cleanser for Normal to Dry Skin - 16 fl oz', url: 'https://www.target.com/p/cerave-hydrating-facial-cleanser/-/A-13977967' },
    { name: 'Neutrogena Hydro Boost Water Gel Face Moisturizer - 1.7oz', url: 'https://www.target.com/p/neutrogena-hydro-boost-water-gel/-/A-49112116' },
    { name: "L'Oreal Paris Voluminous Original Mascara - 0.26 fl oz", url: 'https://www.target.com/p/l-oreal-paris-voluminous-mascara/-/A-13917233' },
    { name: 'NYX Professional Makeup Epic Ink Liner - 0.03 fl oz', url: 'https://www.target.com/p/nyx-professional-makeup-epic-ink-liner/-/A-52504182' },
    { name: 'e.l.f. Cosmetics Halo Glow Liquid Filter - 1.01 fl oz', url: 'https://www.target.com/p/e-l-f-halo-glow-liquid-filter/-/A-83973001' },
    { name: 'The Ordinary Niacinamide 10% + Zinc 1% - 1 fl oz', url: 'https://www.target.com/p/the-ordinary-niacinamide-10-zinc-1/-/A-75563065' },
    { name: 'Maybelline Fit Me Matte + Poreless Foundation', url: 'https://www.target.com/p/maybelline-fit-me-matte-poreless-foundation/-/A-11537871' },
    { name: 'Cetaphil Daily Facial Cleanser - 16 fl oz', url: 'https://www.target.com/p/cetaphil-daily-facial-cleanser/-/A-13977935' },
    { name: 'CeraVe Moisturizing Cream - 19oz', url: 'https://www.target.com/p/cerave-moisturizing-cream-19oz/-/A-51372909' },
    { name: 'Neutrogena Makeup Remover Cleansing Towelettes', url: 'https://www.target.com/p/neutrogena-makeup-remover-cleansing-towelettes/-/A-13977951' },
    { name: 'e.l.f. Camo Liquid Concealer', url: 'https://www.target.com/p/e-l-f-camo-liquid-concealer/-/A-75572568' },
    { name: 'Maybelline SuperStay Matte Ink Liquid Lipstick', url: 'https://www.target.com/p/maybelline-superstay-matte-ink-liquid-lipstick/-/A-52963541' },
    { name: 'Garnier SkinActive Micellar Cleansing Water', url: 'https://www.target.com/p/garnier-skinactive-micellar-cleansing-water/-/A-49114606' },
    { name: 'Aveeno Daily Moisturizing Lotion', url: 'https://www.target.com/p/aveeno-daily-moisturizing-lotion/-/A-11537908' },
    { name: 'NYX Professional Makeup Butter Gloss', url: 'https://www.target.com/p/nyx-professional-makeup-butter-gloss/-/A-14352862' },
    { name: 'Revlon ColorStay Longwear Makeup Foundation', url: 'https://www.target.com/p/revlon-colorstay-longwear-makeup/-/A-14497580' },
    { name: 'e.l.f. Poreless Putty Primer', url: 'https://www.target.com/p/e-l-f-poreless-putty-primer/-/A-76151667' },
  ];

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const fixedProducts = [];

  for (let i = 0; i < products.length; i++) {
    const { name, url } = products[i];
    console.log(`[${i + 1}/${products.length}] ${name}`);
    
    const imageUrl = await getProductImageUrl(browser, url);
    
    if (imageUrl) {
      console.log(`  ✅ ${imageUrl}`);
      fixedProducts.push({ name, image: imageUrl, url });
    } else {
      console.log(`  ❌ Failed`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await browser.close();

  console.log(`\n\n✅ Fixed ${fixedProducts.length}/${products.length} products`);

  // Save to products.json
  const outputPath = path.join(__dirname, 'public', 'products.json');
  fs.writeFileSync(outputPath, JSON.stringify(fixedProducts, null, 2));
  console.log(`💾 Saved to: ${outputPath}`);
}

main();
