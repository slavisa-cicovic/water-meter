import { AccountRole, PrismaClient, StaffRole, VerificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

type ConsumerSeed = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  householdSize: number;
  verificationStatus: VerificationStatus;
  password: string;
};

type StaffSeed = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  staffRole: StaffRole;
  verificationStatus: VerificationStatus;
  password: string;
};

type AdminSeed = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const reviewerId = 'seed-admin';

const admins: AdminSeed[] = [
  {
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@example.com',
    password: 'password123',
  },
  {
    firstName: 'Ops',
    lastName: 'Lead',
    email: 'ops.lead@example.com',
    password: 'password123',
  },
];

const consumers: ConsumerSeed[] = [
  {
    firstName: 'Ana',
    lastName: 'Jovanovic',
    email: 'ana.jovanovic@example.com',
    phone: '+381601111111',
    address: 'Kralja Petra 12, Beograd',
    householdSize: 3,
    verificationStatus: 'verified',
    password: 'password123',
  },
  {
    firstName: 'Marko',
    lastName: 'Petrovic',
    email: 'marko.petrovic@example.com',
    phone: '+381621234567',
    address: 'Cara Dusana 5, Novi Sad',
    householdSize: 2,
    verificationStatus: 'pending',
    password: 'password123',
  },
  {
    firstName: 'Ivana',
    lastName: 'Nikolic',
    email: 'ivana.nikolic@example.com',
    phone: '+381641234567',
    address: 'Bulevar Oslobodjenja 88, Novi Sad',
    householdSize: 4,
    verificationStatus: 'rejected',
    password: 'password123',
  },
  {
    firstName: 'Petra',
    lastName: 'Milosavljevic',
    email: 'petra.milosavljevic@example.com',
    phone: '+381631234567',
    address: 'Nemanjina 2, Beograd',
    householdSize: 1,
    verificationStatus: 'verified',
    password: 'password123',
  },
  {
    firstName: 'Stefan',
    lastName: 'Radovanovic',
    email: 'stefan.radovanovic@example.com',
    phone: '+381651234567',
    address: 'Sindjeliceva 14, Nis',
    householdSize: 5,
    verificationStatus: 'pending',
    password: 'password123',
  },
];

const staff: StaffSeed[] = [
  {
    firstName: 'Jelena',
    lastName: 'Stankovic',
    email: 'jelena.stankovic@example.com',
    phone: '+381601234000',
    address: 'Makedonska 1, Beograd',
    staffRole: 'field',
    verificationStatus: 'verified',
    password: 'password123',
  },
  {
    firstName: 'Nikola',
    lastName: 'Savic',
    email: 'nikola.savic@example.com',
    phone: '+381641234000',
    address: 'Balkanska 20, Beograd',
    staffRole: 'backoffice',
    verificationStatus: 'pending',
    password: 'password123',
  },
  {
    firstName: 'Tamara',
    lastName: 'Matic',
    email: 'tamara.matic@example.com',
    phone: '+381631234000',
    address: 'Cara Lazara 7, Kragujevac',
    staffRole: 'field',
    verificationStatus: 'rejected',
    password: 'password123',
  },
  {
    firstName: 'Uros',
    lastName: 'Zivkovic',
    email: 'uros.zivkovic@example.com',
    phone: '+381651234000',
    address: 'Zmaj Jovina 10, Novi Sad',
    staffRole: 'backoffice',
    verificationStatus: 'verified',
    password: 'password123',
  },
];

async function clearData() {
  await prisma.verificationLog.deleteMany({});
  await prisma.meterConsumer.deleteMany({});
  await prisma.meter.deleteMany({});
  await prisma.consumerProfile.deleteMany({});
  await prisma.staffProfile.deleteMany({});
  await prisma.account.deleteMany({});
}

async function seedConsumers() {
  for (const c of consumers) {
    const account = await prisma.account.create({
      data: {
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        address: c.address,
        passwordHash: c.password, // intentionally plain text per current choice
        role: AccountRole.consumer,
        verificationStatus: c.verificationStatus,
        consumerProfile: {
          create: {
            householdSize: c.householdSize,
          },
        },
        verificationLogs:
          c.verificationStatus !== 'pending'
            ? {
                create: {
                  reviewerId,
                  status: c.verificationStatus,
                  note: `Seeded as ${c.verificationStatus}`,
                },
              }
            : undefined,
      },
    });
    console.log(`Seeded consumer ${account.email} (${account.verificationStatus})`);
  }
}

async function seedAdmins() {
  for (const a of admins) {
    const account = await prisma.account.create({
      data: {
        firstName: a.firstName,
        lastName: a.lastName,
        email: a.email,
        passwordHash: a.password,
        role: AccountRole.admin,
        address: 'HQ',
        verificationStatus: 'verified',
        verificationLogs: {
          create: {
            reviewerId,
            status: 'verified',
            note: 'Seeded admin',
          },
        },
      },
    });
    console.log(`Seeded admin ${account.email}`);
  }
}

