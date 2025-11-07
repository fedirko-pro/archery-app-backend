# Database Successfully Seeded 🎉

The database has been populated with test data including users, tournaments, and applications.

## Summary

- ✅ **30 Users** (1 admin + 29 regular users)
- ✅ **20 Tournaments** (10 from seed x2 runs)
- ✅ **206 Applications** (103 x2 runs)
- ✅ **Avatars**: Random profile images from pravatar.cc
- ✅ **Banners**: Beautiful nature/castle images from Unsplash

## Login Credentials

### Admin Account
```
Email: admin@archery.com
Password: admin123
```

### Regular User Accounts
```
Email: user1@archery.com through user29@archery.com
Password: user123
```

Examples:
- user1@archery.com / user123
- user2@archery.com / user123
- ...
- user29@archery.com / user123

## Test the Upload Feature

Now you can test the file upload functionality:

1. **Login as admin**: http://localhost:3001/pt/auth/login
   - Email: `admin@archery.com`
   - Password: `admin123`

2. **View tournaments**: http://localhost:3001/pt/tournaments
   - See existing tournaments with beautiful Unsplash banners

3. **Create new tournament**: http://localhost:3001/pt/tournaments/create
   - Upload a banner image
   - Test the crop functionality
   - See it converted to WebP

4. **Edit tournament**: Pick any tournament and click Edit
   - Change the banner
   - Upload attachments (PDF, DOC, images)
   - Test file deletion

5. **View tournament detail**: Click on any tournament
   - See the banner displayed
   - Download attachments

## Sample Data

### Users
- Portuguese names (João, Maria, Pedro, Ana, etc.)
- Mix of Portuguese and English language preferences
- Profile pictures from https://i.pravatar.cc

### Tournaments
- 10 different tournament types
- Various locations in Portugal
- Beautiful banner images from Unsplash:
  - Mountain landscapes
  - Medieval castles
  - Nature scenery
  - Coastal views

### Applications
- Each tournament has 5-15 random applications
- Various categories: recurve, compound, barebow, traditional, longbow
- Various divisions: men, women, mixed
- All in "pending" status

## Re-running the Seeder

If you want to reset and re-seed the database:

```bash
cd archery-app-backend

# Drop and recreate schema
npx mikro-orm schema:fresh --run

# Run all migrations
npx mikro-orm migration:up

# Seed the database
npx mikro-orm seeder:run --class DatabaseSeeder
```

⚠️ **WARNING**: `schema:fresh` will DELETE ALL DATA. Use carefully!

## Upload API Endpoints

The following upload endpoints are now ready:

### Upload Image (Avatar/Banner)
```bash
POST /api/upload/image
Content-Type: multipart/form-data

Body:
- file: File
- type: 'avatar' | 'banner'
- cropX, cropY, cropWidth, cropHeight (optional)
- quality (optional)
```

### Upload Attachment
```bash
POST /api/upload/attachment
Content-Type: multipart/form-data

Body:
- file: File
- tournamentId: UUID
```

### Delete Attachment
```bash
DELETE /api/upload/attachment/:tournamentId/:filename
```

## Next Steps

1. Test creating a new tournament with a custom banner
2. Test uploading attachments to existing tournaments
3. Test downloading attachments
4. Test deleting attachments
5. Verify WebP conversion and image optimization

Happy testing! 🏹
