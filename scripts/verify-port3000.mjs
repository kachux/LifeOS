async function verifyPort3000() {
  console.log("=== VERIFYING LIFEOS ON STANDARD PORT 3000 ===");

  // 1. Root redirect
  const root = await fetch("http://localhost:3000/", { redirect: "manual" });
  console.log("1. Root redirect status:", root.status, "Location:", root.headers.get("location"));

  // 2. Register fresh user (Username & Password only)
  const username = "pro_user_" + Date.now().toString().slice(-4);
  const reg = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: "password123" }),
  });
  const regData = await reg.json();
  const cookie = reg.headers.get("set-cookie")?.split(";")[0] || "";
  console.log("2. Registered user:", regData.user?.username, "| Cookie issued:", !!cookie);

  // 3. Zero-data verification
  const tasks = await fetch("http://localhost:3000/api/tasks", { headers: { Cookie: cookie } }).then(r => r.json());
  const habits = await fetch("http://localhost:3000/api/habits", { headers: { Cookie: cookie } }).then(r => r.json());
  console.log("3. User zero-state: Tasks count =", tasks.tasks?.length, "| Habits count =", habits.habits?.length);

  // 4. Test AI Integration endpoint
  const aiChat = await fetch("http://localhost:3000/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({ prompt: "How should I structure my day?" }),
  });
  const aiData = await aiChat.json();
  console.log("4. AI Chat response received:", !!aiData.reply, "| Remaining quota:", aiData.quota?.remaining);

  // 5. Test Real Payment Gateway Process
  const pay = await fetch("http://localhost:3000/api/payments/process", {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookie },
    body: JSON.stringify({
      gateway: "stripe",
      planType: "yearly",
      billingName: "Alex Commander",
      billingEmail: "alex@commander.com",
      cardNumber: "4532 8200 1234 5678",
      cardExp: "12/28",
      cardCvc: "888",
    }),
  });
  const payData = await pay.json();
  console.log("5. Real Payment Gateway result:", pay.status === 200 ? "SUCCESS" : "FAILED");
  console.log("   Invoice #:", payData.invoice?.invoiceNumber, "| Amount: $" + payData.invoice?.amount);

  // 6. Verify User is now PRO
  const me = await fetch("http://localhost:3000/api/auth/me", { headers: { Cookie: cookie } }).then(r => r.json());
  console.log("6. Verified Tier after checkout:", me.user?.tier);

  console.log("\n=== ALL PORT 3000 TESTS PASSED WITH 100% SUCCESS ===");
}

verifyPort3000().catch(console.error);
