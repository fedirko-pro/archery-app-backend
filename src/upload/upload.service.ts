import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import {
  ImageUploadOptions,
  ProcessedImage,
  AttachmentMetadata,
} from './interfaces/upload-options.interface';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly uploadPath = 'uploads';
  private readonly maxImageSize = 10 * 1024 * 1024; // 10MB
  private readonly maxAttachmentSize = 50 * 1024 * 1024; // 50MB
  private readonly backendUrl: string;

  private readonly imageDimensions = {
    avatar: { width: 512, height: 512 },
    banner: { width: 1200, height: 400 },
  };

  private readonly allowedImageTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  private readonly allowedAttachmentTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  constructor(private readonly configService: ConfigService) {
    // Get backend URL from environment, fallback to localhost for development
    this.backendUrl =
      this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000';
    this.ensureUploadDirectories();
  }

  private async ensureUploadDirectories() {
    const directories = [
      join(this.uploadPath, 'images', 'avatars'),
      join(this.uploadPath, 'images', 'banners'),
      join(this.uploadPath, 'attachments'),
    ];

    for (const dir of directories) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        this.logger.log(`Created directory: ${dir}`);
      }
    }
  }

  async processAndSaveImage(
    file: Express.Multer.File,
    options: ImageUploadOptions,
  ): Promise<ProcessedImage> {
    // Validate file
    if (!this.allowedImageTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedImageTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxImageSize) {
      throw new BadRequestException(
        `File too large. Maximum size: ${this.maxImageSize / 1024 / 1024}MB`,
      );
    }

    try {
      const {
        type,
        entityId,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        quality = 90,
      } = options;
      const dimensions = this.imageDimensions[type];

      // Process image with sharp
      let image = sharp(file.buffer);

      // Apply crop if provided
      if (
        cropX !== undefined &&
        cropY !== undefined &&
        cropWidth &&
        cropHeight
      ) {
        image = image.extract({
          left: Math.round(cropX),
          top: Math.round(cropY),
          width: Math.round(cropWidth),
          height: Math.round(cropHeight),
        });
      }

      // Resize to target dimensions
      image = image.resize(dimensions.width, dimensions.height, {
        fit: 'cover',
        position: 'center',
      });

      // Convert to WebP
      const processedBuffer = await image.webp({ quality }).toBuffer();

      // Use entityId as filename - this ensures we always overwrite the old file
      const filename = `${entityId}.webp`;
      const filepath = join(this.uploadPath, 'images', `${type}s`, filename);

      // Delete old file if it exists (though writeFile will overwrite anyway)
      try {
        await fs.access(filepath);
        this.logger.log(`Overwriting existing ${type} for entity ${entityId}`);
      } catch {
        // File doesn't exist, that's fine
      }

      await fs.writeFile(filepath, processedBuffer);

      // Get file stats
      const stats = await fs.stat(filepath);

      // Return full URL using backend URL from config
      const url = `${this.backendUrl}/uploads/images/${type}s/${filename}`;

      this.logger.log(`Saved ${type} image: ${url} (${stats.size} bytes)`);

      return {
        url,
        filename,
        size: stats.size,
        dimensions,
      };
    } catch (error) {
      this.logger.error(
        `Error processing image: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to process image');
    }
  }

  async saveAttachment(
    file: Express.Multer.File,
    tournamentId: string,
  ): Promise<AttachmentMetadata> {
    // Validate file
    if (!this.allowedAttachmentTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedAttachmentTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxAttachmentSize) {
      throw new BadRequestException(
        `File too large. Maximum size: ${this.maxAttachmentSize / 1024 / 1024}MB`,
      );
    }

    try {
      // Create tournament-specific directory
      const tournamentDir = join(this.uploadPath, 'attachments', tournamentId);
      try {
        await fs.access(tournamentDir);
      } catch {
        await fs.mkdir(tournamentDir, { recursive: true });
      }

      // Sanitize filename
      const sanitizedFilename = this.sanitizeFilename(file.originalname);
      const id = uuid();
      const filename = `${id}_${sanitizedFilename}`;
      const filepath = join(tournamentDir, filename);

      // Save file
      await fs.writeFile(filepath, file.buffer);

      // Return full URL using backend URL from config
      const url = `${this.backendUrl}/uploads/attachments/${tournamentId}/${filename}`;

      this.logger.log(`Saved attachment: ${url} (${file.size} bytes)`);

      return {
        id,
        url,
        filename: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
      };
    } catch (error) {
      this.logger.error(
        `Error saving attachment: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException('Failed to save attachment');
    }
  }

  async deleteAttachment(
    tournamentId: string,
    filename: string,
  ): Promise<void> {
    try {
      const filepath = join(
        this.uploadPath,
        'attachments',
        tournamentId,
        filename,
      );
      await fs.unlink(filepath);
      this.logger.log(`Deleted attachment: ${filepath}`);
    } catch (error) {
      this.logger.error(
        `Error deleting attachment: ${error.message}`,
        error.stack,
      );
      // Don't throw error if file doesn't exist
      if (error.code !== 'ENOENT') {
        throw new BadRequestException('Failed to delete attachment');
      }
    }
  }

  async cleanupTournamentAttachments(tournamentId: string): Promise<void> {
    try {
      const tournamentDir = join(this.uploadPath, 'attachments', tournamentId);
      await fs.rm(tournamentDir, { recursive: true, force: true });
      this.logger.log(`Cleaned up tournament attachments: ${tournamentId}`);
    } catch (error) {
      this.logger.error(
        `Error cleaning up attachments: ${error.message}`,
        error.stack,
      );
    }
  }

  async deleteImage(
    entityId: string,
    type: 'avatar' | 'banner',
  ): Promise<void> {
    try {
      const filename = `${entityId}.webp`;
      const filepath = join(this.uploadPath, 'images', `${type}s`, filename);
      await fs.unlink(filepath);
      this.logger.log(`Deleted ${type} image for entity ${entityId}`);
    } catch (error) {
      // Don't throw error if file doesn't exist
      if (error.code !== 'ENOENT') {
        this.logger.error(
          `Error deleting ${type} image: ${error.message}`,
          error.stack,
        );
      }
    }
  }

  async cleanupUserFiles(userId: string): Promise<void> {
    await this.deleteImage(userId, 'avatar');
    this.logger.log(`Cleaned up user files: ${userId}`);
  }

  async cleanupTournamentFiles(tournamentId: string): Promise<void> {
    await this.deleteImage(tournamentId, 'banner');
    await this.cleanupTournamentAttachments(tournamentId);
    this.logger.log(`Cleaned up all tournament files: ${tournamentId}`);
  }

  private sanitizeFilename(filename: string): string {
    // Remove any directory traversal attempts and special characters
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 200); // Limit length
  }
}
