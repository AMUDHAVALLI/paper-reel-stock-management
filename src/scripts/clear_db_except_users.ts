import { prisma } from '../lib/prisma';

async function main() {
  console.log('Connecting to Neon PostgreSQL database...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:([^:@]+)@/, ':****@'));

  // Count records before deletion
  const preConsumption = await prisma.consumptionLog.count();
  const preReels = await prisma.reel.count();
  const preAudit = await prisma.auditLog.count();
  const userCount = await prisma.user.count();
  const roleCount = await prisma.role.count();
  const settingCount = await prisma.setting.count();

  console.log('\n--- CURRENT RECORD COUNTS BEFORE CLEARING ---');
  console.log(`ConsumptionLog: ${preConsumption}`);
  console.log(`Reel:           ${preReels}`);
  console.log(`AuditLog:       ${preAudit}`);
  console.log(`User:           ${userCount} (WILL BE PRESERVED)`);
  console.log(`Role:           ${roleCount} (WILL BE PRESERVED)`);
  console.log(`Setting:        ${settingCount} (WILL BE PRESERVED)`);

  const users = await prisma.user.findMany({
    select: {
      username: true,
      fullName: true,
      roleName: true,
      isActive: true,
    },
  });
  console.log('\nPreserved Users in DB:', users);

  console.log('\nClearing tables: ConsumptionLog, Reel, AuditLog...');

  // Delete in order of foreign key dependencies
  const deletedConsumption = await prisma.consumptionLog.deleteMany({});
  console.log(`Deleted ${deletedConsumption.count} records from ConsumptionLog.`);

  const deletedReels = await prisma.reel.deleteMany({});
  console.log(`Deleted ${deletedReels.count} records from Reel.`);

  const deletedAudit = await prisma.auditLog.deleteMany({});
  console.log(`Deleted ${deletedAudit.count} records from AuditLog.`);

  // Verify counts after deletion
  const postConsumption = await prisma.consumptionLog.count();
  const postReels = await prisma.reel.count();
  const postAudit = await prisma.auditLog.count();
  const postUsers = await prisma.user.count();

  console.log('\n--- VERIFICATION AFTER CLEARING ---');
  console.log(`ConsumptionLog: ${postConsumption}`);
  console.log(`Reel:           ${postReels}`);
  console.log(`AuditLog:       ${postAudit}`);
  console.log(`User:           ${postUsers} (Untouched & Intact)`);

  console.log('\nDatabase cleared successfully (except User and Role tables)!');
}

main()
  .catch((e) => {
    console.error('Error clearing database:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
