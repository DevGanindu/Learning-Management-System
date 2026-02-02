# NextLMS - Learning Management System

A comprehensive Learning Management System built with **Next.js 15**, featuring role-based access control for Admins, Teachers, and Students across grades 6-11.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Supabase account ([sign up free](https://supabase.com))

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Set up Supabase (see SUPABASE_SETUP.md for detailed guide)
# - Create project at supabase.com
# - Get connection strings from Settings → Database
# - Update .env.local with your credentials

# 3. Initialize database
npx prisma generate
npx prisma db push
npx prisma db seed

# 4. Start development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🔐 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@lms.com | admin123 |
| **Teacher** | teacher@lms.com | teacher123 |

> **Note:** Students must register through the registration page and be approved by an admin before they can login.

## ✨ Key Features

### 🎯 Admin Portal
- Student management (add, edit, view)
- Payment tracking and account locking
- Dashboard with real-time statistics
- Grade assignment (6-11)

### 👨‍🏫 Teacher Portal
- Upload learning materials (PDF, DOC, YouTube, Online Classes)
- Assign materials to specific grades
- View upload statistics

### 👨‍🎓 Student Portal
- View grade-specific materials only
- Download documents and access video links
- Check payment history and status
- Locked page when payment overdue

## 🔒 Security Features

- ✅ NextAuth.js authentication with JWT sessions
- ✅ Role-based route protection via middleware
- ✅ Automatic payment status checking
- ✅ Account locking for unpaid fees (14-day grace period)
- ✅ Bcrypt password hashing
- ✅ SQL injection prevention (Prisma ORM)

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Validation**: Zod
- **Icons**: Lucide React
- **Date Utils**: date-fns

## 📁 Project Structure

```
NextLMS/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── admin/        # Admin dashboard & features
│   │   ├── teacher/      # Teacher dashboard & materials
│   │   ├── student/      # Student dashboard & materials
│   │   └── login/        # Authentication page
│   ├── components/       # Reusable React components
│   ├── lib/              # Utilities, auth, validations
│   └── middleware.ts     # Auth & payment checking
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Demo data
└── public/uploads/       # File storage
```

## 📚 Database Schema

- **User**: Authentication (email, password, role)
- **Student**: Profile (grade, status, locked flag)
- **Grade**: Levels 6-11
- **Material**: Learning resources (files, links)
- **Payment**: Monthly fee tracking

## 🎨 Design Highlights

- Modern, responsive UI with Tailwind CSS
- Gradient backgrounds and smooth animations
- Color-coded status indicators
- Sticky navigation with sidebar
- Professional dashboard layouts

## 🧪 Testing

1. **Login** as any role using demo credentials
2. **Admin**: View students list, check statistics
3. **Teacher**: See dashboards and materials
4. **Student**: View grade-specific materials and payment history

## 🚧 Next Steps

Planned features for future development:
- Payment management interface
- Student add/edit forms  
- Material upload with file validation
- Email notifications
- Export payment reports
- Multi-grade material assignment

## 📄 License

This project is for educational purposes.

## 👤 Author

Built as a demonstration of modern full-stack development practices.

---

**Note**: This application uses Supabase PostgreSQL. For production deployment, ensure proper environment variables and enable Row Level Security (RLS) policies in Supabase.
