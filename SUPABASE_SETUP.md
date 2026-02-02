# Supabase Database Configuration

## Step 1: Create a Supabase Project

1. Go to https://supabase.com
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - Project Name: `NextLMS`
   - Database Password: (Generate a strong password - save this!)
   - Region: Choose closest to you
   - Click "Create new project"

## Step 2: Get Your Database Connection Strings

1. In your Supabase dashboard, go to **Settings** → **Database**
2. Scroll down to **Connection string** section
3. You'll need TWO connection strings:

### A. Connection Pooling URL (for DATABASE_URL)
- Select **URI** tab under "Connection Pooling"
- Mode: **Transaction**
- Copy the URL, it looks like:
  ```
  postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
  ```
- Replace `[YOUR-PASSWORD]` with your actual database password

### B. Direct Connection URL (for DIRECT_URL)
- Select **URI** tab under "Connection String"
- Mode: **Session**
- Copy the URL, it looks like:
  ```
  postgresql://postgres.xxxxx:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
  ```
- Replace `[YOUR-PASSWORD]` with your actual database password

## Step 3: Update Your .env.local File

Open `.env.local` and replace the DATABASE_URL and DIRECT_URL values:

```env
# Supabase Database URLs
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# Application
GRACE_PERIOD_DAYS=14
MAX_FILE_SIZE_MB=10
```

## Step 4: Push Schema and Seed Database

After updating .env.local, run these commands:

```bash
# Generate Prisma client
npx prisma generate

# Push the schema to Supabase
npx prisma db push

# Seed the database with demo data
npx prisma db seed
```

## Step 5: Restart Development Server

```bash
# Stop the current server (Ctrl+C if running)
npm run dev
```

## Verification

- ✅ Check Supabase dashboard → **Table Editor** to see your tables
- ✅ Login to the app with demo credentials to verify everything works
- ✅ All data should be stored in Supabase PostgreSQL now

## Important Notes

- **Connection Pooling** (DATABASE_URL): Used by your application for queries
- **Direct Connection** (DIRECT_URL): Used by Prisma for migrations and schema changes
- **Security**: Never commit .env.local to Git (already in .gitignore)
- **Production**: Generate a new NEXTAUTH_SECRET for production deployment

## Helpful Supabase Features

You can now use Supabase dashboard to:
- View all tables and data in **Table Editor**
- Run SQL queries in **SQL Editor**
- Set up Row Level Security (RLS) policies
- Enable real-time subscriptions
- Add database backups
- Monitor performance
