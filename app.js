const express = require('express');
const configManager = require('./config');

const app = express();

// Run configuration validation on startup
const configCheck = configManager.runConfigCheck();

if (!configCheck.validation.isValid) {
  console.error('Configuration validation failed:', configCheck.validation.errors);
  // In production, you might want to exit: process.exit(1);
}

if (configCheck.drift.driftDetected) {
  console.warn('Configuration drift detected:', configCheck.drift.changes);
}

const config = configManager.getConfig();

app.get('/', (req, res) => res.send('Hello from CI/CD Pipeline!'));

// Health check endpoint that includes configuration status
app.get('/health', (req, res) => {
  const healthCheck = configManager.runConfigCheck();
  res.status(healthCheck.healthy ? 200 : 503).json({
    status: healthCheck.healthy ? 'healthy' : 'unhealthy',
    config: config,
    validation: healthCheck.validation,
    drift: healthCheck.drift,
  });
});

// Only start the server if this file is run directly, not when it's required
if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
    console.log(`Environment: ${config.NODE_ENV}`);
    console.log(`Configuration validation: ${configCheck.validation.isValid ? 'PASSED' : 'FAILED'}`);
  });
}

module.exports = app;
