# 📦 BACKEND TASK (Node.js)

## Context
Система генерації патрулів для змагань з стрільби з лука. Учасники реєструються на змагання, обираючи категорії зброї. Система має автоматично розподілити їх по патрулях (групах), які будуть стріляти на окремих мішенях.

## Technical Requirements

### Data Structures

```typescript
// Input: Participant entry для конкретної категорії
interface PatrolEntry {
  participantId: string;
  name: string;
  club: string;          // з БД за federationNumber
  category: string;      // 'FSC', 'LB', 'BBC', etc
  age: string;          // 'cub', 'junior', 'adult', 'veteran'
  gender: string;       // 'm', 'f', 'other'
  escalao: string;      // оригінальне значення з форми
}

// Output: Generated patrol
interface Patrol {
  id: string;
  targetNumber: number;  // 1-18 (номер мішені)
  members: string[];     // participantIds
  leaderId: string;
  judgeIds: [string, string];
}

// Competition config
interface CompetitionConfig {
  tournamentId: string;
  category: string;      // 'FSC', 'LB', etc
  targetPatrolCount: number;  // кількість мішеней
  groupingPriority: [
    { field: 'category', weight: 10 },
    { field: 'age', weight: 5 },
    { field: 'gender', weight: 2 }
  ];
  minPatrolSize: 3;
}
```

### API Endpoints to Implement

```javascript
POST /api/tournaments/:tournamentId/categories/:category/patrols/generate
Request body: {
  entries: PatrolEntry[],
  targetPatrolCount: number
}
Response: {
  patrols: Patrol[],
  stats: {
    totalParticipants: number,
    averagePatrolSize: number,
    clubDiversityScore: number,  // скільки % патрулів мають судді з різних клубів
    homogeneityScores: {
      age: number,     // % патрулів де всі одного віку
      gender: number   // % патрулів де всі однієї статі
    }
  }
}

GET /api/tournaments/:tournamentId/categories/:category/patrols
Response: {
  patrols: Patrol[],
  status: 'draft' | 'published'
}

PUT /api/tournaments/:tournamentId/categories/:category/patrols
Request body: {
  patrols: Patrol[]
}
Response: { success: boolean }

GET /api/tournaments/:tournamentId/categories/:category/patrols/pdf
Response: PDF file (buffer)
```

## Core Algorithm to Implement

### Function 1: `generatePatrols(entries, targetPatrolCount, config)`

**Input:**
- `entries: PatrolEntry[]` - список учасників для категорії
- `targetPatrolCount: number` - кількість мішеней (патрулів)
- `config: CompetitionConfig`

**Output:**
- `Patrol[]` - масив патрулів

**Algorithm Steps:**

```javascript
1. GROUP BY SIMILARITY
   - Створити ключ для кожного entry: `${age}|${gender}`
   - Групувати entries за цим ключем
   - Результат: Map<string, PatrolEntry[]>

2. CALCULATE TARGET SIZES
   avgSize = Math.ceil(entries.length / targetPatrolCount)
   minSize = Math.max(3, Math.floor(avgSize * 0.8))
   maxSize = Math.ceil(avgSize * 1.2)

3. INITIAL PATROL FORMATION
   For each group:
     while (group.length > 0):
       size = clamp(group.length, minSize, maxSize)
       createPatrol(group.splice(0, size))
   
   Result: patrols[] (може бути більше або менше ніж targetPatrolCount)

4. ADJUST TO TARGET COUNT
   if (patrols.length > targetPatrolCount):
     mergeSmallerPatrols()
   
   if (patrols.length < targetPatrolCount):
     splitLargerPatrols()

5. BALANCE PATROL SIZES
   Перемістити учасників між патрулями щоб:
   - Мінімізувати різницю між max і min розміром
   - Зберігати схожість (переміщати схожих по age/gender)
   
   Iterate until balanced:
     smallest = patrol with min size
     largest = patrol with max size
     if (largest.size - smallest.size > 1):
       moveBestCandidate(largest → smallest)

6. BALANCE CLUBS (best effort)
   For each patrol:
     clubs = getUniqueClubs(patrol.members)
     
     if (clubs.length < 2):
       // Спробувати знайти swap з іншим патрулем
       otherPatrols = patrols.filter(p => getUniqueClubs(p).length > 2)
       
       for each otherPatrol:
         candidate = findSwapCandidate(patrol, otherPatrol)
         if (candidate && improvesDiversity):
           swap(patrol, otherPatrol, candidate)
           break

7. ASSIGN ROLES
   For each patrol:
     // Призначити суддів
     if (hasMultipleClubs):
       judgeIds = selectJudgesFromDifferentClubs()
     else:
       judgeIds = selectAnyTwoMembers()
     
     // Призначити лідера
     leaderId = selectRandomMember(excluding judgeIds)
     
     // Присвоїти номер мішені
     targetNumber = index + 1
```

