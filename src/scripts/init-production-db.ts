import path from 'path';
import fs from 'fs';
import { prisma } from '../lib/prisma';
import { parseReelStockExcel } from '../lib/excel-parser';

async function initDb() {
  console.log('[init-db] Checking database initialization status...');

  // 1. Ensure System Roles exist
  const defaultRoles = [
    {
      name: 'ADMIN',
      displayName: 'Factory Administrator / Owner',
      description: 'Complete operational and financial control, pricing management, and user administration.',
      isSystem: true,
      canViewDashboard: true,
      canViewRegister: true,
      canViewPrices: true,
      canInwardReels: true,
      canIssueReels: true,
      canViewSheets: true,
      canPrintLabels: true,
      canViewReports: true,
      canManageSettings: true,
      canDeleteReels: true,
      canAccessAdmin: true,
    },
    {
      name: 'ACCOUNTANT',
      displayName: 'Chief Accountant / Billing',
      description: 'Stock valuation, inward & consumption register, financial reports and price auditing.',
      isSystem: true,
      canViewDashboard: true,
      canViewRegister: true,
      canViewPrices: true,
      canInwardReels: false,
      canIssueReels: false,
      canViewSheets: true,
      canPrintLabels: true,
      canViewReports: true,
      canManageSettings: false,
      canDeleteReels: false,
      canAccessAdmin: false,
    },
    {
      name: 'STOREKEEPER',
      displayName: 'Storekeeper / Inward Incharge',
      description: 'Receives mill paper reels, enters physical roll weight, prints QR sticker barcodes.',
      isSystem: true,
      canViewDashboard: true,
      canViewRegister: true,
      canViewPrices: false,
      canInwardReels: true,
      canIssueReels: false,
      canViewSheets: true,
      canPrintLabels: true,
      canViewReports: false,
      canManageSettings: false,
      canDeleteReels: false,
      canAccessAdmin: false,
    },
    {
      name: 'OPERATOR',
      displayName: 'Corrugator Machine Operator',
      description: 'Corrugation production floor: issues rolls, cuts paper, records consumed and balance weights.',
      isSystem: true,
      canViewDashboard: true,
      canViewRegister: true,
      canViewPrices: false,
      canInwardReels: false,
      canIssueReels: true,
      canViewSheets: true,
      canPrintLabels: true,
      canViewReports: false,
      canManageSettings: false,
      canDeleteReels: false,
      canAccessAdmin: false,
    },
  ];

  for (const r of defaultRoles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
  }
  console.log('[init-db] Roles verified/created.');

  // 2. Ensure Default Users exist
  const bcrypt = await import('bcryptjs');
  const defaultUsers = [
    {
      username: 'admin',
      password: 'admin123',
      fullName: 'Sivakumar (Factory Admin)',
      roleName: 'ADMIN',
    },
    {
      username: 'accountant',
      password: 'account123',
      fullName: 'Ramesh (Chief Accountant)',
      roleName: 'ACCOUNTANT',
    },
    {
      username: 'store',
      password: 'store123',
      fullName: 'Murugan (Store Incharge)',
      roleName: 'STOREKEEPER',
    },
    {
      username: 'operator',
      password: 'operator123',
      fullName: 'Karthik (Corrugator Operator)',
      roleName: 'OPERATOR',
    },
  ];

  for (const u of defaultUsers) {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(u.password, salt);
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        username: u.username,
        passwordHash,
        fullName: u.fullName,
        roleName: u.roleName,
      },
    });
  }
  console.log('[init-db] Default users verified/created.');

  // 3. Ensure Settings exist
  await prisma.setting.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      companyName: 'OM NAMASIVAYAM PACKAGING',
      financialYear: '2026-2027',
      currencySymbol: '₹',
      lowStockThresholdKg: 1000,
    },
  });

  // 4. Check if reels already exist
  const reelCount = await prisma.reel.count();
  if (reelCount > 0) {
    console.log(`[init-db] Database already contains ${reelCount} reels. Preserving existing live data.`);
    return;
  }

  // 5. Seed reels if empty
  console.log('[init-db] Database is empty. Seeding reels from Excel...');
  const excelPath = path.join(process.cwd(), 'REELS STOCK 26-27 NEW.xlsx');
  if (fs.existsSync(excelPath)) {
    const parsed = parseReelStockExcel(excelPath);
    let count = 0;
    for (const r of parsed.reels) {
      await prisma.reel.create({
        data: {
          reelNo: r.reelNo,
          itemType: r.itemType,
          category: r.category,
          sizeDesc: r.sizeDesc,
          sizeValue: r.sizeValue,
          sizeUnit: r.sizeUnit,
          gsm: r.gsm,
          bf: r.bf,
          weight: r.weight,
          usedWeight: r.usedWeight,
          balanceWeight: r.balanceWeight,
          pricePerKg: r.pricePerKg,
          reelAmount: r.reelAmount,
          consumedAmount: r.consumedAmount,
          balanceAmount: r.balanceAmount,
          millName: r.millName,
          status: r.status,
          inwardDate: r.inwardDate,
          usedDate: r.usedDate,
          financialYear: r.financialYear,
          isSheet: r.isSheet,
          bayLocation: r.category.includes('100') ? 'Bay A-1' : r.category.includes('120') ? 'Bay B-1' : 'Bay C-1',
        },
      });
      count++;
    }
    console.log(`[init-db] Successfully seeded ${count} initial reels.`);
  } else {
    console.warn(`[init-db] Excel file not found at ${excelPath}. Skipping initial reel seed.`);
  }
}

initDb()
  .catch((e) => {
    console.error('[init-db] Error during database initialization:', e.message);
    // Do not crash the build if database is unreachable during build
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
