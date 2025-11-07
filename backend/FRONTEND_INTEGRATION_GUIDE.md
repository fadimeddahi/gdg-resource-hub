# Frontend Integration Guide - File Upload & Viewing

## 🎯 Overview

The backend has been updated with **file upload and view tracking** functionality for all 4 collections (Projects, Guides, Events, Templates). Your frontend UI remains unchanged - users still see only titles in cards, but now they can click to view/download files.

---

## ✅ What's Been Added to Backend

### 1. **New Schema Fields** (All Collections)

Each collection (Projects, Guides, Events, Templates) now has:

```javascript
{
  _id: ObjectId,
  department: ObjectId,
  title: String,
  fileUrl: String,        // ← NEW: Cloudinary URL
  views: Number,          // ← NEW: View counter (default: 0)
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **New API Endpoints**

For **EACH** collection (replace `{collection}` with `projects`, `guides`, `events`, or `templates`):

#### **A. Upload File**
```
POST /api/v1/{collection}/upload
```
**Request:** `multipart/form-data`
- `file`: File to upload (PDF, DOCX, XLSX, PPTX, images, etc.)
- `department`: Department ObjectId (required)
- `title`: Item title (required)

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "673c1234...",
    "department": {
      "_id": "690d3f81...",
      "name": "Development",
      "slug": "dev"
    },
    "title": "Q1 Planning Document.pdf",
    "fileUrl": "https://res.cloudinary.com/...",
    "views": 0,
    "isActive": true,
    "createdAt": "2024-11-19T...",
    "updatedAt": "2024-11-19T..."
  }
}
```

#### **B. Get File URL**
```
GET /api/v1/{collection}/:id/file
```
**Response:**
```json
{
  "success": true,
  "data": {
    "fileUrl": "https://res.cloudinary.com/...",
    "title": "Q1 Planning Document.pdf"
  }
}
```

#### **C. Increment Views**
```
PATCH /api/v1/{collection}/:id/views
```
**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "673c1234...",
    "views": 1,
    // ... full item data
  }
}
```

---

## 🔧 Frontend Changes Required

### **Step 1: Update RecentFileCard Component**

Your current card only displays title. Now add click handler to open files:

#### **File:** `src/components/cards/RecentFileCard.jsx`

**Current Code:**
```jsx
const RecentFileCard = ({ title, onClick }) => {
  return (
    <div className="card" onClick={onClick}>
      <h3>{title}</h3>
    </div>
  );
};
```

**Updated Code:**
```jsx
import { useState } from 'react';

const RecentFileCard = ({ id, title, fileUrl, collection }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (!fileUrl) {
      // No file attached - show message or do nothing
      console.log('No file attached to this item');
      return;
    }

    setIsLoading(true);
    
    try {
      // Increment view count
      await fetch(`http://localhost:5000/api/v1/${collection}/${id}/views`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      // Open file in new tab
      window.open(fileUrl, '_blank');
    } catch (error) {
      console.error('Error opening file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`card ${isLoading ? 'loading' : ''} ${fileUrl ? 'clickable' : ''}`}
      onClick={handleClick}
      style={{ cursor: fileUrl ? 'pointer' : 'default' }}
    >
      <h3>{title}</h3>
      {isLoading && <span className="spinner">Loading...</span>}
    </div>
  );
};

export default RecentFileCard;
```

---

### **Step 2: Update Parent Components**

Update the pages that render `RecentFileCard` to pass the new props:

#### **Files to Update:**
- `src/pages/ProjectsPage.jsx`
- `src/pages/GuidesPage.jsx`
- `src/pages/EventsPage.jsx`
- `src/pages/TemplatesPage.jsx`

**Current Code (example from ProjectsPage):**
```jsx
const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    // Fetch projects
    fetch(`/api/v1/projects?department=${departmentId}`)
      .then(res => res.json())
      .then(data => setProjects(data.data));
  }, []);

  return (
    <div>
      {projects.map(project => (
        <RecentFileCard 
          key={project._id}
          title={project.title}
        />
      ))}
    </div>
  );
};
```

**Updated Code:**
```jsx
const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  
  useEffect(() => {
    // Fetch projects (API response now includes fileUrl and views)
    fetch(`/api/v1/projects?department=${departmentId}`)
      .then(res => res.json())
      .then(data => setProjects(data.data));
  }, []);

  return (
    <div>
      {projects.map(project => (
        <RecentFileCard 
          key={project._id}
          id={project._id}
          title={project.title}
          fileUrl={project.fileUrl}      // ← NEW
          collection="projects"          // ← NEW
        />
      ))}
    </div>
  );
};
```

**Repeat for other pages:**
- `GuidesPage` → `collection="guides"`
- `EventsPage` → `collection="events"`
- `TemplatesPage` → `collection="templates"`

---

### **Step 3: Add File Upload UI (Optional - Admin Feature)**

If you want to add file upload functionality for admins:

#### **Create:** `src/components/UploadFileModal.jsx`

```jsx
import { useState } from 'react';

