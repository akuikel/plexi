/**
 * Database seed script
 * Run with: npm run db:seed
 */
import { prisma } from './client';
import bcrypt from 'bcrypt';

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
  });

  if (!adminExists) {
    const adminPasswordHash = await bcrypt.hash('admin123', 12);

    const admin = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@example.com',
        passwordHash: adminPasswordHash,
        name: 'System Administrator',
        role: 'ADMIN',
      },
    });

    console.log('✅ Created admin user:', admin.email);
  } else {
    console.log('👤 Admin user already exists');
  }

  // Create sample users
  const sampleUsers = [
    {
      username: 'john_doe',
      email: 'john.doe@example.com',
      name: 'John Doe',
      role: 'USER' as const,
    },
    {
      username: 'jane_smith',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      role: 'USER' as const,
    },
  ];

  for (const userData of sampleUsers) {
    const userExists = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!userExists) {
      const passwordHash = await bcrypt.hash('password123', 12);

      const user = await prisma.user.create({
        data: {
          ...userData,
          passwordHash,
        },
      });

      console.log('✅ Created user:', user.email);
    } else {
      console.log('👤 User already exists:', userData.email);
    }
  }

  // Create sample calls with different statuses
  const john = await prisma.user.findUnique({
    where: { email: 'john.doe@example.com' },
    select: { id: true },
  });

  const sampleCalls = [
    {
      title: 'Amazon Customer Service',
      date: new Date(),
      duration: '0:00',
      summary: 'Checking refund status for recent order',
      status: 'ACTIVE' as const,
      transcript: [],
      createdBy: john?.id,
    },
    {
      title: 'Dentist Appointment Scheduling',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      scheduledStartTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      duration: '0:00',
      summary: 'Schedule routine dental checkup',
      status: 'SCHEDULED' as const,
      transcript: [],
      createdBy: john?.id,
    },
    {
      title: 'Walmart Product Check',
      date: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      duration: '3:15',
      summary: 'iPhone 15 Pro Max in stock, reserved for pickup at store #2847',
      status: 'COMPLETED' as const,
      transcript: [
        { time: '00:00', speaker: 'Persa AI', text: "Hello, I'm calling to check product availability." },
        { time: '00:15', speaker: 'Store Associate', text: 'Sure, what product are you looking for?' },
        { time: '00:20', speaker: 'Persa AI', text: 'iPhone 15 Pro Max, any color.' },
        { time: '00:35', speaker: 'Store Associate', text: 'We have it in stock. Would you like me to reserve one?' },
        { time: '00:45', speaker: 'Persa AI', text: 'Yes, please reserve one for pickup.' },
        { time: '03:00', speaker: 'Store Associate', text: 'Done! Your item is reserved for 24 hours.' },
      ],
      createdBy: john?.id,
    },
    {
      title: 'Bill Negotiation',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      duration: '8:42',
      summary: 'Successfully reduced internet bill by $25/month',
      status: 'COMPLETED' as const,
      transcript: [
        {
          time: '00:00',
          speaker: 'Persa AI',
          text: "Hello, I'd like to discuss my current plan and see if there are any better options.",
        },
        { time: '00:20', speaker: 'Customer Service', text: 'I can help you with that. Let me review your account.' },
        {
          time: '02:15',
          speaker: 'Customer Service',
          text: 'I can offer you our promotional rate which saves $25 per month.',
        },
        { time: '08:30', speaker: 'Persa AI', text: 'Perfect, please apply that to my account.' },
      ],
      createdBy: john?.id,
    },
    {
      title: 'Insurance Inquiry Draft',
      date: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      duration: '0:00',
      summary: 'Draft call to inquire about policy coverage',
      status: 'DRAFT' as const,
      transcript: [],
      createdBy: john?.id,
    },
    {
      title: 'Doctor Follow-up',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      scheduledStartTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      duration: '0:00',
      summary: 'Follow-up appointment scheduling',
      status: 'SCHEDULED' as const,
      transcript: [],
      createdBy: john?.id,
    },
  ];

  for (const callData of sampleCalls) {
    const existingCall = await prisma.call.findFirst({
      where: { title: callData.title },
    });

    if (!existingCall) {
      const call = await prisma.call.create({ data: callData });
      console.log('✅ Created call:', call.title, `(${call.status})`);
    } else {
      console.log('📞 Call already exists:', callData.title);
    }
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
