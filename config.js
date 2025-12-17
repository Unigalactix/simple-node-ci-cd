/**
 * Configuration module for environment variable management and validation
 * Ensures environment variables persist correctly and validates configuration on startup
 */

class ConfigurationManager {
  constructor() {
    this.config = {
      PORT: process.env.PORT || 3000,
      NODE_ENV: process.env.NODE_ENV || 'development',
      HOST: process.env.HOST || 'localhost',
    };
    
    // Store initial config for drift detection
    this.initialConfig = { ...this.config };
    this.configErrors = [];
    this.driftDetected = false;
  }

  /**
   * Validates required environment variables
   * @returns {Object} Validation result with isValid flag and errors array
   */
  validate() {
    this.configErrors = [];
    
    // Validate PORT
    const port = parseInt(this.config.PORT, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      this.configErrors.push({
        variable: 'PORT',
        value: this.config.PORT,
        error: 'PORT must be a valid number between 1 and 65535',
      });
    }

    // Validate NODE_ENV
    const validEnvs = ['development', 'production', 'test'];
    if (!validEnvs.includes(this.config.NODE_ENV)) {
      this.configErrors.push({
        variable: 'NODE_ENV',
        value: this.config.NODE_ENV,
        error: `NODE_ENV must be one of: ${validEnvs.join(', ')}`,
      });
    }

    // Validate HOST
    if (typeof this.config.HOST !== 'string' || this.config.HOST.trim() === '') {
      this.configErrors.push({
        variable: 'HOST',
        value: this.config.HOST,
        error: 'HOST must be a non-empty string',
      });
    }

    return {
      isValid: this.configErrors.length === 0,
      errors: this.configErrors,
    };
  }

  /**
   * Detects configuration drift from initial state
   * @returns {Object} Drift detection result with driftDetected flag and changes array
   */
  detectDrift() {
    const changes = [];
    
    Object.keys(this.initialConfig).forEach((key) => {
      const currentValue = process.env[key] || this.config[key];
      const initialValue = this.initialConfig[key];
      
      if (String(currentValue) !== String(initialValue)) {
        changes.push({
          variable: key,
          initialValue,
          currentValue,
        });
      }
    });

    this.driftDetected = changes.length > 0;
    
    return {
      driftDetected: this.driftDetected,
      changes,
    };
  }

  /**
   * Triggers alert for configuration issues
   * @param {string} type - Type of alert ('validation' or 'drift')
   * @param {Object} data - Alert data
   */
  triggerAlert(type, data) {
    const timestamp = new Date().toISOString();
    const alertMessage = {
      timestamp,
      type,
      severity: type === 'drift' ? 'warning' : 'error',
      data,
    };

    // Log alert to console (in production, this could send to monitoring service)
    console.error(`[CONFIG ALERT] ${JSON.stringify(alertMessage, null, 2)}`);
    
    return alertMessage;
  }

  /**
   * Get current configuration
   * @returns {Object} Current configuration object
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * Run full configuration check (validation + drift detection)
   * @returns {Object} Complete check result
   */
  runConfigCheck() {
    const validationResult = this.validate();
    const driftResult = this.detectDrift();

    // Trigger alerts if issues detected
    if (!validationResult.isValid) {
      this.triggerAlert('validation', validationResult);
    }

    if (driftResult.driftDetected) {
      this.triggerAlert('drift', driftResult);
    }

    return {
      validation: validationResult,
      drift: driftResult,
      healthy: validationResult.isValid && !driftResult.driftDetected,
    };
  }
}

// Export both the class (for testing) and singleton instance (for use in app)
const configManager = new ConfigurationManager();

module.exports = configManager;
module.exports.ConfigurationManager = ConfigurationManager;
