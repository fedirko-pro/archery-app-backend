import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import { Tournament } from '../tournament/tournament.entity';
import { TournamentApplication } from '../tournament/tournament-application.entity';
import { Patrol } from '../tournament/patrol.entity';
import { PatrolMember } from '../tournament/patrol-member.entity';
import { Rule } from '../rule/rule.entity';
import { User } from '../user/entity/user.entity';

async function reseedTournaments() {
  console.log('🔄 Reseeding tournaments with rules...\n');

  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  try {
    // Delete existing tournament-related data
    console.log('🗑️  Clearing existing tournament data...');
    await em.nativeDelete(PatrolMember, {});
    await em.nativeDelete(Patrol, {});
    await em.nativeDelete(TournamentApplication, {});
    await em.nativeDelete(Tournament, {});
    console.log('✅ Cleared tournament data\n');

    // Fetch admin user
    const admin = await em.findOne(User, { role: 'admin' });
    if (!admin) {
      console.error('❌ Admin user not found. Please run full seeder first.');
      await orm.close();
      return;
    }

    // Fetch rules
    const rules = await em.find(Rule, {});
    if (rules.length === 0) {
      console.error('❌ No rules found. Please run full seeder first.');
      await orm.close();
      return;
    }
    console.log(`✅ Found ${rules.length} rules\n`);

    // Tournament data
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
      // Past tournaments
      'Winter Championship 2024',
      'Holiday Archery Classic',
      'New Year Tournament',
      'Early Spring Cup',
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
      // Past tournament locations
      'Porto Archery Range',
      'Lisbon Sports Complex',
      'Coimbra Stadium',
      'Braga Outdoor Center',
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
      // Past tournament banners
      'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&h=400&fit=crop',
      'https://images.unsplash.com/photo-1511576661531-b34d7da5d0bb?w=1200&h=400&fit=crop',
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
      // Past tournament descriptions
      'A memorable winter championship that brought together archers from across the region.',
      'Holiday season tournament featuring festive competitions and celebrations.',
      'New Year tournament marking the start of the archery season with great enthusiasm.',
      'Early spring competition that showcased emerging talent and competitive spirit.',
    ];

    // Create tournaments
    console.log('🏹 Creating tournaments with rules...');
    const tournaments: Tournament[] = [];
    const now = new Date();

    // Create future tournaments (first 10)
    for (let i = 0; i < 10; i++) {
      const startDate = new Date(now);
      startDate.setDate(now.getDate() + i * 15 + 10);

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (i % 3 === 0 ? 2 : 1));

      const applicationDeadline = new Date(startDate);
      applicationDeadline.setDate(startDate.getDate() - 5);

      // Assign rule (cycle through available rules)
      const rule = rules[i % rules.length];

      const tournament = em.create(Tournament, {
        title: tournamentNames[i],
        description: descriptions[i],
        address: locations[i],
        startDate,
        endDate,
        applicationDeadline,
        allowMultipleApplications: i % 3 !== 0,
        targetCount: 12 + (i % 3) * 6,
        banner: bannerImages[i],
        createdBy: admin,
        rule,
      });
      tournaments.push(tournament);
      console.log(`   ✓ ${tournamentNames[i]} (${rule.ruleCode}) - Future`);
    }

    // Create past tournaments (last 4)
    console.log('\n📜 Creating past tournaments for demo...');
    for (let i = 10; i < 14; i++) {
      const startDate = new Date(now);
      // Set dates in the past: 30, 60, 90, 120 days ago
      startDate.setDate(now.getDate() - (30 + (i - 10) * 30));

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + (i % 3 === 0 ? 2 : 1));

      const applicationDeadline = new Date(startDate);
      applicationDeadline.setDate(startDate.getDate() - 5);

      // Assign rule (cycle through available rules)
      const rule = rules[i % rules.length];

      const tournament = em.create(Tournament, {
        title: tournamentNames[i],
        description: descriptions[i],
        address: locations[i],
        startDate,
        endDate,
        applicationDeadline,
        allowMultipleApplications: i % 3 !== 0,
        targetCount: 12 + (i % 3) * 6,
        banner: bannerImages[i],
        createdBy: admin,
        rule,
      });
      tournaments.push(tournament);
      console.log(`   ✓ ${tournamentNames[i]} (${rule.ruleCode}) - Past`);
    }

    await em.persistAndFlush(tournaments);
    console.log(
      `\n✅ Created ${tournaments.length} tournaments (10 future, 4 past) with rules\n`,
    );

    console.log('🎉 Reseeding completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await orm.close();
  }
}

reseedTournaments();
