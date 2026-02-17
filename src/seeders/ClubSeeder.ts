import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Club } from '../club/club.entity';

export class ClubSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🏹 Seeding clubs...');

    const clubs = [
      {
        name: 'Kyiv Archery Club',
        shortCode: 'KAC',
        description:
          'Premier archery club in Kyiv, offering training for all levels from beginners to competitive archers. We specialize in Olympic recurve and compound bow techniques.',
        location: 'Kyiv, Ukraine',
        clubLogo: 'https://i.pravatar.cc/300?img=1',
      },
      {
        name: 'Lviv Traditional Archers',
        shortCode: 'LTA',
        description:
          'Dedicated to preserving traditional archery methods and techniques. Join us for a unique experience in historical archery practices.',
        location: 'Lviv, Ukraine',
        clubLogo: 'https://i.pravatar.cc/300?img=2',
      },
      {
        name: 'Odessa Bow Hunters',
        shortCode: 'OBH',
        description:
          'Coastal archery club focusing on field archery and 3D target shooting. Perfect for outdoor enthusiasts and hunters.',
        location: 'Odessa, Ukraine',
        clubLogo: 'https://i.pravatar.cc/300?img=3',
      },
      {
        name: 'Dnipro Archery Academy',
        shortCode: 'DAA',
        description:
          'Professional training academy with certified coaches. We prepare athletes for national and international competitions.',
        location: 'Dnipro, Ukraine',
        clubLogo: 'https://i.pravatar.cc/300?img=4',
      },
      {
        name: 'Kharkiv Youth Archers',
        shortCode: 'KYA',
        description:
          'Youth-focused archery program promoting physical fitness, discipline, and sportsmanship among young athletes aged 8-18.',
        location: 'Kharkiv, Ukraine',
        clubLogo: 'https://i.pravatar.cc/300?img=5',
      },
      {
        name: 'Lisbon Archery Center',
        shortCode: 'LAC',
        description:
          'Modern archery facility in Lisbon with indoor and outdoor ranges. Home to national team training sessions.',
        location: 'Lisbon, Portugal',
        clubLogo: 'https://i.pravatar.cc/300?img=6',
      },
      {
        name: 'Porto Field Archers',
        shortCode: 'PFA',
        description:
          'Specialized in field archery and nature courses. Experience archery in the beautiful Portuguese countryside.',
        location: 'Porto, Portugal',
        clubLogo: 'https://i.pravatar.cc/300?img=7',
      },
      {
        name: 'Coimbra University Archery',
        shortCode: 'CUA',
        description:
          'University archery club open to students and community. Combining academic excellence with sporting achievement.',
        location: 'Coimbra, Portugal',
        clubLogo: 'https://i.pravatar.cc/300?img=8',
      },
      {
        name: 'Algarve Coastal Archers',
        shortCode: 'ACA',
        description:
          'Seaside archery club with stunning ocean views. Specializing in outdoor competitions and beach archery events.',
        location: 'Faro, Portugal',
        clubLogo: 'https://i.pravatar.cc/300?img=9',
      },
      {
        name: 'Braga Historic Bowmen',
        shortCode: 'BHB',
        description:
          'Traditional and medieval archery enthusiasts. Preserving the heritage of Portuguese archery traditions.',
        location: 'Braga, Portugal',
        clubLogo: 'https://i.pravatar.cc/300?img=10',
      },
    ];

    const toPersist: Club[] = [];
    for (const clubData of clubs) {
      const existing = await em.findOne(Club, {
        shortCode: clubData.shortCode,
      });
      if (!existing) {
        const club = em.create(Club, clubData);
        toPersist.push(club);
      }
    }
    await em.persistAndFlush(toPersist);

    console.log(
      `✅ ${toPersist.length} clubs created (${clubs.length - toPersist.length} already existed)`,
    );
  }
}
