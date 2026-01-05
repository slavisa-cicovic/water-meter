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
  await prisma.accountRoleLink.deleteMany({});
  await prisma.rolePermission.deleteMany({});
  await prisma.permission.deleteMany({});
  await prisma.role.deleteMany({});
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

type PermissionSeed = {
  slug: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
};

const permissions: PermissionSeed[] = [
  { slug: 'settings:read', name: 'Read settings', resource: 'settings', action: 'read' },
  { slug: 'settings:update', name: 'Update settings', resource: 'settings', action: 'update' },
  { slug: 'accounts:list', name: 'List accounts', resource: 'accounts', action: 'list' },
  { slug: 'accounts:read', name: 'Read account', resource: 'accounts', action: 'read' },
  { slug: 'accounts:update', name: 'Update account', resource: 'accounts', action: 'update' },
  { slug: 'accounts:verify', name: 'Verify account', resource: 'accounts', action: 'verify' },
  { slug: 'meters:list', name: 'List meters', resource: 'meters', action: 'list' },
  { slug: 'meters:read', name: 'Read meter', resource: 'meters', action: 'read' },
  { slug: 'meters:create', name: 'Create meter', resource: 'meters', action: 'create' },
  { slug: 'meters:update', name: 'Update meter', resource: 'meters', action: 'update' },
  { slug: 'meters:delete', name: 'Delete meter', resource: 'meters', action: 'delete' },
  { slug: 'readings:list', name: 'List readings', resource: 'readings', action: 'list' },
  { slug: 'readings:read', name: 'Read reading', resource: 'readings', action: 'read' },
  { slug: 'readings:create', name: 'Create reading', resource: 'readings', action: 'create' },
  { slug: 'readings:update', name: 'Update reading', resource: 'readings', action: 'update' },
  { slug: 'notifications:read', name: 'Read notifications', resource: 'notifications', action: 'read' },
  { slug: 'billing:list', name: 'List invoices', resource: 'billing', action: 'list' },
  { slug: 'billing:generate', name: 'Generate invoices', resource: 'billing', action: 'generate' },
  { slug: 'billing:confirm', name: 'Confirm invoices', resource: 'billing', action: 'confirm' },
  { slug: 'billing:read', name: 'Read invoice', resource: 'billing', action: 'read' },
  { slug: 'billing:review', name: 'Review invoice', resource: 'billing', action: 'review' },
  { slug: 'tariffs:list', name: 'List tariffs', resource: 'tariffs', action: 'list' },
  { slug: 'tariffs:read', name: 'Read tariff', resource: 'tariffs', action: 'read' },
  { slug: 'tariffs:create', name: 'Create tariff', resource: 'tariffs', action: 'create' },
  { slug: 'tariffs:update', name: 'Update tariff', resource: 'tariffs', action: 'update' },
  { slug: 'tariffs:bulk_update', name: 'Bulk update tariffs', resource: 'tariffs', action: 'bulk_update' },
  { slug: 'jobs:list', name: 'List jobs', resource: 'jobs', action: 'list' },
  { slug: 'jobs:read', name: 'Read job', resource: 'jobs', action: 'read' },
  { slug: 'jobs:create', name: 'Create job', resource: 'jobs', action: 'create' },
  { slug: 'jobs:update', name: 'Update job', resource: 'jobs', action: 'update' },
  { slug: 'jobs:bulk_update', name: 'Bulk update jobs', resource: 'jobs', action: 'bulk_update' },
  { slug: 'jobs:run', name: 'Run job', resource: 'jobs', action: 'run' },
  { slug: 'jobs:runs_list', name: 'List job runs', resource: 'jobs', action: 'runs_list' },
  { slug: 'mobile_profile:read', name: 'Read mobile profile', resource: 'mobile_profile', action: 'read' },
  { slug: 'mobile_profile:update', name: 'Update mobile profile', resource: 'mobile_profile', action: 'update' },
  { slug: 'mobile_readings:context', name: 'Read mobile reading context', resource: 'mobile_readings', action: 'context' },
  { slug: 'mobile_readings:create', name: 'Create mobile reading', resource: 'mobile_readings', action: 'create' },
  { slug: 'mobile_meters:list', name: 'List mobile meters', resource: 'mobile_meters', action: 'list' },
  { slug: 'mobile_consumption:read', name: 'Read mobile consumption', resource: 'mobile_consumption', action: 'read' },
  { slug: 'mobile_notifications:read', name: 'Read mobile notifications', resource: 'mobile_notifications', action: 'read' },
  { slug: 'mobile_payments:read', name: 'Read mobile payments', resource: 'mobile_payments', action: 'read' },
  { slug: 'mobile_payments:pay', name: 'Pay mobile invoice', resource: 'mobile_payments', action: 'pay' },
  { slug: 'mobile_billing:read', name: 'Read mobile billing', resource: 'mobile_billing', action: 'read' },
];

