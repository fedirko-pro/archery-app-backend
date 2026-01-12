import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import { User } from '../user/entity/user.entity';
import { Club } from '../club/club.entity';

// Helper function to generate random 8-digit federation number
function generateFederationNumber(): string {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

async function updateUsersFederationAndClub() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  console.log('🔄 Updating users federation numbers and clubs...');

  const users = await em.find(User, {});
  const clubs = await em.find(Club, {});

  console.log(`Found ${users.length} users`);
  console.log(`Found ${clubs.length} clubs`);

  if (clubs.length === 0) {
    console.error('No clubs found. Please run the ClubSeeder first.');
    await orm.close();
    process.exit(1);
  }

  let updatedCount = 0;

  for (const user of users) {
    // Add federation number if not present
    if (!user.federationNumber) {
      user.federationNumber = generateFederationNumber();
    }

    // Add club if not present (90% chance of having a club)
    if (!user.club && Math.random() < 0.9) {
      user.club = clubs[Math.floor(Math.random() * clubs.length)];
    }

    em.persist(user);
    updatedCount++;
  }

  await em.flush();
  await orm.close();

  console.log(
    `✅ Updated ${updatedCount} users with federation numbers and clubs`,
  );
  console.log('\n🎉 Done!');
}

updateUsersFederationAndClub().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
