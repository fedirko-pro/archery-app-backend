import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Rule } from '../rule/rule.entity';
import { Division } from '../division/division.entity';

const STANDARD_DIVISIONS = [
  { name: 'Cub Male', description: 'Boys under 12 years' },
  { name: 'Cub Female', description: 'Girls under 12 years' },
  { name: 'Junior Male', description: 'Boys 12-17 years' },
  { name: 'Junior Female', description: 'Girls 12-17 years' },
  { name: 'Adult Male', description: 'Men 18-49 years' },
  { name: 'Adult Female', description: 'Women 18-49 years' },
  { name: 'Veteran Male', description: 'Men 50+ years' },
  { name: 'Veteran Female', description: 'Women 50+ years' },
];

const RULE_CODES = ['IFAA', 'IFAA-HB', 'FABP', 'HDH-IAA'];

/**
 * Seeds standard divisions (Cub, Junior, Adult, Veteran - Male/Female) for main rules.
 * FABP-ROTA has its own divisions from FABPRotaSeeder.
 */
export class DivisionSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('📋 Seeding divisions for main rules...\n');

    let totalCreated = 0;

    for (const ruleCode of RULE_CODES) {
      const rule = await em.findOne(Rule, { ruleCode });
      if (!rule) {
        console.log(`   ⚠️  Rule ${ruleCode} not found, skipping`);
        continue;
      }

      let created = 0;
      for (const div of STANDARD_DIVISIONS) {
        const existing = await em.findOne(Division, {
          name: div.name,
          rule,
        });
        if (!existing) {
          const division = em.create(Division, {
            name: div.name,
            description: div.description,
            rule,
          });
          await em.persistAndFlush(division);
          created++;
        }
      }
      totalCreated += created;
      console.log(
        `   ${ruleCode}: ${created} new divisions (${STANDARD_DIVISIONS.length - created} already existed)`,
      );
    }

    console.log(`\n✅ ${totalCreated} divisions created for main rules`);
  }
}
