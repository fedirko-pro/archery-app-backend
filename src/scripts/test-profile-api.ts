import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import { User } from '../user/entity/user.entity';

async function testProfileApi() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  console.log('🔍 Testing profile API response...\n');

  // Get a user with club
  const user = await em.findOne(
    User,
    { email: 'admin@archery.com' },
    { populate: ['club'] },
  );

  if (!user) {
    console.log('User not found');
    await orm.close();
    return;
  }

  console.log('Raw user from DB:');
  console.log('  email:', user.email);
  console.log('  club object:', user.club);
  console.log('  club?.id:', user.club?.id);
  console.log('  club?.name:', user.club?.name);

  // Simulate what the controller does
  const { id, email, role, firstName, lastName, club } = user as any;

  const response = {
    id,
    email,
    role,
    firstName,
    lastName,
    clubId: club?.id || null,
  };

  console.log('\nSimulated API response:');
  console.log(JSON.stringify(response, null, 2));

  await orm.close();
}

testProfileApi().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
