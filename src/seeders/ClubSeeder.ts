import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { Club } from '../club/club.entity';

export class ClubSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🏹 Seeding clubs...');

    const clubs = [
      {
        name: 'Kyiv Archery Club',
        description:
          'Premier archery club in Kyiv, offering training for all levels from beginners to competitive archers. We specialize in Olympic recurve and compound bow techniques.',
        location: 'Kyiv, Ukraine',
        clubLogo: 'https://i.pravatar.cc/300?img=1',
      },
      {
        name: 'Lviv Traditional Archers',
        description:
          'Dedicated to preserving traditional archery methods and techniques. Join us for a unique experience in historical archery practices.',
        location: 'Lviv, Ukraine',
        clubLogo: 'https://i.pravatar.cc/300?img=2',
      },
      {
        name: 'Odessa Bow Hunters',
        description:
          'Coastal archery club focusing on field archery and 3D target shooting. Perfect for outdoor enthusiasts and hunters.',
        location: 'Odessa, Ukraine',
        clubLogo: 'https://i.pravatar.cc/300?img=3',
      },
      {
        name: 'Dnipro Archery Academy',
        description:
          'Professional training academy with certified coaches. We prepare athletes for national and international competitions.',
        location: 'Dnipro, Ukraine',
        clubLogo: 'https://i.pravatar.cc/300?img=4',
      },
      {
        name: 'Kharkiv Youth Archers',
        description:
          'Youth-focused archery program promoting physical fitness, discipline, and sportsmanship among young athletes aged 8-18.',
        location: 'Kharkiv, Ukraine',
        clubLogo: 'https://i.pravatar.cc/300?img=5',
      },
    ];

    for (const clubData of clubs) {
      const club = em.create(Club, clubData);
      await em.persistAndFlush(club);
    }

    console.log(`✅ ${clubs.length} clubs created`);
  }
}