const UploadFileModal = ({ isOpen, onClose, departmentId, collection }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !file) {
      setError('Title and file are required');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('department', departmentId);

    try {
      const response = await fetch(`http://localhost:5000/api/v1/${collection}/upload`, {
        method: 'POST',
        body: formData,
        // Note: Don't set Content-Type header - browser will set it with boundary
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('File uploaded:', data);
      
      // Close modal and refresh list
      onClose();
      window.location.reload(); // Or use state management to refresh
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Upload {collection}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
            required
          />
          
          {error && <p className="error">{error}</p>}
          
          <button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadFileModal;
```

---

## 📊 API Response Changes

### **Before (old response):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "673c1234...",
      "department": { ... },
      "title": "Project Title",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": { ... }
}
```

### **After (new response with fileUrl and views):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "673c1234...",
      "department": { ... },
      "title": "Project Title",
      "fileUrl": "https://res.cloudinary.com/...",  ← NEW
      "views": 5,                                    ← NEW
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": { ... }
}
```

---

## 🎨 User Experience Flow

### **Current Behavior:**
1. User sees cards with titles
2. Clicking does nothing (or shows error)

### **New Behavior:**
1. User sees cards with titles (UI unchanged)
2. User clicks card
3. View counter increments (+1)
4. File opens in new browser tab
   - **PDFs** → Display in browser
   - **Images** → Display directly
   - **Office docs** → Browser downloads them
5. Card shows loading state briefly

---

## 🧪 Testing Checklist

### **Test File Viewing:**
- [ ] Click on a project with `fileUrl` → File opens in new tab
- [ ] Click on a project without `fileUrl` → Nothing happens or shows message
- [ ] Verify view count increases on each click
- [ ] Test with different file types (PDF, DOCX, images)
- [ ] Test on mobile devices

### **Test File Upload (if implemented):**
- [ ] Upload PDF file → Success
- [ ] Upload DOCX file → Success
- [ ] Upload image → Success
- [ ] Try to upload without title → Shows error
- [ ] Try to upload without file → Shows error
- [ ] Verify file appears in list immediately
- [ ] Click newly uploaded file → Opens correctly

---

## 🔍 Example Test Data

The backend database already has 93 items seeded, but they don't have `fileUrl` yet (older data). To test:

### **Option 1: Use Upload Endpoint**
```bash
# Upload a test file via curl
curl -X POST http://localhost:5000/api/v1/projects/upload \
  -F "file=@test.pdf" \
  -F "title=Test Project with File" \
  -F "department=690d3f818bdc298befa12a0e"
```

### **Option 2: Use Postman**
1. Create POST request to `http://localhost:5000/api/v1/projects/upload`
2. Body → form-data
3. Add fields:
   - `file`: Choose file
   - `title`: "Test File"
   - `department`: "690d3f818bdc298befa12a0e" (or your dept ID)
4. Send → Returns project with `fileUrl`

---

## 🚨 Important Notes

### **1. Backward Compatibility**
Old items without `fileUrl` will still display. Your card should handle:
```jsx
if (!fileUrl) {
  // Don't show clickable cursor
  // Or show "No file" badge
  return;
}
```

### **2. File Types Supported**
- **Documents:** PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- **Images:** JPG, JPEG, PNG, GIF
- **Archives:** ZIP

### **3. CORS Already Configured**
Backend already allows:
- `http://localhost:5173`
- `http://localhost:5174`
- `http://localhost:3000`

### **4. No Authentication Required**
The new endpoints are public (no JWT token needed) for:
- `GET /:id/file`
- `PATCH /:id/views`

Upload requires authentication (add later if needed).

---

## 📱 Mobile Considerations

```jsx
// Add touch feedback for mobile
const handleClick = async () => {
  // Add haptic feedback (if available)
  if (navigator.vibrate) {
    navigator.vibrate(50);
  }
  
  // ... rest of click handler
};
```

---

## 🎯 Summary of Changes

| Component | Change Required | Difficulty |
|-----------|----------------|------------|
| `RecentFileCard.jsx` | Add `id`, `fileUrl`, `collection` props + click handler | ⭐⭐ Medium |
| `ProjectsPage.jsx` | Pass new props to cards | ⭐ Easy |
| `GuidesPage.jsx` | Pass new props to cards | ⭐ Easy |
| `EventsPage.jsx` | Pass new props to cards | ⭐ Easy |
| `TemplatesPage.jsx` | Pass new props to cards | ⭐ Easy |
| `UploadFileModal.jsx` | Create new component (optional) | ⭐⭐⭐ Hard |

---

## 🚀 Quick Start

**Minimal changes to get file viewing working:**

1. **Update `RecentFileCard.jsx`** (copy the code from Step 1 above)
2. **Update all 4 page components** (add `id`, `fileUrl`, `collection` props)
3. **Test with one file upload** (use Postman or curl)
4. **Click the card** → File should open!

**That's it!** Your UI stays the same, but now cards are clickable and functional.

---

## 📞 Backend Endpoints Reference

```
# Projects
GET    /api/v1/projects
GET    /api/v1/projects/:id
GET    /api/v1/projects/:id/file        ← NEW
POST   /api/v1/projects
POST   /api/v1/projects/upload          ← NEW
PATCH  /api/v1/projects/:id/views       ← NEW
PUT    /api/v1/projects/:id
DELETE /api/v1/projects/:id

# Guides (same pattern)
GET    /api/v1/guides/:id/file          ← NEW
POST   /api/v1/guides/upload            ← NEW
PATCH  /api/v1/guides/:id/views         ← NEW

# Events (same pattern)
GET    /api/v1/events/:id/file          ← NEW
POST   /api/v1/events/upload            ← NEW
PATCH  /api/v1/events/:id/views         ← NEW

# Templates (same pattern)
GET    /api/v1/templates/:id/file       ← NEW
POST   /api/v1/templates/upload         ← NEW
PATCH  /api/v1/templates/:id/views      ← NEW
```

---

## 🐛 Troubleshooting

### Issue: "File won't open"
**Solution:** Check if `fileUrl` exists and is valid Cloudinary URL

### Issue: "CORS error"
**Solution:** Backend already configured - check you're using `localhost:5173` or `5174`

### Issue: "Views not incrementing"
**Solution:** Check network tab - PATCH request should return 200

### Issue: "Upload fails"
**Solution:** 
- Check file size (< 50MB limit)
- Check file type is allowed
- Verify `department` and `title` are provided

---

**Questions?** Backend is ready and running on `http://localhost:5000` 🚀
