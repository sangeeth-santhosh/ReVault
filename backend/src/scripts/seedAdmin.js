import User from '../models/User.js';
import { connectDB, disconnectDB } from '../config/db.js';

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@gmail.com').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const run = async () => {
  await connectDB();

  const normalizedEmail = ADMIN_EMAIL;

  const existing = await User.findOne({ email: normalizedEmail });

  if (existing) {
    existing.role = 'admin';
    existing.businessName = existing.businessName || 'ReVault Admin';
    existing.name = existing.name || 'Admin';
    existing.password = ADMIN_PASSWORD;
    existing.status = 'approved';
    existing.approvedAt = existing.approvedAt || new Date();
    existing.appliedAt = existing.appliedAt || existing.createdAt || new Date();

    await existing.save();
    console.log(`✅ Updated existing user to admin: ${normalizedEmail}`);
  } else {
    const user = await User.create({
      businessName: 'ReVault Admin',
      name: 'Admin',
      email: normalizedEmail,
      password: ADMIN_PASSWORD,
      role: 'admin',
      status: 'approved',
      appliedAt: new Date(),
      approvedAt: new Date(),
    });

    console.log(`✅ Created admin user: ${user.email}`);
  }

  await disconnectDB();
};

run().catch(async (err) => {
  console.error('❌ seedAdmin failed', err);
  try {
    await disconnectDB();
  } catch {
    // ignore
  }
  process.exit(1);
});
