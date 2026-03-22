# .env Configuration Guide

## Security Best Practices

### ⚠️ Important
DO NOT commit your real API keys to Git!

### Recommended .gitignore entries

Add these to your `.gitignore` file:

```gitignore
# Environment variables
.env
.env.local
.env.*.local

# API Keys
*.key
*.keys

# Keep example file in repo
!.env.example
```

## .env File Setup

### 1. Create `.env` file (Already created)
```env
VITE_GROQ_API_KEY=gsk_your_actual_key_here
```

### 2. Create `.env.example` (for documentation)
```env
VITE_GROQ_API_KEY=gsk_your_default_groq_api_key_here
```

### 3. Update Your .gitignore
```bash
# Check current .gitignore
cat .gitignore

# Add if not present
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
```

## Environment Variable Names

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_GROQ_API_KEY` | Default Groq API key | `gsk_abc123xyz...` |

**Note**: `VITE_` prefix makes it available to Vite frontend (not secret)

## How to Get Your Groq API Key

1. Visit https://console.groq.com/keys
2. Sign up for free account (if needed)
3. Create new API key
4. Copy the key (starts with `gsk_`)
5. Paste in `.env` file

## Loading Environment Variables

### In Your Component (Example)
```tsx
// Access via import.meta.env (Vite)
const defaultKey = import.meta.env.VITE_GROQ_API_KEY;

console.log(defaultKey); // Output: gsk_...
```

### Checking if .env is loaded
```javascript
// In browser console
console.log(import.meta.env.VITE_GROQ_API_KEY);

// If it shows: undefined → Restart dev server
// If it shows: gsk_... → Loaded successfully ✅
```

## Common Issues

### 1. Environment variable not loading?
**Solution**: Restart dev server after changing `.env`
```bash
# Stop: Ctrl+C
# Start: npm run dev
```

### 2. Variable shows as undefined?
**Check**:
- File named exactly `.env` (not `.env.txt`)
- Variable starts with `VITE_` prefix
- Dev server restarted
- No typos in variable name

### 3. Key not working in production?
**Note**: Deploy platforms need env vars configured too
- Vercel: Project Settings → Environment Variables
- Netlify: Site settings → Build & deploy → Environment
- Other: Check your hosting docs

## Development vs Production

### Development (.env)
```env
VITE_GROQ_API_KEY=gsk_dev_key_for_testing
```

### Production (Platform Settings)
Add same variable through platform's dashboard:
- No `.env` file needed
- Configure in platform settings
- Vite will access it automatically

## Multiple Keys (Optional)

If you want different keys for different environments:

```env
VITE_GROQ_API_KEY=gsk_production_key
VITE_GROQ_API_KEY_DEV=gsk_development_key
```

Then in code:
```tsx
const isDev = import.meta.env.DEV;
const apiKey = isDev 
  ? import.meta.env.VITE_GROQ_API_KEY_DEV
  : import.meta.env.VITE_GROQ_API_KEY;
```

## Verifying Setup

### Test 1: Check file exists
```bash
ls -la .env     # macOS/Linux
dir .env        # Windows PowerShell
```

### Test 2: Check content
```bash
cat .env        # macOS/Linux
Get-Content .env  # Windows PowerShell
```

### Test 3: Check it's in .gitignore
```bash
grep ".env" .gitignore
```

### Test 4: Verify in browser
```javascript
// Open browser console (F12)
// Run:
console.log(import.meta.env.VITE_GROQ_API_KEY);

// Should show: gsk_...
// Should NOT show: undefined
```

## Security Reminders

🔐 **DO:**
- ✅ Use `.env` for local development
- ✅ Add `.env` to `.gitignore`
- ✅ Use platform env vars for production
- ✅ Rotate keys regularly
- ✅ Keep backups of working keys

🔴 **DON'T:**
- ❌ Commit `.env` to Git
- ❌ Paste keys in public repos
- ❌ Log keys to console in production
- ❌ Share keys in emails/chats
- ❌ Use same key across projects

## File Permissions (macOS/Linux)

```bash
# Restrict .env to only your user
chmod 600 .env

# Verify
ls -l .env
# Should show: -rw------- (600)
```

## Troubleshooting Environment Variables

### Problem: "Cannot find module" error
**Check**: Is `VITE_GROQ_API_KEY` actually set?
```javascript
console.log(import.meta.env);
// Look for VITE_GROQ_API_KEY in output
```

### Problem: Modal shows but key isn't used
**Check**: Is default key in .env empty or invalid?
```env
# Wrong ❌
VITE_GROQ_API_KEY=

# Wrong ❌  
VITE_GROQ_API_KEY=my_api_key

# Correct ✅
VITE_GROQ_API_KEY=gsk_actual_key
```

### Problem: Works in dev but not production
**Check**:
1. Platform has env var configured
2. Variable name is correct
3. Value starts with `gsk_`
4. Deployed with latest code
5. Clear browser cache

## Quick Setup Checklist

- [ ] Create `.env` file in project root
- [ ] Add `VITE_GROQ_API_KEY=gsk_...` with actual key
- [ ] Add `.env` to `.gitignore`
- [ ] Restart dev server (`npm run dev`)
- [ ] Verify in browser console: `import.meta.env.VITE_GROQ_API_KEY`
- [ ] Test modal appears on first visit
- [ ] Commit `.gitignore` and `.env.example` to Git
- [ ] DO NOT commit `.env` file

---

Everything is ready! Your `.env` file already exists with placeholder value. Just update it with your actual Groq API key.
