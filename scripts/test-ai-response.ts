import { generateAiResponse } from "../lib/ai-engine";

async function test() {
  console.log("Calling generateAiResponse with user question...");
  const prompt = "Can you suggest 3 creative startup ideas for college students? Answer concisely.";
  const response = await generateAiResponse(prompt, "cmwj821ex0005uvf1ar4qtjdi");
  console.log("\n=== REAL AI RESPONSE RECEIVED ===");
  console.log(response);
  console.log("=================================");
}

test().catch(console.error);
