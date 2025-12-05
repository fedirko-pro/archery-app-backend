# Patrol System API Documentation

## Overview
Система генерації патрулів для змагань з стрільби з лука з автоматичним розподілом учасників.

---

## 🏢 Club Endpoints

### GET /clubs
Отримати список всіх клубів
- **Auth**: No
- **Response**: `Club[]`

### GET /clubs/:id
Отримати клуб за ID
- **Auth**: No
- **Response**: `Club`

### POST /clubs
Створити новий клуб
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
Оновити клуб
- **Auth**: Yes (Admin)
- **Body**: Partial `CreateClubDto`
- **Response**: `Club`

### DELETE /clubs/:id
Видалити клуб
- **Auth**: Yes (Admin)
- **Response**: 204 No Content

---

## 📋 Division Endpoints

### GET /divisions
Отримати список дивізіонів (можна фільтрувати за правилами)
- **Auth**: No
- **Query Params**:
  - `ruleId` (optional) - фільтр за ID правила
- **Response**: `Division[]`

### GET /divisions/:id
Отримати дивізіон за ID
- **Auth**: No
- **Response**: `Division` (з populate rule)

### POST /divisions
Створити новий дивізіон
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
Оновити дивізіон
- **Auth**: Yes (Admin)
- **Body**: Partial `CreateDivisionDto`
- **Response**: `Division`

### DELETE /divisions/:id
Видалити дивізіон
- **Auth**: Yes (Admin)
- **Response**: 204 No Content

---

## 📜 Rule Endpoints

### GET /rules
Отримати список всіх правил
- **Auth**: No
- **Response**: `Rule[]` (з populate divisions та bowCategories)

### GET /rules/:id
Отримати правило за ID
- **Auth**: No
- **Response**: `Rule` (з populate divisions та bowCategories)

**Note**: Rules створюються через seeders, немає CRUD endpoints для створення.

---

## 🏹 Bow Category Endpoints

### GET /bow-categories
Отримати список категорій луків (можна фільтрувати за правилами)
- **Auth**: No
- **Query Params**:
  - `ruleId` (optional) - фільтр за ID правила
- **Response**: `BowCategory[]`

### GET /bow-categories/:id
Отримати категорію лука за ID
- **Auth**: No
- **Response**: `BowCategory` (з populate rule)

**Note**: Bow Categories створюються через seeders, немає CRUD endpoints для створення.

---

## 🎯 Patrol Generation Endpoints

### POST /patrols/tournaments/:tournamentId/generate
**Згенерувати патрулі (preview) на основі ВСІХ затверджених заявок**
- **Auth**: Yes (Admin)
- **Body**: No body required
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
      "division": 70.0,
      "gender": 60.0
    }
  }
}
```

**How it works:**
- Бере ВСІ approved заявки для турніру (без фільтрації по категорії лука)
- Використовує `targetCount` з турніру (за замовчуванням 18 мішеней)
- Генерує патрулі автоматично

**Algorithm Details:**
1. Групування учасників за схожістю (division + gender)
2. Розрахунок оптимальних розмірів патрулів (min: 3, avg, max)
3. Формування початкових патрулів
4. Коригування до цільової кількості мішеней (merge/split)
5. Балансування розмірів патрулів
6. Балансування клубів для різноманітності суддів
7. Призначення ролей (1 лідер + 2 судді)

**Stats Explanation:**
- `clubDiversityScore`: відсоток патрулів де судді з різних клубів
- `homogeneityScores.division`: відсоток патрулів де всі учасники з одного дивізіону
- `homogeneityScores.gender`: відсоток патрулів де всі учасники однієї статі

---

### POST /patrols/tournaments/:tournamentId/generate-and-save
**Згенерувати та зберегти патрулі в БД**
- **Auth**: Yes (Admin)
- **Body**: No body required
- **Response**:
```json
{
  "patrols": [
    {
      "id": "patrol-uuid",
      "name": "Target 1",
      "description": "Patrol for target 1",
      "tournament": { "id": "...", "title": "..." },
      "leader": { "id": "...", "firstName": "...", ... },
      "createdAt": "2025-12-01T19:00:00Z",
      "updatedAt": null
    }
  ],
  "stats": { ... }
}
```

**Note**: Цей endpoint створює записи Patrol та PatrolMember в БД.

---

### GET /patrols/tournaments/:tournamentId/pdf
**Згенерувати PDF з збереженими патрулями турніру для друку**
- **Auth**: No
- **Response**: PDF file (application/pdf)

**Note**: Цей endpoint працює зі збереженими патрулями турніру (після виклику `/generate-and-save`). Якщо патрулі не збережені - поверне помилку.

**PDF Format:**
```
TOURNAMENT NAME - BOW CATEGORY
Date: 01/12/2025

