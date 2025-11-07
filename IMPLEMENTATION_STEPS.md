# File Upload Implementation - Remaining Steps

## ✅ Completed
1. Created upload module structure with interfaces, DTOs, service, and controller
2. Updated Tournament entity with `banner` and `attachments` fields
3. Created UPLOAD_IMPLEMENTATION.md with full architecture documentation

## 📋 TODO: Backend

### 1. Install Required Dependencies
```bash
cd archery-app-backend
npm install --save @nestjs/platform-express multer sharp @nestjs/schedule
npm install --save-dev @types/multer
```

### 2. Register Upload Module in app.module.ts
```typescript
import { UploadModule } from './upload/upload.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // ... existing imports
    ScheduleModule.forRoot(),
    UploadModule,
  ],
  // ...
})
```

### 3. Create Database Migration
```bash
npx mikro-orm migration:create --name add-tournament-banner-attachments
```

This will create a migration file. The migration should add:
- `banner` column (nullable, varchar)
- `attachments` column (nullable, json)

### 4. Run Migration
```bash
npx mikro-orm migration:up
```

### 5. Create Cleanup Service (Optional - for scheduled cleanup)

Create `src/upload/upload-cleanup.service.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';
import { Tournament } from '../tournament/tournament.entity';
import { UploadService } from './upload.service';

@Injectable()
export class UploadCleanupService {
  private readonly logger = new Logger(UploadCleanupService.name);

  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentRepo: EntityRepository<Tournament>,
    private readonly uploadService: UploadService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldAttachments() {
    this.logger.log('Starting cleanup of old tournament attachments');

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    try {
      // Find tournaments that ended more than 1 month ago
      const oldTournaments = await this.tournamentRepo.find({
        endDate: { $lt: oneMonthAgo },
        attachments: { $ne: null },
      });

      for (const tournament of oldTournaments) {
        this.logger.log(`Cleaning attachments for tournament: ${tournament.id}`);

        // Delete files from disk
        await this.uploadService.cleanupTournamentAttachments(tournament.id);

        // Clear attachments from database
        tournament.attachments = [];
        await this.tournamentRepo.flush();
      }

      this.logger.log(`Cleaned up ${oldTournaments.length} tournaments`);
    } catch (error) {
      this.logger.error('Error during cleanup:', error);
    }
  }
}
```

Register it in `upload.module.ts`:
```typescript
import { UploadCleanupService } from './upload-cleanup.service';

@Module({
  // ...
  providers: [UploadService, UploadCleanupService],
  // ...
})
```

### 6. Configure Static File Serving

Add to `main.ts`:
```typescript
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// In bootstrap function:
const app = await NestFactory.create<NestExpressApplication>(AppModule);

// Serve static files from uploads directory
app.useStaticAssets(join(__dirname, '..', 'uploads'), {
  prefix: '/uploads/',
});
```

### 7. Update Tournament DTOs (if needed)

Ensure `CreateTournamentDto` and `UpdateTournamentDto` include:
```typescript
@IsOptional()
@IsString()
banner?: string;

@IsOptional()
@IsArray()
attachments?: AttachmentMetadata[];
```

## 📋 TODO: Frontend

### 1. Create Upload API Service

Add to `src/services/api.ts`:

```typescript
// Upload image (avatar or banner)
async uploadImage(
  file: Blob,
  type: 'avatar' | 'banner',
  options?: {
    cropX?: number;
    cropY?: number;
    cropWidth?: number;
    cropHeight?: number;
    quality?: number;
  }
): Promise<{ url: string; filename: string; size: number; dimensions: { width: number; height: number } }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  if (options) {
    if (options.cropX !== undefined) formData.append('cropX', options.cropX.toString());
    if (options.cropY !== undefined) formData.append('cropY', options.cropY.toString());
    if (options.cropWidth !== undefined) formData.append('cropWidth', options.cropWidth.toString());
    if (options.cropHeight !== undefined) formData.append('cropHeight', options.cropHeight.toString());
    if (options.quality !== undefined) formData.append('quality', options.quality.toString());
  }

  const response = await this.axiosInstance.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
},

// Upload attachment
async uploadAttachment(
  file: File,
  tournamentId: string
): Promise<{ id: string; url: string; filename: string; size: number; mimeType: string; uploadedAt: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tournamentId', tournamentId);

  const response = await this.axiosInstance.post('/upload/attachment', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
},

// Delete attachment
async deleteAttachment(tournamentId: string, filename: string): Promise<void> {
  await this.axiosInstance.delete(`/upload/attachment/${tournamentId}/${filename}`);
},
```

