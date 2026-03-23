import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Country } from '../country/country.entity';
import { Federation } from '../federation/federation.entity';

export class FederationSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🏛️  Seeding federations...');

    const federations: Array<{
      shortCode: string;
      name: string;
      description?: string;
      logo?: string;
      url?: string;
      countryCode: string;
    }> = [
      {
        shortCode: 'FABP',
        name: 'Federação dos Arqueiros e Besteiros de Portugal',
        url: 'https://www.fabp.pt',
        countryCode: 'PT',
      },
    ];

    const toPersist: Federation[] = [];

    for (const f of federations) {
      const existing = await em.findOne(Federation, { shortCode: f.shortCode });
      if (!existing) {
        const { countryCode, ...federationData } = f;
        toPersist.push(
          em.create(Federation, {
            ...federationData,
            country: em.getReference(
              Country as any,
              countryCode.toUpperCase() as any,
            ) as any,
          }),
        );
        continue;
      }

      const { countryCode, ...updateData } = f;
      existing.name = updateData.name;
      existing.description = updateData.description;
      existing.logo = updateData.logo;
      existing.url = updateData.url;
      existing.country = em.getReference(
        Country as any,
        countryCode.toUpperCase() as any,
      ) as any;
      existing.updatedAt = new Date();
      toPersist.push(existing);
    }

    await em.persistAndFlush(toPersist);
    console.log(`✅ Seeded ${federations.length} federations`);
  }
}
