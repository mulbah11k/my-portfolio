# Security Guide for Your Portfolio

## 🔐 Security Features

### 1. **Environment Variables (Not Hardcoded Passwords)**
- Admin password is now stored in `.env.local` (never commit to git)
- API keys are also environment-based
- Set `VITE_ADMIN_PASSWORD` to a strong, unique password

### 2. **File Upload Validation**
- Image uploads are validated by type (must be image/*) and size (max 5MB)
- Images are safely encoded as base64 data URLs
- No files are stored on a server - only in browser storage

### 3. **Input Validation**
- All URLs are validated before storage (GitHub, Live Demo links)
- Project descriptions and names are validated
- Form inputs are checked for required fields

### 4. **Data Storage**
- Data is stored in browser's local storage via `window.storage`
- Each field is JSON-serialized for security
- No sensitive data (passwords, API keys) is stored in local storage

## 🛡️ Best Practices

### Before Deployment:
1. **Change your password**: Edit `.env.local` and set a strong `VITE_ADMIN_PASSWORD`
2. **Protect API keys**: Use environment variables, not hardcoded values
3. **Add `.env.local` to `.gitignore`** (critical!)
4. **Never commit `.env.local`** to version control

### Admin Panel Access:
- Share the admin password ONLY over secure channels
- Change password regularly
- Use a strong password (mix of uppercase, lowercase, numbers, symbols)

### Images:
- Images are converted to base64 and stored in browser storage
- Max file size: 5MB
- Supported formats: PNG, JPG, JPEG, GIF, WEBP
- No server-side storage = no server vulnerability

### XSS Protection:
- URLs are validated with URL constructor
- All inputs are sanitized
- Base64 images are safe (data URLs cannot execute code)

## 🚀 Setup Instructions

### 1. Copy Environment Template
```bash
cp .env.example .env.local
```

### 2. Edit `.env.local`
```env
VITE_ADMIN_PASSWORD=your_secure_password_here
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Make Sure `.env.local` is in `.gitignore`
Check your `.gitignore` file includes:
```
.env.local
.env*.local
```

### 4. Restart Development Server
```bash
npm run dev
```

## ⚠️ Important Security Notes

### What is NOT secure in this setup:
- Browser storage (localStorage) can be accessed by browser extensions or XSS
- No server-side authentication (if you deploy, add backend auth)
- Images in local storage are accessible if someone has your browser data

### What IS secure in this setup:
- Passwords are not hardcoded
- API keys are in environment variables
- File uploads are validated
- URLs are sanitized
- No sensitive data sent unnecessarily

## 🔄 For Production Deployment

If you deploy this to production, consider:
1. **Backend API** for admin authentication
2. **JWT tokens** for session management
3. **Database** instead of browser storage
4. **HTTPS** for all communications
5. **CORS headers** to prevent unauthorized access
6. **Rate limiting** on admin endpoints

## 📝 Questions?

For security concerns or to report vulnerabilities, contact the portfolio owner.
