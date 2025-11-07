# Backend API Implementation - COMPLETE INTEGRATION GUIDE

## ⚠️ CRITICAL: Frontend is Ready - Backend Implementation Required

The frontend has been **fully implemented and tested**. All pages are correctly:
- Fetching department data by slug to obtain MongoDB ObjectIds
- Passing MongoDB ObjectIds (NOT slugs) to all collection endpoints
- Handling loading states, errors, and empty states
- Ready to display data immediately once backend endpoints are available

**Current Status:** Frontend is making API calls to endpoints that return **404 Not Found**. Once you implement these endpoints, the frontend will automatically display the data.

---

## New API Base Endpoints

All endpoints are now available at:
```
http://localhost:5000/api/v1/{collection}
```

Where `{collection}` is one of: `projects`, `guides`, `events`, or `templates`

---

## Data Model Schema

Each collection (Projects, Guides, Events, Templates) follows this exact structure:

```json
{
  "_id": "ObjectId",
  "department": "ObjectId (reference to Department collection)",
  "title": "string (required, max 200 chars)",
  "isActive": "boolean (default: true)",
  "createdAt": "ISO 8601 timestamp (auto-generated)",
  "updatedAt": "ISO 8601 timestamp (auto-generated)"
}
```

### Example Document:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "department": "507f1f77bcf86cd799439001",
  "title": "Project Proposal.pdf",
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

---

## API Endpoints for Each Collection

### 1. GET All Items (with Pagination & Filters)

**Endpoint:** `GET /api/v1/{collection}`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `department` | string (ObjectId) | - | Filter by department ID (exact match) |
| `search` | string | - | Full-text search in title field |
| `page` | number | 1 | Pagination page number |
| `limit` | number | 10 | Items per page |
| `sortBy` | string | createdAt | Field to sort by (createdAt, title, updatedAt) |
| `order` | string | desc | Sort order: "asc" or "desc" |
| `isActive` | boolean | true | Filter by active status |

**Example Requests:**
```javascript
// Get all projects for a department
GET /api/v1/projects?department=507f1f77bcf86cd799439001&page=1&limit=10

// Search projects
GET /api/v1/projects?search=proposal&department=507f1f77bcf86cd799439001

// Get guides sorted by title (ascending)
GET /api/v1/guides?sortBy=title&order=asc&limit=20

// Get all templates, including inactive
GET /api/v1/templates?isActive=false
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "department": {
        "_id": "507f1f77bcf86cd799439001",
        "name": "Development",
        "slug": "dev"
      },
      "title": "Project Proposal.pdf",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 45,
    "totalPages": 5
  },
  "count": 10
}
```

---

### 2. GET Single Item by ID

**Endpoint:** `GET /api/v1/{collection}/:id`

**URL Parameters:**
- `id` (string, ObjectId): The item's MongoDB ID

**Example Request:**
```javascript
GET /api/v1/projects/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "department": {
      "_id": "507f1f77bcf86cd799439001",
      "name": "Development",
      "slug": "dev"
    },
    "title": "Project Proposal.pdf",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### 3. CREATE New Item

**Endpoint:** `POST /api/v1/{collection}`

**Headers Required:**
```
Content-Type: application/json
Authorization: Bearer {jwt_token}  // Optional but recommended for audit trail
```

**Request Body:**
```json
{
  "department": "507f1f77bcf86cd799439001",
  "title": "New Project Title"
}
```

**Validation Rules:**
- `title`: Required, non-empty string, max 200 characters
- `department`: Required, must be valid MongoDB ObjectId reference to existing Department

**Example Request:**
```javascript
fetch('http://localhost:5000/api/v1/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGc...'
  },
  body: JSON.stringify({
    department: '507f1f77bcf86cd799439001',
    title: 'Q1 2024 Planning'
  })
})
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "department": {
      "_id": "507f1f77bcf86cd799439001",
      "name": "Development",
      "slug": "dev"
    },
    "title": "Q1 2024 Planning",
    "isActive": true,
    "createdAt": "2024-01-20T14:30:00.000Z",
    "updatedAt": "2024-01-20T14:30:00.000Z"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Title is required"
}
```

---

### 4. UPDATE Item

**Endpoint:** `PUT /api/v1/{collection}/:id`

**Headers Required:**
```
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

