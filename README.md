# Restaurant Management System (RMS) mobile app

A modern, scalable Restaurant Management System built with **React Native (Expo)**, **Supabase**, and **Prisma**.

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/)

## 🛠️ Tech Stack

- **Frontend**: React Native, Expo, Expo Router
- **Backend/DB**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **Language**: TypeScript

## 📦 Installation & Setup

Follow these steps to set up the project locally.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd rms
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```
Fill in your Supabase credentials in `.env`:
- `DATABASE_URL`: Connection String (Transaction Pooler / Port 6543)
- `DIRECT_URL`: Connection String (Session / Port 5432) **(Crucial for migrations)**
- `EXPO_PUBLIC_SUPABASE_URL`: Project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Project Anon Key

### 4. Database Setup (Supabase & Prisma)

We use **Prisma** to manage the database schema.

**Step A: Sync Schema to Database**
This command pushes the Prisma schema to your Supabase database.
```bash
npx prisma db push
```

**Step B: Generate Prisma Client**
Generate the type-safe client for use in the app.
```bash
npx prisma generate
```

**Step C: Seed Initial Data**
Populate the database with sample data (Restaurant, Menu, Ingredients).
```bash
npx tsx prisma/seed.ts
```

### 5. Start the Application

```bash
npx expo start
```
- Press `a` for Android Emulator
- Press `i` for iOS Simulator
- Scan the QR code with Expo Go on your phone

## 🛡️ Database Security (RLS)

This project uses **Row Level Security (RLS)** in Supabase.
Prisma does **not** automatically apply RLS policies.

**Action Required**:
1. Open `supabase_rls_policies.sql` in this project.
2. Copy the content.
3. Go to your [Supabase Dashboard](https://supabase.com/dashboard) -> **SQL Editor**.
4. Paste and Run the script to secure your tables.

## 🐛 Troubleshooting

**"Prisma Client has no exported member..."**
Run `npx prisma generate` to rebuild the client.

**"Database connection error" during migration**
Ensure `DIRECT_URL` in `.env` is set to the port 5432 connection string.

**App shows empty data**
Check if you ran the seed script (`npx tsx prisma/seed.ts`).
