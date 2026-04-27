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

### 4. Upload `.env` to the server
Upload `backend/.env` to `public_html/api/.env`.
**Never commit this file — it contains real credentials.**

### 5. Import the database
1. hPanel → Databases → phpMyAdmin
2. Select your database (`u856082912_frbams`)
3. Import tab → choose `database/schema.sql` → Go

### 6. Verify
Open `https://linen-salmon-143266.hostingersite.com/api/health` in a browser.  
Expected response: `{"status":"ok","ts":...}`

If you see the frontend page instead of JSON, the frontend `.htaccess` isn't in place.  
If you see 403, the backend `.htaccess` or file permissions are the issue — set all PHP files to `644` and directories to `755` in hPanel File Manager.