**URL Parameters:**
- `id` (string, ObjectId): The item's MongoDB ID

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "isActive": false
}
```

**Updatable Fields:**
- `title` (string, max 200 chars): Item title
- `isActive` (boolean): Active/inactive status

**Example Request:**
```javascript
fetch('http://localhost:5000/api/v1/guides/507f1f77bcf86cd799439012', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGc...'
  },
  body: JSON.stringify({
    title: 'Updated Guide Title',
    isActive: true
  })
})
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "department": {
      "_id": "507f1f77bcf86cd799439001",
      "name": "Design",
      "slug": "design"
    },
    "title": "Updated Guide Title",
    "isActive": true,
    "createdAt": "2024-01-10T10:00:00.000Z",
    "updatedAt": "2024-01-20T15:45:00.000Z"
  }
}
```

---

### 5. DELETE Item

**Endpoint:** `DELETE /api/v1/{collection}/:id`

**Headers Required:**
```
Authorization: Bearer {jwt_token}
```

**URL Parameters:**
- `id` (string, ObjectId): The item's MongoDB ID

**Example Request:**
```javascript
fetch('http://localhost:5000/api/v1/events/507f1f77bcf86cd799439013', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer eyJhbGc...'
  }
})
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Item not found"
}
```

---

## Available Collections & Endpoints

| Collection | GET All | GET by ID | POST | PUT | DELETE |
|-----------|---------|-----------|------|-----|--------|
| Projects | `GET /api/v1/projects` | `GET /api/v1/projects/:id` | `POST /api/v1/projects` | `PUT /api/v1/projects/:id` | `DELETE /api/v1/projects/:id` |
| Guides | `GET /api/v1/guides` | `GET /api/v1/guides/:id` | `POST /api/v1/guides` | `PUT /api/v1/guides/:id` | `DELETE /api/v1/guides/:id` |
| Events | `GET /api/v1/events` | `GET /api/v1/events/:id` | `POST /api/v1/events` | `PUT /api/v1/events/:id` | `DELETE /api/v1/events/:id` |
| Templates | `GET /api/v1/templates` | `GET /api/v1/templates/:id` | `POST /api/v1/templates` | `PUT /api/v1/templates/:id` | `DELETE /api/v1/templates/:id` |

---

## Frontend Integration Guide

### Step 1: Get Department ID
```javascript
// First, fetch departments to get their IDs
const deptResponse = await fetch('http://localhost:5000/api/v1/departments');
const { data: departments } = await deptResponse.json();

// Find the department you want
const devDept = departments.find(d => d.slug === 'dev');
const departmentId = devDept._id;
```

### Step 2: Fetch Items for a Department
```javascript
// In ProjectsPage.jsx, GuidesPage.jsx, etc.
const fetchProjects = async (departmentId) => {
  const response = await fetch(
    `http://localhost:5000/api/v1/projects?department=${departmentId}&page=1&limit=10`
  );
  const result = await response.json();
  
  if (result.success) {
    setProjects(result.data);
    setPagination(result.pagination);
  }
};
```

### Step 3: Display in Cards
```javascript
// Map data to RecentFileCard components
{projects.map((project) => (
  <RecentFileCard
    key={project._id}
    title={project.title}
    onClick={() => handleProjectClick(project._id)}
  />
))}
```

### Step 4: Handle Search & Filters
```javascript
const searchProjects = async (departmentId, searchTerm) => {
  const response = await fetch(
    `http://localhost:5000/api/v1/projects?department=${departmentId}&search=${searchTerm}`
  );
  const result = await response.json();
  setProjects(result.data);
};
```

### Step 5: Create New Item
```javascript
const createProject = async (departmentId, title) => {
  const response = await fetch('http://localhost:5000/api/v1/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      department: departmentId,
      title: title
    })
  });
  
  const result = await response.json();
  if (result.success) {
    // Refresh the projects list
    fetchProjects(departmentId);
  }
};
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common Error Codes:**
- **400 Bad Request**: Missing required fields or invalid data
- **404 Not Found**: Item doesn't exist
- **500 Internal Server Error**: Server error (check backend logs)

**Example Error Handling:**
```javascript
try {
  const response = await fetch('/api/v1/projects');
  const result = await response.json();
  
  if (!result.success) {
    console.error('API Error:', result.message);
    // Show error to user
  } else {
    // Use result.data
  }
} catch (error) {
  console.error('Network Error:', error);
}
```

---

## Query Examples by Use Case

### Use Case 1: Display Projects for a Department
```
GET /api/v1/projects?department=507f1f77bcf86cd799439001&page=1&limit=20
```

