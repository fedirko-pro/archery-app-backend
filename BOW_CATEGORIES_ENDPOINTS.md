# Bow Categories API Endpoints

## GET /bow-categories

Get all bow categories

- **Auth**: No
- **Query Params**:
  - `ruleId` (optional) - Filter by rule ID
- **Response**: `BowCategory[]`

```json
[
  {
    "id": "uuid",
    "code": "FSC",
    "name": "Freestyle",
    "descriptionEn": "...",
    "descriptionPt": "...",
    "descriptionIt": "...",
    "descriptionUk": "...",
    "descriptionEs": "...",
    "ruleReference": "...",
    "ruleCitation": "...",
    "rule": { "id": "uuid", "ruleCode": "IFAA", ... },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": null
  }
]
```

## GET /bow-categories/:id

Get bow category by ID

- **Auth**: No
- **Params**: `id` (string, UUID)
- **Response**: `BowCategory`

```json
{
  "id": "uuid",
  "code": "FSC",
  "name": "Freestyle",
  "descriptionEn": "...",
  "descriptionPt": "...",
  "descriptionIt": "...",
  "descriptionUk": "...",
  "descriptionEs": "...",
  "ruleReference": "...",
  "ruleCitation": "...",
  "rule": { "id": "uuid", "ruleCode": "IFAA", ... },
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": null
}
```

## GET /bow-categories/code/:code

Get bow category by code

- **Auth**: No
- **Params**: `code` (string, e.g., "FSC", "LB", "BBC")
- **Response**: `BowCategory` (same structure as above)

## POST /bow-categories

Create new bow category

- **Auth**: Yes (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `CreateBowCategoryDto`

```json
{
  "code": "FSC",
  "name": "Freestyle",
  "descriptionEn": "Optional",
  "descriptionPt": "Optional",
  "descriptionIt": "Optional",
  "descriptionUk": "Optional",
  "descriptionEs": "Optional",
  "ruleReference": "Optional",
  "ruleCitation": "Optional",
  "ruleId": "uuid" // Required
}
```

- **Response**: `BowCategory` (created entity)

## PATCH /bow-categories/:id

Update bow category

- **Auth**: Yes (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Params**: `id` (string, UUID)
- **Body**: `UpdateBowCategoryDto` (all fields optional)

```json
{
  "code": "FSC",
  "name": "Updated Name",
  "descriptionEn": "Updated description",
  "ruleId": "uuid"
  // ... any other fields
}
```

- **Response**: `BowCategory` (updated entity)

## DELETE /bow-categories/:id

Delete bow category

- **Auth**: Yes (Admin only)
- **Headers**: `Authorization: Bearer <token>`
- **Params**: `id` (string, UUID)
- **Response**: `204 No Content`
