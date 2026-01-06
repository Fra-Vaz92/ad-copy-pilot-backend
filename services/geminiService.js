const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Helper: Exponential Backoff Retry
 */
const callWithRetry = async (fn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if ((error.message?.includes("429") || error.status === 429) && i < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
        continue;
      }
      throw error;
    }
  }
};

exports.generateEmbeddings = async (text) => {
  return await callWithRetry(async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    const result = await model.embedContent(text);
    return result.embedding.values; 
  });
};

exports.generateAdCopy = async (context, persona, platform) => {
  return await callWithRetry(async () => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Using the newest and fastest Gemini model
    const model = genAI.getGenerativeModel({ 
      model: "models/gemini-2.5-flash"
    });

    const userPrompt = `
System: You are an expert media buyer and copywriter for ${platform} and you are really focused on ad performance measuring main KPIs like lowering ad and campaign CPA, increase ROAS, lowering CPM and CPC as well as ad spend efficiency.
Context: ${context}
Target Persona: ${persona}
Requirement: Return a JSON array of 3 ads with 'headline' and 'body'.
No markdown, no preamble. Return only valid JSON.

Example format:
[
  {"headline": "Example Headline", "body": "Example body text"},
  {"headline": "Another Headline", "body": "Another body text"},
  {"headline": "Third Headline", "body": "Third body text"}
]
`;

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Raw AI Response:", text); // Debug log
    
    // Clean JSON from potential AI markdown
    const cleanJson = text.replace(/```(?:json)?\n?|```/g, "").trim();
    return JSON.parse(cleanJson);
  });
};