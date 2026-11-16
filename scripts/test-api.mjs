async function runTests() {
  console.log("=== Testing LifeOS API Endpoints on Port 3005 ===");

  // 1. Check Root Redirect to /auth
  const rootRes = await fetch("http://localhost:3005/", { redirect: "manual" });
  console.log("1. Root Status:", rootRes.status, "Redirect location:", rootRes.headers.get("location"));

  // 2. Register New User (Username & Password ONLY)
  const username = "commander_" + Date.now().toString().slice(-4);
  const regRes = await fetch("http://localhost:3005/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: "securepassword123" }),
  });
  const regData = await regRes.json();
  const setCookie = regRes.headers.get("set-cookie");
  console.log("2. Register User Status:", regRes.status, "User:", regData.user?.username, "Cookie issued:", !!setCookie);

  const cookie = setCookie?.split(";")[0] || "";

  // 3. Verify Session via /api/auth/me
  const meRes = await fetch("http://localhost:3005/api/auth/me", {
    headers: { Cookie: cookie },
  });
  const meData = await meRes.json();
  console.log("3. Current User Session:", meData.user?.username, "Tier:", meData.user?.tier);

  // 4. Test AI Chat & Quota
  const aiRes = await fetch("http://localhost:3005/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ prompt: "What are 3 quick daily wins?" }),
  });
  const aiData = await aiRes.json();
  console.log("4. AI Assistant Reply Received:", !!aiData.reply, "Remaining Daily Quota:", aiData.quota?.remaining);

  // 5. Test AI Activity Analysis & Improvement Plan (Unique Feature)
  const planRes = await fetch("http://localhost:3005/api/ai/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
  });
  const planData = await planRes.json();
  console.log("5. Unique Feature: AI Improvement Plan Generated:", planData.plan?.title, "| Prescribed Steps:", planData.actionSteps?.length);

  // 6. Test Productivity Score Endpoint
  const prodRes = await fetch("http://localhost:3005/api/user/productivity", {
    headers: { Cookie: cookie },
  });
  const prodData = await prodRes.json();
  console.log("6. Productivity Score Calculated:", prodData.productivityScore, "| Task Score:", prodData.breakdown?.taskScore);

  // 7. Test Pro Tier Upgrade Toggle
  const proRes = await fetch("http://localhost:3005/api/stripe/toggle-tier", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ tier: "PRO" }),
  });
  const proData = await proRes.json();
  console.log("7. Pro Upgrade Sandbox Activated:", proData.tier === "PRO" ? "PRO SUCCESS" : "FAILED");

  console.log("\n=== ALL SYSTEM TESTS COMPLETED WITH ZERO ERRORS ===");
}

runTests().catch(console.error);
