# Deploying to Netlify

This guide will help you deploy the DevMonitor Dashboard to Netlify.

## Prerequisites

- A Netlify account (sign up at https://netlify.com)
- Your backend API deployed and accessible

## Deployment Steps

### Option 1: Deploy via Netlify UI

1. Push your code to GitHub, GitLab, or Bitbucket
2. Log in to Netlify
3. Click "Add new site" → "Import an existing project"
4. Connect to your Git provider and select this repository
5. Configure build settings:
   - **Base directory**: `dashboard`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `dashboard/build`
6. Add environment variables:
   - `CI` = `false`
   - `NODE_VERSION` = `18`
   - `REACT_APP_API_URL` = Your backend API URL (e.g., `https://api.yourdomain.com`)
   - `REACT_APP_SOCKET_URL` = Your backend API URL (same as above)
7. Click "Deploy site"

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from the dashboard directory
cd dashboard
npm install
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

### Option 3: Manual Deployment

```bash
# Build the project
cd dashboard
npm install
npm run build

# The build folder can now be uploaded to Netlify manually via the UI
# Go to https://app.netlify.com/drop and drag the build folder
```

## Configuration

### Environment Variables

Set these in Netlify's dashboard under "Site settings" → "Environment variables":

| Variable | Description | Example |
|----------|-------------|---------|
| `CI` | Prevents treating warnings as errors | `false` |
| `NODE_VERSION` | Node.js version to use | `18` |
| `REACT_APP_API_URL` | Backend API URL | `https://api.yourdomain.com` |
| `REACT_APP_SOCKET_URL` | WebSocket server URL | `https://api.yourdomain.com` |

### Build Settings

The `netlify.toml` file in the root directory contains the build configuration:

```toml
[build]
  base = "dashboard"
  command = "npm install && npm run build"
  publish = "build"

[build.environment]
  CI = "false"
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## Post-Deployment

After deployment:

1. Update your backend's CORS settings to allow requests from your Netlify domain
2. Configure your backend's `ALLOWED_ORIGINS` environment variable to include your Netlify URL
3. Test the application by accessing your Netlify URL
4. Set up a custom domain if desired

## CORS Configuration

Update your backend's `.env` file:

```env
ALLOWED_ORIGINS=https://your-app.netlify.app,https://yourdomain.com
```

Or in your backend's CORS configuration:

```javascript
cors({
  origin: [
    'https://your-app.netlify.app',
    'https://yourdomain.com'
  ],
  credentials: true
})
```

## Troubleshooting

### Build Fails

- Check that all dependencies are listed in `package.json`
- Verify that `CI=false` is set in environment variables
- Check build logs in Netlify dashboard

### Cannot Connect to Backend

- Verify `REACT_APP_API_URL` is set correctly
- Check that backend allows CORS from your Netlify domain
- Verify backend is running and accessible

### 404 on Refresh

- Ensure the redirects rule in `netlify.toml` is configured correctly
- This handles client-side routing for React Router

### WebSocket Connection Issues

- Verify `REACT_APP_SOCKET_URL` is set correctly
- Ensure your backend supports WebSocket connections
- Check that there's no proxy blocking WebSocket upgrades

## Automatic Deploys

Netlify will automatically deploy when you push to your connected Git repository:

- Pushes to main branch → Production deployment
- Pull requests → Preview deployments

## Custom Domain

To use a custom domain:

1. Go to "Domain settings" in Netlify
2. Add your custom domain
3. Update DNS records as instructed
4. Netlify will automatically provision SSL certificate

## Performance

The built app is optimized for production:

- Minified JavaScript and CSS
- Code splitting
- Optimized images
- Gzip compression
- CDN distribution

## Support

For Netlify-specific issues, refer to:
- https://docs.netlify.com
- https://answers.netlify.com

For application issues, check the main README.md
