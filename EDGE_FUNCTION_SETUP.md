# Edge Function Setup & Testing Guide

## Overview
This guide helps you verify that Supabase Edge Functions are properly connected to your frontend and all AI elements are working.

## Edge Function Name
The application expects an edge function named: **`ai-career-companion`**

## Quick Test

### Option 1: Use the Built-in Test Component
1. Navigate to **Settings** → **Advanced** tab in the dashboard
2. Scroll to the "Edge Function Test" section
3. Click **"Run Tests"** button
4. Review the test results

### Option 2: Test via Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Run this test:

```javascript
// Get your session token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Test edge function
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-career-companion`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      message: 'Hello, test message',
      context: { language: 'en' }
    })
  }
);

console.log('Status:', response.status);
console.log('Response:', await response.json());
```

## Edge Function Requirements

### Expected Request Format
```json
{
  "message": "User's message here",
  "context": {
    "language": "en",
    "timestamp": 1234567890,
    "requestId": "unique-id",
    "contextType": "resume" | "interview" | "general"
  }
}
```

### Expected Response Format
```json
{
  "items": [
    {
      "id": "unique-id",
      "type": "message" | "suggestion",
      "content": "AI response text here",
      "suggestion": {
        "section": "optional section name",
        "enhancement": "optional enhancement text"
      }
    }
  ],
  "feedbackRatings": []
}
```

## Deployment Checklist

### 1. Verify Edge Function Exists
- Go to Supabase Dashboard → Edge Functions
- Check if `ai-career-companion` function exists
- If not, you need to deploy it

### 2. Check Environment Variables
Your `.env` file should have:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Verify Authentication
- User must be signed in
- Session must have valid `access_token`
- Token is automatically included in requests

### 4. Test Connection
Run the built-in test or use the console method above.

## Common Issues & Solutions

### Issue: 404 Not Found
**Problem:** Edge function doesn't exist or wrong name
**Solution:**
- Check function name matches exactly: `ai-career-companion`
- Deploy the function in Supabase dashboard
- Verify function is active

### Issue: 401 Unauthorized
**Problem:** Authentication token missing or invalid
**Solution:**
- Ensure user is signed in
- Check session is valid: `await supabase.auth.getSession()`
- Verify token is being sent in Authorization header

### Issue: 500 Internal Server Error
**Problem:** Edge function has an error
**Solution:**
- Check Supabase Edge Function logs
- Verify function code is correct
- Check function environment variables

### Issue: CORS Error
**Problem:** Cross-origin request blocked
**Solution:**
- Edge functions should handle CORS automatically
- Check Supabase project CORS settings
- Verify function returns proper CORS headers

### Issue: Invalid Response Format
**Problem:** Function returns wrong structure
**Solution:**
- Ensure function returns `{ items: [...] }` format
- Check each item has `content` field
- Verify response is valid JSON

## Testing AI Features

### 1. AI Coach
- Navigate to **AI Coach** in dashboard
- Send a test message
- Check browser console for errors
- Verify response appears in chat

### 2. Resume Builder AI
- Go to **Resume Builder**
- Use AI generation features
- Check console for edge function calls
- Verify AI suggestions appear

### 3. Interview Prep
- Navigate to **Interview Prep**
- Start a practice session
- Check if AI feedback works
- Verify session saves correctly

## Debugging Tips

### Enable Detailed Logging
The AI service logs detailed information:
- Check browser console for:
  - `AI Career Service: Sending message...`
  - `Making API request to: [URL]`
  - `AI API Response status: [status]`
  - `AI Response received successfully`

### Check Network Tab
1. Open DevTools → Network tab
2. Filter by "functions"
3. Look for requests to `/functions/v1/ai-career-companion`
4. Check:
   - Request headers (Authorization present?)
   - Request payload (correct format?)
   - Response status (200 OK?)
   - Response body (valid JSON?)

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Navigate to Edge Functions → Logs
3. Look for:
   - Function invocations
   - Error messages
   - Execution times

## Manual Function Test

If you want to test the function directly:

```bash
# Using curl (replace with your values)
curl -X POST \
  https://your-project.supabase.co/functions/v1/ai-career-companion \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Test message",
    "context": {
      "language": "en"
    }
  }'
```

## Next Steps

1. ✅ Run the built-in test component
2. ✅ Check all test results pass
3. ✅ Test AI Coach with a real message
4. ✅ Verify responses are saved to database
5. ✅ Check Supabase logs for any errors

## Support

If tests fail:
1. Check the error message in test results
2. Review troubleshooting tips above
3. Check Supabase dashboard for function logs
4. Verify environment variables are correct
5. Ensure user is properly authenticated

