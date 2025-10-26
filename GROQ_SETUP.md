# GROQ API Setup Guide 🤖

## Getting Your GROQ API Key

Follow these simple steps to get your free GROQ API key for the AI User Story Generator:

### Step 1: Visit GROQ Console
Go to: [https://console.groq.com](https://console.groq.com)

### Step 2: Sign Up / Log In
- Click "Sign Up" if you don't have an account
- You can sign up using:
  - Email and password
  - GitHub account
  - Google account

### Step 3: Navigate to API Keys
1. After logging in, you'll be on the dashboard
2. Look for "API Keys" in the left sidebar
3. Click on "API Keys"

### Step 4: Create New API Key
1. Click the "Create API Key" button
2. Give it a name (e.g., "Project Management Tool")
3. Click "Create"

### Step 5: Copy Your API Key
1. Your new API key will be displayed
2. **IMPORTANT:** Copy it immediately - you won't be able to see it again!
3. Store it securely

### Step 6: Add to Your Project
1. Open `backend/.env` file
2. Find the line: `GROQ_API_KEY=your_groq_api_key_here`
3. Replace `your_groq_api_key_here` with your actual API key
4. Save the file

Example:
```env
GROQ_API_KEY=gsk_abc123xyz456...
```

### Step 7: Restart Backend Server
```bash
cd backend
npm run dev
```

## ✅ Testing Your Setup

1. Log in to your application
2. Navigate to "AI Stories" from the navbar
3. Enter a project description, for example:
   ```
   An ecommerce website where customers can browse products, 
   add to cart, and make payments online. Admin should manage 
   products and view orders.
   ```
4. Click "Generate User Stories"
5. You should see AI-generated user stories appear!

## 🎯 Available Models

GROQ supports several models. The default in our code is:
- **llama-3.3-70b-versatile** (Recommended - Fast & High Quality)

Other options you can use (change in `aiController.js`):
- `mixtral-8x7b-32768` - Great for long context
- `llama3-70b-8192` - Balanced performance
- `llama3-8b-8192` - Faster, lighter model

## 💡 Free Tier Limits

GROQ's free tier includes:
- 14,400 requests per day
- 30 requests per minute
- More than enough for development and testing!

## 🔒 Security Best Practices

1. **Never commit your API key to Git**
   - Already handled in `.gitignore`
   
2. **Use environment variables**
   - Always store keys in `.env` file
   
3. **Regenerate if exposed**
   - If you accidentally expose your key, regenerate it immediately

## ❓ Troubleshooting

### Error: "Invalid API Key"
- Double-check you copied the entire key
- Make sure there are no extra spaces
- Verify the key is set in `.env` file

### Error: "Rate limit exceeded"
- You've hit the free tier limit
- Wait a few minutes and try again
- Consider upgrading if needed

### Error: "GROQ_API_KEY is not defined"
- Make sure `.env` file exists in `backend/` folder
- Restart your backend server after adding the key
- Check that `dotenv` is configured in `server.js`

## 📚 Additional Resources

- [GROQ Documentation](https://console.groq.com/docs)
- [GROQ Playground](https://console.groq.com/playground) - Test prompts
- [Model Comparison](https://console.groq.com/docs/models)

## 🎉 You're All Set!

Once you see user stories generating successfully, you're ready to showcase your AI-powered feature!

---

**Questions?** Check the main README.md or contact support.
