async function testQuotaLimit() {
  console.log("=== Testing Free Tier Quota Exhaustion & 429 Trigger ===");
  const username = "limit_test_" + Date.now().toString().slice(-4);
  const regRes = await fetch("http://localhost:3005/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: "password123" }),
  });
  const cookie = regRes.headers.get("set-cookie")?.split(";")[0] || "";

  // Exhaust quota by setting dailyAiCount to 10 via toggle-tier
  await fetch("http://localhost:3005/api/stripe/toggle-tier", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ tier: "FREE" }),
  });

  // Now make an AI request - it should return 429 Limit Exceeded!
  const res = await fetch("http://localhost:3005/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ prompt: "Hello AI" }),
  });

  const data = await res.json();
  console.log("Limit Check Status:", res.status);
  console.log("Limit Reached Flag:", data.limitReached);
  console.log("Reset Hours:", data.resetHours, "Reset Minutes:", data.resetMinutes);
  console.log("User Notification:", data.message);
}

testQuotaLimit().catch(console.error);
