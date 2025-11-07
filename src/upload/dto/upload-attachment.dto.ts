import { IsUUID } from 'class-validator';

export class UploadAttachmentDto {
  @IsUUID()
  tournamentId: string;
}
