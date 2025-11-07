import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../user/entity/user.entity';
import { Tournament } from '../tournament/tournament.entity';
import {
  TournamentApplication,
  ApplicationStatus,
} from '../tournament/tournament-application.entity';
import bcrypt from 'bcryptjs';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🌱 Starting database seeding...');

    // Create admin user first
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = em.create(User, {
      email: 'admin@archery.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      authProvider: 'local',
      picture: 'https://i.pravatar.cc/512?img=33',
      appLanguage: 'en',
    });
    await em.persistAndFlush(admin);
    console.log('✅ Admin user created');

    // Create 29 regular users (total 30 with admin)
    const users: User[] = [admin];
    const userPassword = await bcrypt.hash('user123', 10);

    const firstNames = [
      'João',
      'Maria',
      'Pedro',
      'Ana',
      'Carlos',
      'Sofia',
      'Miguel',
      'Beatriz',
      'Ricardo',
      'Inês',
      'Paulo',
      'Catarina',
      'André',
      'Mariana',
      'Tiago',
      'Rita',
      'Bruno',
      'Sara',
      'Diogo',
      'Marta',
      'Gonçalo',
      'Joana',
      'Rui',
      'Diana',
      'Nuno',
      'Francisca',
      'Luís',
      'Carolina',
      'Vasco',
    ];

    const lastNames = [
      'Silva',
      'Santos',
      'Ferreira',
      'Pereira',
      'Oliveira',
      'Costa',
      'Rodrigues',
      'Martins',
      'Jesus',
      'Sousa',
      'Fernandes',
      'Gonçalves',
      'Gomes',
      'Lopes',
      'Marques',
      'Alves',
      'Almeida',
      'Ribeiro',
      'Pinto',
      'Carvalho',
      'Teixeira',
      'Moreira',
      'Correia',
      'Monteiro',
      'Mendes',
      'Nunes',
      'Soares',
      'Vieira',
      'Campos',
    ];

    for (let i = 0; i < 29; i++) {
      const user = em.create(User, {
        email: `user${i + 1}@archery.com`,
        password: userPassword,
        firstName: firstNames[i],
        lastName: lastNames[i],
        role: 'user',
        authProvider: 'local',
        picture: `https://i.pravatar.cc/512?img=${i + 1}`,
        appLanguage: i % 2 === 0 ? 'pt' : 'en',
      });
      users.push(user);
    }
    await em.persistAndFlush(users);
    console.log('✅ 29 regular users created');

    // Create 10 tournaments with random banners
    const tournaments: Tournament[] = [];
    const tournamentNames = [
      'National Archery Championship',
      'Spring Outdoor Tournament',
      'Indoor Winter Cup',
      'Coastal Archery Challenge',
      'Mountain Masters Competition',
      'City Championship Series',
      'Regional Qualifiers',
      'Summer Grand Prix',
      'Autumn Classic Tournament',
      'Youth Archery Festival',
    ];

    const locations = [
      'Lisbon Sports Complex',
      'Porto Archery Range',
      'Coimbra Stadium',
      'Braga Outdoor Center',
      'Faro Beach Arena',
      'Évora Historic Grounds',
      'Aveiro Riverside Park',
      'Guimarães Castle Grounds',
      'Sintra Nature Reserve',
      'Cascais Coastal Center',
    ];

    // Unsplash collection IDs for nature/castle images
    const bannerImages = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop', // Mountain landscape
      'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1200&h=400&fit=crop', // Castle
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=400&fit=crop', // Mountain lake
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=400&fit=crop', // Nature
      'https://images.unsplash.com/photo-1511576661531-b34d7da5d0bb?w=1200&h=400&fit=crop', // Medieval castle
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=400&fit=crop', // Forest
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=400&fit=crop', // Sunset landscape
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop', // Mountains
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=400&fit=crop', // Mountain peak
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&h=400&fit=crop', // Lake landscape
    ];

    const descriptions = [
      'Join us for the most prestigious archery event of the year. Open to all categories and skill levels.',
      'Experience outdoor archery at its finest. Beautiful weather and challenging targets await.',
      'Indoor precision shooting competition. Perfect conditions for achieving your best scores.',
      'Compete by the beautiful coastline. A unique archery experience with ocean views.',
      'Mountain setting provides both challenge and stunning scenery for this elite competition.',
      'Annual city championship with multiple divisions. Great prizes and local recognition.',
      'Qualify for the national finals. Top performers advance to the championship round.',
      "Summer's biggest archery event. Multiple days of competition and festivities.",
      'Traditional autumn tournament with a rich history. Join our legacy of champions.',
      'Encouraging young archers to develop their skills in a friendly, supportive environment.',
    ];

    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const startDate = new Date(now);
      startDate.setDate(now.getDate() + i * 15 + 10); // Tournaments every 15 days starting in 10 days

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (i % 3 === 0 ? 2 : 1)); // Some tournaments are 2 days

      const tournament = em.create(Tournament, {
        title: tournamentNames[i],
        description: descriptions[i],
        address: locations[i],
        startDate,
        endDate,
        allowMultipleApplications: i % 3 !== 0, // 2/3 allow multiple applications
        banner: bannerImages[i],
        createdBy: admin,
      });
      tournaments.push(tournament);
    }
    await em.persistAndFlush(tournaments);
    console.log('✅ 10 tournaments created with banners');

    // Create applications - each tournament gets applications from random users
    const applications: TournamentApplication[] = [];
    const categories = [
      'recurve',
      'compound',
      'barebow',
      'traditional',
      'longbow',
    ];
    const divisions = ['men', 'women', 'mixed'];
    const equipment = ['olympic', 'compoundBow', 'traditionalBow'];

    for (const tournament of tournaments) {
      // Each tournament gets 5-15 random applications
      const numApplications = 5 + Math.floor(Math.random() * 11);
      const applicants = new Set<User>();

      while (applicants.size < numApplications) {
        // Pick random user (skip admin)
        const randomUser = users[1 + Math.floor(Math.random() * 29)];
        applicants.add(randomUser);
      }

      for (const user of applicants) {
        const application = em.create(TournamentApplication, {
          tournament,
          applicant: user,
          category: categories[Math.floor(Math.random() * categories.length)],
          division: divisions[Math.floor(Math.random() * divisions.length)],
          equipment: equipment[Math.floor(Math.random() * equipment.length)],
          status: ApplicationStatus.PENDING,
          notes:
            Math.random() > 0.7 ? 'Looking forward to this event!' : undefined,
        });
        applications.push(application);
      }
    }
    await em.persistAndFlush(applications);
    console.log(`✅ ${applications.length} tournament applications created`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • 1 Admin user (admin@archery.com / admin123)`);
    console.log(
      `   • 29 Regular users (user1@archery.com - user29@archery.com / user123)`,
    );
    console.log(`   • 10 Tournaments with banners`);
    console.log(`   • ${applications.length} Tournament applications`);
    console.log('\n🔑 Login credentials:');
    console.log('   Admin: admin@archery.com / admin123');
    console.log('   Users: user1@archery.com - user29@archery.com / user123');
  }
}
