import { Migration } from '@mikro-orm/migrations';

export class Migration20251005142500_RenameLanguageToAppLanguage extends Migration {
  override async up(): Promise<void> {
    // Rename column if it exists; if not, add it to be safe
    this.addSql(
      `alter table "user" rename column "language" to "app_language";`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "user" rename column "app_language" to "language";`,
    );
  }
}
