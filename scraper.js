const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeProductPage(browser, url, productName) {
  const page = await browser.newPage();
  try {
    console.log(`  Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Scroll to trigger lazy-loaded images
    await page.evaluate(() => window.scrollTo(0, 500));
    
    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const product = await page.evaluate(() => {
      // Try multiple selectors for the product image
      let imgEl = document.querySelector('[data-test="product-image"]');
      if (!imgEl) imgEl = document.querySelector('picture img');
      if (!imgEl) imgEl = document.querySelector('img[src*="scene7"]');
      if (!imgEl) {
        // Get all images and find the largest one (likely product image)
        const allImgs = Array.from(document.querySelectorAll('img'));
        imgEl = allImgs.find(img => 
          img.src.includes('scene7') && 
          !img.src.includes('icon') && 
          !img.src.includes('wid=48') && // Skip tiny thumbnails
          img.width > 100
        );
      }
      
      let image = imgEl?.src || imgEl?.currentSrc || '';
      
      // If we got a small thumbnail, try to get a larger version
      if (image && image.includes('wid=48')) {
        // Look for a larger image in the srcset or picture element
        const pictureEl = document.querySelector('picture');
        if (pictureEl) {
          const sources = pictureEl.querySelectorAll('source');
          for (const source of sources) {
            const srcset = source.srcset;
            if (srcset && !srcset.includes('wid=48')) {
              image = srcset.split(',')[0].trim().split(' ')[0];
              break;
            }
          }
        }
      }
      
      // Try to get product name from page
      const titleEl = document.querySelector('[data-test="product-title"]') || 
                      document.querySelector('h1');
      const name = titleEl?.textContent?.trim() || '';
      
      return { name, image, url: window.location.href };
    });
    
    await page.close();
    return product.image ? { ...product, name: productName || product.name } : null;
  } catch (error) {
    console.error(`  ❌ Error: ${error.message}`);
    await page.close();
    return null;
  }
}

async function scrapeTargetProducts() {
  console.log('🚀 Starting Target beauty products scraper...\n');
  
  // Target product URLs with names
  const productsToScrape = [
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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  try {
    const products = [];
    
    for (let i = 0; i < productsToScrape.length; i++) {
      const { name, url } = productsToScrape[i];
      console.log(`\n📦 [${i + 1}/${productsToScrape.length}] ${name}`);
      
      const product = await scrapeProductPage(browser, url, name);
      
      if (product && product.image) {
        console.log(`  ✅ Got image: ${product.image.substring(0, 80)}...`);
        products.push(product);
      } else {
        console.log(`  ⚠️  No image found`);
      }
      
      // Be nice to Target's servers
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    console.log(`\n\n🎉 Successfully scraped ${products.length}/${productsToScrape.length} products`);

    if (products.length > 0) {
      // Save to JSON file
      const outputPath = path.join(__dirname, 'public', 'products.json');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, JSON.stringify(products, null, 2));
      
      console.log(`💾 Saved to: ${outputPath}`);
    } else {
      console.log('❌ No products were scraped successfully');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await browser.close();
  }
}

scrapeTargetProducts();
