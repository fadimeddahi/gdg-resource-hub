# 📚 My Library Feature - Frontend Integration Guide

## ✅ Backend Status: COMPLETE & READY

The backend "My Library" feature is **fully implemented** and running on `http://localhost:5000`.

---

## 🎯 What This Feature Does

Users can **save their favorite department folders** (Projects, Guides, Events, Templates) to a personal library for quick access.

### **User Flow:**
```
1. User browses "Development" department
2. Sees 4 folders: Projects, Guides, Events, Templates
3. Clicks ⭐ "Save" button on "Projects" folder
4. Folder saved to "My Library"
5. User clicks "My Library" in sidebar
6. Sees "Development Projects" card
7. Clicks card → Goes directly to Dev Projects page
```

---

## 📡 API Endpoints (All Ready)

### **Base URL:** `http://localhost:5000/api/v1/saved-folders`
### **Authentication:** All endpoints require Bearer token in header

---

### **1. GET /api/v1/saved-folders**
Get all saved folders for the logged-in user.

**Headers:**
```
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "673c1234abcd...",
      "user": "673c5678...",
      "department": {
        "_id": "690d3f818bdc298befa12a0e",
        "name": "Development",
        "slug": "dev"
      },
      "folderType": "projects",
      "folderName": "Projects",
      "departmentName": "Development",
      "departmentSlug": "dev",
      "color": "blue",
      "itemCount": 15,
      "createdAt": "2024-11-19T10:00:00.000Z",
      "updatedAt": "2024-11-19T10:00:00.000Z"
    },
    {
      "_id": "673c9876dcba...",
      "user": "673c5678...",
      "department": {
        "_id": "690d3f818bdc298befa12a0b",
        "name": "Design",
        "slug": "design"
      },
      "folderType": "templates",
      "folderName": "Templates",
      "departmentName": "Design",
      "departmentSlug": "design",
      "color": "purple",
      "itemCount": 12,
      "createdAt": "2024-11-19T11:30:00.000Z",
      "updatedAt": "2024-11-19T11:30:00.000Z"
    }
  ],
  "count": 2
}
```

---

### **2. POST /api/v1/saved-folders**
Save a folder to the user's library.

**Headers:**
```
Authorization: Bearer {your_jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "department": "690d3f818bdc298befa12a0e",
  "folderType": "projects",
  "folderName": "Projects",
  "departmentName": "Development",
  "departmentSlug": "dev",
  "color": "blue"
}
```

