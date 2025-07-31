#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * CLAUDE.md Auto-Update Script
 * 
 * This script analyzes recent git commits and suggests updates to CLAUDE.md
 * Usage: npm run update-docs [days] [--auto-commit]
 */

const DAYS_BACK = process.argv[2] || 7; // Default to last 7 days
const AUTO_COMMIT = process.argv.includes('--auto-commit');

function getRecentCommits(days = 7) {
  try {
    const gitLog = execSync(
      `git log --since="${days} days ago" --pretty=format:"%h|%ad|%s|%an" --date=short --no-merges`,
      { encoding: 'utf8' }
    );
    
    if (!gitLog.trim()) {
      console.log(`📅 No commits found in the last ${days} days`);
      return [];
    }

    return gitLog.trim().split('\n').map(line => {
      const [hash, date, message, author] = line.split('|');
      return { hash, date, message, author };
    });
  } catch (error) {
    console.error('❌ Error fetching git commits:', error.message);
    return [];
  }
}

function getChangedFiles(days = 7) {
  try {
    const changedFiles = execSync(
      `git log --since="${days} days ago" --name-only --pretty=format: --no-merges`,
      { encoding: 'utf8' }
    );
    
    const files = changedFiles
      .split('\n')
      .filter(file => file.trim() && !file.includes('CLAUDE.md'))
      .reduce((acc, file) => {
        acc[file] = (acc[file] || 0) + 1;
        return acc;
      }, {});

    return Object.entries(files)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10 most changed files
  } catch (error) {
    console.error('❌ Error fetching changed files:', error.message);
    return [];
  }
}

function categorizeCommits(commits) {
  const categories = {
    features: [],
    fixes: [],
    ui: [],
    api: [],
    auth: [],
    analytics: [],
    performance: [],
    other: []
  };

  const patterns = {
    features: /^(feat|add|implement|create)/i,
    fixes: /^(fix|resolve|correct)/i,
    ui: /^(ui|style|design|homepage|hero|card|animation)/i,
    api: /^(api|endpoint|backend|server)/i,
    auth: /^(auth|oauth|login|signup|security)/i,
    analytics: /^(analytics|tracking|admin|dashboard)/i,
    performance: /^(perf|optimize|cache|speed)/i
  };

  commits.forEach(commit => {
    let categorized = false;
    for (const [category, pattern] of Object.entries(patterns)) {
      if (pattern.test(commit.message)) {
        categories[category].push(commit);
        categorized = true;
        break;
      }
    }
    if (!categorized) {
      categories.other.push(commit);
    }
  });

  return categories;
}

function generateUpdateSuggestions(categories, changedFiles) {
  const suggestions = [];
  const today = new Date().toISOString().split('T')[0];
  
  // Convert date to readable format
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (categories.features.length > 0) {
    suggestions.push(`\n### ✅ New Features (${formatDate(today)})`);
    categories.features.forEach(commit => {
      suggestions.push(`- **${commit.message}** - ${commit.hash}`);
    });
  }

  if (categories.ui.length > 0) {
    suggestions.push(`\n### ✅ UI/UX Improvements (${formatDate(today)})`);
    categories.ui.forEach(commit => {
      suggestions.push(`- **${commit.message}** - ${commit.hash}`);
    });
  }

  if (categories.api.length > 0) {
    suggestions.push(`\n### ✅ Backend & API Updates (${formatDate(today)})`);
    categories.api.forEach(commit => {
      suggestions.push(`- **${commit.message}** - ${commit.hash}`);
    });
  }

  if (categories.auth.length > 0) {
    suggestions.push(`\n### ✅ Authentication & Security (${formatDate(today)})`);
    categories.auth.forEach(commit => {
      suggestions.push(`- **${commit.message}** - ${commit.hash}`);
    });
  }

  if (categories.analytics.length > 0) {
    suggestions.push(`\n### ✅ Analytics & Tracking (${formatDate(today)})`);
    categories.analytics.forEach(commit => {
      suggestions.push(`- **${commit.message}** - ${commit.hash}`);
    });
  }

  if (categories.fixes.length > 0) {
    suggestions.push(`\n### ✅ Bug Fixes & Improvements (${formatDate(today)})`);
    categories.fixes.forEach(commit => {
      suggestions.push(`- **${commit.message}** - ${commit.hash}`);
    });
  }

  // Add file change summary
  if (changedFiles.length > 0) {
    suggestions.push(`\n### 📁 Most Modified Files:`);
    changedFiles.slice(0, 5).forEach(([file, count]) => {
      suggestions.push(`- \`${file}\` (${count} changes)`);
    });
  }

  return suggestions;
}

function updateClaudeMd(suggestions) {
  const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md');
  
  if (!fs.existsSync(claudeMdPath)) {
    console.error('❌ CLAUDE.md not found in current directory');
    return false;
  }

  const content = fs.readFileSync(claudeMdPath, 'utf8');
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Find the insertion point (before "## Current Architecture")
  const insertionPoint = content.indexOf('## Current Architecture');
  if (insertionPoint === -1) {
    console.error('❌ Could not find insertion point in CLAUDE.md');
    return false;
  }

  const beforeInsertion = content.substring(0, insertionPoint);
  const afterInsertion = content.substring(insertionPoint);
  
  const newSection = suggestions.join('\n');
  const updatedContent = beforeInsertion + newSection + '\n\n' + afterInsertion;

  // Update the "Last updated" line
  const updatedWithDate = updatedContent.replace(
    /\*Last updated: .+\*/,
    `*Last updated: ${today} - Automated Update*`
  );

  fs.writeFileSync(claudeMdPath, updatedWithDate);
  return true;
}

function main() {
  console.log(`🔍 Analyzing commits from the last ${DAYS_BACK} days...\n`);

  const commits = getRecentCommits(DAYS_BACK);
  if (commits.length === 0) {
    return;
  }

  const changedFiles = getChangedFiles(DAYS_BACK);
  const categories = categorizeCommits(commits);

  console.log(`📊 Found ${commits.length} commits:`);
  Object.entries(categories).forEach(([category, items]) => {
    if (items.length > 0) {
      console.log(`  ${category}: ${items.length} commits`);
    }
  });

  const suggestions = generateUpdateSuggestions(categories, changedFiles);
  
  if (suggestions.length === 0) {
    console.log('\n✅ No significant changes to document');
    return;
  }

  console.log('\n📝 Suggested CLAUDE.md updates:');
  console.log('=' .repeat(50));
  console.log(suggestions.join('\n'));
  console.log('=' .repeat(50));

  if (AUTO_COMMIT) {
    console.log('\n🚀 Auto-committing updates...');
    if (updateClaudeMd(suggestions)) {
      try {
        execSync('git add CLAUDE.md');
        execSync(`git commit -m "Auto-update CLAUDE.md with recent changes (${DAYS_BACK} days)

${suggestions.slice(0, 5).join('\n')}

🤖 Generated with automated update script"`);
        console.log('✅ CLAUDE.md updated and committed!');
      } catch (error) {
        console.error('❌ Error committing changes:', error.message);
      }
    }
  } else {
    console.log('\n💡 To auto-commit these changes, run:');
    console.log(`   npm run update-docs ${DAYS_BACK} --auto-commit`);
    console.log('\n💡 Or manually copy the suggestions above into CLAUDE.md');
  }
}

if (require.main === module) {
  main();
}

module.exports = { getRecentCommits, categorizeCommits, generateUpdateSuggestions };