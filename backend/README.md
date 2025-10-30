# GDG Resource Hub — Backend

This folder contains a minimal, production-ready Express.js backend scaffold using Mongoose (MongoDB).

Quick start (PowerShell):

```powershell
cd C:\Users\User\Desktop\gdg-resource-hub\backend
npm install
# create or update .env with a valid MONGO_URI
npm run dev   # starts nodemon for development
```

Project layout:

backend/
├── src/
│   ├── config/db.js
│   ├── controllers/resourceController.js
│   ├── models/Resource.js
│   ├── routes/resourceRoutes.js
│   ├── middleware/errorHandler.js
│   ├── utils/helper.js
│   └── server.js
├── .env (ignored)
├── .gitignore
├── package.json
└── README.md

Notes:
- `.env` is included locally for convenience but is ignored by git. Replace `MONGO_URI` with your production connection string.
- This scaffold includes TODO comments to guide future development.
