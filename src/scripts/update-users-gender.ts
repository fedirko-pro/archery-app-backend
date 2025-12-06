import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import { User } from '../user/entity/user.entity';

async function updateUsersGender() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  console.log('🔄 Updating users gender...');

  const users = await em.find(User, {});
  console.log(`Found ${users.length} users`);

  // Define gender based on typical Portuguese names
  const femaleNames = [
    'Maria',
    'Ana',
    'Sofia',
    'Beatriz',
    'Inês',
    'Catarina',
    'Mariana',
    'Rita',
    'Sara',
    'Marta',
    'Joana',
    'Diana',
    'Francisca',
    'Carolina',
  ];

  let maleCount = 0;
  let femaleCount = 0;

  for (const user of users) {
    // Determine gender based on first name if possible
    if (user.firstName && femaleNames.includes(user.firstName)) {
      user.gender = 'F';
      femaleCount++;
    } else {
      user.gender = 'M';
      maleCount++;
    }
    em.persist(user);
  }

  await em.flush();
  await orm.close();

  console.log(`✅ Updated ${users.length} users:`);
  console.log(`   • ${maleCount} Male (M)`);
  console.log(`   • ${femaleCount} Female (F)`);
  console.log('\n🎉 Done!');
}

updateUsersGender().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
