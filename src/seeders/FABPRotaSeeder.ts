import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Rule } from '../rule/rule.entity';
import { Division } from '../division/division.entity';
import { BowCategory } from '../bow-category/bow-category.entity';

/**
 * Seeder for FABP Rota dos Castelos rules, divisions, and bow categories
 * This seeder checks for existing data before creating to avoid duplicates
 */
export class FABPRotaSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🏹 Seeding FABP Rota dos Castelos data...\n');

    // Check if FABP rule already exists
    let fabpRule = await em.findOne(Rule, { ruleCode: 'FABP-ROTA' });

    if (!fabpRule) {
      fabpRule = em.create(Rule, {
        ruleCode: 'FABP-ROTA',
        ruleName: 'FABP Rota dos Castelos',
        descriptionEn:
          'Federação de Arco e Besta de Portugal - Rota dos Castelos rules',
        descriptionPt:
          'Federação de Arco e Besta de Portugal - Regras da Rota dos Castelos',
      });
      em.persist(fabpRule);
      console.log('✅ Rule created: FABP Rota dos Castelos');
    } else {
      console.log('ℹ️  Rule already exists: FABP Rota dos Castelos');
    }

    // Create Divisions (combining age and gender) - check for existing by name + rule
    const divisionsData = [
      { name: 'Cub Male', description: 'Boys under 12 years' },
      { name: 'Cub Female', description: 'Girls under 12 years' },
      { name: 'Junior Male', description: 'Boys 12-17 years' },
      { name: 'Junior Female', description: 'Girls 12-17 years' },
      { name: 'Adult Male', description: 'Men 18-49 years' },
      { name: 'Adult Female', description: 'Women 18-49 years' },
      { name: 'Veteran Male', description: 'Men 50+ years' },
      { name: 'Veteran Female', description: 'Women 50+ years' },
    ];

    let divisionsCreated = 0;
    for (const div of divisionsData) {
      const existing = await em.findOne(Division, {
        name: div.name,
        rule: fabpRule,
      });
      if (!existing) {
        const division = em.create(Division, {
          name: div.name,
          description: div.description,
          rule: fabpRule,
        });
        em.persist(division);
        divisionsCreated++;
      }
    }
    console.log(
      `✅ ${divisionsCreated} new Divisions created (${divisionsData.length - divisionsCreated} already existed)`,
    );

    // Create Bow Categories - check for existing by code
    const bowCategoriesData = [
      {
        name: 'Field Sport Compound',
        code: 'FSC',
        descriptionEn: 'Compound bow for field archery',
      },
      {
        name: 'Longbow',
        code: 'LB',
        descriptionEn: 'Traditional longbow',
      },
      {
        name: 'Barebow Compound',
        code: 'BBC',
        descriptionEn: 'Compound bow without sights',
      },
      {
        name: 'Recurve',
        code: 'RC',
        descriptionEn: 'Olympic-style recurve bow',
      },
      {
        name: 'Compound',
        code: 'CP',
        descriptionEn: 'Modern compound bow with sights',
      },
      {
        name: 'Traditional',
        code: 'TR',
        descriptionEn: 'Traditional bow styles',
      },
      {
        name: 'Barebow Recurve',
        code: 'BBR',
        descriptionEn: 'Recurve bow without sights',
      },
    ];

    let categoriesCreated = 0;
    for (const cat of bowCategoriesData) {
      const existing = await em.findOne(BowCategory, { code: cat.code });
      if (!existing) {
        const bowCategory = em.create(BowCategory, {
          name: cat.name,
          code: cat.code,
          descriptionEn: cat.descriptionEn,
          rule: fabpRule,
        });
        em.persist(bowCategory);
        categoriesCreated++;
      }
    }
    await em.flush();
    console.log(
      `✅ ${categoriesCreated} new Bow Categories created (${bowCategoriesData.length - categoriesCreated} already existed)`,
    );

    const totalDivisions = await em.count(Division, { rule: fabpRule });
    const totalCategories = await em.count(BowCategory, { rule: fabpRule });

    console.log('\n🎉 FABP Rota dos Castelos seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`   • Rule: ${fabpRule.ruleName}`);
    console.log(`   • Total Divisions: ${totalDivisions}`);
    console.log(`   • Total Bow Categories: ${totalCategories}`);
  }
}
