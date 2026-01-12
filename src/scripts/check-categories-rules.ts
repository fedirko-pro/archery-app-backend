import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import { BowCategory } from '../bow-category/bow-category.entity';

async function checkCategoriesRules() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  console.log('🔍 Checking bow categories and their rules...\n');

  const categories = await em.find(
    BowCategory,
    {},
    { populate: ['rule'], limit: 15 },
  );

  console.log(`Found ${categories.length} categories (showing first 15):`);
  categories.forEach((cat) => {
    console.log(
      `  ${cat.code} - ${cat.name} | Rule: ${cat.rule?.ruleCode || 'NONE'}`,
    );
  });

  // Count by rule
  const allCategories = await em.find(BowCategory, {}, { populate: ['rule'] });
  const byRule: Record<string, number> = {};
  allCategories.forEach((cat) => {
    const ruleCode = cat.rule?.ruleCode || 'NO_RULE';
    byRule[ruleCode] = (byRule[ruleCode] || 0) + 1;
  });

  console.log('\n📊 Categories by rule:');
  Object.entries(byRule).forEach(([rule, count]) => {
    console.log(`  ${rule}: ${count} categories`);
  });

  await orm.close();
}

checkCategoriesRules().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
