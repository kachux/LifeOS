async function main() {
  console.log("=== VERIFYING REAL GOOGLE GEMINI CHAT IN PRODUCTION ===");
  const baseUrl = "http://localhost:3030";

  // 1. Register fresh user
  const username = `gemini_tester_${Date.now().toString().slice(-4)}`;
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password: "testPassword123",
    }),
  });

  const cookieHeader = regRes.headers.get("set-cookie");
  const cookie = cookieHeader ? cookieHeader.split(";")[0] : "";
  console.log("Registered:", username, "Status:", regRes.status, "Cookie obtained:", !!cookie);

  // 2. Query Me
  const meRes = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { cookie },
  });
  const meData = await meRes.json();
  console.log("User in session:", meData.user?.username);

  // 3. Question 1
  console.log("\n--- Sending Prompt 1 to Gemini ---");
  const chat1 = await fetch(`${baseUrl}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie,
    },
    body: JSON.stringify({
      prompt: "What are 3 unique ways to stay focused while preparing for competitive exams? Give a short bulleted response.",
    }),
  });
  const data1 = await chat1.json();
  console.log("Status:", chat1.status);
  console.log("Gemini Response 1:\n", data1.reply);

  // 4. Question 2
  console.log("\n--- Sending Prompt 2 to Gemini ---");
  const chat2 = await fetch(`${baseUrl}/api/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie,
    },
    body: JSON.stringify({
      prompt: "Can you write a 2-line motivational quote for an entrepreneur building an app?",
    }),
  });
  const data2 = await chat2.json();
  console.log("Status:", chat2.status);
  console.log("Gemini Response 2:\n", data2.reply);

  // Assertions
  if (!data1.reply || !data2.reply) {
    throw new Error("Missing reply from Gemini API");
  }
  if (data1.reply === data2.reply) {
    throw new Error("Replies are identical! Must be dynamic AI.");
  }
  console.log("\n>>> ALL TESTS PASSED: GOOGLE GEMINI IS FULLY LIVE & RESPONDING DYNAMICALLY! <<<");
}

main().catch(e => {
  console.error("Test failed:", e);
  process.exit(1);
});
