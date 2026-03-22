# Quick Reference - Groq API Key Feature

## 🚀 Quick Start

### 1. Set Default Key
Edit `.env`:
```env
VITE_GROQ_API_KEY=gsk_your_default_key_here
```

### 2. Use in Components
```tsx
import { useGroqApiKey } from '@/hooks/use-groq-api-key';

const MyComponent = () => {
  const apiKey = useGroqApiKey();
  // Use apiKey for API calls
};
```

### 3. That's It!
- Modal appears automatically on first visit
- Users can enter their own key or skip
- Everything is handled for you

---

## 📱 What Users See

### On First Visit:
- Modal popup: "Enter Your Groq API Key"
- Input field for `gsk_*` key
- "Get API Key" button → opens console.groq.com/keys
- "Skip for Now" button → uses default
- "Submit" button → saves and uses their key

### Result:
- ✅ Custom key used for all their requests
- ✅ Or default key used if they skip
- ❌ Default key NOT used if user provides custom key

---

## 📚 Files Overview

| File | Purpose |
|------|---------|
| `src/context/ApiKeyContext.tsx` | Global state & localStorage |
| `src/components/ApiKeyModal.tsx` | Modal popup UI |
| `src/components/ApiKeySettings.tsx` | Optional settings page |
| `src/hooks/use-groq-api-key.ts` | Hooks to access key |
| `src/App.tsx` | Provider & modal integration |
| `.env` | Default key configuration |

---

## 🔑 How to Use API Key

### Get Current Key:
```tsx
const { apiKey } = useApiKey();
```

### Make API Call:
```tsx
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
  },
  // ... rest of config
});
```

### Check If Default:
```tsx
const { isUsingDefaultKey } = useApiKey();
if (isUsingDefaultKey) {
  console.log('Using default key - limited rate');
}
```

---

## 🛠️ Common Tasks

### Show Settings Page
Add to your settings/profile page:
```tsx
import { ApiKeySettings } from '@/components/ApiKeySettings';

export default function SettingsPage() {
  return <ApiKeySettings />;
}
```

### Manually Trigger Modal
```tsx
import { useEffect } from 'react';

// In any component:
useEffect(() => {
  localStorage.removeItem('api_key_modal_seen');
  window.location.reload();
}, []);
```

### Check API Key Status
```tsx
import { useApiKey } from '@/context/ApiKeyContext';

const { apiKey, isUsingDefaultKey } = useApiKey();
console.log(apiKey); // Current key
console.log(isUsingDefaultKey); // true if default
```

### Change API Key Programmatically
```tsx
import { useApiKey } from '@/context/ApiKeyContext';

const { setApiKey } = useApiKey();
setApiKey('gsk_new_key_here');
```

### Clear API Key & Use Default
```tsx
import { useApiKey } from '@/context/ApiKeyContext';

const { clearApiKey } = useApiKey();
clearApiKey();
```

---

## 🐛 Debugging

### See stored key:
```javascript
localStorage.getItem('groq_api_key');
```

### See if modal was shown:
```javascript
localStorage.getItem('api_key_modal_seen');
```

### Clear everything:
```javascript
localStorage.clear();
window.location.reload();
```

### Check environment key:
```javascript
console.log(import.meta.env.VITE_GROQ_API_KEY);
```

---

## 🔐 Security Reminders

✅ Keys stored in browser (localStorage)
✅ Never sent to YOUR backend server
✅ Only sent to Groq API directly
✅ Each browser has separate key
✅ Clear browser data = key deleted

⚠️ DO NOT commit .env with real keys to Git
⚠️ DO NOT log API keys in console
⚠️ DO NOT expose keys in network requests

---

## 📖 Full Documentation

See `API_KEY_FEATURE.md` for complete documentation.

---

## ❓ FAQ

**Q: Will default key work if I don't set it?**
A: No, modal will show and won't close. Set a default key in `.env`.

**Q: Can users share their key in the app?**
A: No, it's stored locally per browser. Each user has their own.

**Q: What if user forgets their key?**
A: They can get a new one at console.groq.com/keys. The "Get API Key" button opens this.

**Q: Does the key expire?**
A: Groq keys don't expire, but can be regenerated/revoked from console.

**Q: Can I change the validation rules?**
A: Yes, edit `validateGroqApiKey()` in `src/components/ApiKeyModal.tsx`.

**Q: How do I test with different keys?**
A: Set different keys in localStorage or clear and reload:
```javascript
localStorage.removeItem('groq_api_key');
```

---

## 🎯 Integration Steps

1. ✅ Context created and integrated
2. ✅ Modal component added
3. ✅ App.tsx updated
4. ✅ .env configured
5. 📝 Use `useGroqApiKey()` in your components
6. 📝 Integrate with your API calls
7. 📝 (Optional) Add settings page with `ApiKeySettings`

---

**Everything is ready! Start using the hook in your components.** 🚀
