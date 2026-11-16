# 🌟 LifeOS – Personal Life Operating System

LifeOS is a modern, full-stack personal operating system designed to manage your finances, special countdowns, tasks, daily habits, and AI assistant in one clean, distraction-free platform.

---

## ✨ Core Modules

1. **💰 Money Balance System** (`/dashboard/money`):
   - Track personal cashflow, net balance in ₹ INR, monthly inflow/income, and outflow/expenses.
   - Real-time transaction ledger with instant deletion and categorization.

2. **⏳ Special Days & Countdowns** (`/dashboard/countdowns`):
   - Live day and hour countdowns to birthdays, exams, trips, anniversaries, and holidays.
   - Milestone hero card highlighting your nearest upcoming special event.

3. **✅ Tasks to Do & Deadlines** (`/dashboard/tasks`):
   - Due dates with live countdown badges (*"X days left"*, *"Due Today"*, *"Overdue"*).
   - One-click task completion with clean strike-through micro-animations.

4. **🔥 Daily Habits Tik List** (`/dashboard/habits`):
   - One-tap daily checkboxes with compounding day streaks.
   - Daily progress meter and completion percentage.

5. **✨ AI Assistant (Powered by Google Gemini)** (`/dashboard/ai-assistant`):
   - Conversational AI to clear doubts, brainstorm creative ideas, and discover practical ways forward.
   - Directly integrated with Google Gemini with one-click copy.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) + React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Plus Jakarta Sans & Outfit Typography
- **Icons & UI**: Lucide React, Framer Motion
- **Database**: SQLite with Prisma ORM
- **AI Engine**: Google Generative AI (`@google/generative-ai`)
- **Authentication**: JWT with HTTP-only cookies (Username & Password only, no emails or phone numbers required)

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/kasimraheeskzr/LifeOS.git
cd LifeOS
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your free Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Setup Database
```bash
npx prisma db push
```

### 5. Run the Application
```bash
npm run dev
# or for production build
npm run build
npm run start
```
Open [http://localhost:3030](http://localhost:3030) in your browser.
