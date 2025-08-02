# 🔒 Security Guidelines

This document outlines security practices for this project to prevent sensitive data from being committed to git.

## 🚨 Sensitive Files

### ❌ NEVER commit these files:
- `.env` - Contains API keys and secrets
- `.env.local` - Local environment overrides
- `*.key` - Private keys
- `*.pem` - Certificate files
- `*.p12` - Certificate bundles
- `config.json` - If it contains secrets

### ✅ Safe to commit:
- `.env.example` - Template without real values
- `README.md` - Documentation
- Source code using `process.env.VARIABLE_NAME`

## 🛡️ Protection Measures

### 1. .gitignore Protection
All sensitive file patterns are in `.gitignore`:
```
.env
.env.local
*.key
*.pem
```

### 2. Pre-commit Hook
Automatically prevents committing:
- `.env` files
- Hardcoded API keys
- Other sensitive patterns

### 3. Security Audit Script
Run before committing:
```bash
./scripts/security-audit.sh
```

## 🔑 Environment Variables

### Setup:
1. Copy `.env.example` to `.env`
2. Fill in your actual API keys
3. Never commit the `.env` file

### Usage in Code:
```typescript
// ✅ Good - uses environment variable
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// ❌ Bad - hardcoded key
const API_KEY = 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

## 🚀 Deployment

### Development:
- Use `.env` file locally
- Never commit it to git

### Production:
- Set environment variables in your hosting platform
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables

## 🔍 Regular Audits

### Before each commit:
```bash
# Run security audit
./scripts/security-audit.sh

# Check git status
git status

# Ensure no .env files are staged
git diff --cached --name-only | grep -v "\.env"
```

### If you accidentally commit sensitive data:

1. **Remove from staging:**
   ```bash
   git reset HEAD .env
   ```

2. **Remove from history (if already committed):**
   ```bash
   git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch .env' --prune-empty --tag-name-filter cat -- --all
   ```

3. **Force push (⚠️ dangerous):**
   ```bash
   git push origin --force --all
   ```

## 📞 Emergency Response

If sensitive data was committed:

1. **Immediately revoke/rotate** all exposed API keys
2. **Remove from git history** using commands above
3. **Update all team members** to pull latest changes
4. **Review access logs** for any unauthorized usage

## ✅ Security Checklist

Before each commit:
- [ ] `.env` file is not staged
- [ ] No hardcoded API keys in code
- [ ] All secrets use environment variables
- [ ] Security audit script passes
- [ ] Pre-commit hook is enabled

---

**Remember: It's easier to prevent than to fix! 🛡️**
