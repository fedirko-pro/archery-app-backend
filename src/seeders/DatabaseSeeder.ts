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
// 👇 Виправлено імпорт bcryptjs
import * as bcrypt from 'bcryptjs';
import { ClubSeeder } from './ClubSeeder';
import { CountrySeeder } from './CountrySeeder';
import { FederationSeeder } from './FederationSeeder';
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
      CountrySeeder,
      FederationSeeder,
      ClubSeeder,
      RuleSeeder,
      DivisionSeeder,
      BowCategorySeeder,
      FABPRotaSeeder,
    ]);

    // Fetch clubs for user assignment
    const clubs = await em.find(Club, {});
    console.log(`✅ Found ${clubs.length} clubs for user assignment`);

    const users: User[] = [];

    // --- ADMIN CREATION (Idempotent) ---
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
      console.log('ℹ️ Admin user already exists');
    }
    users.push(admin);

    // --- REGULAR USERS CREATION (Idempotent) ---
    const userPassword = await bcrypt.hash('user123', 10);

    const firstNames = [
      /* ... 90 names ... */ 'João',
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
      /* ... 90 surnames ... */ 'Silva',
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

    let newUsersCount = 0;
    for (let i = 0; i < 90; i++) {
      const email = `user${i + 1}@archery.com`;
      let user = await em.findOne(User, { email });

      if (!user) {
        const nationality = i < 9 ? 'Outro' : 'Portuguesa';
        const firstName = firstNames[i % firstNames.length];
        const lastName = lastNames[i % lastNames.length];
        const gender = femaleNames.includes(firstName) ? 'F' : 'M';
        const club =
          Math.random() < 0.05
            ? undefined
            : clubs[Math.floor(Math.random() * clubs.length)];

        user = em.create(User, {
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
        em.persist(user);
        newUsersCount++;
      }
      users.push(user);
    }
    await em.flush();
    console.log(
      `✅ ${newUsersCount} new regular users created (${90 - newUsersCount} already existed)`,
    );

    // --- TOURNAMENTS CREATION (Idempotent) ---
    const rules = await em.find(Rule, {});
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
    // (locations, banners, descriptions omitted for brevity, keeping your exact strings)
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
    const bannerImages = [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1511576661531-b34d7da5d0bb?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&h=400&fit=crop',
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
    let newTournamentsCount = 0;

    for (let i = 0; i < 10; i++) {
      const title = tournamentNames[i];
      let tournament = await em.findOne(Tournament, { title });

      if (!tournament) {
        const startDate = new Date(now);
        startDate.setDate(now.getDate() + i * 15 + 10);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + (i % 3 === 0 ? 2 : 1));
        const rule = rules.length > 0 ? rules[i % rules.length] : undefined;
        const applicationDeadline = new Date(startDate);
        applicationDeadline.setDate(startDate.getDate() - 5);

        tournament = em.create(Tournament, {
          title,
          description: descriptions[i],
          address: locations[i],
          startDate,
          endDate,
          applicationDeadline,
          allowMultipleApplications: i % 3 !== 0,
          targetCount: 12 + (i % 3) * 6,
          banner: bannerImages[i],
          isOpenToOtherFederations: false,
          isOpenToOtherCountries: false,
          createdBy: admin,
          rule,
        });
        em.persist(tournament);
        newTournamentsCount++;
      }
      tournaments.push(tournament);
    }
    await em.flush();
    console.log(
      `✅ ${newTournamentsCount} new tournaments created (${10 - newTournamentsCount} already existed)`,
    );

    // --- APPLICATIONS CREATION (Idempotent) ---
    const divisions = await em.find(Division, {});
    const maleDivisions = divisions.filter((d) => d.name.includes('Male'));
    const femaleDivisions = divisions.filter((d) => d.name.includes('Female'));
    const bowCategories = await em.find(BowCategory, {});
    let newAppsCount = 0;

    for (const tournament of tournaments) {
      // Check if tournament already has applications to avoid duplicating on re-run
      const existingAppsCount = await em.count(TournamentApplication, {
        tournament,
      });
      if (existingAppsCount > 0) continue;

      const numApplications = 40 + Math.floor(Math.random() * 31);
      const applicants = new Set<User>();

      while (
        applicants.size < numApplications &&
        applicants.size < users.length - 1
      ) {
        const randomUser = users[1 + Math.floor(Math.random() * 90)];
        applicants.add(randomUser);
      }

      for (const user of applicants) {
        const status =
          Math.random() < 0.9
            ? ApplicationStatus.APPROVED
            : ApplicationStatus.PENDING;
        const rand = Math.random();
        const divisionName =
          rand < 0.7
            ? 'Adult'
            : rand < 0.9
              ? 'Junior'
              : rand < 0.95
                ? 'Cub'
                : 'Veteran';

        const applicableDivisions =
          user.gender === 'F' ? femaleDivisions : maleDivisions;
        const division = applicableDivisions.find((d) =>
          d.name.startsWith(divisionName),
        );
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
        newAppsCount++;
      }
    }
    await em.flush();
    console.log(`✅ ${newAppsCount} new tournament applications created`);

    console.log('\n🎉 Database seeding completed successfully!');
  }
}
