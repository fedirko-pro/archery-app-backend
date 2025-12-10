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
      {
        name: 'Lisbon Archery Center',
        description:
          'Modern archery facility in Lisbon with indoor and outdoor ranges. Home to national team training sessions.',
        location: 'Lisbon, Portugal',
        clubLogo: 'https://i.pravatar.cc/300?img=6',
      },
      {
        name: 'Porto Field Archers',
        description:
          'Specialized in field archery and nature courses. Experience archery in the beautiful Portuguese countryside.',
        location: 'Porto, Portugal',
        clubLogo: 'https://i.pravatar.cc/300?img=7',
      },
      {
        name: 'Coimbra University Archery',
        description:
          'University archery club open to students and community. Combining academic excellence with sporting achievement.',
        location: 'Coimbra, Portugal',
        clubLogo: 'https://i.pravatar.cc/300?img=8',
      },
      {
        name: 'Algarve Coastal Archers',
        description:
          'Seaside archery club with stunning ocean views. Specializing in outdoor competitions and beach archery events.',
        location: 'Faro, Portugal',
        clubLogo: 'https://i.pravatar.cc/300?img=9',
      },
      {
        name: 'Braga Historic Bowmen',
        description:
          'Traditional and medieval archery enthusiasts. Preserving the heritage of Portuguese archery traditions.',
        location: 'Braga, Portugal',
        clubLogo: 'https://i.pravatar.cc/300?img=10',
      },
    ];

    for (const clubData of clubs) {
      const club = em.create(Club, clubData);
      await em.persistAndFlush(club);
    }

    console.log(`✅ ${clubs.length} clubs created`);
  }
}
