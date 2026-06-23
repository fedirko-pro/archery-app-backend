import { Migration } from '@mikro-orm/migrations';

export class Migration20260623130000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create index "tournament_feedback_tournament_id_index" on "tournament_feedback" ("tournament_id");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `drop index if exists "tournament_feedback_tournament_id_index";`,
    );
  }
}
