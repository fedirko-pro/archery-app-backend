import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import { BowCategory } from '../bow-category/bow-category.entity';
import { Rule } from '../rule/rule.entity';

async function updateCategoriesRules() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  console.log('🔄 Updating bow categories rules...\n');

  // Get all rules
  const ifaaRule = await em.findOne(Rule, { ruleCode: 'IFAA' });
  const fabpRule = await em.findOne(Rule, { ruleCode: 'FABP' });
  const hdhRule = await em.findOne(Rule, { ruleCode: 'HDH-IAA' });

  if (!ifaaRule || !fabpRule || !hdhRule) {
    console.error('Not all rules found in database');
    await orm.close();
    return;
  }

  // Categories that belong to FABP (crossbows)
  const fabpCategoryCodes = ['SC-St', 'SC-Fs', 'TC', 'MC'];

  // Categories that belong to HDH-IAA (historical bows)
  const hdhCategoryCodes = ['HB', 'HBR', 'HBM', 'HBN', 'HLB', 'HCB'];

  const categories = await em.find(BowCategory, {});

  let updatedCount = 0;
  for (const category of categories) {
    let newRule: Rule | null = null;

    if (fabpCategoryCodes.includes(category.code)) {
      newRule = fabpRule;
    } else if (hdhCategoryCodes.includes(category.code)) {
      newRule = hdhRule;
    } else {
      // Keep as IFAA
      newRule = ifaaRule;
    }

    if (category.rule?.id !== newRule.id) {
      category.rule = newRule;
      em.persist(category);
      updatedCount++;
      console.log(`  ${category.code} → ${newRule.ruleCode}`);
    }
  }

  await em.flush();
  await orm.close();

  console.log(`\n✅ Updated ${updatedCount} categories`);
  console.log('🎉 Done!');
}

updateCategoriesRules().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
