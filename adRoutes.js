const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const { scrapeWebsite } = require('../services/scraperService');
const { generateEmbeddings, generateAdCopy } = require('../services/geminiService');

/**
 * @route   POST /api/ads/generate
 */
router.post('/generate', async (req, res) => {
    const { url, persona, platform } = req.body;

    if (!url || !persona || !platform) {
        return res.status(400).json({ 
            success: false, 
            message: "Missing required fields: url, persona, and platform are mandatory." 
        });
    }

    try {
        console.log(`--- Processing Request for: ${url} [Platform: ${platform}] ---`);

        let brand = await Brand.findOne({ url });

        if (!brand) {
            console.log("Status: Brand not found in DB. Initiating Scraper...");
            
            const rawContent = await scrapeWebsite(url);
            
            console.log("Status: Generating AI Embeddings...");
            // Correctly calling the function we imported at the top
            const vector = await generateEmbeddings(rawContent);

            brand = await Brand.create({
                url: url,
                description: rawContent,
                embedding: vector
            });
            console.log("Status: Brand successfully cached in MongoDB.");
        } else {
            console.log("Status: Found cached brand data. Skipping Scraper.");
        }

        console.log(`Status: Generating ${platform} Ad Copy...`);
        // Passing the cached description to the generator
        const ads = await generateAdCopy(brand.description, persona, platform);

        res.status(200).json({
            success: true,
            brand_id: brand._id,
            platform: platform,
            persona: persona,
            ads: ads 
        });

    } catch (error) {
        console.error("CRITICAL ERROR in adRoutes:", error.message);
        res.status(500).json({ 
            success: false, 
            message: "An error occurred during ad generation.",
            error: error.message 
        });
    }
});

module.exports = router;