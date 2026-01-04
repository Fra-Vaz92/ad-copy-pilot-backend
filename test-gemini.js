require('dotenv').config();

async function testGeminiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log("\n=== GEMINI API KEY TEST ===");
  console.log("API Key found:", apiKey ? "✓ YES" : "✗ NO");
  
  if (apiKey) {
    console.log("First 10 chars:", apiKey.substring(0, 10) + "...");
    console.log("Full length:", apiKey.length, "characters");
  } else {
    console.error("\n❌ GEMINI_API_KEY not found!");
    console.error("Make sure .env file exists in /backend folder");
    return;
  }
  
  try {
    console.log("\nTesting API connection...");
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    console.log("Response Status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("\n❌ API Request Failed:");
      console.error(errorText);
      
      if (response.status === 400) {
        console.error("\n💡 Possible issues:");
        console.error("   - Invalid API key format");
        console.error("   - API key has been revoked or disabled");
        console.error("   - API key restrictions (IP, HTTP referrers, etc.)");
        console.error("\n🔧 Solutions:");
        console.error("   1. Go to: https://aistudio.google.com/app/apikey");
        console.error("   2. Create a NEW API key");
        console.error("   3. Make sure it has NO restrictions");
        console.error("   4. Replace the key in your .env file");
      }
      return;
    }
    
    const data = await response.json();
    
    console.log("\n✅ API Key is VALID!\n");
    console.log("=== MODELS THAT SUPPORT generateContent ===");
    
    const workingModels = [];
    
    if (data.models) {
      data.models.forEach(model => {
        const canGenerate = model.supportedGenerationMethods?.includes('generateContent');
        if (canGenerate) {
          console.log(`✓ ${model.name}`);
          workingModels.push(model.name);
        }
      });
      
      if (workingModels.length > 0) {
        console.log("\n💡 COPY THIS LINE TO YOUR geminiService.js:");
        console.log(`\n   model: "${workingModels[0]}"\n`);
      } else {
        console.log("\n⚠️  No models support generateContent");
      }
    } else {
      console.log("⚠️  No models found in response");
    }
    
    console.log("==========================================\n");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\nFull error:", error);
  }
}

testGeminiKey();