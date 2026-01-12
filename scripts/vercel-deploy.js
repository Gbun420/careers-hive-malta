const { execSync } = require('child_process');
const fs = require('fs');

class VercelDeployer {
  constructor() {
    this.projectName = 'careers-hive-malta-prod';
    this.requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_SITE_URL',
      'RESEND_API_KEY',
      'ALERT_DISPATCH_SECRET',
      'SEARCH_REINDEX_SECRET',
      'FEATURED_DURATION_DAYS',
    ];
  }

  async deploy() {
    console.log('=== VERCEL DEPLOYMENT ===');

    try {
      this.cleanVercelConfig();
      await this.linkVercelProject();
      await this.setEnvironmentVariables();
      await this.deployProduction();
      console.log('✅ Deployment completed successfully');
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  cleanVercelConfig() {
    if (fs.existsSync('.vercel')) {
      fs.rmSync('.vercel', { recursive: true });
      console.log('✅ Removed existing Vercel config');
    }
  }

  async linkVercelProject() {
    console.log(`Linking Vercel project: ${this.projectName}...`);
    execSync(`npx vercel link --yes --project ${this.projectName}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'inherit'],
    });
    console.log('✅ Vercel project linked');
  }

  async setEnvironmentVariables() {
    console.log('\nSetting environment variables from .env.production...');
    
    if (!fs.existsSync('.env.production')) {
      console.warn('⚠️  .env.production not found, skipping environment variable sync');
      return;
    }

    const envContent = fs.readFileSync('.env.production', 'utf8');
    const envLines = envContent.split('\n');
    const envMap = {};

    envLines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        envMap[key] = value;
      }
    });

    for (const envVar of this.requiredEnvVars) {
      const value = envMap[envVar];
      if (value) {
        try {
          console.log(`Setting ${envVar}...`);
          // Use 'echo' to pipe the value to avoid shell expansion issues
          execSync(`echo "${value}" | npx vercel env add ${envVar} production --force`, {
            stdio: ['pipe', 'pipe', 'inherit'],
          });
        } catch (error) {
          console.warn(`⚠️  Could not set ${envVar}: ${error.message}`);
        }
      } else {
        console.warn(`⚠️  Value for ${envVar} not found in .env.production`);
      }
    }
  }

  async deployProduction() {
    console.log('\nDeploying to production...');
    const output = execSync('npx vercel --prod --yes', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'inherit'],
    });

    const urlMatch = output.match(/https:\/\/[^\s]+/);
    if (urlMatch) {
      this.productionUrl = urlMatch[0];
      console.log(`✅ Deployed to: ${this.productionUrl}`);
      this.updateProductionUrl();
    }
  }

  updateProductionUrl() {
    console.log(`Production URL: ${this.productionUrl}`);
  }
}

if (require.main === module) {
  const deployer = new VercelDeployer();
  deployer.deploy();
}

module.exports = VercelDeployer;
