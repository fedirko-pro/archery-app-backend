# File Upload Implementation Plan

## Architecture Overview

### 1. Upload Module Structure
```
src/upload/
├── upload.module.ts
├── upload.controller.ts
├── upload.service.ts
├── dto/
│   ├── upload-image.dto.ts
│   └── upload-attachment.dto.ts
└── interfaces/
    └── upload-options.interface.ts
```

### 2. Storage Structure
```
uploads/
├── images/              # Processed images (webp format)
│   ├── avatars/        # User avatars (512x512)
│   └── banners/        # Tournament banners (1200x400)
└── attachments/         # Tournament attachments (original format)
    └── [tournament-id]/ # Organized by tournament
        └── [files]      # PDF, DOC, images
```

### 3. API Endpoints

#### Image Upload (Universal)
```
POST /api/upload/image
Content-Type: multipart/form-data

Body:
- file: File (required)
- type: 'avatar' | 'banner' (required)
- cropX: number (optional)
- cropY: number (optional)
- cropWidth: number (optional)
- cropHeight: number (optional)
- quality: number (optional, default: 90)

Response:
{
  url: string,           // Relative URL: /uploads/images/avatars/uuid.webp
  filename: string,      // uuid.webp
  size: number,          // File size in bytes
  dimensions: {
    width: number,
    height: number
  }
}
```

#### Attachment Upload
```
POST /api/upload/attachment
Content-Type: multipart/form-data

Body:
- file: File (required)
- tournamentId: string (required)

Response:
{
  id: string,            // UUID for the attachment
  url: string,           // Relative URL: /uploads/attachments/[tournament-id]/[filename]
  filename: string,      // Original filename
  size: number,          // File size in bytes
  mimeType: string,      // File MIME type
  uploadedAt: string     // ISO timestamp
}
```

#### Delete Attachment
```
DELETE /api/upload/attachment/:id
Response: 204 No Content
```

### 4. Image Processing Flow

1. **Upload** → Receive file via multer
2. **Validate** → Check file type, size
3. **Process** → Use sharp library:
   - Crop if coordinates provided
   - Resize to target dimensions
   - Convert to WebP format
   - Compress with quality setting
4. **Save** → Write to disk with UUID filename
5. **Return** → Send URL and metadata

### 5. Attachment Processing Flow

1. **Upload** → Receive file via multer
2. **Validate** → Check file type (PDF, DOC, DOCX, images), size
3. **Organize** → Save to tournament-specific folder
4. **Save** → Write to disk with original name (sanitized)
5. **Return** → Send URL and metadata

### 6. Database Schema Changes

#### Tournament Entity
```typescript
@Property({ nullable: true })
banner?: string;  // URL to banner image

@Property({ type: 'json', nullable: true })
attachments?: Array<{
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}>;
```

### 7. Cleanup Job (Scheduled Task)

```typescript
@Cron('0 0 * * *')  // Run daily at midnight
async cleanupOldAttachments() {
  // Find tournaments ended > 1 month ago
  // Delete their attachment folders
  // Remove attachment references from database
}
```

### 8. Dependencies to Install

```bash
npm install --save @nestjs/platform-express multer sharp @nestjs/schedule
npm install --save-dev @types/multer @types/sharp
```

### 9. Configuration

```typescript
// config/upload.config.ts
export default {
  maxFileSize: {
    image: 10 * 1024 * 1024,        // 10MB
    attachment: 50 * 1024 * 1024,   // 50MB
  },
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedAttachmentTypes: [
    'image/jpeg',
    'image/png',
    'image/pdf',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  imageDimensions: {
    avatar: { width: 512, height: 512 },
    banner: { width: 1200, height: 400 },
  },
  uploadPath: 'uploads/',
  webpQuality: 90,
  attachmentRetentionDays: 30, // After tournament ends
};
```

### 10. Security Considerations

- File type validation (MIME type + file signature)
- File size limits
- Filename sanitization
- Rate limiting on upload endpoints
- Authentication required for uploads
- Only tournament creator/admin can upload attachments
- Serve files through controller (not direct folder access)

### 11. Frontend Integration Changes

#### Replace base64 with file upload:
```typescript
// Old: Store base64 in state
banner: string  // base64 data URL

// New: Upload file, store URL
banner: string  // /uploads/images/banners/uuid.webp
```

#### Upload flow:
1. User selects & crops image
2. Convert canvas to Blob
3. Upload Blob to /api/upload/image
4. Receive URL
5. Store URL in form state
6. Submit URL with tournament data

### 12. Migration Strategy

1. Add new fields to Tournament entity
2. Create migration for database schema
3. Deploy upload module
4. Update frontend to use new endpoints
5. Existing tournaments without banner/attachments work fine (nullable fields)