### Use Case 2: Search Across All Collections
```
GET /api/v1/projects?search=proposal
GET /api/v1/guides?search=brand
GET /api/v1/events?search=2024
GET /api/v1/templates?search=meeting
```

### Use Case 3: Sort by Most Recent
```
GET /api/v1/projects?sortBy=createdAt&order=desc
```

### Use Case 4: Sort by Title Alphabetically
```
GET /api/v1/guides?sortBy=title&order=asc
```

### Use Case 5: Get Inactive Items (for archive view)
```
GET /api/v1/projects?isActive=false
```

### Use Case 6: Pagination
```
GET /api/v1/projects?page=2&limit=15
```

---

## Database Collections Created

Backend has created 4 new MongoDB collections:

1. **projects** - For project-related items
2. **guides** - For guide/documentation items
3. **events** - For event-related items
4. **templates** - For template items

Each collection has the same schema and uses text indexing on titles for search functionality.

---

## Testing the APIs

### Using curl (command line):
```bash
# Get all projects
curl http://localhost:5000/api/v1/projects

# Get projects for a specific department
curl "http://localhost:5000/api/v1/projects?department=507f1f77bcf86cd799439001"

# Create a new project
curl -X POST http://localhost:5000/api/v1/projects \
  -H "Content-Type: application/json" \
  -d '{"department":"507f1f77bcf86cd799439001","title":"New Project"}'
```

### Using Postman:
1. Create a GET request to `http://localhost:5000/api/v1/projects`
2. Add query parameters in "Params" tab
3. For POST/PUT, add JSON body in "Body" tab (raw, JSON format)
4. For protected endpoints, add `Authorization` header with Bearer token

### Using Browser Console:
```javascript
// Paste this directly in browser console while on frontend
fetch('http://localhost:5000/api/v1/projects?department=507f1f77bcf86cd799439001')
  .then(r => r.json())
  .then(d => console.table(d.data))
```

---

## Implementation Checklist

- [ ] Get all departments using existing endpoint
- [ ] Store department IDs for use in collection queries
- [ ] Create fetch functions for each collection (projects, guides, events, templates)
- [ ] Update ProjectsPage.jsx to fetch from `/api/v1/projects`
- [ ] Update GuidesPage.jsx to fetch from `/api/v1/guides`
- [ ] Update EventsPage.jsx to fetch from `/api/v1/events`
- [ ] Update TemplatesPage.jsx to fetch from `/api/v1/templates`
- [ ] Map fetched data to RecentFileCard components
- [ ] Add search/filter functionality using query parameters
- [ ] Add pagination support
- [ ] Add loading states during fetch
- [ ] Add error handling and user feedback
- [ ] Test all CRUD operations (Create, Read, Update, Delete)
- [ ] Test pagination and sorting
- [ ] Test search functionality

---

## Backend Files Modified/Created

**New Models:**
- `src/models/Project.js`
- `src/models/Guide.js`
- `src/models/Event.js`
- `src/models/Template.js`

**New Controllers:**
- `src/controllers/collectionController.js` (factory function for all collections)

**New Routes:**
- `src/routes/projectRoutes.js`
- `src/routes/guideRoutes.js`
- `src/routes/eventRoutes.js`
- `src/routes/templateRoutes.js`

**Modified Files:**
- `src/server.js` (added route imports and registrations)

---

## Notes for Frontend Developer

1. **All collections use the same schema** - You can create reusable fetch/CRUD functions
2. **Text search is case-insensitive** - Search works on partial title matches
3. **Department filtering is required** - Always include the department ID when fetching
4. **Timestamps are ISO 8601** - Format: `2024-01-15T10:00:00.000Z`
5. **Pagination is zero-indexed on API side** - `page=1` is the first page
6. **No authentication required for GET requests** - But recommended to add for audit logging
7. **IDs are MongoDB ObjectIds** - 24-character hex strings like `507f1f77bcf86cd799439001`
8. **All responses follow consistent format** - `{ success: boolean, data: object|array, pagination?: object, message?: string }`

---

## Performance Tips

1. **Use pagination** - Don't fetch all items at once, use `page` and `limit` parameters
2. **Cache department IDs** - Fetch departments once and reuse IDs
3. **Debounce search** - Add debouncing to search input to reduce API calls
4. **Lazy load** - Load items only when user navigates to that section
5. **Use sortBy=createdAt** - Leverages database index for faster sorting

---

**Backend is ready! Start integrating! 🚀**