async function seedRbac() {
  const roleData = [
    { slug: 'admin', name: 'Admin', isSystem: true },
    { slug: 'staff_backoffice', name: 'Staff Backoffice', isSystem: true },
    { slug: 'staff_field', name: 'Staff Field', isSystem: true },
    { slug: 'consumer', name: 'Consumer', isSystem: true },
  ];

  const roles = await Promise.all(
    roleData.map((role) =>
      prisma.role.create({
        data: role,
      })
    )
  );

  const permissionsCreated = await Promise.all(
    permissions.map((permission) => prisma.permission.create({ data: permission }))
  );

  const roleBySlug = new Map(roles.map((role) => [role.slug, role]));
  const permissionBySlug = new Map(permissionsCreated.map((permission) => [permission.slug, permission]));

  const adminPermissions = permissions.map((permission) => permission.slug);
  const backofficePermissions = [
    'settings:read',
    'accounts:list',
    'accounts:read',
    'accounts:update',
    'accounts:verify',
    'meters:list',
    'meters:read',
    'meters:create',
    'meters:update',
    'meters:delete',
    'readings:list',
    'readings:read',
    'readings:create',
    'readings:update',
    'notifications:read',
    'billing:list',
    'billing:generate',
    'billing:confirm',
    'billing:read',
    'billing:review',
    'tariffs:list',
    'tariffs:read',
    'tariffs:create',
    'tariffs:update',
    'tariffs:bulk_update',
  ];

  const accountPermissions = ['accounts:list', 'accounts:read', 'accounts:update', 'accounts:verify'];
  const rolePermissionConditions: Record<string, Record<string, { accountRoles: AccountRole[] }>> = {
    admin: Object.fromEntries(
      accountPermissions.map((permission) => [
        permission,
        { accountRoles: [AccountRole.admin, AccountRole.staff_backoffice] },
      ])
    ),
    staff_backoffice: Object.fromEntries(
      accountPermissions.map((permission) => [
        permission,
        { accountRoles: [AccountRole.consumer, AccountRole.staff_field, AccountRole.staff_backoffice] },
      ])
    ),
  };

  const rolePermissions = [
    { roleSlug: 'admin', permissionSlugs: adminPermissions },
    { roleSlug: 'staff_backoffice', permissionSlugs: backofficePermissions },
    {
      roleSlug: 'staff_field',
      permissionSlugs: [
        'mobile_profile:read',
        'mobile_profile:update',
        'mobile_readings:context',
        'mobile_readings:create',
        'mobile_meters:list',
        'mobile_notifications:read',
      ],
    },
    {
      roleSlug: 'consumer',
      permissionSlugs: [
        'mobile_profile:read',
        'mobile_profile:update',
        'mobile_readings:context',
        'mobile_readings:create',
        'mobile_consumption:read',
        'mobile_notifications:read',
        'mobile_payments:read',
        'mobile_payments:pay',
        'mobile_billing:read',
      ],
    },
  ];

  for (const { roleSlug, permissionSlugs } of rolePermissions) {
    const role = roleBySlug.get(roleSlug);
    if (!role) continue;
    const data = permissionSlugs
      .map((slug) => permissionBySlug.get(slug))
      .filter((permission): permission is NonNullable<typeof permission> => Boolean(permission))
      .map((permission) => {
        const conditions = rolePermissionConditions[roleSlug]?.[permission.slug];
        return {
          roleId: role.id,
          permissionId: permission.id,
          ...(conditions ? { conditions } : {}),
        };
      });

    if (data.length) {
      await prisma.rolePermission.createMany({ data });
    }
  }

  const accounts = await prisma.account.findMany({ select: { id: true, role: true } });
  const accountRoles = accounts
    .map((account) => {
      const role = roleBySlug.get(account.role);
      if (!role) return null;
      return { accountId: account.id, roleId: role.id };
    })
    .filter((entry): entry is { accountId: string; roleId: string } => Boolean(entry));

  if (accountRoles.length) {
    await prisma.accountRoleLink.createMany({ data: accountRoles });
  }

  console.log('Seeded RBAC roles, permissions, and account role mappings');
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

async function seedReadings() {
  const meters = await prisma.meter.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const readers = await prisma.account.findMany({
    where: { role: { in: [AccountRole.consumer, AccountRole.staff_field] } },
    orderBy: { createdAt: 'asc' },
  });

  const staffBackoffice = await prisma.account.findFirst({
    where: { role: AccountRole.staff_backoffice },
  });

  if (!meters.length || !readers.length) {
    console.log('Skipping readings seed: missing meters or readers');
    return;
  }

  const year = new Date().getFullYear();
  const months = Array.from({ length: 11 }, (_, i) => i + 1); // Jan-Nov

  const pickCountForMonth = (month: number) => 3 + (month % 3); // 3-5
  const extraReadsForMonth = (month: number) => (month % 2 === 0 ? 2 : 3); // 2-3

  const selectMeterIndexes = (month: number, count: number) => {
    const selected: number[] = [];
    let idx = month % meters.length;
    while (selected.length < count) {
      if (!selected.includes(idx)) selected.push(idx);
      idx = (idx + 7) % meters.length;
    }
    return selected;
  };

  let editApplied = false;

  for (const meter of meters) {
    const meterBase = 800 + meters.indexOf(meter) * 7;
    const reader = readers[meters.indexOf(meter) % readers.length];

    for (const month of months) {
      const baseValue = meterBase + month * 5;
      const readAt = new Date(Date.UTC(year, month - 1, 15, 9, 0, 0));
      const method = month % 4 === 0 ? 'remote' : month % 3 === 0 ? 'photo_ocr' : 'manual';
      const imageFilename = method === 'photo_ocr' ? `meter_${meter.id}_${year}-${pad2(month)}.jpg` : null;

      await prisma.reading.create({
        data: {
          meterId: meter.id,
          readerAccountId: reader.id,
          readAt,
          method,
          value: baseValue,
          originalValue: baseValue,
          imageFilename,
        },
      });
    }
  }

  for (const month of months) {
    const count = pickCountForMonth(month);
    const extraReads = extraReadsForMonth(month);
    const selectedIdx = selectMeterIndexes(month, count);

    for (const idx of selectedIdx) {
      const meter = meters[idx];
      const reader = readers[idx % readers.length];
      const baseValue = 900 + idx * 6 + month * 4;

      for (let extra = 1; extra <= extraReads; extra += 1) {
        const readAt = new Date(Date.UTC(year, month - 1, 15 + extra, 14, 0, 0));
        const method = extra === 1 ? 'manual' : extra === 2 ? 'photo_ocr' : 'remote';
        const imageFilename = method === 'photo_ocr' ? `meter_${meter.id}_${year}-${pad2(month)}-extra${extra}.jpg` : null;

        const reading = await prisma.reading.create({
          data: {
            meterId: meter.id,
            readerAccountId: reader.id,
            readAt,
            method,
            value: baseValue + extra,
            originalValue: baseValue,
            imageFilename,
          },
        });

        if (!editApplied && staffBackoffice && method === 'photo_ocr') {
          await prisma.reading.update({
            where: { id: reading.id },
            data: { value: baseValue + extra + 10 },
          });

          await prisma.readingEdit.create({
            data: {
              readingId: reading.id,
              accountId: staffBackoffice.id,
              editorRole: staffBackoffice.role,
              value: baseValue + extra + 10,
              reason: 'Corrected OCR value',
            },
          });
          editApplied = true;
        }
      }
    }
  }

  console.log('Seeded monthly readings (Jan-Nov) with extra readings and one edit entry');
}

async function seedTariffs() {
  const existing = await prisma.tariff.count();
  if (existing > 0) {
    console.log('Tariffs already seeded');
    return;
  }

  await prisma.tariff.create({
    data: {
      name: 'Default tariff',
      basePrice: 1.0,
      greenLimit: 15,
      blueLimit: 30,
      blueMultiplier: 1.2,
      redMultiplier: 2.0,
      validFrom: new Date(new Date().getFullYear(), 0, 1),
    },
  });

  console.log('Seeded default tariff');
}

async function seedInvoices() {
  const tariff = await prisma.tariff.findFirst({ orderBy: { validFrom: 'desc' } });
  if (!tariff) {
    console.log('Billing seed skipped: no tariff');
    return;
  }

  const singleMeters = await prisma.meterConsumer.groupBy({
    by: ['meterId'],
    _count: { meterId: true },
  });
  const singleMeter = singleMeters.find((m) => m._count.meterId === 1);
  if (!singleMeter) {
    console.log('Billing seed skipped: no single-consumer meters');
    return;
  }

  const meterId = singleMeter.meterId;
  const consumer = await prisma.meterConsumer.findFirst({ where: { meterId } });
  if (!consumer) {
    console.log('Billing seed skipped: no consumer for meter');
    return;
  }

  const endReading = await prisma.reading.findFirst({
    where: { meterId },
    orderBy: { readAt: 'desc' },
  });
  if (!endReading) {
    console.log('Billing seed skipped: no readings');
    return;
  }

  const startReading = await prisma.reading.findFirst({
    where: { meterId, readAt: { lt: endReading.readAt } },
    orderBy: { readAt: 'desc' },
  });
  if (!startReading) {
    console.log('Billing seed skipped: no start reading');
    return;
  }

  let consumption = Number(endReading.value) - Number(startReading.value);
  if (consumption <= 0) {
    consumption = 10;
    console.log('Billing seed: non-positive consumption, using fallback 10');
  }

  const unitPrice = Number(tariff.basePrice);
  const subtotal = Number((consumption * unitPrice).toFixed(2));
  const vatRate = 0.19;
  const vatAmount = Number((subtotal * vatRate).toFixed(2));
  const totalAmount = Number((subtotal + vatAmount).toFixed(2));

  const periodStart = startReading.readAt;
  const periodEnd = endReading.readAt;

  const invoice = await prisma.invoice.create({
    data: {
      accountId: consumer.accountId,
      meterId,
      periodStart,
      periodEnd,
      status: 'draft',
      consumption,
      unitPrice,
      subtotal,
      vatRate,
      vatAmount,
      totalAmount,
      tariffId: tariff.id,
      tariffSnapshot: {
        id: tariff.id,
        name: tariff.name,
        basePrice: tariff.basePrice.toString(),
        greenLimit: tariff.greenLimit,
        blueLimit: tariff.blueLimit,
        blueMultiplier: tariff.blueMultiplier.toString(),
        redMultiplier: tariff.redMultiplier.toString(),
        validFrom: tariff.validFrom.toISOString(),
        validTo: tariff.validTo ? tariff.validTo.toISOString() : null,
        groupCode: tariff.groupCode ?? null,
      },
    },
  });

  await prisma.invoiceLine.create({
    data: {
      invoiceId: invoice.id,
      type: 'consumption',
      description: 'Water consumption',
      quantity: consumption,
      unitPrice,
      amount: subtotal,
    },
  });

  await prisma.invoiceLine.create({
    data: {
      invoiceId: invoice.id,
      type: 'vat',
      description: `VAT ${vatRate * 100}%`,
      amount: vatAmount,
    },
  });

  await prisma.invoiceReadingLink.create({
    data: { invoiceId: invoice.id, readingId: startReading.id, role: 'start' },
  });
  await prisma.invoiceReadingLink.create({
    data: { invoiceId: invoice.id, readingId: endReading.id, role: 'end' },
  });

  console.log('Seeded 1 invoice with lines and reading links');
}

async function main() {
  await clearData();
  await seedAdmins();
  await seedConsumers();
  await seedBulkConsumers();
  await seedStaff();
  await seedExtraStaffField();
  await seedRbac();
  await seedMeters();
  await seedReadings();
  await seedTariffs();
  await seedInvoices();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
