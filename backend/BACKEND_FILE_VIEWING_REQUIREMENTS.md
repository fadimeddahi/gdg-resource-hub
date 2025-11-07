# BACKEND_FILE_VIEWING_REQUIREMENTS.md

## 📋 What's in this document

This file defines a minimal backend change to add file viewing and view-tracking for the Projects collection while keeping the frontend UI unchanged (only titles shown).

### Minimal Schema Update
- Add a `fileUrl` field to the Projects schema.
- No other metadata changes required.

Schema example (Mongoose):

```js
fileUrl: {
  type: String,
  required: false,
  trim: true
}
```

### New Endpoints (Projects)
1. POST `/api/v1/projects/upload` - Upload file and return `fileUrl` (Cloudinary recommended)
2. PATCH `/api/v1/projects/:id/views` - Increment view count when file is opened
3. GET `/api/v1/projects/:id/file` - Return the `fileUrl` for viewing/downloading

### Frontend Changes (Minimal)
- Update `RecentFileCard` `onClick` to open the file URL in a new tab and call the views endpoint.
- No UI layout changes required.

### File Storage Options
1. Cloudinary (recommended for simple setup)
2. AWS S3
3. Google Drive API
4. Local storage (development only)

### Cloudinary quick setup (summary)
1. Create Cloudinary account and get credentials.
2. Add credentials to `.env`:

```
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

3. Use existing `src/config/cloudinary.js` (already in repo) or add if missing.
4. Use multer memory storage and upload to Cloudinary in `POST /api/v1/projects/upload`.

### Example `POST /api/v1/projects/upload` (controller flow)
- Accept multipart/form-data
- Validate file type
- Upload to Cloudinary
- Return `{ success: true, fileUrl: <cloudinary_url> }`

### Example `PATCH /api/v1/projects/:id/views` (controller flow)
- Increment a `views` counter on the project document (add `views` with default 0 to schema if desired) or record a lightweight view event.
- Return updated item or success flag.

### Example `GET /api/v1/projects/:id/file`
- Fetch project by id
- Return `{ success: true, data: { fileUrl } }` or 404 if not found

### Frontend behaviour
- Clicking a card calls `GET /api/v1/projects/:id/file` or directly opens `fileUrl` if already present
- PATCH `/api/v1/projects/:id/views` increments views whenever file is opened
- Files open in a new tab; PDFs render in browser, images display, others download

### Testing
- Upload a PDF via POST /projects/upload, then `PATCH /projects/:id/views` and confirm `GET /projects/:id/file` returns the url.
- Verify Cloudinary URL is accessible and CORS friendly.

---

This document is ready to be reviewed and applied. It keeps the frontend unchanged while enabling file viewing and a view counter on Projects.
