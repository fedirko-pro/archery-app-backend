import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import { User } from '../user/entity/user.entity';

async function updateUsersNationality() {
  console.log('🔄 Updating users nationality...\n');

  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  try {
    // Fetch all users
    const users = await em.find(User, {});
    console.log(`Found ${users.length} users\n`);

    let portuguesaCount = 0;
    let outroCount = 0;

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      // Admin and 90% users get Portuguesa, 10% get Outro
      if (user.role === 'general_admin' || i % 10 !== 0) {
        user.nationality = 'Portuguesa';
        portuguesaCount++;
      } else {
        user.nationality = 'Outro';
        outroCount++;
      }
    }

    await em.flush();

    console.log(`✅ Updated ${users.length} users:`);
    console.log(`   • ${portuguesaCount} Portuguesa`);
    console.log(`   • ${outroCount} Outro`);
    console.log('\n🎉 Done!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await orm.close();
  }
}

updateUsersNationality();
