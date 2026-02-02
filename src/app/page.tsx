import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    // Redirect to appropriate dashboard based on role
    const redirectMap = {
        ADMIN: '/admin',
        TEACHER: '/teacher',
        STUDENT: '/student',
    };

    redirect(redirectMap[session.user.role]);
}
