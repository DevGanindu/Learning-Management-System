import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: "ADMIN" | "TEACHER" | "STUDENT"
            studentId?: string
            gradeId?: string
        } & DefaultSession["user"]
    }

    interface User {
        role: "ADMIN" | "TEACHER" | "STUDENT"
        studentId?: string
        gradeId?: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        role: "ADMIN" | "TEACHER" | "STUDENT"
        studentId?: string
        gradeId?: string
    }
}
