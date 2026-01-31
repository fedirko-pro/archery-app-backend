import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import { DivisionSeeder } from '../seeders/DivisionSeeder';

async function runSeeder() {
  const orm = await MikroORM.init(config);

  try {
    const seeder = orm.getSeeder();
    await seeder.seed(DivisionSeeder);
    console.log('\n✨ Division seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await orm.close();
  }
}

runSeeder();
