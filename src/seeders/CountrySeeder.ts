import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Country } from '../country/country.entity';

export class CountrySeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🌍 Seeding countries...');

    const countries: Array<{
      code: string;
      name: string;
      flagEmoji?: string;
      enabled: boolean;
    }> = [
      { code: 'PT', name: 'Portugal', flagEmoji: '🇵🇹', enabled: true },
      { code: 'ES', name: 'Spain', flagEmoji: '🇪🇸', enabled: true },
      { code: 'IT', name: 'Italy', flagEmoji: '🇮🇹', enabled: false },
      { code: 'FR', name: 'France', flagEmoji: '🇫🇷', enabled: false },
      { code: 'GB', name: 'Great Britain', flagEmoji: '🇬🇧', enabled: false },
      { code: 'UA', name: 'Ukraine', flagEmoji: '🇺🇦', enabled: false },
    ];

    const toPersist: Country[] = [];

    for (const c of countries) {
      const code = c.code.toUpperCase();
      const existing = await em.findOne(Country, { code });
      if (!existing) {
        const created = em.create(Country, { ...c, code });
        toPersist.push(created);
        continue;
      }

      // Keep idempotent and update fields on re-run
      existing.name = c.name;
      existing.flagEmoji = c.flagEmoji;
      existing.enabled = c.enabled;
      existing.updatedAt = new Date();
      toPersist.push(existing);
    }

    await em.persistAndFlush(toPersist);
    console.log(`✅ Seeded ${countries.length} countries`);
  }
}
