# Patrol System API Documentation

## Overview

Patrol generation system for archery competitions with automatic participant distribution based on bow category, division, and gender.

---

## 🎯 Patrol Generation Algorithm

### Core Principle
The algorithm groups participants by **bow category** as the primary criterion, ensuring that archers using the same type of bow compete together. Secondary grouping considers division (age group) and gender.

### Algorithm Steps

#### Step 1: Group by Bow Category
```
Input: All approved applications
Output: Groups of participants by bow category (RC, CP, LB, etc.)

Example:
  RC (Recurve): [user1, user2, user3, user4, user5]
  CP (Compound): [user6, user7, user8]
  LB (Longbow): [user9, user10, user11, user12]
```

Within each bow category group, participants are sorted by division+gender for optimal sub-grouping.

#### Step 2: Calculate Target Patrol Sizes
```
avgSize = ceil(totalParticipants / targetPatrolCount)
minSize = max(3, floor(avgSize * 0.8))
maxSize = ceil(avgSize * 1.2)
```

#### Step 3: Initial Patrol Formation
Create patrols from each bow category group, respecting min/max sizes.

#### Step 4: Adjust to Target Count
- If too many patrols: Merge smaller patrols (prefer same category)
- If too few patrols: Split larger patrols

#### Step 5: Balance Patrol Sizes
Move participants between patrols to achieve balanced sizes.
Priority when moving: 
1. **Bow Category match** (10 points)
2. **Division match** (3 points)  
3. **Gender match** (1 point)

#### Step 6: Balance Clubs for Judges
Best-effort to ensure judges come from different clubs for fairness.

#### Step 7: Assign Roles
- **1 Leader**: Random participant (not a judge)
- **2 Judges**: Preferably from different clubs

#### Step 8: Calculate Statistics
- `categoryHomogeneity`: % of patrols where all have same bow category
- `clubDiversityScore`: % of patrols with judges from different clubs
- `divisionHomogeneity`: % of patrols where all have same division
- `genderHomogeneity`: % of patrols where all have same gender

### Statistics Explained

| Metric | Description | Target |
|--------|-------------|--------|
| Category Match | % of patrols with same bow category | ≥70% |
| Club Diversity | % of patrols with judges from different clubs | ≥70% |
| Division Match | % of patrols with same division | ≥50% |
| Gender Match | % of patrols with same gender | ≥50% |

---

## 🏢 Club Endpoints

### GET /clubs
Get list of all clubs
- **Auth**: No
- **Response**: `Club[]`

### GET /clubs/:id
Get club by ID
- **Auth**: No
- **Response**: `Club`

### POST /clubs
Create new club
- **Auth**: Yes (Admin)
- **Body**:
```json
{
  "name": "Club Name",
  "description": "Optional description",
  "location": "City, Country",
  "clubLogo": "/uploads/clubs/logo.png"
}
```
- **Response**: `Club`

### PATCH /clubs/:id
Update club
- **Auth**: Yes (Admin)
- **Body**: Partial `CreateClubDto`
- **Response**: `Club`

### DELETE /clubs/:id
Delete club
- **Auth**: Yes (Admin)
- **Response**: 204 No Content

---

## 📋 Division Endpoints

### GET /divisions
Get list of divisions (can filter by rule)
- **Auth**: No
- **Query Params**:
  - `ruleId` (optional) - filter by rule ID
- **Response**: `Division[]`

### GET /divisions/:id
Get division by ID
- **Auth**: No
- **Response**: `Division` (with populated rule)

### POST /divisions
Create new division
- **Auth**: Yes (Admin)
- **Body**:
```json
{
  "name": "Adult Male",
  "description": "Men 18-49 years",
  "ruleId": "rule-uuid"
}
```
- **Response**: `Division`

### PATCH /divisions/:id
Update division
- **Auth**: Yes (Admin)
- **Body**: Partial `CreateDivisionDto`
- **Response**: `Division`

### DELETE /divisions/:id
Delete division
- **Auth**: Yes (Admin)
- **Response**: 204 No Content

---

## 📜 Rule Endpoints

### GET /rules
Get list of all rules
- **Auth**: No
- **Response**: `Rule[]` (with populated divisions and bowCategories)

### GET /rules/:id
Get rule by ID
- **Auth**: No
- **Response**: `Rule` (with populated divisions and bowCategories)

**Note**: Rules are created via seeders, no CRUD endpoints for creation.

---

## 🏹 Bow Category Endpoints

### GET /bow-categories
Get list of bow categories (can filter by rule)
- **Auth**: No
- **Query Params**:
  - `ruleId` (optional) - filter by rule ID
- **Response**: `BowCategory[]`

### GET /bow-categories/:id
Get bow category by ID
- **Auth**: No
- **Response**: `BowCategory` (with populated rule)

**Note**: Bow Categories are created via seeders.

