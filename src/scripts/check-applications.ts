import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';
import {
  TournamentApplication,
  ApplicationStatus,
} from '../tournament/tournament-application.entity';
import { Tournament } from '../tournament/tournament.entity';

async function checkApplications() {
  const orm = await MikroORM.init(config);
  const em = orm.em.fork();

  console.log('🔍 Checking tournament applications...\n');

  const apps = await em.find(
    TournamentApplication,
    {},
    { populate: ['tournament'] },
  );

  const approved = apps.filter(
    (a) => a.status === ApplicationStatus.APPROVED,
  ).length;
  const pending = apps.filter(
    (a) => a.status === ApplicationStatus.PENDING,
  ).length;

  console.log('📊 Applications by status:');
  console.log(
    `   APPROVED: ${approved} (${Math.round((approved / apps.length) * 100)}%)`,
  );
  console.log(
    `   PENDING: ${pending} (${Math.round((pending / apps.length) * 100)}%)`,
  );
  console.log(`   Total: ${apps.length}`);

  // Count per tournament
  const tournaments = await em.find(Tournament, {});
  console.log('\n📋 Applications per tournament:');
  for (const tournament of tournaments) {
    const count = apps.filter((a) => a.tournament.id === tournament.id).length;
    console.log(`   ${tournament.title}: ${count}`);
  }

  await orm.close();
}

checkApplications().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
