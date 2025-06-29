# CORS Fix Guide for VEDARC Frontend-Backend Communication

## Issues Identified

1. **CORS Configuration**: Backend CORS was not properly handling preflight requests
2. **Frontend Environment**: Missing `.env.local` file with correct API URL
3. **Environment Variable Mismatch**: Frontend was using wrong API URL

## Backend Changes Made

### 1. Enhanced CORS Configuration
- Updated CORS middleware to properly handle preflight requests
- Added origin validation in OPTIONS handler
- Added `Access-Control-Max-Age` header for better performance
- Added comprehensive CORS headers to all responses

### 2. Improved Error Handling
- Better error responses for unauthorized origins
- Proper HTTP status codes for CORS failures

## Frontend Changes Needed

### 1. Create `.env.local` file
Create a file named `.env.local` in the `frontend/` directory with:

```env
# Frontend Environment Variables for Production
# API Base URL for production
VITE_API_BASE_URL=https://api.vedarc.co.in/api

# For local development, use:
# VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Updated env.example
The `env.example` file has been updated with the correct production URL.

## Deployment Steps

### Backend Deployment (Render/Railway/Heroku)

1. **Push the updated backend code** to your repository
2. **Redeploy the backend** on your hosting platform
3. **Verify the deployment** by testing the health endpoint:
   ```
   https://api.vedarc.co.in/api/health
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Create the `.env.local` file** in the frontend directory with the content above
2. **Push the updated frontend code** to your repository
3. **Redeploy the frontend** on your hosting platform
4. **Clear browser cache** and test the application

## Testing the Fix

### 1. Test Backend Health
```bash
curl -X GET https://api.vedarc.co.in/api/health
```

### 2. Test CORS Preflight
```bash
curl -X OPTIONS https://api.vedarc.co.in/api/internships \
  -H "Origin: https://www.vedarc.co.in" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type"
```

### 3. Test Frontend-Backend Communication
1. Open browser developer tools
2. Navigate to https://www.vedarc.co.in
3. Check the Network tab for any CORS errors
4. Verify that API calls to https://api.vedarc.co.in work properly

## Expected Results

After implementing these fixes:

1. ✅ No more CORS errors in browser console
2. ✅ Successful API calls from frontend to backend
3. ✅ Proper preflight request handling
4. ✅ Correct environment variable configuration

## Troubleshooting

### If CORS errors persist:

1. **Check backend logs** for any errors
2. **Verify the backend is running** at https://api.vedarc.co.in
3. **Check frontend environment variables** are correctly set
4. **Clear browser cache** and try again
5. **Test with different browsers** to rule out browser-specific issues

### Common Issues:

1. **Backend not responding**: Check if the backend service is running
2. **Wrong API URL**: Verify VITE_API_BASE_URL is correct
3. **SSL/HTTPS issues**: Ensure both frontend and backend use HTTPS
4. **Cache issues**: Clear browser cache and CDN cache

## Security Notes

- The CORS configuration only allows specific origins
- Credentials are supported for authenticated requests
- Session management is properly configured
- All sensitive endpoints require JWT authentication

## Next Steps

1. Deploy the updated backend
2. Create the frontend `.env.local` file
3. Deploy the updated frontend
4. Test the complete application
5. Monitor for any remaining issues 