═══════════════════════════════════════════
PATROL 1 (Target #1)
═══════════════════════════════════════════
Leader: João Silva (Club A)
Judges: Maria Santos (Club B), Pedro Costa (Club C)

Members:
1. João Silva - Club A - Adult Male - M
2. Maria Santos - Club B - Adult Female - F
3. Pedro Costa - Club C - Veteran Male - M
4. Ana Rodrigues - Club A - Adult Female - F

═══════════════════════════════════════════
PATROL 2 (Target #2)
...
```

---

## 📊 Other Patrol Endpoints

### GET /patrols
Отримати всі патрулі
- **Auth**: No
- **Response**: `Patrol[]`

### GET /patrols/:id
Отримати патруль за ID
- **Auth**: No
- **Response**: `Patrol`

### GET /patrols/tournament/:tournamentId
Отримати всі патрулі для турніру
- **Auth**: No
- **Response**: `Patrol[]`

### POST /patrols
Створити патруль вручну
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
Оновити патруль
- **Auth**: Yes (Admin)
- **Body**: Partial patrol data
- **Response**: `Patrol`

### DELETE /patrols/:id
Видалити патруль
- **Auth**: Yes (Admin)
- **Response**: 204 No Content

### POST /patrols/:patrolId/members
Додати учасника до патруля
- **Auth**: Yes (Admin)
- **Body**:
```json
{
  "userId": "user-uuid",
  "role": "MEMBER" | "LEADER" | "JUDGE"
}
```
- **Response**: `PatrolMember`

### DELETE /patrols/:patrolId/members/:userId
Видалити учасника з патруля
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
  code?: string;  // e.g., "FSC", "LB", "BBC"
  description?: string;
  rule: Rule;
  createdAt: Date;
  updatedAt?: Date;
}
```

### Rule
```typescript
{
  id: string;
  name: string;  // e.g., "FABP Rota dos Castelos"
  description?: string;
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
  name: string;
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
  patrol: Patrol;
  user: User;
  role: 'MEMBER' | 'LEADER' | 'JUDGE';
  position?: number;
  createdAt: Date;
}
```

---

## 🔄 Typical Workflow

### 1. Setup (One-time)
```bash
# Run FABP Rota seeder
npx ts-node src/scripts/run-fabp-seeder.ts
```

### 2. Admin creates tournament with rule
```http
POST /tournaments
{
  "title": "Championship 2025",
  "ruleId": "fabp-rota-rule-id",
  ...
}
```

### 3. Users submit applications
```http
POST /tournament-applications
{
  "tournamentId": "...",
  "divisionId": "adult-male-id",
  "bowCategoryId": "fsc-id",
  "notes": "..."
}
```

### 4. Admin approves applications
```http
PATCH /tournament-applications/:id/approve
```

### 5. Admin generates patrols
```http
# Preview first (uses all approved applications + tournament's targetCount)
POST /patrols/tournaments/:id/generate

# If satisfied, save to DB
POST /patrols/tournaments/:id/generate-and-save

# Generate PDF for printing (works with saved patrols)
GET /patrols/tournaments/:id/pdf
```

---

## ⚠️ Edge Cases Handled

1. **Insufficient participants**: Automatically reduces patrol count
2. **All from same club**: Proceeds with same-club judges (soft constraint)
3. **Uneven numbers**: Distributes evenly (some patrols with N, others with N+1)
4. **Small groups**: Merges with most similar patrols
5. **Too many participants**: Creates larger patrols while maintaining balance

---

## 📈 Success Criteria

✅ Generates exactly targetPatrolCount patrols (or adjusts if impossible)
✅ Every patrol has >= 3 members (minPatrolSize)
✅ All approved participants distributed (none left out)
✅ Every patrol has 1 leader + 2 judges
✅ Patrol sizes differ by max 2 (balanced)
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

### FABP Rota dos Castelos
**File**: `src/seeders/FABPRotaSeeder.ts`
**Run**: `npx ts-node src/scripts/run-fabp-seeder.ts`

Creates:
- 1 Rule: "FABP Rota dos Castelos"
- 8 Divisions: Cub/Junior/Adult/Veteran × Male/Female
- 7 Bow Categories: FSC, LB, BBC, RC, CP, TR, BBR

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

---

## 📝 Notes

- All IDs are UUIDs
- Dates are in ISO 8601 format
- User's `federationNumber` field stores FABP ID or other federation identifiers
- Patrol generation is based on APPROVED applications only
- PDF generation happens on-the-fly (not cached)
