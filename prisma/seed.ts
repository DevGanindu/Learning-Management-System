import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create Grades with different monthly fees
    const grades = await Promise.all([
        prisma.grade.upsert({
            where: { level: 6 },
            update: {},
            create: { level: 6, name: 'Grade 6', monthlyFee: 4000 },
        }),
        prisma.grade.upsert({
            where: { level: 7 },
            update: {},
            create: { level: 7, name: 'Grade 7', monthlyFee: 4500 },
        }),
        prisma.grade.upsert({
            where: { level: 8 },
            update: {},
            create: { level: 8, name: 'Grade 8', monthlyFee: 5000 },
        }),
        prisma.grade.upsert({
            where: { level: 9 },
            update: {},
            create: { level: 9, name: 'Grade 9', monthlyFee: 5500 },
        }),
        prisma.grade.upsert({
            where: { level: 10 },
            update: {},
            create: { level: 10, name: 'Grade 10', monthlyFee: 6000 },
        }),
        prisma.grade.upsert({
            where: { level: 11 },
            update: {},
            create: { level: 11, name: 'Grade 11', monthlyFee: 6500 },
        }),
    ]);
    console.log('✅ Created grades with monthly fees');

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@lms.com' },
        update: {},
        create: {
            email: 'admin@lms.com',
            password: adminPassword,
            name: 'System Administrator',
            role: 'ADMIN',
        },
    });
    console.log('✅ Created admin user (admin@lms.com / admin123)');

    // Create Teacher
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const teacher = await prisma.user.upsert({
        where: { email: 'teacher@lms.com' },
        update: {},
        create: {
            email: 'teacher@lms.com',
            password: teacherPassword,
            name: 'John Teacher',
            role: 'TEACHER',
        },
    });
    console.log('✅ Created teacher user (teacher@lms.com / teacher123)');

    // Note: No demo students are created
    // Students must register through the registration page and be approved by admin

    // Create Sample Materials
    const sampleMaterials = [
        {
            title: 'Introduction to Mathematics',
            description: 'Basic mathematics concepts for Grade 6',
            type: 'PDF' as const,
            gradeLevel: 6,
            fileUrl: '/uploads/sample-math-grade6.pdf'
        },
        {
            title: 'Science Fundamentals',
            description: 'Introduction to scientific methods',
            type: 'PDF' as const,
            gradeLevel: 7,
            fileUrl: '/uploads/sample-science-grade7.pdf'
        },
        {
            title: 'Math Tutorial - Algebra',
            description: 'Video tutorial on algebra basics',
            type: 'YOUTUBE' as const,
            gradeLevel: 8,
            link: 'https://www.youtube.com/watch?v=NybHckSEQBI'
        },
        {
            title: 'Online Class - Physics',
            description: 'Weekly physics class session',
            type: 'ONLINE_CLASS' as const,
            gradeLevel: 9,
            link: 'https://meet.google.com/abc-defg-hij'
        },
        {
            title: 'Chemistry Notes',
            description: 'Comprehensive chemistry notes',
            type: 'DOC' as const,
            gradeLevel: 10,
            fileUrl: '/uploads/sample-chemistry-grade10.docx'
        },
        {
            title: 'Advanced Mathematics',
            description: 'Calculus and advanced topics',
            type: 'PDF' as const,
            gradeLevel: 11,
            fileUrl: '/uploads/sample-math-grade11.pdf'
        },
    ];

    for (const material of sampleMaterials) {
        const grade = grades.find(g => g.level === material.gradeLevel);
        if (!grade) continue;

        await prisma.material.create({
            data: {
                title: material.title,
                description: material.description,
                type: material.type,
                fileUrl: material.fileUrl,
                link: material.link,
                gradeId: grade.id,
                uploadedById: teacher.id,
            },
        });
    }
    console.log('✅ Created sample materials');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@lms.com / admin123');
    console.log('   Teacher: teacher@lms.com / teacher123');
    console.log('\n📝 Note: Students must register and be approved by admin to login');
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