---

## 🎯 Patrol Generation Endpoints

### GET /patrols/tournaments/:tournamentId/generate-or-get
**Get existing patrols or auto-generate if none exist**
- **Auth**: Yes (Admin)
- **Response**:
```json
{
  "patrols": [...],
  "stats": {...},
  "isNewlyGenerated": true|false
}
```

This is the recommended endpoint for the frontend - it automatically generates and saves patrols if they don't exist.

---

### POST /patrols/tournaments/:tournamentId/generate
**Generate patrols (preview) - does NOT save to database**
- **Auth**: Yes (Admin)
- **Response**:
```json
{
  "patrols": [
    {
      "id": "patrol-uuid",
      "targetNumber": 1,
      "members": ["user-id-1", "user-id-2", "user-id-3"],
      "leaderId": "user-id-1",
      "judgeIds": ["user-id-2", "user-id-3"]
    }
  ],
  "stats": {
    "totalParticipants": 100,
    "averagePatrolSize": 5.5,
    "clubDiversityScore": 85.5,
    "homogeneityScores": {
      "category": 75.0,
      "division": 70.0,
      "gender": 60.0
    }
  }
}
```

---

### POST /patrols/tournaments/:tournamentId/generate-and-save
**Generate and save patrols to database (deletes existing patrols first)**
- **Auth**: Yes (Admin)
- **Response**: Same as generate, but patrols are persisted

**Note**: This endpoint deletes ALL existing patrols for the tournament before generating new ones.

---

### GET /patrols/tournaments/:tournamentId/pdf
**Generate PDF with saved patrol list for printing**
- **Auth**: No
- **Response**: PDF file (application/pdf)

**PDF Format:**
```
┌─────────────────────────────────────────────────────────┐
│              Tournament Name                            │
│              Patrol List | 01/12/2025                   │
├────────┬──────────────┬──────────┬──────────┬─────┬─────┤
│ Patrol │ Name         │ Club     │ Division │ Cat │Role │
├────────┼──────────────┼──────────┼──────────┼─────┼─────┤
│ #1     │ João Silva   │ Club A   │ Adult M  │ RC  │Lead │
│        │ Maria Santos │ Club B   │ Adult F  │ RC  │Judge│
│        │ Pedro Costa  │ Club C   │ Adult M  │ RC  │Judge│
│        │ Ana Rodrigues│ Club A   │ Adult F  │ RC  │     │
├────────┼──────────────┼──────────┼──────────┼─────┼─────┤
│ #2     │ ...          │ ...      │ ...      │ CP  │     │
└────────┴──────────────┴──────────┴──────────┴─────┴─────┘
```

---

## 📊 Patrol CRUD Endpoints

### GET /patrols
Get all patrols
- **Auth**: No
- **Response**: `Patrol[]`

### GET /patrols/:id
Get patrol by ID
- **Auth**: No
- **Response**: `Patrol`

### GET /patrols/tournament/:tournamentId
Get all patrols for tournament
- **Auth**: No
- **Response**: `Patrol[]` with members including division and bowCategory

### POST /patrols
Create patrol manually
- **Auth**: Yes (Admin)
- **Body**:
```json
{
  "name": "Patrol 1",
  "tournamentId": "tournament-uuid",
  "leaderId": "user-uuid"
}
```
- **Response**: `Patrol`

### PUT /patrols/:id
Update patrol
- **Auth**: Yes (Admin)
- **Body**: Partial patrol data
- **Response**: `Patrol`

### DELETE /patrols/:id
Delete patrol (also deletes all patrol members)
- **Auth**: Yes (Admin)
- **Response**: 204 No Content

### POST /patrols/:patrolId/members
Add member to patrol
- **Auth**: Yes (Admin)
- **Body**:
```json
{
  "userId": "user-uuid",
  "role": "member" | "leader" | "judge"
}
```
- **Response**: `PatrolMember`

### DELETE /patrols/:patrolId/members/:userId
Remove member from patrol
- **Auth**: Yes (Admin)
- **Response**: 204 No Content

---

## 🗂️ Data Models

### Club
```typescript
{
  id: string;
  name: string;
  description?: string;
  location?: string;
  clubLogo?: string;
  createdAt: Date;
  updatedAt?: Date;
}
```

### Division
```typescript
{
  id: string;
  name: string;  // e.g., "Adult Male", "Junior Female"
  description?: string;
  rule: Rule;
  createdAt: Date;
  updatedAt?: Date;
}
```

### BowCategory
```typescript
{
  id: string;
  name: string;  // e.g., "Field Sport Compound"
  code?: string;  // e.g., "FSC", "LB", "BBC", "RC", "CP"
  descriptionEn?: string;
  rule: Rule;
  createdAt: Date;
  updatedAt?: Date;
}
```

