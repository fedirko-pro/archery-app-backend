export class PublicAchievementShareDto {
  id: string;
  title: string;
  description: string;
  rarity: string;
  earned: boolean;
  earnedDate?: string | null;
  owner: {
    id: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
  };
}
