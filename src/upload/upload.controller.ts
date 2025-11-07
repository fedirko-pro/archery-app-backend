import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { UploadAttachmentDto } from './dto/upload-attachment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.uploadService.processAndSaveImage(file, {
      type: dto.type,
      entityId: dto.entityId,
      cropX: dto.cropX,
      cropY: dto.cropY,
      cropWidth: dto.cropWidth,
      cropHeight: dto.cropHeight,
      quality: dto.quality,
    });

    return result;
  }

  @Post('attachment')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadAttachmentDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const result = await this.uploadService.saveAttachment(
      file,
      dto.tournamentId,
    );

    return result;
  }

  @Delete('attachment/:tournamentId/:filename')
  async deleteAttachment(
    @Param('tournamentId') tournamentId: string,
    @Param('filename') filename: string,
  ) {
    await this.uploadService.deleteAttachment(tournamentId, filename);
    return { message: 'Attachment deleted successfully' };
  }
}
