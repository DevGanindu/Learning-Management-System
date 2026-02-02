# ⚠️ REQUIRED: Complete Supabase Setup

## You Need to Complete These Steps:

### 1. Create a Supabase Project

1. Go to **https://supabase.com** and sign in
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: NextLMS
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Select your closest region
4. Click **"Create new project"** (takes ~2 minutes)

### 2. Get Your Connection Strings

Once your project is created:

1. Go to **Settings** (left sidebar) → **Database**
2. Scroll to **Connection string** section

#### A. Get Connection Pooling URL (for DATABASE_URL)

- Under **"Connection Pooling"** section
- Click **URI** tab
- Make sure mode is set to **Transaction**
- Copy the connection string (looks like this):
  ```
  postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
  ```
- **IMPORTANT**: Replace `[YOUR-PASSWORD]` with the database password you created

#### B. Get Direct Connection URL (for DIRECT_URL)

- Under **"Connection String"** section  
- Click **URI** tab
- Make sure mode is set to **Session**
- Copy the connection string (looks like this):
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
  ```
- **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your database password

### 3. Update .env.local File

Open the file `.env.local` in your project and replace the placeholder URLs:

```env
# Replace these two lines with your actual Supabase connection strings:
DATABASE_URL="your-pooling-url-here"
DIRECT_URL="your-direct-url-here"

# Keep the rest as is:
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
GRACE_PERIOD_DAYS=14
MAX_FILE_SIZE_MB=10
```

**Example with real values:**
```env
DATABASE_URL="postgresql://postgres.abcdefgh:MySecretPass123@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:MySecretPass123@db.abcdefgh.supabase.co:5432/postgres"
```

### 4. Push Database Schema to Supabase

Run these commands in order:

```bash
# Push the database schema to Supabase
npx prisma db push

# Seed the database with demo data
npx prisma db seed

# Start the development server
npm run dev
```

### 5. Verify in Supabase Dashboard

1. Go back to your Supabase project
2. Click **Table Editor** (left sidebar)
3. You should see these tables:
   - ✅ users
   - ✅ students
   - ✅ grades
   - ✅ materials
   - ✅ payments

4. Click on any table to see the seeded data

### 6. Test the Application

1. Open http://localhost:3000
2. Login with:
   - **Admin**: admin@lms.com / admin123
   - **Student**: alice@student.com / student123

---

## Troubleshooting

**Error: "Can't reach database server"**
- Check that you replaced `[YOUR-PASSWORD]` with your actual password
- Verify the connection strings are copied correctly (no extra spaces)
- Make sure your Supabase project is fully initialized

**Error: "P1001: Can't connect"**
- Check your internet connection
- Verify the region in the URL matches your Supabase project region
- Make sure you're using the correct URLs (pooling for DATABASE_URL, direct for DIRECT_URL)

**Tables not appearing in Supabase**
- Make sure you ran `npx prisma db push` successfully
- Check the terminal for any error messages
- Verify your DIRECT_URL is correct

---

## What Changed?

✅ **Prisma schema** → Now uses PostgreSQL instead of SQLite
✅ **Environment variables** → Configured for Supabase connection pooling
✅ **Database** → All data now stored in Supabase (cloud PostgreSQL)
✅ **Documentation** → Updated README.md with Supabase instructions

## Benefits of Supabase

🚀 **Production-ready**: PostgreSQL is enterprise-grade
🌐 **Cloud-hosted**: Access from anywhere
📊 **Dashboard**: Visual table editor and SQL query runner
🔒 **Secure**: Built-in authentication and Row Level Security
💾 **Backups**: Automatic daily backups
📈 **Scalable**: Grows with your application

---

**Need Help?** Check the detailed guide in `SUPABASE_SETUP.md`