### 2. Update BannerUploader Component

Replace the current implementation that uses base64 with:

```typescript
const handleSave = async () => {
  if (!imageEl || !naturalSize) return;

  // Create canvas and get image data
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Draw image (same cropping logic)
  const baseScaleW = width / naturalSize.w;
  const baseScaleH = height / naturalSize.h;
  const baseScale = Math.max(baseScaleW, baseScaleH);
  const scale = baseScale * zoom;
  const sx = Math.max(0, Math.min(naturalSize.w - width / scale, -offset.x / scale));
  const sy = Math.max(0, Math.min(naturalSize.h - height / scale, -offset.y / scale));
  const sWidth = width / scale;
  const sHeight = height / scale;
  ctx.clearRect(0, 0, outputWidth, outputHeight);
  ctx.drawImage(imageEl, sx, sy, sWidth, sHeight, 0, 0, outputWidth, outputHeight);

  // Convert canvas to Blob
  canvas.toBlob(async (blob) => {
    if (!blob) return;

    try {
      // Upload to server
      const result = await apiService.uploadImage(blob, 'banner', {
        quality: 90
      });

      // Pass URL to parent component
      onChange(result.url);
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload image');
    }
  }, 'image/jpeg', 0.9);
};
```

### 3. Update AvatarUploader Component

Similar changes as BannerUploader, but use `type: 'avatar'`

### 4. Update FileAttachments Component

Replace base64 storage with actual file upload:

```typescript
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);

  // ... validation ...

  for (const file of files) {
    try {
      const result = await apiService.uploadAttachment(file, tournamentId);
      validFiles.push(result);
    } catch (err) {
      errors.push(`${file.name}: Failed to upload`);
    }
  }

  if (validFiles.length > 0) {
    onChange([...value, ...validFiles]);
  }
};

const handleRemove = async (id: string) => {
  const attachment = value.find(f => f.id === id);
  if (!attachment) return;

  try {
    const filename = attachment.url.split('/').pop();
    await apiService.deleteAttachment(tournamentId, filename);
    onChange(value.filter((file) => file.id !== id));
  } catch (error) {
    console.error('Delete failed:', error);
  }
};
```

### 5. Update Tournament Forms

In `tournament-create.tsx` and `tournament-edit.tsx`:

- `banner` should now be a URL string (not base64)
- `attachments` should be `AttachmentMetadata[]` (not with dataUrl)
- Remove base64 conversion logic
- Use the upload API endpoints

## 🧪 Testing

### Backend Tests
```bash
# Test image upload
curl -X POST http://localhost:3000/api/upload/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "type=banner"

# Test attachment upload
curl -X POST http://localhost:3000/api/upload/attachment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-document.pdf" \
  -F "tournamentId=YOUR_TOURNAMENT_ID"
```

### Frontend Tests
1. Create new tournament with banner upload
2. Add attachments to tournament
3. Edit tournament and change banner
4. Delete attachments
5. Verify images are WebP format
6. Check file sizes are reduced

## 📝 Notes

- All images are converted to WebP format for better compression
- Attachments are organized by tournament ID
- Cleanup job runs daily to remove old attachments
- Files are served through NestJS (not direct folder access)
- Authentication is required for all uploads
- File type and size validation is enforced

## 🔒 Security Checklist

- [x] File type validation (MIME type)
- [x] File size limits
- [x] Filename sanitization
- [x] Authentication required
- [x] Path traversal prevention
- [ ] Rate limiting (add if needed)
- [ ] Virus scanning (add if needed for production)
