async function debugRegister() {
  const regRes = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "test_commander", password: "password123" }),
  });
  console.log("Status:", regRes.status);
  const text = await regRes.text();
  console.log("Body:", text);
}

debugRegister().catch(console.error);
