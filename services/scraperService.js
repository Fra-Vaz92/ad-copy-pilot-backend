const axios = require('axios');
const cheerio = require('cheerio');

exports.scrapeWebsite = async (url) => {
  try {
    const { data } = await axios.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' } 
    });
    const $ = cheerio.load(data);
    
    // Target meaningful text (Headings and paragraphs)
    const text = $('h1, h2, p')
      .map((i, el) => $(el).text())
      .get()
      .join(' ')
      .replace(/\s+/g, ' ') // Clean up whitespace
      .substring(0, 4000);   // Keep it under Gemini's token limit
    
    return text;
  } catch (err) {
    throw new Error("Could not scrape website. Check the URL.");
  }
};