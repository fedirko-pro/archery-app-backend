import { Injectable } from '@nestjs/common';
import { User } from './entity/user.entity';
import { ProfileVisibilities, Roles } from './types';

export type ProfileViewLevel = 'none' | 'limited' | 'public' | 'full';

export interface ProfileViewer {
  sub: string;
  role: string;
  clubId?: string | null;
}

@Injectable()
export class ProfileVisibilityService {
  resolveViewLevel(
    target: User,
    viewer?: ProfileViewer | null,
  ): ProfileViewLevel {
    if (viewer?.sub === target.id) {
      return 'full';
    }

    const visibility = target.profileVisibility ?? ProfileVisibilities.Personal;

    if (visibility === ProfileVisibilities.Personal) {
      return 'none';
    }

    if (visibility === ProfileVisibilities.Public) {
      return 'public';
    }

    if (!viewer) {
      return 'none';
    }

    if (viewer.role === Roles.FederationAdmin) {
      return 'limited';
    }

    const targetClubId = target.club?.id;
    if (targetClubId && viewer.clubId && targetClubId === viewer.clubId) {
      return 'limited';
    }

    return 'none';
  }

  canViewPublicUnauthenticated(target: User): boolean {
    return (
      (target.profileVisibility ?? ProfileVisibilities.Personal) ===
      ProfileVisibilities.Public
    );
  }
}
