# 🚀 Publishing Checklist for @barikoi/mqtt-location

## ✅ Completed Steps

- [x] Created monorepo structure with workspaces
- [x] Extracted MQTT logic to reusable package
- [x] Created TypeScript types and interfaces
- [x] Implemented `useMqttLocation` React hook
- [x] Added utility functions (topic building, parsing)
- [x] Built and tested in monorepo
- [x] Created comprehensive README
- [x] Added MIT License
- [x] Created `.npmignore` and `.gitignore`
- [x] Configured package.json for npm publishing
- [x] Successfully built the package

## 📋 Pre-Publishing Checklist

### Before You Start

- [ ] Have npm account ([sign up here](https://www.npmjs.com/signup))
- [ ] Decided on package name (if `@barikoi/mqtt-location` is taken)
- [ ] Have GitHub account for repository

### Repository Setup (15 minutes)

- [ ] Run extract script: `./packages/mqtt-location/extract-package.sh`
- [ ] Create new GitHub repository at https://github.com/new
- [ ] Update `package.json` with your GitHub URLs:
  ```json
  {
    "repository": {
      "url": "https://github.com/YOUR_USERNAME/mqtt-location.git"
    },
    "bugs": {
      "url": "https://github.com/YOUR_USERNAME/mqtt-location/issues"
    },
    "homepage": "https://github.com/YOUR_USERNAME/mqtt-location#readme"
  }
  ```
- [ ] Push to GitHub:
  ```bash
  cd ~/Desktop/mqtt-location
  git remote add origin https://github.com/YOUR_USERNAME/mqtt-location.git
  git push -u origin main
  ```

### Build & Test (5 minutes)

- [ ] Install dependencies: `npm install`
- [ ] Build package: `npm run build`
- [ ] Check build output in `dist/` folder
- [ ] (Optional) Test with `npm link` in another project

### Publish to npm (5 minutes)

- [ ] Login to npm: `npm login`
- [ ] Check what will be published: `npm publish --dry-run`
- [ ] Publish: `npm publish --access public`
- [ ] Verify on npmjs.com: https://npmjs.com/package/@barikoi/mqtt-location

### Post-Publishing

- [ ] Install in your main project: `npm install @barikoi/mqtt-location`
- [ ] Update import in PublicMaps.tsx to use published package
- [ ] Test the published package works correctly
- [ ] Share with your team!

## 📦 Package Info

**Current Version:** 1.0.0

**Package Name:** @barikoi/mqtt-location

**Size (estimate):** ~15KB (minified)

**Dependencies:**
- Peer: `react ^18.0.0 || ^19.0.0`
- Peer: `mqtt ^5.0.0`

## 🔧 Common Issues & Solutions

### Package name already taken
Change the name in `package.json`:
- Option 1: `@your-username/mqtt-location`
- Option 2: `mqtt-location-tracker`
- Option 3: `react-mqtt-location`

### Build fails
```bash
rm -rf node_modules package-lock.json dist
npm install
npm run build
```

### Cannot publish
```bash
npm whoami  # Check if logged in
npm logout
npm login
```

### Permission denied
Add `--access public` flag:
```bash
npm publish --access public
```

## 📚 Resources

- **Publishing Guide:** `PUBLISHING.md`
- **Package README:** `README.md`
- **Extract Script:** `extract-package.sh`
- **npm docs:** https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry

## 🎯 Quick Commands Reference

```bash
# Extract package to standalone directory
./packages/mqtt-location/extract-package.sh

# Navigate to package
cd ~/Desktop/mqtt-location

# Install dependencies
npm install

# Build
npm run build

# Test build output
ls -la dist/

# Dry run (see what will be published)
npm pack --dry-run

# Publish
npm login
npm publish --access public

# Update version for next release
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
```

## 📝 After Publishing

Update your main project to use the published package:

```bash
cd /home/barikoi/Desktop/Project/trace-mqtt-dashboard

# Remove workspace reference, use published package
npm uninstall @barikoi/mqtt-location
npm install @barikoi/mqtt-location
```

Then update `vite.config.ts` to remove the alias (no longer needed).

## 🌟 Sharing with Team

Once published, your team can use it:

```bash
npm install @barikoi/mqtt-location
```

```typescript
import { useMqttLocation } from '@barikoi/mqtt-location';
```

## 🔄 Future Updates

When you make changes:

1. Update code in standalone repo
2. Increment version: `npm version patch`
3. Build: `npm run build`
4. Publish: `npm publish`
5. Update in projects: `npm update @barikoi/mqtt-location`

---

**Need Help?** See `PUBLISHING.md` for detailed step-by-step instructions.

**Questions?** Open an issue on GitHub after publishing!

Good luck! 🚀
