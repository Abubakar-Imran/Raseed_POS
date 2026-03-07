require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const localUrl = "postgresql://raseed:password@localhost:5432/raseed?schema=public";
const supabaseUrl = process.env.DATABASE_URL;

const localPrisma = new PrismaClient({
  datasources: { db: { url: localUrl } },
});

const supabasePrisma = new PrismaClient({
  datasources: { db: { url: supabaseUrl } },
});

async function main() {
  console.log('Starting data migration to Supabase...');

  // 1. Retailer
  const retailers = await localPrisma.retailer.findMany();
  console.log(`Migrating ${retailers.length} Retailers...`);
  if (retailers.length) await supabasePrisma.retailer.createMany({ data: retailers, skipDuplicates: true });

  // 2. Branch
  const branches = await localPrisma.branch.findMany();
  console.log(`Migrating ${branches.length} Branches...`);
  if (branches.length) await supabasePrisma.branch.createMany({ data: branches, skipDuplicates: true });

  // 3. Customer
  const customers = await localPrisma.customer.findMany();
  console.log(`Migrating ${customers.length} Customers...`);
  if (customers.length) await supabasePrisma.customer.createMany({ data: customers, skipDuplicates: true });

  // 4. Receipt
  const receipts = await localPrisma.receipt.findMany();
  console.log(`Migrating ${receipts.length} Receipts...`);
  if (receipts.length) await supabasePrisma.receipt.createMany({ data: receipts, skipDuplicates: true });

  // 5. ReceiptItem
  const receiptItems = await localPrisma.receiptItem.findMany();
  console.log(`Migrating ${receiptItems.length} ReceiptItems...`);
  if (receiptItems.length) await supabasePrisma.receiptItem.createMany({ data: receiptItems, skipDuplicates: true });

  // 6. LoyaltyRule
  const rules = await localPrisma.loyaltyRule.findMany();
  console.log(`Migrating ${rules.length} LoyaltyRules...`);
  if (rules.length) await supabasePrisma.loyaltyRule.createMany({ data: rules, skipDuplicates: true });

  // 7. CustomerLoyalty
  const loyalties = await localPrisma.customerLoyalty.findMany();
  console.log(`Migrating ${loyalties.length} CustomerLoyalties...`);
  if (loyalties.length) await supabasePrisma.customerLoyalty.createMany({ data: loyalties, skipDuplicates: true });

  // 8. Discount
  const discounts = await localPrisma.discount.findMany();
  console.log(`Migrating ${discounts.length} Discounts...`);
  if (discounts.length) await supabasePrisma.discount.createMany({ data: discounts, skipDuplicates: true });

  // 9. Feedback
  const feedbacks = await localPrisma.feedback.findMany();
  console.log(`Migrating ${feedbacks.length} Feedbacks...`);
  if (feedbacks.length) await supabasePrisma.feedback.createMany({ data: feedbacks, skipDuplicates: true });

  // 10. SustainabilityStats
  const stats = await localPrisma.sustainabilityStats.findMany();
  console.log(`Migrating ${stats.length} SustainabilityStats...`);
  if (stats.length) await supabasePrisma.sustainabilityStats.createMany({ data: stats, skipDuplicates: true });

  console.log('🎉 Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  });