### Function 2: `balancePatrolSizes(patrols, minSize, maxSize)`

**Ціль:** Зробити розміри патрулів максимально рівномірними

```javascript
Algorithm:
1. Sort patrols by size
2. While (max_size - min_size > 1):
   - Find person in largest patrol most similar to smallest patrol
   - Move that person
   - Re-sort
3. Ensure no patrol < minSize or > maxSize
```

### Function 3: `findBestSwapCandidate(sourcePatrol, targetPatrol, priorities)`

**Ціль:** Знайти найкращу людину для переміщення/обміну

```javascript
Algorithm:
1. For each person in sourcePatrol:
   calculate similarity to targetPatrol:
     score = 0
     if (person.age === targetPatrol.commonAge) score += 5
     if (person.gender === targetPatrol.commonGender) score += 2
     if (person.club != targetPatrol.dominantClub) score += 3 // diversity bonus
   
2. Return person with highest score
```

### Function 4: `assignJudges(patrol)`

**Ціль:** Вибрати 2 суддів, по можливості з різних клубів

```javascript
Algorithm:
1. Group members by club
2. If (clubs.length >= 2):
     Pick 1 member from club A
     Pick 1 member from club B (B != A)
3. Else:
     Pick any 2 members randomly
4. Return [judgeId1, judgeId2]
```

### Function 5: `calculateStats(patrols, entries)`

Розрахувати метрики якості розподілу

```javascript
function calculateStats(patrols, entries) {
  const stats = {
    totalParticipants: entries.length,
    averagePatrolSize: entries.length / patrols.length,
    clubDiversityScore: 0,
    homogeneityScores: {
      age: 0,
      gender: 0
    }
  };
  
  // Club diversity
  let diversePatrols = 0;
  patrols.forEach(patrol => {
    const judges = patrol.judgeIds.map(id => 
      entries.find(e => e.participantId === id)
    );
    if (judges[0].club !== judges[1].club) {
      diversePatrols++;
    }
  });
  stats.clubDiversityScore = (diversePatrols / patrols.length) * 100;
  
  // Age homogeneity
  let homogeneousAgePatrols = 0;
  patrols.forEach(patrol => {
    const ages = patrol.members.map(id => 
      entries.find(e => e.participantId === id).age
    );
    if (new Set(ages).size === 1) {
      homogeneousAgePatrols++;
    }
  });
  stats.homogeneityScores.age = (homogeneousAgePatrols / patrols.length) * 100;
  
  // Gender homogeneity
  let homogeneousGenderPatrols = 0;
  patrols.forEach(patrol => {
    const genders = patrol.members.map(id => 
      entries.find(e => e.participantId === id).gender
    );
    if (new Set(genders).size === 1) {
      homogeneousGenderPatrols++;
    }
  });
  stats.homogeneityScores.gender = (homogeneousGenderPatrols / patrols.length) * 100;
  
  return stats;
}
```

## PDF Generation Requirements

**Format:**
```
TOURNAMENT NAME - CATEGORY FSC
Date: 23/11/2025

═══════════════════════════════════════════
PATROL 1 (Target #1)
═══════════════════════════════════════════
Leader: João Silva (Club A)
Judges: Maria Santos (Club B), Pedro Costa (Club C)

Members:
1. João Silva - Club A - Adult - M
2. Maria Santos - Club B - Adult - F
3. Pedro Costa - Club C - Veteran - M
4. Ana Rodrigues - Club A - Adult - F

═══════════════════════════════════════════
PATROL 2 (Target #2)
...
```

