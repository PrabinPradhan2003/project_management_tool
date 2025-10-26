/**
 * Test script for GROQ AI User Story Generator
 * Run: node test-groq.js
 */

require('dotenv').config();
const Groq = require('groq-sdk');

async function testGroqAPI() {
  console.log('🧪 Testing GROQ API Integration...\n');

  // Check if API key is set
  if (!process.env.GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not found in .env file');
    console.log('\nPlease:');
    console.log('1. Get your API key from https://console.groq.com');
    console.log('2. Add it to your .env file: GROQ_API_KEY=your_key_here');
    process.exit(1);
  }

  console.log('✅ GROQ_API_KEY found');

  // Normalize and validate key (avoid leaking key value)
  const rawKey = String(process.env.GROQ_API_KEY || '');
  const apiKey = rawKey.trim();
  const looksValid = /^gsk_[A-Za-z0-9_-]{20,}$/.test(apiKey);
  const masked = apiKey ? apiKey.slice(0, 4) + '...' + apiKey.slice(-4) : 'N/A';
  console.log(`🔑 Key format looks ${looksValid ? 'valid' : 'suspicious'} (length=${apiKey.length}, mask=${masked})`);

  // Initialize Groq client
  const groq = new Groq({ apiKey });

  // Discover available models and choose candidates
  async function getModelCandidates() {
    const override = String(process.env.GROQ_MODEL || '').trim();
    if (override) return [override];
    try {
      const res = await groq.models.list();
      const all = (res?.data || []).map(m => m.id).filter(Boolean);
      const filtered = all
        .filter(id => !/vision|guard|whisper|embedding/i.test(id))
        .sort((a, b) => {
          const w = (s) => (/llama/i.test(s) ? 3 : /gemma/i.test(s) ? 2 : 1) * 100 + (/70b|405b/i.test(s) ? 3 : /34b|32b/i.test(s) ? 2 : /8b|7b|9b/i.test(s) ? 1 : 0);
          return w(b) - w(a);
        });
      return filtered.length ? filtered : ['llama-3.1-8b'];
    } catch (e) {
      return ['llama-3.1-70b', 'llama-3.1-8b', 'llama3-8b-8192'];
    }
  }

  console.log('✅ Groq client initialized\n');

  // Test project description
  const testDescription = `
    An ecommerce website where customers can browse products, 
    add to cart, and make payments online. Admin should manage 
    products and view orders.
  `;

  console.log('📝 Test Project Description:');
  console.log(testDescription);
  console.log('\n⏳ Generating user stories...\n');

  try {
    // Create the prompt
    const prompt = `You are a product manager expert. Generate detailed user stories from the following project description.

Project Description:
${testDescription}

Generate user stories in the following format:
As a [role], I want to [action], so that [benefit].

Generate 5-7 comprehensive user stories that cover all aspects of the project. Return ONLY the user stories as a JSON array of strings, nothing else.

Example format:
["As a customer, I want to browse products, so that I can choose what to buy.", "As an admin, I want to manage products, so that the catalog is up to date."]`;

    // Call GROQ API with model candidates
    const models = await getModelCandidates();
    let chatCompletion;
    let lastError;
    for (const m of models) {
      try {
        console.log(`🔎 Trying model: ${m}`);
        chatCompletion = await groq.chat.completions.create({
          messages: [{ role: 'user', content: prompt }],
          model: m,
          temperature: 0.7,
          max_tokens: 2000,
        });
        console.log(`✅ Model succeeded: ${m}`);
        break;
      } catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data;
        const msg = (data?.error?.message || err?.message || '').toLowerCase();
        console.log(`❌ Model failed: ${m} -> ${status ? status + ' ' : ''}${JSON.stringify(data) || err.message}`);
        if (status === 401 || /invalid api key/.test(msg)) { lastError = err; break; }
        if (status === 400 && /decommissioned|no longer supported|model/.test(msg)) { lastError = err; continue; }
        if (status === 404) { lastError = err; continue; }
        lastError = err; break;
      }
    }
    if (!chatCompletion) throw lastError || new Error('No candidate model succeeded');

    // Extract response
    let responseText = chatCompletion.choices[0]?.message?.content || '[]';
    
    console.log('🤖 Raw AI Response:');
    console.log(responseText);
    console.log('\n');

    // Clean up the response
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON
    let userStories;
    try {
      userStories = JSON.parse(responseText);
    } catch (parseError) {
      // Try to extract user stories manually
      const storyMatches = responseText.match(/As a .+?, I want to .+?, so that .+?\./g);
      userStories = storyMatches || [];
    }

    // Display results
    if (Array.isArray(userStories) && userStories.length > 0) {
      console.log('✅ SUCCESS! Generated User Stories:\n');
      userStories.forEach((story, index) => {
        console.log(`${index + 1}. ${story}`);
      });
      console.log(`\n📊 Total: ${userStories.length} user stories generated`);
      console.log('\n✨ GROQ integration is working perfectly!\n');
    } else {
      console.log('⚠️  No user stories were generated');
      console.log('Response format might need adjustment');
    }

  } catch (error) {
    console.error('❌ Error testing GROQ API:');
    const status = error?.response?.status;
    const data = error?.response?.data;
    console.error(status ? `${status} ${JSON.stringify(data)}` : error.message);

    // Hints for common issues
    if (status === 401 || /invalid api key/i.test(JSON.stringify(data) || '')) {
      console.log('\n💡 Tips to fix Invalid API Key:');
      console.log('1) Ensure your key starts with gsk_ and is copied fully (no spaces).');
      console.log('2) Update backend/.env: GROQ_API_KEY=your_key_here');
      console.log('3) Save the file, then re-run: node test-groq.js');
      console.log('4) If still failing, regenerate a new key at https://console.groq.com/keys');
    }

    if (status === 429 || /rate limit/i.test(error?.message || '')) {
      console.log('\n💡 You hit the rate limit. Wait a minute and try again.');
    }
  }
}

// Run the test
testGroqAPI();
