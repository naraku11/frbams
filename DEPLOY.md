# Hostinger Deployment Checklist

## File layout on the server

```
public_html/
├── .htaccess          ← from  frontend/dist/.htaccess
├── index.html         ← from  frontend/dist/index.html
├── assets/            ← from  frontend/dist/assets/
└── api/
    ├── .htaccess      ← from  backend/.htaccess
    ├── .env           ← copy of backend/.env.example  (fill in real values)
    ├── index.php      ← from  backend/index.php
    ├── config/        ← from  backend/config/
    ├── src/           ← from  backend/src/
    └── controllers/   ← from  backend/controllers/
```

## Step-by-step

### 1. Build the frontend
```
npm run build
```
Output is in `frontend/dist/`.

### 2. Upload frontend files
Upload the **contents** of `frontend/dist/` into `public_html/` (not the `dist` folder itself).  
After upload `public_html/` should contain: `.htaccess`, `index.html`, `assets/`

### 3. Upload backend files
Create the folder `public_html/api/` in hPanel File Manager, then upload:
- `backend/.htaccess`
- `backend/index.php`
- `backend/config/` directory
- `backend/src/` directory
- `backend/controllers/` directory

### 4. Create `.env` on the server
In hPanel File Manager, create `public_html/api/.env` with your real values.
**Do NOT upload `.env.example` — it contains real credentials and must stay local.**

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=u856082912_frbams
DB_USER=u856082912_frbams_app
DB_PASS=your_db_password
DB_CHARSET=utf8mb4

JWT_SECRET=replace_with_64_random_chars
JWT_TTL=86400

APP_ENV=production
APP_URL=https://linen-salmon-143266.hostingersite.com/api
API_PREFIX=/api
FRONTEND_URL=https://linen-salmon-143266.hostingersite.com
```

> **JWT_SECRET must be at least 32 random characters.**  
> Generate one at: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### 5. Import the database
1. hPanel → Databases → phpMyAdmin
2. Select your database (`u856082912_frbams`)
3. Import tab → choose `database/schema.sql` → Go

### 6. Verify
Open `https://linen-salmon-143266.hostingersite.com/api/health` in a browser.  
Expected response: `{"status":"ok","ts":...}`

If you see the frontend page instead of JSON, the frontend `.htaccess` isn't in place.  
If you see 403, the backend `.htaccess` or file permissions are the issue — set all PHP files to `644` and directories to `755` in hPanel File Manager.
