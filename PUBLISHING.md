# Publishing Guide for @barikoi/mqtt-location

This guide will help you publish the package to npm.

## Prerequisites

1. **npm account**: Create one at [npmjs.com](https://www.npmjs.com/signup)
2. **npm CLI**: Already installed with Node.js
3. **Git repository**: Create a new repo on GitHub

## Step-by-Step Publishing Process

### 1. Prepare Your Git Repository

```bash
# Create a new directory for the standalone package
cd ~/Desktop
mkdir mqtt-location
cd mqtt-location

# Copy the package files
cp -r /home/barikoi/Desktop/Project/trace-mqtt-dashboard/packages/mqtt-location/* .

# Initialize git
git init
git add .
git commit -m "Initial commit: MQTT location tracking package"

# Create GitHub repo (do this on github.com) then:
git remote add origin https://github.com/YOUR_USERNAME/mqtt-location.git
git branch -M main
git push -u origin main
```

### 2. Update package.json URLs

Before publishing, update these fields in `package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/mqtt-location.git"
  },
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/mqtt-location/issues"
  },
  "homepage": "https://github.com/YOUR_USERNAME/mqtt-location#readme"
}
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Build the Package

```bash
npm run build
```

This will create the `dist/` folder with:
- `index.js` (CommonJS)
- `index.mjs` (ES Module)
- `index.d.ts` (TypeScript definitions)

### 5. Test Locally (Optional but Recommended)

```bash
# In the package directory
npm link

# In your dashboard project
cd /home/barikoi/Desktop/Project/trace-mqtt-dashboard
npm link @barikoi/mqtt-location

# Test if it works, then unlink
npm unlink @barikoi/mqtt-location
```

### 6. Login to npm

```bash
npm login
# Enter your npm username, password, and email
```

### 7. Publish to npm

```bash
# Dry run first (see what will be published)
npm publish --dry-run

# If everything looks good, publish!
npm publish --access public
```

**Note**: The `--access public` flag is required for scoped packages (@barikoi/mqtt-location).

### 8. Verify Publication

Visit: https://www.npmjs.com/package/@barikoi/mqtt-location

## Using the Published Package

### Installation

```bash
npm install @barikoi/mqtt-location
```

### Usage in Projects

```typescript
import { useMqttLocation } from '@barikoi/mqtt-location';

function MyComponent() {
  const { markers, isConnected, error } = useMqttLocation({
    host: 'broker.example.com',
    port: 8083,
    username: 'user',
    password: 'pass',
    topic: 'company/123/+/+/location',
  });

  return (
    <div>
      {Object.values(markers).map(marker => (
        <div key={marker.deviceId}>
          {marker.deviceId}: {marker.latitude}, {marker.longitude}
        </div>
      ))}
    </div>
  );
}
```

## Updating the Package

### 1. Update Version

```bash
# Patch release (1.0.0 -> 1.0.1)
npm version patch

# Minor release (1.0.0 -> 1.1.0)
npm version minor

# Major release (1.0.0 -> 2.0.0)
npm version major
```

### 2. Build and Publish

```bash
npm run build
npm publish
```

### 3. Push Changes to Git

```bash
git push
git push --tags
```

## Versioning Strategy

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 -> 2.0.0): Breaking changes
- **MINOR** (1.0.0 -> 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 -> 1.0.1): Bug fixes

## Troubleshooting

### Package name already taken

If `@barikoi/mqtt-location` is taken, you have options:

1. Use your npm username: `@your-username/mqtt-location`
2. Different name: `mqtt-location-tracker`, `react-mqtt-location`, etc.
3. Without scope: `mqtt-location` (if available)

Update the `name` field in package.json before publishing.

### Build fails

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Cannot publish

```bash
# Check if you're logged in
npm whoami

# Login again
npm logout
npm login
```

## Package Size

Keep your package lean:

```bash
# Check what will be included
npm pack --dry-run

# Check package size
npm pack
ls -lh barikoi-mqtt-location-1.0.0.tgz
rm barikoi-mqtt-location-1.0.0.tgz
```

## Security

- Never commit `.env` files or secrets
- Use `.npmignore` to exclude sensitive files
- Review what's published with `npm pack --dry-run`

## CI/CD (Optional)

Consider setting up GitHub Actions to auto-publish on release:

```yaml
# .github/workflows/publish.yml
name: Publish Package

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Need Help?

- npm docs: https://docs.npmjs.com/
- npm support: https://www.npmjs.com/support
- MQTT.js: https://github.com/mqttjs/MQTT.js

---

## Quick Checklist Before Publishing

- [ ] Updated package.json with correct repository URLs
- [ ] Created GitHub repository
- [ ] Ran `npm install` successfully
- [ ] Ran `npm run build` successfully
- [ ] Tested with `npm link` (optional)
- [ ] Logged in to npm with `npm login`
- [ ] Checked package contents with `npm pack --dry-run`
- [ ] Published with `npm publish --access public`
- [ ] Verified on npmjs.com
- [ ] Updated main project to use published package

Good luck! 🚀