**Implementation suggestions:**
- Use library like `pdfkit` or `puppeteer`
- Format should be print-friendly (A4, readable font)
- Include tournament info at top
- Clear visual separation between patrols

## Edge Cases to Handle

1. **Insufficient participants**: Менше ніж targetPatrolCount * 3 учасників
   - Response: Зменшити кількість патрулів автоматично
   - Example: 40 people, 18 targets → reduce to 13 patrols (avg 3 per patrol)

2. **All from same club**: Неможливо знайти судді з різних клубів
   - Proceed з суддями з одного клубу (soft constraint)
   - Still assign 2 judges

3. **Uneven numbers**: 100 учасників, 18 патрулів = 5.5 avg
   - Деякі патрулі по 5, деякі по 6
   - Distribute evenly (e.g., 10 patrols with 6, 8 patrols with 5)

4. **Empty groups**: Група "veteran female" має 1 особу
   - Додати до найбільш схожого патруля
   - Prioritize same age > same gender

5. **Too many participants**: 200 people, 18 targets = 11 avg
   - All patrols will be larger
   - Ensure balanced distribution

## Testing Data Example

```javascript
const testEntries = [
  {
    participantId: '1',
    name: 'João Silva',
    club: 'Club A',
    category: 'FSC',
    age: 'adult',
    gender: 'm',
    escalao: 'Adulto'
  },
  {
    participantId: '2',
    name: 'Maria Santos',
    club: 'Club B',
    category: 'FSC',
    age: 'adult',
    gender: 'f',
    escalao: 'Dama'
  },
  // Generate 98 more with varied data:
  // - 4-8 different clubs
  // - Mix of ages (cub, junior, adult, veteran)
  // - Mix of genders
];

const testConfig = {
  tournamentId: 'tournament-1',
  category: 'FSC',
  targetPatrolCount: 18,
  groupingPriority: [
    { field: 'age', weight: 5 },
    { field: 'gender', weight: 2 }
  ],
  minPatrolSize: 3
};

// Expected output: 18 patrols, sizes 5-6, with stats
```

## Database Schema (suggestion)

```sql
-- Tournaments table
CREATE TABLE tournaments (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255),
  date DATE,
  target_count INT,
  created_at TIMESTAMP
);

-- Patrols table
CREATE TABLE patrols (
  id VARCHAR(36) PRIMARY KEY,
  tournament_id VARCHAR(36),
  category VARCHAR(50),
  target_number INT,
  leader_id VARCHAR(36),
  status ENUM('draft', 'published', 'final'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

-- Patrol members table
CREATE TABLE patrol_members (
  patrol_id VARCHAR(36),
  participant_id VARCHAR(36),
  is_judge BOOLEAN DEFAULT FALSE,
  position INT,
  PRIMARY KEY (patrol_id, participant_id),
  FOREIGN KEY (patrol_id) REFERENCES patrols(id)
);
```

## Success Criteria

✅ Generates exactly targetPatrolCount patrols  
✅ Every patrol has >= minPatrolSize members  
✅ All entries distributed (none left out)  
✅ Every patrol has 1 leader + 2 judges  
✅ Patrol sizes differ by max 2 (balanced)  
✅ Best effort to assign judges from different clubs  
✅ Returns meaningful stats  
✅ PDF generates correctly with all patrol information  
✅ API endpoints return proper status codes  
✅ Handles all edge cases gracefully  

## Implementation Notes

1. **Start with core algorithm** - get basic grouping and distribution working first
2. **Add balancing** - implement size balancing, then club balancing
3. **Implement API endpoints** - create REST endpoints with proper validation
4. **Add PDF generation** - implement last as it's independent
5. **Test with edge cases** - verify all edge cases are handled

## Constraints Summary

**Hard Constraints (MUST):**
- Exactly targetPatrolCount patrols
- Minimum 3 members per patrol
- 1 leader + 2 judges per patrol
- All participants distributed

**Soft Constraints (NICE TO HAVE):**
- Judges from different clubs (weight: 10)
- Same age in patrol (weight: 5)
- Same gender in patrol (weight: 2)
- Balanced patrol sizes (weight: 7)