**Field Validation:**
- `department` (required): MongoDB ObjectId
- `folderType` (required): "projects", "guides", "events", or "templates"
- `folderName` (required): Display name (e.g., "Projects")
- `departmentName` (optional): Defaults to "Unknown"
- `departmentSlug` (optional): Defaults to "unknown"
- `color` (optional): "blue", "green", "yellow", "red", "purple", "pink", "indigo" (default: "blue")

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "_id": "673c1234abcd...",
    "user": "673c5678...",
    "department": {
      "_id": "690d3f818bdc298befa12a0e",
      "name": "Development",
      "slug": "dev"
    },
    "folderType": "projects",
    "folderName": "Projects",
    "departmentName": "Development",
    "departmentSlug": "dev",
    "color": "blue",
    "itemCount": 15,
    "createdAt": "2024-11-19T10:00:00.000Z",
    "updatedAt": "2024-11-19T10:00:00.000Z"
  }
}
```

**Response (Already Saved - Error):**
```json
{
  "success": false,
  "message": "This folder is already in your library"
}
```

---

### **3. DELETE /api/v1/saved-folders/:id**
Remove a saved folder from the library.

**Headers:**
```
Authorization: Bearer {your_jwt_token}
```

**URL Parameter:**
- `id`: The `_id` of the saved folder

**Response:**
```json
{
  "success": true,
  "message": "Folder removed from library"
}
```

---

### **4. GET /api/v1/saved-folders/check**
Check if a specific folder is already saved.

**Headers:**
```
Authorization: Bearer {your_jwt_token}
```

**Query Parameters:**
- `department`: MongoDB ObjectId (required)
- `folderType`: "projects", "guides", "events", or "templates" (required)

**Example:**
```
GET /api/v1/saved-folders/check?department=690d3f818bdc298befa12a0e&folderType=projects
```

**Response (Saved):**
```json
{
  "success": true,
  "isSaved": true,
  "data": {
    "_id": "673c1234abcd...",
    "folderType": "projects",
    "departmentName": "Development",
    ...
  }
}
```

**Response (Not Saved):**
```json
{
  "success": true,
  "isSaved": false,
  "data": null
}
```

---

### **5. PATCH /api/v1/saved-folders/:id/count**
Update the item count for a saved folder (recalculates from database).

**Headers:**
```
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "673c1234abcd...",
    "itemCount": 18,
    ...
  }
}
```

---

## 🎨 Frontend Implementation

### **Step 1: Create Library Page**

Create `src/pages/LibraryPage.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LibraryPage = () => {
  const [savedFolders, setSavedFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSavedFolders();
  }, []);

  const fetchSavedFolders = async () => {
    try {
      const token = localStorage.getItem('token'); // Or however you store auth token
      
      const response = await fetch('http://localhost:5000/api/v1/saved-folders', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setSavedFolders(data.data);
      }
    } catch (error) {
      console.error('Error fetching saved folders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFolder = async (folderId) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5000/api/v1/saved-folders/${folderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove from UI
        setSavedFolders(savedFolders.filter(f => f._id !== folderId));
      }
    } catch (error) {
      console.error('Error removing folder:', error);
    }
  };

  const handleOpenFolder = (folder) => {
    // Navigate to the folder's page
    navigate(`/department/${folder.departmentSlug}/${folder.folderType}`);
  };

  if (loading) {
    return <div>Loading your library...</div>;
  }

  return (
    <div className="library-page">
      <h1>📚 My Library</h1>
      
      {savedFolders.length === 0 ? (
        <div className="empty-state">
          <p>No saved folders yet</p>
          <p>Click the ⭐ Save button on any folder to add it here</p>
        </div>
      ) : (
        <div className="saved-folders-grid">
          {savedFolders.map(folder => (
            <div 
              key={folder._id} 
              className="folder-card"
              onClick={() => handleOpenFolder(folder)}
              style={{ cursor: 'pointer' }}
            >
              {/* Same folder design as DepartmentPage */}
              <div className={`folder-icon ${folder.color}`}>
                📁
              </div>
              
              {/* Text overlay on folder */}
              <div className="folder-text-overlay">
                <p className="folder-department">{folder.departmentName}</p>
                <p className="folder-name">{folder.folderName}</p>
              </div>
              
              {/* Remove button */}
              <button
                className="remove-button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFolder(folder._id);
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
```

---

### **Step 2: Add Save Button to Department Folder Cards**

Update your DepartmentPage to show save buttons on each folder:

```jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const DepartmentPage = () => {
  const { slug } = useParams(); // e.g., "dev"
  const [department, setDepartment] = useState(null);
  const [savedFolders, setSavedFolders] = useState(new Set());

  const folders = [
    { type: 'projects', name: 'Projects', color: 'blue' },
    { type: 'guides', name: 'Guides', color: 'green' },
    { type: 'events', name: 'Events', color: 'yellow' },
    { type: 'templates', name: 'Templates', color: 'purple' },
  ];

  useEffect(() => {
    fetchDepartment();
    checkSavedFolders();
  }, [slug]);

  const fetchDepartment = async () => {
    const response = await fetch(`http://localhost:5000/api/v1/departments/${slug}`);
    const data = await response.json();
    if (data.success) {
      setDepartment(data.data);
    }
  };

  const checkSavedFolders = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/v1/saved-folders', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        const saved = new Set(
          data.data
            .filter(f => f.departmentSlug === slug)
            .map(f => f.folderType)
        );
        setSavedFolders(saved);
      }
    } catch (error) {
      console.error('Error checking saved folders:', error);
    }
  };

  const handleSaveFolder = async (folder) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please login to save folders');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/v1/saved-folders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          department: department._id,
          folderType: folder.type,
          folderName: folder.name,
          departmentName: department.name,
          departmentSlug: slug,
          color: folder.color,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSavedFolders(new Set([...savedFolders, folder.type]));
        alert(`${folder.name} saved to library!`);
      }
    } catch (error) {
      console.error('Error saving folder:', error);
    }
  };

  if (!department) return <div>Loading...</div>;

  return (
    <div className="department-page">
      <h1>{department.name}</h1>
      
      <div className="folders-grid">
        {folders.map(folder => (
          <div key={folder.type} className="folder-card">
            <h3>{folder.name}</h3>
            
            <button
              className={`save-button ${savedFolders.has(folder.type) ? 'saved' : ''}`}
              onClick={() => handleSaveFolder(folder)}
              disabled={savedFolders.has(folder.type)}
            >
              {savedFolders.has(folder.type) ? '✓ Saved' : '⭐ Save'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DepartmentPage;
```

---

### **Step 3: Add Library Link to Sidebar**

Update your sidebar navigation:

```jsx
<nav className="sidebar">
  <ul>
    <li>
      <Link to="/library">📚 My Library</Link>
    </li>
    <li className="divider" />
    <li>
      <Link to="/department/dev">Development</Link>
    </li>
    <li>
      <Link to="/department/design">Design</Link>
    </li>
    {/* ... more departments */}
  </ul>
</nav>
```

---

### **Step 4: Add Route**

In your router configuration:

```jsx
import LibraryPage from './pages/LibraryPage';

// Inside your Routes
<Route path="/library" element={<LibraryPage />} />
```

---

## 🧪 Testing Guide

### **Test 1: Save a Folder**

1. Login to your app
2. Navigate to a department (e.g., `/department/dev`)
3. Click "⭐ Save" on "Projects" folder
4. Should see "✓ Saved" button
5. Navigate to "My Library"
6. Should see "Development Projects" card

### **Test 2: Remove from Library**

1. Go to "My Library"
2. Click "✕ Remove" on a saved folder
3. Folder should disappear from library

### **Test 3: Click Saved Folder**

1. Go to "My Library"
2. Click on "Development Projects" card
3. Should navigate to `/department/dev/projects`
4. Should see list of projects

### **Test 4: Duplicate Prevention**

1. Save "Dev Projects"
2. Try to save "Dev Projects" again
3. Should show error: "This folder is already in your library"

---

## 📊 Database Schema Reference

```javascript
SavedFolder {
  _id: ObjectId,
  user: ObjectId (ref: User),          // Who saved it
  department: ObjectId (ref: Dept),    // Which department
  folderType: String,                  // "projects", "guides", etc.
  folderName: String,                  // "Projects"
  departmentName: String,              // "Development"
  departmentSlug: String,              // "dev"
  color: String,                       // "blue", "green", etc.
  itemCount: Number,                   // Count of items in folder
  createdAt: Date,
  updatedAt: Date
}
```

**Unique Index:** `(user, department, folderType)` - Each user can only save each folder once

---

## 🎨 Styling Suggestions

```css
/* Library Page */
.library-page {
  padding: 2rem;
}

.saved-folders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

/* Use the SAME folder-card style as DepartmentPage */
.folder-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.folder-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

/* Colored folder icon background (same as existing folders) */
.folder-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
}

.folder-icon.blue {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.folder-icon.red {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.folder-icon.yellow {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.folder-icon.green {
  background: linear-gradient(135deg, #56ccf2 0%, #2f80ed 100%);
}

.folder-icon.purple {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

/* Text overlay on folder */
.folder-text-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  width: 80%;
  z-index: 2;
}

.folder-department {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.folder-name {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

/* Remove button */
.remove-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  transition: background 0.2s;
}

.remove-button:hover {
  background: rgba(239, 68, 68, 1);
}

/* Save Button (for DepartmentPage) */
.save-button {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
  z-index: 3;
}

.save-button:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.05);
}

.save-button.saved {
  background: rgba(16, 185, 129, 0.9);
  color: white;
}

.save-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
```

---

## 🚨 Important Notes

### **Authentication Required**
All endpoints require a valid JWT token. If user is not logged in, redirect to login page.

### **Error Handling**
```jsx
try {
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  // Handle success
} catch (error) {
  console.error('Error:', error);
  alert(error.message);
}
```

### **Token Storage**
```jsx
// Store token after login
localStorage.setItem('token', data.token);

// Get token for requests
const token = localStorage.getItem('token');

// Add to request headers
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## ✅ Implementation Checklist

- [ ] Create LibraryPage component
- [ ] Add save buttons to department folder cards
- [ ] Add "My Library" link to sidebar
- [ ] Add `/library` route
- [ ] Test saving a folder
- [ ] Test removing a folder
- [ ] Test clicking saved folder (navigation)
- [ ] Test duplicate save prevention
- [ ] Add loading states
- [ ] Add error handling
- [ ] Style components
- [ ] Test on mobile

---

## 📞 API Summary

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v1/saved-folders` | GET | ✅ Yes | Get all saved folders |
| `/api/v1/saved-folders` | POST | ✅ Yes | Save a folder |
| `/api/v1/saved-folders/:id` | DELETE | ✅ Yes | Remove saved folder |
| `/api/v1/saved-folders/check` | GET | ✅ Yes | Check if saved |
| `/api/v1/saved-folders/:id/count` | PATCH | ✅ Yes | Update item count |

---

## 🎯 Benefits for Users

✅ **Quick Access** - No need to navigate through departments  
✅ **Personalized** - Each user has their own library  
✅ **Organized** - See all saved folders in one place  
✅ **Efficient** - Direct links to frequently used folders  
✅ **Professional** - Modern UX feature  

---

**Backend Status:** ✅ COMPLETE  
**Server:** 🟢 Running on `http://localhost:5000`  
**Ready for:** Frontend integration  
**Estimated Time:** 2-3 hours frontend work  

Good luck! 🚀
