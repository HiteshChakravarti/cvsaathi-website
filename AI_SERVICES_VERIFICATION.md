# AI Services Verification Guide

## Quick Start

### How to Test Edge Functions

1. **Navigate to Settings**
   - Go to Dashboard → Settings (gear icon)
   - Click on **"Advanced"** tab
   - Scroll to **"Edge Function & AI Service Test"** section

2. **Run Tests**
   - Click the **"Run Tests"** button
   - Wait for all tests to complete
   - Review the results

3. **Check Results**
   - ✅ Green = Test passed
   - ❌ Red = Test failed
   - Click "View Details" for more information

## What Gets Tested

### 1. Environment Variables
- Checks if `VITE_SUPABASE_URL` is set
- Checks if `VITE_SUPABASE_ANON_KEY` is set
- Verifies configuration is correct

### 2. Authentication
- Verifies user is signed in
- Checks for valid session token
- Confirms authentication is working

### 3. Edge Function URL
- Constructs the correct URL
- Verifies URL format: `{SUPABASE_URL}/functions/v1/ai-career-companion`

### 4. Edge Function Connectivity
- Makes a test request to the edge function
- Checks response status
- Validates response format

### 5. AI Service Integration
- Tests the AI service wrapper
- Verifies message sending works
- Checks response parsing

### 6. Edge Function Existence
- Verifies function is deployed
- Checks if function is accessible

## Expected Edge Function

### Function Name
```
ai-career-companion
```

### Function URL
```
https://your-project-id.supabase.co/functions/v1/ai-career-companion
```

### Request Format
```json
{
  "message": "User message here",
  "context": {
    "language": "en",
    "timestamp": 1234567890,
    "requestId": "unique-id"
  }
}
```

### Response Format
```json
{
  "items": [
    {
      "id": "unique-id",
      "type": "message",
      "content": "AI response text"
    }
  ]
}
```

## Testing AI Features Manually

### 1. AI Coach
1. Navigate to **AI Coach** in dashboard
2. Click **"New Chat"** or select existing conversation
3. Type a message and send
4. Check browser console (F12) for:
   - `AI Career Service: Sending message...`
   - `Making API request to: [URL]`
   - `AI API Response status: 200`
   - `AI Response received successfully`

### 2. Resume Builder AI
1. Go to **Resume Builder**
2. Use any AI generation feature
3. Check console for edge function calls
4. Verify AI suggestions appear

### 3. Interview Prep
1. Navigate to **Interview Prep**
2. Start a practice session
3. Check if AI feedback works
4. Verify responses are saved

## Common Issues

### Issue: "Edge function not found (404)"
**Solution:**
- Deploy the edge function in Supabase dashboard
- Verify function name is exactly: `ai-career-companion`
- Check function is active in Supabase dashboard

### Issue: "No access token found"
**Solution:**
- Sign out and sign back in
- Check browser console for auth errors
- Verify session is valid

### Issue: "Failed to connect to edge function"
**Solution:**
- Check Supabase project is active
- Verify `.env` file has correct URL
- Check network tab for CORS errors

### Issue: "Invalid response structure"
**Solution:**
- Check edge function returns correct format
- Verify function returns `{ items: [...] }`
- Check each item has `content` field

## Debugging Tips

### Browser Console
Open DevTools (F12) and check:
- Network tab → Filter by "functions"
- Look for requests to `/functions/v1/ai-career-companion`
- Check request/response details

### Supabase Dashboard
1. Go to Supabase Dashboard
2. Navigate to **Edge Functions** → **Logs**
3. Look for:
   - Function invocations
   - Error messages
   - Execution times

### Environment Variables
Check your `.env` file:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Next Steps After Testing

1. ✅ All tests pass → AI services are working!
2. ❌ Some tests fail → Check error messages
3. Review troubleshooting tips above
4. Check Supabase dashboard for function logs
5. Verify edge function is deployed and active

## Support

If you continue to have issues:
1. Check the detailed error in test results
2. Review `EDGE_FUNCTION_SETUP.md` for more details
3. Check Supabase dashboard for function logs
4. Verify all environment variables are correct

