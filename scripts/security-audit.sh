#!/bin/bash

# Security Audit Script for React Native/Expo Project
# This script checks for sensitive data that might be committed to git

echo "🔒 Security Audit for my-app"
echo "================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ "$2" = "ERROR" ]; then
        echo -e "${RED}❌ $1${NC}"
    elif [ "$2" = "WARNING" ]; then
        echo -e "${YELLOW}⚠️  $1${NC}"
    else
        echo -e "${GREEN}✅ $1${NC}"
    fi
}

# Check 1: .env file protection
echo -e "\n📁 Checking .env file protection..."
if [ -f ".env" ]; then
    if grep -q "^\.env$" .gitignore; then
        print_status ".env file exists and is in .gitignore" "OK"
    else
        print_status ".env file exists but NOT in .gitignore!" "ERROR"
        echo "   Add '.env' to your .gitignore file"
    fi
else
    print_status "No .env file found" "OK"
fi

# Check 2: Look for hardcoded API keys in code
echo -e "\n🔍 Scanning for hardcoded API keys..."
SENSITIVE_PATTERNS=(
    "AIza[0-9A-Za-z_-]{35}"  # Google API keys
    "sk_[a-zA-Z0-9]{24,}"    # Stripe secret keys
    "pk_[a-zA-Z0-9]{24,}"    # Stripe public keys
    "['\"]API.*KEY['\"].*['\"][A-Za-z0-9_-]{10,}['\"]"  # Generic API keys
    "['\"]SECRET['\"].*['\"][A-Za-z0-9_-]{10,}['\"]"    # Secrets
    "['\"]PASSWORD['\"].*['\"][A-Za-z0-9_-]{6,}['\"]"   # Passwords
)

found_sensitive=false
for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    files=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | xargs grep -l "$pattern" 2>/dev/null || true)
    if [ ! -z "$files" ]; then
        print_status "Found potential hardcoded secrets in: $files" "ERROR"
        found_sensitive=true
    fi
done

if [ "$found_sensitive" = false ]; then
    print_status "No hardcoded API keys found in code" "OK"
fi

# Check 3: Git history for sensitive files
echo -e "\n📚 Checking git history for sensitive files..."
sensitive_in_history=$(git log --name-only --oneline | grep -E "\.env$|\.key$|\.pem$|config\.json$" || true)
if [ ! -z "$sensitive_in_history" ]; then
    print_status "Found sensitive files in git history!" "ERROR"
    echo "$sensitive_in_history"
else
    print_status "No sensitive files found in git history" "OK"
fi

# Check 4: Current git status
echo -e "\n📊 Checking current git status..."
if git status --porcelain | grep -q "\.env"; then
    print_status ".env file is staged/modified - DO NOT COMMIT!" "ERROR"
else
    print_status "No .env file in git staging area" "OK"
fi

# Check 5: .gitignore completeness
echo -e "\n📋 Checking .gitignore completeness..."
required_ignores=(
    ".env"
    ".env.local"
    "*.key"
    "*.pem"
    "node_modules/"
)

missing_ignores=()
for ignore in "${required_ignores[@]}"; do
    if ! grep -q "^$ignore" .gitignore 2>/dev/null; then
        missing_ignores+=("$ignore")
    fi
done

if [ ${#missing_ignores[@]} -eq 0 ]; then
    print_status "All important patterns are in .gitignore" "OK"
else
    print_status "Missing patterns in .gitignore: ${missing_ignores[*]}" "WARNING"
fi

# Check 6: Environment variable usage
echo -e "\n🌍 Checking environment variable usage..."
env_usage=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | xargs grep -l "process\.env\." 2>/dev/null || true)
if [ ! -z "$env_usage" ]; then
    print_status "Environment variables properly used in: $(echo $env_usage | tr '\n' ' ')" "OK"
else
    print_status "No environment variable usage found" "WARNING"
fi

echo -e "\n🎯 Security Audit Complete!"
echo "================================"

# Summary
if [ "$found_sensitive" = true ]; then
    echo -e "${RED}⚠️  ACTION REQUIRED: Fix the issues above before committing!${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Your project looks secure for git commits!${NC}"
    exit 0
fi
