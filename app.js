const express = require('express');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

// Helper function to get git commit info
function getLastCommit() {
  try {
    const hash = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
    const message = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    const timestamp = execSync('git log -1 --pretty=%ai', { encoding: 'utf8' }).trim();
    return { hash: hash.substring(0, 7), message, timestamp };
  } catch (error) {
    console.error('Error getting git commit info:', error.message);
    return { hash: 'unknown', message: 'N/A', timestamp: 'N/A' };
  }
}

// Helper function to get dependencies
function getDependencies() {
  try {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    return {
      dependencies: packageJson.dependencies || {},
      devDependencies: packageJson.devDependencies || {}
    };
  } catch (error) {
    console.error('Error reading dependencies:', error.message);
    return { dependencies: {}, devDependencies: {} };
  }
}

// Helper function to get deployment status
function getDeploymentStatus() {
  try {
    const deploymentFile = path.join(__dirname, 'deployment-status.json');
    if (fs.existsSync(deploymentFile)) {
      return JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    }
    return {
      status: 'unknown',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
  } catch (error) {
    console.error('Error reading deployment status:', error.message);
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
  }
}

// API Endpoints
app.get('/api/dependencies', (req, res) => {
  try {
    const deps = getDependencies();
    res.json(deps);
  } catch (error) {
    console.error('Error in /api/dependencies:', error);
    res.status(500).json({ error: 'Failed to fetch dependencies' });
  }
});

app.get('/api/last-commit', (req, res) => {
  try {
    const commit = getLastCommit();
    res.json(commit);
  } catch (error) {
    console.error('Error in /api/last-commit:', error);
    res.status(500).json({ error: 'Failed to fetch commit information' });
  }
});

app.get('/api/deployment-status', (req, res) => {
  try {
    const status = getDeploymentStatus();
    res.json(status);
  } catch (error) {
    console.error('Error in /api/deployment-status:', error);
    res.status(500).json({ error: 'Failed to fetch deployment status' });
  }
});

// Main UI route
app.get('/', (req, res) => {
  try {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deployment Dashboard - Simple Node CI/CD</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        .header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 1.2em;
            opacity: 0.9;
        }
        .dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .card {
            background: white;
            border-radius: 10px;
            padding: 25px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }
        .card h2 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 1.5em;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .icon {
            font-size: 1.2em;
        }
        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }
        .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }
        .status-success {
            background-color: #10b981;
            color: white;
        }
        .status-error {
            background-color: #ef4444;
            color: white;
        }
        .status-unknown {
            background-color: #6b7280;
            color: white;
        }
        .info-item {
            margin-bottom: 12px;
            padding: 10px;
            background: #f9fafb;
            border-radius: 5px;
        }
        .info-label {
            font-weight: bold;
            color: #4b5563;
            margin-bottom: 5px;
        }
        .info-value {
            color: #1f2937;
            word-break: break-word;
        }
        .dependency-list {
            max-height: 300px;
            overflow-y: auto;
        }
        .dependency-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 10px;
            background: #f9fafb;
            margin-bottom: 5px;
            border-radius: 5px;
        }
        .dep-name {
            font-weight: 500;
            color: #1f2937;
        }
        .dep-version {
            color: #667eea;
            font-family: monospace;
        }
        .section-title {
            font-weight: bold;
            color: #4b5563;
            margin-top: 15px;
            margin-bottom: 10px;
        }
        .footer {
            text-align: center;
            color: white;
            margin-top: 40px;
            opacity: 0.8;
        }
        .refresh-info {
            text-align: center;
            color: white;
            margin-top: 20px;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Deployment Dashboard</h1>
            <p>Simple Node.js CI/CD Pipeline Status</p>
        </div>
        
        <div class="dashboard">
            <div class="card">
                <h2><span class="icon">📦</span> Dependencies</h2>
                <div id="dependencies" class="loading">Loading dependencies...</div>
            </div>
            
            <div class="card">
                <h2><span class="icon">📝</span> Last Commit</h2>
                <div id="commit" class="loading">Loading commit info...</div>
            </div>
            
            <div class="card">
                <h2><span class="icon">🔄</span> Deployment Status</h2>
                <div id="deployment" class="loading">Loading deployment status...</div>
            </div>
        </div>
        
        <div class="refresh-info">
            Auto-refreshing every 30 seconds...
        </div>
        
        <div class="footer">
            <p>Simple Node.js CI/CD Pipeline | Powered by Express & GitHub Actions</p>
        </div>
    </div>
    
    <script>
        async function fetchData() {
            try {
                // Fetch dependencies
                const depsResponse = await fetch('/api/dependencies');
                const deps = await depsResponse.json();
                const depsHtml = \`
                    <div class="section-title">Production Dependencies</div>
                    <div class="dependency-list">
                        \${Object.entries(deps.dependencies || {}).map(([name, version]) => 
                            \`<div class="dependency-item">
                                <span class="dep-name">\${name}</span>
                                <span class="dep-version">\${version}</span>
                            </div>\`
                        ).join('') || '<div class="info-item">No production dependencies</div>'}
                    </div>
                    <div class="section-title">Development Dependencies</div>
                    <div class="dependency-list">
                        \${Object.entries(deps.devDependencies || {}).map(([name, version]) => 
                            \`<div class="dependency-item">
                                <span class="dep-name">\${name}</span>
                                <span class="dep-version">\${version}</span>
                            </div>\`
                        ).join('') || '<div class="info-item">No development dependencies</div>'}
                    </div>
                \`;
                document.getElementById('dependencies').innerHTML = depsHtml;
                
                // Fetch commit info
                const commitResponse = await fetch('/api/last-commit');
                const commit = await commitResponse.json();
                const commitHtml = \`
                    <div class="info-item">
                        <div class="info-label">Commit Hash</div>
                        <div class="info-value">\${commit.hash}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Message</div>
                        <div class="info-value">\${commit.message}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Timestamp</div>
                        <div class="info-value">\${new Date(commit.timestamp).toLocaleString()}</div>
                    </div>
                \`;
                document.getElementById('commit').innerHTML = commitHtml;
                
                // Fetch deployment status
                const deployResponse = await fetch('/api/deployment-status');
                const deploy = await deployResponse.json();
                const statusClass = deploy.status === 'success' ? 'status-success' : 
                                  deploy.status === 'error' || deploy.status === 'failed' ? 'status-error' : 
                                  'status-unknown';
                const deployHtml = \`
                    <div class="info-item">
                        <div class="info-label">Status</div>
                        <div class="info-value">
                            <span class="status-badge \${statusClass}">\${deploy.status.toUpperCase()}</span>
                        </div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Environment</div>
                        <div class="info-value">\${deploy.environment}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Last Deployment</div>
                        <div class="info-value">\${new Date(deploy.timestamp).toLocaleString()}</div>
                    </div>
                \`;
                document.getElementById('deployment').innerHTML = deployHtml;
            } catch (error) {
                console.error('Error fetching data:', error);
                document.getElementById('dependencies').innerHTML = '<div class="info-item">Error loading dependencies</div>';
                document.getElementById('commit').innerHTML = '<div class="info-item">Error loading commit info</div>';
                document.getElementById('deployment').innerHTML = '<div class="info-item">Error loading deployment status</div>';
            }
        }
        
        // Initial load
        fetchData();
        
        // Auto-refresh every 30 seconds
        setInterval(fetchData, 30000);
    </script>
</body>
</html>
    `);
  } catch (error) {
    console.error('Error rendering homepage:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

// Only start the server if this file is run directly, not when it's required
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
