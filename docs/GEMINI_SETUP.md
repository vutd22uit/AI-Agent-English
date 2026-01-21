# 🆓 Google Gemini API Setup Guide (100% FREE)

## ✨ Why Gemini?

- **100% FREE** - No credit card required!
- **Generous limits:** 15 requests/minute, 1500 requests/day
- **1M context window** - Much larger than GPT-4
- **Excellent performance** - Competitive with GPT-4 and Claude
- **JSON mode support** - Perfect for structured outputs

## 🔑 Get Your FREE API Key (2 minutes)

### Step 1: Visit Google AI Studio
Go to: https://aistudio.google.com/app/apikey

### Step 2: Sign in with Google Account
- Use any Google account (Gmail, Workspace, etc.)
- No payment info required!

### Step 3: Create API Key
1. Click **"Get API key"** or **"Create API key"**
2. Select a project (or create new one)
3. Click **"Create API key in existing project"**
4. **Copy your API key** (starts with `AIza...`)

### Step 4: Add to Backend Config

Edit `backend/.env`:
```env
GEMINI_API_KEY=AIzaSy...your_key_here
```

That's it! 🎉

## 📊 Free Tier Limits

| Feature | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Requests/minute** | 15 | 1000+ |
| **Requests/day** | 1500 | Unlimited |
| **Context window** | 1M tokens | 1M tokens |
| **Models** | Gemini 1.5 Pro, Flash | All models |
| **Cost** | $0 | Pay per token |

**For IELTS Learning Platform:**
- 1500 requests/day = ~150-300 full lessons per day
- More than enough for testing and small-scale deployment!

## 🔄 Model Options

### Gemini 1.5 Pro (Default)
```python
model="gemini-1.5-pro"
```
- Best quality
- Slowest but most accurate
- Use for: Assessments, grading, complex content

### Gemini 1.5 Flash (Fast)
```python
model="gemini-1.5-flash"
```
- 10x faster than Pro
- Still excellent quality
- Use for: Content generation, simple tasks

## ⚙️ Configuration Priority

The system auto-selects AI provider in this order:

1. **Gemini** (if `GEMINI_API_KEY` set) ← Default
2. **OpenAI** (if `OPENAI_API_KEY` set)
3. **Claude** (if `ANTHROPIC_API_KEY` set)

You can mix and match:
```env
# Use Gemini for most tasks (FREE)
GEMINI_API_KEY=AIza...

# Use OpenAI as fallback
OPENAI_API_KEY=sk-...

# Optional: Claude for premium features
ANTHROPIC_API_KEY=sk-ant-...
```

## 🧪 Test Your Setup

### 1. Start Backend
```bash
cd backend
docker-compose up -d
```

### 2. Test Gemini API
```bash
curl http://localhost:8000/api/lessons/generate/reading \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Technology",
    "cefr_level": "B2",
    "passage_type": "expository"
  }'
```

### 3. Check Response
Look for:
```json
{
  "generation_metadata": {
    "model_used": "gemini-1.5-pro",
    "provider": "gemini"
  }
}
```

## 🚀 Usage Examples

### Generate Reading Lesson (FREE)
```bash
POST /api/lessons/generate/reading
{
  "topic": "Climate Change",
  "cefr_level": "B2",
  "passage_type": "expository"
}
```

### Assess Writing (FREE)
```bash
POST /api/assessments/submit/writing
{
  "lesson_id": "...",
  "submission_text": "Your essay here...",
  "prompt_text": "...",
  "task_type": "task2"
}
```

All powered by **FREE Gemini API!** 🎉

## 📈 Rate Limit Management

If you hit the 15 RPM limit:

### Option 1: Use Multiple API Keys
Create multiple Google accounts and rotate keys:
```python
GEMINI_API_KEY=AIza...key1
GEMINI_API_KEY_2=AIza...key2
GEMINI_API_KEY_3=AIza...key3
```

### Option 2: Switch to Flash Model
Edit `ai_service.py`:
```python
model_name = model or "gemini-1.5-flash"  # 10x faster!
```

### Option 3: Add Retry Logic
The system will auto-retry with exponential backoff.

## 💡 Pro Tips

### 1. Cache Responses
For repeated requests, cache AI responses to avoid rate limits.

### 2. Use Flash for Generation
```python
# Content generation (fast)
model="gemini-1.5-flash"

# Assessment (accurate)
model="gemini-1.5-pro"
```

### 3. Optimize Prompts
Shorter prompts = fewer tokens = more requests per day.

### 4. Monitor Usage
Check usage at: https://aistudio.google.com/app/apikey

## 🆘 Troubleshooting

### Error: "API key not valid"
- Check key starts with `AIza`
- No extra spaces in `.env`
- Restart backend after changing `.env`

### Error: "Resource exhausted"
- You hit rate limit (15 RPM)
- Wait 1 minute and retry
- Or switch to OpenAI/Claude fallback

### Error: "GEMINI_API_KEY not configured"
- Make sure `.env` file exists in `backend/` folder
- Check spelling: `GEMINI_API_KEY` (all caps)

## 📚 Learn More

- **Google AI Studio:** https://aistudio.google.com
- **Gemini API Docs:** https://ai.google.dev/docs
- **Pricing:** https://ai.google.dev/pricing

## ✅ Summary

✅ **FREE forever** - No credit card
✅ **1500 requests/day** - Enough for testing
✅ **Easy setup** - 2 minutes
✅ **Excellent quality** - Competitive with GPT-4
✅ **JSON mode** - Perfect for our use case

**Start using FREE AI now!** 🚀
