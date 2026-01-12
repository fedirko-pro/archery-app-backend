import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import { User } from '../user/entity/user.entity';
import { Club } from '../club/club.entity';

async function checkClubs() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  console.log('🔍 Checking clubs and users...\n');

  // Get all clubs
  const clubs = await em.find(Club, {});
  console.log(`📋 Clubs in database (${clubs.length}):`);
  clubs.forEach((club) => {
    console.log(`   ID: ${club.id} | Name: ${club.name}`);
  });

  // Get all users with their club_id
  const users = await em.find(User, {}, { populate: ['club'] });
  console.log(`\n👥 Users with clubs (first 10):`);

  let withClub = 0;
  let withoutClub = 0;

  users.slice(0, 10).forEach((user) => {
    console.log(
      `   ${user.email} | club_id: ${user.club?.id || 'NULL'} | club: ${user.club?.name || 'NONE'}`,
    );
  });

  users.forEach((user) => {
    if (user.club) {
      withClub++;
    } else {
      withoutClub++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Users with club: ${withClub}`);
  console.log(`   Users without club: ${withoutClub}`);

  await orm.close();
}

checkClubs().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
