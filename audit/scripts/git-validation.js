const { execSync } = require('child_process');

class GitValidator {
  validate() {
    console.log('=== GIT VALIDATION ===');

    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      console.log(`Current branch: ${currentBranch}`);

      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        console.log('❌ Working tree has uncommitted changes');
        console.log('Please commit or stash changes before deployment');
        process.exit(1);
      }

      const recentCommits = execSync('git log --oneline -5', { encoding: 'utf8' });
      console.log('\nRecent commits:');
      console.log(recentCommits);

      try {
        execSync('git fetch origin');
        const behind = execSync(`git rev-list HEAD..origin/${currentBranch} --count`, { encoding: 'utf8' }).trim();
        if (Number(behind) > 0) {
          console.log(`⚠️  Local branch is ${behind} commits behind remote`);
        }
      } catch (error) {
        console.log('Note: Cannot check remote status');
      }

      console.log('✅ Git validation passed');
      return true;
    } catch (error) {
      console.error('Git validation failed:', error.message);
      process.exit(1);
    }
  }
}

if (require.main === module) {
  new GitValidator().validate();
}

module.exports = GitValidator;
