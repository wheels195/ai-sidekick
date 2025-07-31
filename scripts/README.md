# Scripts Documentation

This directory contains automation scripts for maintaining the AI Sidekick project.

## CLAUDE.md Auto-Update Script

The `update-claude-md.js` script analyzes recent git commits and generates suggested updates for the CLAUDE.md file.

### Usage

```bash
# Analyze last 7 days (default) and show suggestions
npm run update-docs

# Analyze specific number of days
npm run update-docs 14

# Auto-commit the updates (be careful!)
npm run update-docs 7 --auto-commit

# Analyze last 30 days with auto-commit
npm run update-docs 30 --auto-commit
```

### What it does

1. **Analyzes Git History**: Scans commits from the last N days
2. **Categorizes Changes**: Groups commits by type (features, fixes, UI, API, etc.)
3. **Identifies Key Files**: Shows most frequently changed files
4. **Generates Suggestions**: Creates formatted CLAUDE.md sections
5. **Optional Auto-Commit**: Can automatically update and commit CLAUDE.md

### Categories

The script automatically categorizes commits based on patterns:

- **Features**: `feat`, `add`, `implement`, `create`
- **Fixes**: `fix`, `resolve`, `correct`  
- **UI/UX**: `ui`, `style`, `design`, `homepage`, `hero`, `card`, `animation`
- **API**: `api`, `endpoint`, `backend`, `server`
- **Auth**: `auth`, `oauth`, `login`, `signup`, `security`
- **Analytics**: `analytics`, `tracking`, `admin`, `dashboard`
- **Performance**: `perf`, `optimize`, `cache`, `speed`

### Example Output

```
🔍 Analyzing commits from the last 7 days...

📊 Found 12 commits:
  ui: 4 commits
  api: 3 commits  
  fixes: 2 commits
  features: 2 commits
  auth: 1 commits

📝 Suggested CLAUDE.md updates:
==================================================
### ✅ New Features (July 31, 2025)
- **Add comprehensive API cost tracking** - a6ebf19
- **Implement staggered card animations** - 637a960

### ✅ UI/UX Improvements (July 31, 2025)  
- **Redesign hero feature cards with professional styling** - 19baa59
- **Fix card animation persistence** - 637a960
==================================================
```

### Safety Features

- **Preview Mode**: Shows suggestions without making changes (default)
- **Backup Detection**: Won't overwrite if CLAUDE.md structure is unexpected
- **File Validation**: Checks for required sections before updating
- **Commit Messages**: Includes commit hashes for traceability

### Best Practices

1. **Run Weekly**: After significant development sessions
2. **Review First**: Always review suggestions before auto-committing
3. **Manual Polish**: Use generated content as a starting point, then refine
4. **Commit Context**: Include meaningful commit messages for better categorization

### Integration Options

The script can be integrated into:

- **Git Hooks**: Pre-commit or post-commit automation
- **GitHub Actions**: Scheduled weekly documentation updates  
- **Development Workflow**: Part of release preparation
- **CI/CD Pipeline**: Automated documentation maintenance

### Troubleshooting

**No commits found**: Check that you're in a git repository with recent commits
**Permission errors**: Ensure the script has execute permissions (`chmod +x`)
**Missing sections**: Verify CLAUDE.md has the expected structure
**Git errors**: Ensure git is properly configured in your environment