async function seedBulkConsumers() {
  const bulk: ConsumerSeed[] = [];
  for (let i = 1; i <= 50; i += 1) {
    bulk.push({
      firstName: `Consumer${i}`,
      lastName: 'Test',
      email: `consumer${i}@example.com`,
      address: `Test Address ${i}`,
      householdSize: (i % 5) + 1,
      verificationStatus: i % 3 === 0 ? 'pending' : 'verified',
      password: 'password123',
    });
  }

  for (const c of bulk) {
    await prisma.account.create({
      data: {
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        address: c.address,
        passwordHash: c.password,
        role: AccountRole.consumer,
        verificationStatus: c.verificationStatus,
        consumerProfile: {
          create: {
            householdSize: c.householdSize,
          },
        },
        verificationLogs:
          c.verificationStatus !== 'pending'
            ? {
                create: {
                  reviewerId,
                  status: c.verificationStatus,
                  note: `Seeded as ${c.verificationStatus}`,
                },
              }
            : undefined,
      },
    });
  }
  console.log('Seeded 50 bulk consumers');
}

async function seedExtraStaffField(count = 3) {
  const extra: StaffSeed[] = [];
  for (let i = 1; i <= count; i += 1) {
    extra.push({
      firstName: `Field${i}`,
      lastName: 'Worker',
      email: `field${i}@example.com`,
      address: `Field Address ${i}`,
      staffRole: 'field',
      verificationStatus: i % 2 === 0 ? 'verified' : 'pending',
      password: 'password123',
    });
  }

  for (const s of extra) {
    await prisma.account.create({
      data: {
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        address: s.address,
        passwordHash: s.password,
        role: 'staff_field',
        verificationStatus: s.verificationStatus,
        staffProfile: {
          create: {
            staffRole: s.staffRole,
          },
        },
        verificationLogs:
          s.verificationStatus !== 'pending'
            ? {
                create: {
                  reviewerId,
                  status: s.verificationStatus,
                  note: `Seeded as ${s.verificationStatus}`,
                },
              }
            : undefined,
      },
    });
  }
  console.log(`Seeded ${count} extra staff_field`);
}

async function seedStaff() {
  for (const s of staff) {
    const account = await prisma.account.create({
      data: {
        firstName: s.firstName,
        lastName: s.lastName,
        email: s.email,
        phone: s.phone,
        address: s.address,
        passwordHash: s.password, // intentionally plain text per current choice
        role: s.staffRole === 'backoffice' ? ('staff_backoffice' as AccountRole) : ('staff_field' as AccountRole),
        verificationStatus: s.verificationStatus,
        staffProfile: {
          create: {
            staffRole: s.staffRole,
          },
        },
        verificationLogs:
          s.verificationStatus !== 'pending'
            ? {
                create: {
                  reviewerId,
                  status: s.verificationStatus,
                  note: `Seeded as ${s.verificationStatus}`,
                },
              }
            : undefined,
      },
    });
    console.log(`Seeded staff ${account.email} (${account.verificationStatus})`);
  }
}

const pad2 = (value: number) => String(value).padStart(2, '0');

async function seedMeters() {
  const consumerAccounts = await prisma.account.findMany({
    where: { role: AccountRole.consumer },
    orderBy: { email: 'asc' },
    take: 55,
    select: { id: true, email: true, address: true },
  });

  if (consumerAccounts.length < 55) {
    throw new Error(`Expected at least 55 consumer accounts, got ${consumerAccounts.length}`);
  }

  // 40 meters, linked 1:1 to first 40 consumers
  for (let i = 0; i < 40; i += 1) {
    const consumer = consumerAccounts[i];
    const meter = await prisma.meter.create({
      data: {
        serialNumber: `SN-${pad2(i + 1)}-${consumer.id.slice(0, 6)}`,
        groupCode: pad2(i + 1),
        address: consumer.address,
        status: 'active',
        type: i % 3 === 0 ? 'automatic' : 'mechanical',
      },
    });

    await prisma.meterConsumer.create({
      data: { meterId: meter.id, accountId: consumer.id },
    });
  }
  console.log('Seeded 40 meters (1:1) linked to first 40 consumers');

  // 1 shared meter linked to remaining 15 consumers (building scenario)
  const sharedAddress = 'Shared Building 1, Entrance A';
  const sharedMeter = await prisma.meter.create({
    data: {
      serialNumber: `SN-99-SHARED`,
      groupCode: '99',
      address: sharedAddress,
      status: 'active',
      type: 'mechanical',
    },
  });

  for (let i = 40; i < 55; i += 1) {
    await prisma.account.update({
      where: { id: consumerAccounts[i].id },
      data: { address: sharedAddress },
    });
    await prisma.meterConsumer.create({
      data: { meterId: sharedMeter.id, accountId: consumerAccounts[i].id },
    });
  }
  console.log('Seeded 1 shared meter linked to remaining 15 consumers');

  // 1 extra meter for a consumer that already has a meter (one consumer has two meters)
  const extraConsumer = consumerAccounts[0];
  const extraMeter = await prisma.meter.create({
    data: {
      serialNumber: `SN-41-EXTRA-${extraConsumer.id.slice(0, 6)}`,
      groupCode: '41',
      address: extraConsumer.address,
      status: 'active',
      type: 'automatic',
    },
  });
  await prisma.meterConsumer.create({
    data: { meterId: extraMeter.id, accountId: extraConsumer.id },
  });
  console.log('Seeded 1 extra meter linked to a consumer with existing meter');
}

async function main() {
  await clearData();
  await seedAdmins();
  await seedConsumers();
  await seedBulkConsumers();
  await seedStaff();
  await seedExtraStaffField();
  await seedMeters();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
