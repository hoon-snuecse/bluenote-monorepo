import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.update({
      where: { email: 'admin@school.edu' },
      data: { password: hashedPassword }
    });
    
    console.log('Admin password reset successfully:', admin.email);
  } catch (error) {
    console.error('Error resetting admin password:', error);
    
    // If admin doesn't exist, create one
    try {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = await prisma.user.create({
        data: {
          email: 'admin@school.edu',
          password: hashedPassword,
          name: '관리자',
          role: 'TEACHER'
        }
      });
      console.log('Admin user created:', admin.email);
    } catch (createError) {
      console.error('Error creating admin user:', createError);
    }
  }
}

resetAdminPassword()
  .catch(console.error)
  .finally(() => prisma.$disconnect());