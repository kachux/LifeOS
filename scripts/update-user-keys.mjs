import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || "";
  const res = await prisma.user.updateMany({
    data: {
      userApiKey: apiKey,
      aiProvider: "gemini"
    }
  });
  console.log("Updated users count:", res.count);

  const users = await prisma.user.findMany({
    select: { id: true, username: true, userApiKey: true, aiProvider: true }
  });
  console.log("Users in DB:", users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
