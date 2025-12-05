import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { Rule } from '../rule/rule.entity';
import { Division } from '../division/division.entity';
import { BowCategory } from '../bow-category/bow-category.entity';

/**
 * Seeder for FABP Rota dos Castelos rules, divisions, and bow categories
 */
export class FABPRotaSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🏹 Seeding FABP Rota dos Castelos data...\n');

    // Create FABP Rota dos Castelos Rule
    const fabpRule = em.create(Rule, {
      ruleCode: 'FABP-ROTA',
      ruleName: 'FABP Rota dos Castelos',
      descriptionEn:
        'Federação de Arco e Besta de Portugal - Rota dos Castelos rules',
      descriptionPt:
        'Federação de Arco e Besta de Portugal - Regras da Rota dos Castelos',
    });

    await em.persistAndFlush(fabpRule);
    console.log('✅ Rule created: FABP Rota dos Castelos');

    // Create Divisions (combining age and gender)
    const divisions = [
      { name: 'Cub Male', description: 'Boys under 12 years' },
      { name: 'Cub Female', description: 'Girls under 12 years' },
      { name: 'Junior Male', description: 'Boys 12-17 years' },
      { name: 'Junior Female', description: 'Girls 12-17 years' },
      { name: 'Adult Male', description: 'Men 18-49 years' },
      { name: 'Adult Female', description: 'Women 18-49 years' },
      { name: 'Veteran Male', description: 'Men 50+ years' },
      { name: 'Veteran Female', description: 'Women 50+ years' },
    ];

    const createdDivisions: Division[] = [];
    for (const div of divisions) {
      const division = em.create(Division, {
        name: div.name,
        description: div.description,
        rule: fabpRule,
      });
      createdDivisions.push(division);
    }

    await em.persistAndFlush(createdDivisions);
    console.log(`✅ ${createdDivisions.length} Divisions created`);

    // Create Bow Categories
    const bowCategories = [
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

    const createdBowCategories: BowCategory[] = [];
    for (const cat of bowCategories) {
      const bowCategory = em.create(BowCategory, {
        name: cat.name,
        code: cat.code,
        descriptionEn: cat.descriptionEn,
        rule: fabpRule,
      });
      createdBowCategories.push(bowCategory);
    }

    await em.persistAndFlush(createdBowCategories);
    console.log(`✅ ${createdBowCategories.length} Bow Categories created`);

    console.log('\n🎉 FABP Rota dos Castelos seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`   • Rule: ${fabpRule.ruleName}`);
    console.log(`   • Divisions: ${createdDivisions.length}`);
    console.log(`   • Bow Categories: ${createdBowCategories.length}`);
  }
}
