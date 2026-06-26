import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import { User } from '../user/entity/user.entity';
import { Club } from '../club/club.entity';
import { TournamentApplication } from '../tournament/tournament-application.entity';
import * as bcrypt from 'bcryptjs';

// Helper function to generate random 8-digit federation number
function generateFederationNumber(): string {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

async function reseedUsers() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  console.log('🔄 Reseeding users...');

  // Clear all dependent data first
  console.log('🗑️  Clearing dependent data...');

  // Clear patrol members
  try {
    await em.nativeDelete('PatrolMember', {});
    console.log('   ✓ Patrol members cleared');
  } catch {
    console.log('   ℹ️ No patrol members to clear');
  }

  // Clear patrols
  try {
    await em.nativeDelete('Patrol', {});
    console.log('   ✓ Patrols cleared');
  } catch {
    console.log('   ℹ️ No patrols to clear');
  }

  // Clear tournament applications
  await em.nativeDelete(TournamentApplication, {});
  console.log('   ✓ Tournament applications cleared');

  // Clear tournaments (they reference users via createdBy)
  await em.nativeDelete('Tournament', {});
  console.log('   ✓ Tournaments cleared');

  // Clear existing users
  console.log('🗑️  Clearing existing users...');
  await em.nativeDelete(User, {});
  console.log('✅ Cleared users');

  // Fetch clubs for user assignment
  const clubs = await em.find(Club, {});
  console.log(`✅ Found ${clubs.length} clubs for user assignment`);

  // Create admin user first
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = em.create(User, {
    email: 'admin@archery.com',
    password: adminPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: 'general_admin',
    authProvider: 'local',
    appLanguage: 'en',
    profileVisibility: 'personal',
    nationality: 'Portuguesa',
    gender: 'M',
    federationNumber: generateFederationNumber(),
    club: clubs.length > 0 ? clubs[0] : undefined,
  });
  em.persist(admin);
  console.log('✅ Admin user created');

  // Create 60 regular users
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
    'Teresa',
    'Fernando',
    'Leonor',
    'António',
    'Matilde',
    'José',
    'Lara',
    'Manuel',
    'Clara',
    'Francisco',
    'Alice',
    'Rodrigo',
    'Constança',
    'Tomás',
    'Mafalda',
    'Duarte',
    'Bianca',
    'Afonso',
    'Filipa',
    'Guilherme',
    'Daniela',
    'Simão',
    'Helena',
    'Martim',
    'Raquel',
    'David',
    'Patrícia',
    'Alexandre',
    'Vera',
    'Bernardo',
    'Sandra',
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
  ];

  console.log('👥 Creating 60 regular users...');
  for (let i = 0; i < 60; i++) {
    const nationality = i < 6 ? 'Outro' : 'Portuguesa';
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const gender = femaleNames.includes(firstName) ? 'F' : 'M';
    const club =
      Math.random() < 0.1
        ? undefined
        : clubs[Math.floor(Math.random() * clubs.length)];

    const user = em.create(User, {
      email: `user${i + 1}@archery.com`,
      password: userPassword,
      firstName,
      lastName,
      role: 'user',
      authProvider: 'local',
      profileVisibility: 'personal',
      appLanguage: i % 2 === 0 ? 'pt' : 'en',
      nationality,
      gender,
      federationNumber: generateFederationNumber(),
      club,
    });
    em.persist(user);
  }

  await em.flush();
  await orm.close();

  console.log('✅ 60 regular users created');
  console.log('\n🎉 User reseeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('   • 1 Admin user (admin@archery.com / admin123)');
  console.log(
    '   • 60 Regular users (user1@archery.com - user60@archery.com / user123)',
  );
  console.log('   • All users have federation numbers and clubs assigned');
}

reseedUsers().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
