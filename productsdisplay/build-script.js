import { execSync, spawn } from 'child_process';
import fs from 'fs';

if (process.env.NODE_ENV === 'production') {
  console.log('Production environment detected. Installing Google Cloud SQL Proxy...');
  
  // Install or validate the proxy binary (adjust the command if needed)
  try {
    execSync('curl -o cloud_sql_proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.2/cloud-sql-proxy.linux.amd64 && chmod +x cloud_sql_proxy', { stdio: 'ignore' });
    fs.writeFileSync('credentials.json', atob(process.env.JSON_CREDENTIALS));
    const startProxy = spawn("./cloud_sql_proxy", [process.env.INSTANCE_CONNECTION_NAME, "--credentials-file=credentials.json"], { detached: true, stdio: 'ignore' });
    startProxy.unref();
    await new Promise(resolve => setTimeout(resolve, 2000));
} catch (err) {
    console.error('Failed to install Google Cloud SQL Proxy:', err.message);
    process.exit(1);
  }
} else {
  console.log('Non-production environment. Skipping Google Cloud SQL Proxy installation.');
}

// Proceed with your build process (e.g., Next.js build)
execSync('next build', { stdio: 'inherit' });
