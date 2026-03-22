# ⚡ QUICK START CARD - Groq API Key Feature

## 🎯 What Was Built
A **popup modal** that appears on first visit asking users for their Groq API key.
- User enters key → Stored locally, custom key used
- User skips → Default key from .env used
- Never shows again unless localStorage cleared

---

## ⚡ 3-Step Setup

### 1️⃣ Update .env
```bash
VITE_GROQ_API_KEY=gsk_your_actual_key_here
```

### 2️⃣ Restart Server
```bash
npm run dev
```

### 3️⃣ Use in Components
```tsx
import { useGroqApiKey } from '@/hooks/use-groq-api-key';

const MyComponent = () => {
  const apiKey = useGroqApiKey();
  // Use apiKey for Groq API calls
};
```

**Done!** Modal appears automatically. 🎉

---

## 📍 Key Files

| File | Purpose |
|------|---------|
| `src/context/ApiKeyContext.tsx` | State management |
| `src/components/ApiKeyModal.tsx` | Modal UI |
| `src/hooks/use-groq-api-key.ts` | Custom hooks |
| `.env` | Your config |
| `src/App.tsx` | (Updated with provider) |

---

## 🚀 Common Tasks

### Get Current API Key
```tsx
const apiKey = useGroqApiKey();
```

### Check If Using Default
```tsx
const isDefault = useIsDefaultApiKey();
```

### Make API Call
```tsx
const apiKey = useGroqApiKey();
fetch('https://api.groq.com/openai/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${apiKey}` },
  // ... rest of config
});
```

### Manual Modal Trigger
```javascript
localStorage.removeItem('api_key_modal_seen');
window.location.reload();
```

---

## 🧪 Quick Test

1. Clear browser storage (DevTools → Application)
2. Reload page
3. Modal should appear ✅
4. Try entering `gsk_test123456` (should validate)
5. Try entering `test` (should show error) ❌

---

## 📚 Documentation

| Document | Time | Purpose |
|----------|------|---------|
| `QUICK_REFERENCE.md` | 5 min | Fast lookup |
| `API_KEY_FEATURE.md` | 15 min | Complete guide |
| `ARCHITECTURE.md` | 10 min | How it works |
| `ENV_SETUP.md` | 5 min | Environment config |

---

## ✅ What's Done

✅ Modal implemented
✅ Validation added
✅ localStorage persistence
✅ Default fallback
✅ Hooks created
✅ App.tsx updated
✅ .env configured
✅ Full documentation
✅ Examples provided
✅ Ready to use

---

## 🎨 What Users See

```
First Visit:
┌──────────────────────────┐
│ Enter Your Groq API Key  │
├──────────────────────────┤
│ [Input: gsk_...]         │
│ [Get Key] [Skip] [Send]  │
└──────────────────────────┘

Later Visits:
✅ No modal, key ready to use
```

---

## 🔐 Security

✅ Keys stored locally (not on server)
✅ Never exposed in logs
✅ Each browser separate
✅ localStorage API secure

---

## 🆘 Troubleshooting

| Issue | Fix |
|-------|-----|
| Modal not showing | `localStorage.clear()` + refresh |
| Key not loading | Restart server after `.env` change |
| Validation failing | Ensure key starts with `gsk_` |
| TypeScript error | Check imports match file paths |

---

## 🚀 Deploy

1. Set `VITE_GROQ_API_KEY` on your hosting platform
2. Deploy your app
3. Test modal on live URL
4. Done! 🎉

---

## 📞 Need Help?

1. Read `QUICK_REFERENCE.md` (5 min)
2. Check `API_KEY_FEATURE.md` (complete guide)
3. Review `ARCHITECTURE.md` (system design)
4. See `ENV_SETUP.md` (configuration)

---

**Everything is ready!** Start building with the Groq API key. 🚀
