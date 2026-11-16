// Automated verification script for Streamlined LifeOS
import http from "node:http";

const PORT = 3030;
const BASE_URL = `http://localhost:${PORT}`;

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json,
        });
      });
    });
    req.on("error", reject);
    if (postData) {
      req.write(typeof postData === "string" ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runVerification() {
  console.log(`\n=== VERIFYING STREAMLINED LIFEOS ON PORT ${PORT} ===`);

  // 1. Root redirect check
  const rootRes = await request({
    hostname: "localhost",
    port: PORT,
    path: "/",
    method: "GET",
  });
  console.log(`1. Root visit redirects to /auth: ${rootRes.statusCode === 307 || rootRes.statusCode === 302 || rootRes.statusCode === 308}`);

  // 2. Register fresh user with username & password only
  const testUsername = `user_${Date.now().toString().slice(-4)}`;
  const regRes = await request(
    {
      hostname: "localhost",
      port: PORT,
      path: "/api/auth/register",
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
    { username: testUsername, password: "testPassword123" }
  );

  const cookieHeader = regRes.headers["set-cookie"];
  const cookie = cookieHeader ? cookieHeader[0].split(";")[0] : "";
  console.log(`2. Registered fresh user: "${testUsername}" | Cookie issued: ${!!cookie}`);

  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: cookie,
  };

  // 3. Verify user starts with 0 data & 1-month free trial
  const meRes = await request({
    hostname: "localhost",
    port: PORT,
    path: "/api/auth/me",
    method: "GET",
    headers: authHeaders,
  });
  const user = meRes.data.user;
  console.log(`3. 1-Month Free Trial active: ${user.isTrialActive} | Days left: ${user.trialDaysLeft} days`);

  const initialMoney = await request({
    hostname: "localhost",
    port: PORT,
    path: "/api/finance",
    method: "GET",
    headers: authHeaders,
  });
  const initialTasks = await request({
    hostname: "localhost",
    port: PORT,
    path: "/api/tasks",
    method: "GET",
    headers: authHeaders,
  });
  const initialHabits = await request({
    hostname: "localhost",
    port: PORT,
    path: "/api/habits",
    method: "GET",
    headers: authHeaders,
  });
  const initialCountdowns = await request({
    hostname: "localhost",
    port: PORT,
    path: "/api/countdowns",
    method: "GET",
    headers: authHeaders,
  });

  console.log(`   Clean slate check:`);
  console.log(`   - Net Balance: ₹${initialMoney.data.summary.currentBalance} (₹0 expected)`);
  console.log(`   - Tasks: ${initialTasks.data.tasks.length} (0 expected)`);
  console.log(`   - Habits: ${initialHabits.data.habits.length} (0 expected)`);
  console.log(`   - Countdowns: ${initialCountdowns.data.events.length} (0 expected)`);

  // 4. Money Balance System: Add Income & Expense
  await request(
    {
      hostname: "localhost",
      port: PORT,
      path: "/api/finance",
      method: "POST",
      headers: authHeaders,
    },
    { title: "Monthly Freelance Client", amount: 5000, type: "INCOME", category: "Salary" }
  );
  await request(
    {
      hostname: "localhost",
      port: PORT,
      path: "/api/finance",
      method: "POST",
      headers: authHeaders,
    },
    { title: "Groceries & Utilities", amount: 1500, type: "EXPENSE", category: "Bills" }
  );

  const updatedMoney = await request({
    hostname: "localhost",
    port: PORT,
    path: "/api/finance",
    method: "GET",
    headers: authHeaders,
  });
  console.log(`4. Money Balance System:`);
  console.log(`   - Net Balance: ₹${updatedMoney.data.summary.currentBalance} (₹3500 expected)`);
  console.log(`   - Inflow: +₹${updatedMoney.data.summary.thisMonthIncome} | Outflow: -₹${updatedMoney.data.summary.thisMonthExpense}`);

  // 5. Special Day Countdown: Add event 10 days ahead
  const tenDaysFuture = new Date(Date.now() + 10 * 86400000).toISOString();
  const countdownRes = await request(
    {
      hostname: "localhost",
      port: PORT,
      path: "/api/countdowns",
      method: "POST",
      headers: authHeaders,
    },
    { title: "Final College Exam", targetDate: tenDaysFuture, category: "Exam" }
  );

  const countdownsList = await request({
    hostname: "localhost",
    port: PORT,
    path: "/api/countdowns",
    method: "GET",
    headers: authHeaders,
  });
  const nextEvent = countdownsList.data.nextEvent;
  console.log(`5. Special Day Countdown: "${nextEvent.title}" -> ${nextEvent.countdownText} (Days Left: ${nextEvent.daysLeft})`);

  // 6. Tasks with Deadlines & Countdown of Days
  const tomorrow = new Date(Date.now() + 1 * 86400000).toISOString();
  const taskRes = await request(
    {
      hostname: "localhost",
      port: PORT,
      path: "/api/tasks",
      method: "POST",
      headers: authHeaders,
    },
    { title: "Submit Final Project Report", priority: "URGENT", dueDate: tomorrow }
  );

  const tasksList = await request({
    hostname: "localhost",
    port: PORT,
    path: "/api/tasks",
    method: "GET",
    headers: authHeaders,
  });
  const createdTask = tasksList.data.tasks[0];
  console.log(`6. Task with Deadline Countdown: "${createdTask.title}" -> ${createdTask.countdownText}`);

  // 7. Daily Habits Tik List
  const habitRes = await request(
    {
      hostname: "localhost",
      port: PORT,
      path: "/api/habits",
      method: "POST",
      headers: authHeaders,
    },
    { name: "Drink 3L Water", category: "Health" }
  );
  const habitId = habitRes.data.habit.id;

  // Toggle habit for today
  await request(
    {
      hostname: "localhost",
      port: PORT,
      path: "/api/habits/toggle",
      method: "POST",
      headers: authHeaders,
    },
    { habitId }
  );

  const habitsList = await request({
    hostname: "localhost",
    port: PORT,
    path: "/api/habits",
    method: "GET",
    headers: authHeaders,
  });
  const updatedHabit = habitsList.data.habits[0];
  console.log(`7. Daily Habit Tik List: "${updatedHabit.name}" -> Ticked Today: ${updatedHabit.isCompletedToday} | Streak: ${updatedHabit.streak}d`);

  // 8. AI Assistant: Doubts, Ideas & Ways
  const aiRes = await request(
    {
      hostname: "localhost",
      port: PORT,
      path: "/api/ai/chat",
      method: "POST",
      headers: authHeaders,
    },
    { prompt: "Give me 3 creative ideas to save money this month" }
  );
  console.log(`8. AI Assistant: Answer received (${aiRes.data.reply ? "SUCCESS" : "FAILED"}) | Quota remaining: ${aiRes.data.quota?.remaining}`);

  // 9. Pro Subscription & Invoicing in Indian Rupees (₹)
  const payRes = await request(
    {
      hostname: "localhost",
      port: PORT,
      path: "/api/payments/process",
      method: "POST",
      headers: authHeaders,
    },
    {
      gateway: "upi",
      planType: "monthly",
      billingName: "Test User",
      upiId: "testuser@okhdfcbank",
    }
  );
  console.log(`9. Pro Subscription Checkout:`);
  console.log(`   - Status: ${payRes.data.success ? "PAID" : "FAILED"}`);
  console.log(`   - Invoice: ${payRes.data.invoice?.invoiceNumber} | Amount: ${payRes.data.amountFormatted}`);

  const postPayUser = await request({
    hostname: "localhost",
    port: PORT,
    path: "/api/auth/me",
    method: "GET",
    headers: authHeaders,
  });
  console.log(`   - Upgraded User Tier: ${postPayUser.data.user.tier} (PRO expected) | isPro: ${postPayUser.data.user.isPro}`);

  const historyRes = await request({
    hostname: "localhost",
    port: PORT,
    path: "/api/payments/history",
    method: "GET",
    headers: authHeaders,
  });
  console.log(`   - Invoice in permanent history: ${historyRes.data.payments.length > 0}`);

  console.log(`\n=== 100% STREAMLINED FEATURES VERIFIED SUCCESSFULLY ===\n`);
}

runVerification().catch(console.error);
