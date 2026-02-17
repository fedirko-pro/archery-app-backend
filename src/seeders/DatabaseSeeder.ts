import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { User } from '../user/entity/user.entity';
import { Tournament } from '../tournament/tournament.entity';
import {
  TournamentApplication,
  ApplicationStatus,
} from '../tournament/tournament-application.entity';
import { Rule } from '../rule/rule.entity';
import { Club } from '../club/club.entity';
import bcrypt from 'bcryptjs';
import { ClubSeeder } from './ClubSeeder';
import { RuleSeeder } from './RuleSeeder';
import { DivisionSeeder } from './DivisionSeeder';
import { BowCategorySeeder } from './BowCategorySeeder';
import { FABPRotaSeeder } from './FABPRotaSeeder';
import { Division } from '../division/division.entity';
import { BowCategory } from '../bow-category/bow-category.entity';

// Helper function to generate random 8-digit federation number
function generateFederationNumber(): string {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    console.log('🌱 Starting database seeding...');

    // Seed clubs, rules, divisions, bow categories, and FABP-ROTA data
    await this.call(em, [
      ClubSeeder,
      RuleSeeder,
      DivisionSeeder,
      BowCategorySeeder,
      FABPRotaSeeder,
    ]);

    // Fetch clubs for user assignment
    const clubs = await em.find(Club, {});
    console.log(`✅ Found ${clubs.length} clubs for user assignment`);

    // Create admin user first (idempotent by email)
    let admin = await em.findOne(User, { email: 'admin@archery.com' });
    if (!admin) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      admin = em.create(User, {
        email: 'admin@archery.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'general_admin',
        authProvider: 'local',
        picture: 'https://i.pravatar.cc/512?img=33',
        appLanguage: 'en',
        nationality: 'Portuguesa',
        gender: 'M',
        federationNumber: generateFederationNumber(),
        club: clubs.length > 0 ? clubs[0] : undefined,
      });
      em.persist(admin);
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create 90 regular users (total 91 with admin) - idempotent by email
    const users: User[] = [admin];
    const userPassword = await bcrypt.hash('user123', 10);

    const firstNames = [
      // Male names (45)
      'João',
      'Pedro',
      'Carlos',
      'Miguel',
      'Ricardo',
      'Paulo',
      'André',
      'Tiago',
      'Bruno',
      'Diogo',
      'Gonçalo',
      'Rui',
      'Nuno',
      'Luís',
      'Vasco',
      'Fernando',
      'António',
      'José',
      'Manuel',
      'Francisco',
      'Rodrigo',
      'Tomás',
      'Duarte',
      'Afonso',
      'Guilherme',
      'Simão',
      'Martim',
      'David',
      'Alexandre',
      'Bernardo',
      'Hugo',
      'Rafael',
      'Sérgio',
      'Daniel',
      'Marco',
      'Fábio',
      'Vítor',
      'Jorge',
      'Hélder',
      'Filipe',
      'Renato',
      'Gustavo',
      'Ivo',
      'Eduardo',
      'Gabriel',
      // Female names (45)
      'Maria',
      'Ana',
      'Sofia',
      'Beatriz',
      'Inês',
      'Catarina',
      'Mariana',
      'Rita',
      'Sara',
      'Marta',
      'Joana',
      'Diana',
      'Francisca',
      'Carolina',
      'Teresa',
      'Leonor',
      'Matilde',
      'Lara',
      'Clara',
      'Alice',
      'Constança',
      'Mafalda',
      'Bianca',
      'Filipa',
      'Daniela',
      'Helena',
      'Raquel',
      'Patrícia',
      'Vera',
      'Sandra',
      'Carla',
      'Mónica',
      'Susana',
      'Paula',
      'Cláudia',
      'Cristina',
      'Andreia',
      'Vanessa',
      'Liliana',
      'Sónia',
      'Isabel',
      'Luísa',
      'Fernanda',
      'Célia',
      'Adriana',
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
      'Cardoso',
      'Rocha',
      'Dias',
      'Araújo',
      'Melo',
      'Barbosa',
      'Ramos',
      'Freitas',
      'Castro',
      'Machado',
      'Reis',
      'Azevedo',
      'Miranda',
      'Cunha',
      'Tavares',
      'Pires',
      'Fonseca',
      'Moura',
      'Figueiredo',
      'Antunes',
      'Baptista',
      'Carneiro',
      'Nascimento',
      'Coelho',
      'Cruz',
      'Matos',
      'Branco',
      'Esteves',
      'Henriques',
      'Leal',
      'Magalhães',
      'Pinheiro',
      'Borges',
      'Abreu',
      'Sampaio',
      'Valente',
      'Lourenço',
      'Ferraz',
      'Bento',
      'Faria',
      'Pacheco',
      'Simões',
      'Amaral',
      'Vicente',
      'Paiva',
      'Morais',
      'Duarte',
      'Andrade',
      'Domingues',
      'Nogueira',
      'Assunção',
      'Guerra',
      'Barros',
      'Vaz',
      'Leite',
      'Couto',
      'Gaspar',
      'Maia',
      'Brito',
      'Sá',
      'Guerreiro',
    ];

    // Define gender based on typical Portuguese names
    const femaleNames = [
      'Maria',
      'Ana',
      'Sofia',
      'Beatriz',
      'Inês',
      'Catarina',
      'Mariana',
      'Rita',
      'Sara',
      'Marta',
      'Joana',
      'Diana',
      'Francisca',
      'Carolina',
      'Teresa',
      'Leonor',
      'Matilde',
      'Lara',
      'Clara',
      'Alice',
      'Constança',
      'Mafalda',
      'Bianca',
      'Filipa',
      'Daniela',
      'Helena',
      'Raquel',
      'Patrícia',
      'Vera',
      'Sandra',
      'Carla',
      'Mónica',
      'Susana',
      'Paula',
      'Cláudia',
      'Cristina',
      'Andreia',
      'Vanessa',
      'Liliana',
      'Sónia',
      'Isabel',
      'Luísa',
      'Fernanda',
      'Célia',
      'Adriana',
    ];

    for (let i = 0; i < 90; i++) {
      const email = `user${i + 1}@archery.com`;
      const existing = await em.findOne(User, { email });
      if (existing) {
        users.push(existing);
        continue;
      }
      // 90% Portuguesa, 10% Outro (indices 0-8 are Outro, rest are Portuguesa)
      const nationality = i < 9 ? 'Outro' : 'Portuguesa';
      const firstName = firstNames[i % firstNames.length];
      const lastName = lastNames[i % lastNames.length];
      const gender = femaleNames.includes(firstName) ? 'F' : 'M';
      // Assign random club (some users may have no club - 5% chance)
      const club =
        Math.random() < 0.05
          ? undefined
          : clubs[Math.floor(Math.random() * clubs.length)];

      const user = em.create(User, {
        email,
        password: userPassword,
        firstName,
        lastName,
        role: 'user',
        authProvider: 'local',
        picture: `https://i.pravatar.cc/512?img=${(i % 70) + 1}`,
        appLanguage: i % 2 === 0 ? 'pt' : 'en',
        nationality,
        gender,
        federationNumber: generateFederationNumber(),
        club,
      });
      users.push(user);
    }
    await em.flush();
    console.log(
      `✅ ${users.length} users ready (with nationality, gender, federation number, and club)`,
    );

    // Fetch rules for tournament assignment
    const rules = await em.find(Rule, {});
    console.log(`✅ Found ${rules.length} rules for tournament assignment`);

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

      const existingTournament = await em.findOne(Tournament, {
        title: tournamentNames[i],
        startDate,
      });
      if (existingTournament) {
        tournaments.push(existingTournament);
        continue;
      }

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (i % 3 === 0 ? 2 : 1)); // Some tournaments are 2 days

      // Assign a rule to each tournament (cycle through available rules)
      const rule = rules.length > 0 ? rules[i % rules.length] : undefined;

      // Set application deadline to 5 days before start
      const applicationDeadline = new Date(startDate);
      applicationDeadline.setDate(startDate.getDate() - 5);

      const tournament = em.create(Tournament, {
        title: tournamentNames[i],
        description: descriptions[i],
        address: locations[i],
        startDate,
        endDate,
        applicationDeadline,
        allowMultipleApplications: i % 3 !== 0, // 2/3 allow multiple applications
        targetCount: 12 + (i % 3) * 6, // 12, 18, or 24 targets
        banner: bannerImages[i],
        createdBy: admin,
        rule,
      });
      em.persist(tournament);
      tournaments.push(tournament);
    }
    await em.flush();
    console.log('✅ 10 tournaments ready with banners');

    // Get divisions for application assignment
    const divisions = await em.find(Division, {});
    const maleDivisions = divisions.filter((d) => d.name.includes('Male'));
    const femaleDivisions = divisions.filter((d) => d.name.includes('Female'));
    console.log(
      `✅ Found ${divisions.length} divisions for application assignment`,
    );

    // Get bow categories for application assignment
    const bowCategories = await em.find(BowCategory, {});
    console.log(
      `✅ Found ${bowCategories.length} bow categories for application assignment`,
    );

    // Create applications - each tournament gets applications from random users
    const applications: TournamentApplication[] = [];

    for (const tournament of tournaments) {
      // Each tournament gets 40-70 random applications
      const numApplications = 40 + Math.floor(Math.random() * 31);
      const applicants = new Set<User>();

      while (
        applicants.size < numApplications &&
        applicants.size < users.length - 1
      ) {
        // Pick random user (skip admin)
        const randomUser = users[1 + Math.floor(Math.random() * 90)];
        applicants.add(randomUser);
      }

      for (const user of applicants) {
        const existingApp = await em.findOne(TournamentApplication, {
          tournament,
          applicant: user,
        });
        if (existingApp) {
          continue;
        }

        // 90% approved, 10% pending
        const status =
          Math.random() < 0.9
            ? ApplicationStatus.APPROVED
            : ApplicationStatus.PENDING;

        // Assign division based on gender
        // Distribution: 70% Adult, 20% Junior, 5% Cub, 5% Veteran
        const rand = Math.random();
        let divisionName: string;
        if (rand < 0.7) {
          divisionName = 'Adult';
        } else if (rand < 0.9) {
          divisionName = 'Junior';
        } else if (rand < 0.95) {
          divisionName = 'Cub';
        } else {
          divisionName = 'Veteran';
        }

        const applicableDivisions =
          user.gender === 'F' ? femaleDivisions : maleDivisions;
        const division = applicableDivisions.find((d) =>
          d.name.startsWith(divisionName),
        );

        // Assign random bow category
        const bowCategory =
          bowCategories.length > 0
            ? bowCategories[Math.floor(Math.random() * bowCategories.length)]
            : undefined;

        const application = em.create(TournamentApplication, {
          tournament,
          applicant: user,
          status,
          division,
          bowCategory,
          notes:
            Math.random() > 0.7 ? 'Looking forward to this event!' : undefined,
        });
        em.persist(application);
        applications.push(application);
      }
    }
    await em.flush();
    console.log(
      `✅ ${applications.length} tournament applications created (with divisions and bow categories)`,
    );

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • 10 Clubs`);
    console.log(`   • 5 Rules (IFAA, IFAA-HB, FABP, HDH-IAA, FABP-ROTA)`);
    console.log(`   • 30 Bow Categories`);
    console.log(`   • 8 Divisions`);
    console.log(`   • 1 Admin user (admin@archery.com / admin123)`);
    console.log(
      `   • 90 Regular users (user1@archery.com - user90@archery.com / user123)`,
    );
    console.log(`   • 10 Tournaments with banners and rules`);
    console.log(
      `   • ${applications.length} Tournament applications (with divisions & bow categories)`,
    );
    console.log('\n🔑 Login credentials:');
    console.log('   Admin: admin@archery.com / admin123');
    console.log('   Users: user1@archery.com - user90@archery.com / user123');
  }
}
