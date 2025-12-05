import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import { FABPRotaSeeder } from '../seeders/FABPRotaSeeder';

async function runSeeder() {
  const orm = await MikroORM.init(config);

  try {
    const seeder = orm.getSeeder();
    await seeder.seed(FABPRotaSeeder);
    console.log('\n✨ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await orm.close();
  }
}

runSeeder();