### Rule
```typescript
{
  id: string;
  ruleCode: string;  // e.g., "FABP-ROTA"
  ruleName: string;  // e.g., "FABP Rota dos Castelos"
  descriptionEn?: string;
  descriptionPt?: string;
  divisions: Division[];
  bowCategories: BowCategory[];
  createdAt: Date;
  updatedAt?: Date;
}
```

### Patrol
```typescript
{
  id: string;
  name: string;  // e.g., "Target 1"
  description?: string;
  tournament: Tournament;
  leader: User;
  members: PatrolMember[];
  createdAt: Date;
  updatedAt?: Date;
}
```

### PatrolMember
```typescript
{
  id: string;
  patrol: Patrol;
  user: User;
  role: 'member' | 'leader' | 'judge';
  createdAt: Date;
}
```

### PatrolEntry (Internal - for generation)
```typescript
{
  participantId: string;
  name: string;
  club: string;
  bowCategory: string;  // e.g., "RC", "CP"
  division: string;     // e.g., "Adult Male"
  gender: string;       // "M", "F", "Other"
  escalao: string;
}
```

---

## 🔄 Typical Workflow

### 1. Setup (One-time)
```bash
# Run database seeder
npx mikro-orm seeder:run --class=DatabaseSeeder
```

### 2. Admin creates tournament with rule
```http
POST /tournaments
{
  "title": "Championship 2025",
  "ruleId": "fabp-rota-rule-id",
  "targetCount": 18,
  ...
}
```

### 3. Users submit applications
```http
POST /tournament-applications
{
  "tournamentId": "...",
  "divisionId": "adult-male-id",
  "bowCategoryId": "rc-id",
  "notes": "..."
}
```

### 4. Admin approves applications
```http
PATCH /tournament-applications/:id/status
{
  "status": "approved"
}
```

### 5. Admin views patrols (auto-generates if needed)
```http
GET /patrols/tournaments/:id/generate-or-get
```

### 6. Admin can regenerate if needed
```http
POST /patrols/tournaments/:id/generate-and-save
```

### 7. Generate PDF for printing
```http
GET /patrols/tournaments/:id/pdf
```

---

## ⚠️ Edge Cases Handled

1. **Insufficient participants**: Automatically reduces patrol count
2. **All from same club**: Proceeds with same-club judges (soft constraint)
3. **Uneven numbers**: Distributes evenly (some patrols N, others N+1)
4. **Small groups**: Merges with most similar patrols (same category preferred)
5. **Too many participants**: Creates larger patrols while maintaining balance
6. **Mixed categories**: Algorithm tries to keep same-category together
7. **No existing patrols**: Auto-generates when accessing patrol list

---

## 📈 Success Criteria

✅ Generates exactly targetPatrolCount patrols (or adjusts if impossible)  
✅ Every patrol has >= 3 members (minPatrolSize)  
✅ All approved participants distributed (none left out)  
✅ Every patrol has 1 leader + 2 judges  
✅ Patrol sizes differ by max 2 (balanced)  
✅ Maximizes bow category homogeneity  
✅ Best effort to assign judges from different clubs  
✅ Returns meaningful stats for quality assessment  
✅ PDF generates correctly with all information  

---

## 🔐 Authentication

Most endpoints require JWT authentication:
```http
Authorization: Bearer <jwt-token>
```

Admin-only endpoints also require `role: 'admin'` in JWT payload.

---

## 📦 Available Seeders

### DatabaseSeeder (Main)
**File**: `src/seeders/DatabaseSeeder.ts`
**Run**: `npx mikro-orm seeder:run --class=DatabaseSeeder`

Creates:
- 10 Clubs
- 5 Rules (including FABP-ROTA)
- 30 Bow Categories
- 8 Divisions (Cub/Junior/Adult/Veteran × Male/Female)
- 1 Admin user
- 90 Regular users
- 10 Tournaments
- ~500 Tournament applications (with divisions and bow categories)

### FABPRotaSeeder (Standalone)
**File**: `src/seeders/FABPRotaSeeder.ts`
**Run**: `npx mikro-orm seeder:run --class=FABPRotaSeeder`

Creates only FABP-specific data (idempotent - safe to run multiple times).

---

## 🛠️ Development

### Build
```bash
pnpm run build
```

### Run Migrations
```bash
pnpm run mikro-orm migration:up
```

### Start Server
```bash
pnpm run start:dev
```

### Reset Database
```bash
npx mikro-orm schema:drop --run
npx mikro-orm schema:create --run
npx mikro-orm seeder:run --class=DatabaseSeeder
```

---

## 📝 Notes

- All IDs are UUIDs
- Dates are in ISO 8601 format
- User's `federationNumber` field stores FABP ID or other federation identifiers
- Patrol generation is based on APPROVED applications only
- PDF generation happens on-the-fly (not cached)
- Bow category code (e.g., "RC") is preferred over full name in compact displays
