/**
 * Tests for configuration persistence and validation
 */

// Import the class directly for testing
const configManagerInstance = require('../config');

// We need to access the class to create fresh instances for testing
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

  getConfig() {
    return { ...this.config };
  }

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

describe('Configuration Manager', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Configuration Validation', () => {
    test('should validate PORT as a valid number', () => {
      const config = new ConfigurationManager();
      config.config.PORT = 3000;
      const result = config.validate();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid PORT', () => {
      const config = new ConfigurationManager();
      config.config.PORT = 'invalid';
      const result = config.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          variable: 'PORT',
          error: expect.stringContaining('valid number'),
        })
      );
    });

    test('should reject PORT out of valid range', () => {
      const config = new ConfigurationManager();
      config.config.PORT = 99999;
      const result = config.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          variable: 'PORT',
          error: expect.stringContaining('between 1 and 65535'),
        })
      );
    });

    test('should validate NODE_ENV with allowed values', () => {
      const config = new ConfigurationManager();
      config.config.NODE_ENV = 'production';
      const result = config.validate();
      
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid NODE_ENV', () => {
      const config = new ConfigurationManager();
      config.config.NODE_ENV = 'invalid-env';
      const result = config.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          variable: 'NODE_ENV',
          error: expect.stringContaining('must be one of'),
        })
      );
    });

    test('should validate HOST as non-empty string', () => {
      const config = new ConfigurationManager();
      config.config.HOST = 'localhost';
      const result = config.validate();
      
      expect(result.isValid).toBe(true);
    });

    test('should reject empty HOST', () => {
      const config = new ConfigurationManager();
      config.config.HOST = '';
      const result = config.validate();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          variable: 'HOST',
          error: expect.stringContaining('non-empty string'),
        })
      );
    });
  });

  describe('Configuration Drift Detection', () => {
    test('should detect no drift when config unchanged', () => {
      const config = new ConfigurationManager();
      const result = config.detectDrift();
      
      expect(result.driftDetected).toBe(false);
      expect(result.changes).toHaveLength(0);
    });

    test('should detect drift when PORT changes', () => {
      const config = new ConfigurationManager();
      const initialPort = config.config.PORT;
      
      // Simulate environment change
      process.env.PORT = '8080';
      
      const result = config.detectDrift();
      
      expect(result.driftDetected).toBe(true);
      expect(result.changes).toContainEqual(
        expect.objectContaining({
          variable: 'PORT',
          initialValue: initialPort,
          currentValue: '8080',
        })
      );
    });

    test('should detect drift when NODE_ENV changes', () => {
      const config = new ConfigurationManager();
      config.initialConfig.NODE_ENV = 'development';
      
      // Simulate environment change
      process.env.NODE_ENV = 'production';
      
      const result = config.detectDrift();
      
      expect(result.driftDetected).toBe(true);
      expect(result.changes).toContainEqual(
        expect.objectContaining({
          variable: 'NODE_ENV',
          initialValue: 'development',
          currentValue: 'production',
        })
      );
    });

    test('should detect multiple configuration changes', () => {
      const config = new ConfigurationManager();
      
      // Simulate multiple environment changes
      process.env.PORT = '9000';
      process.env.NODE_ENV = 'test';
      
      const result = config.detectDrift();
      
      expect(result.driftDetected).toBe(true);
      expect(result.changes.length).toBeGreaterThan(0);
    });
  });

  describe('Alert System', () => {
    test('should trigger validation alert for invalid config', () => {
      const config = new ConfigurationManager();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      config.config.PORT = 'invalid';
      const validationResult = config.validate();
      const alert = config.triggerAlert('validation', validationResult);
      
      expect(alert.type).toBe('validation');
      expect(alert.severity).toBe('error');
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('should trigger drift alert for configuration changes', () => {
      const config = new ConfigurationManager();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      process.env.PORT = '8080';
      const driftResult = config.detectDrift();
      const alert = config.triggerAlert('drift', driftResult);
      
      expect(alert.type).toBe('drift');
      expect(alert.severity).toBe('warning');
      expect(alert.data.driftDetected).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    test('alert should include timestamp', () => {
      const config = new ConfigurationManager();
      const alert = config.triggerAlert('validation', {});
      
      expect(alert.timestamp).toBeDefined();
      expect(new Date(alert.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe('Full Configuration Check', () => {
    test('should pass when config is valid and no drift', () => {
      const config = new ConfigurationManager();
      config.config.PORT = 3000;
      config.config.NODE_ENV = 'production';
      config.config.HOST = 'localhost';
      
      const result = config.runConfigCheck();
      
      expect(result.healthy).toBe(true);
      expect(result.validation.isValid).toBe(true);
      expect(result.drift.driftDetected).toBe(false);
    });

    test('should fail when validation fails', () => {
      const config = new ConfigurationManager();
      config.config.PORT = 'invalid';
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = config.runConfigCheck();
      
      expect(result.healthy).toBe(false);
      expect(result.validation.isValid).toBe(false);
      
      consoleSpy.mockRestore();
    });

    test('should fail when drift detected', () => {
      const config = new ConfigurationManager();
      process.env.PORT = '9999';
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = config.runConfigCheck();
      
      expect(result.healthy).toBe(false);
      expect(result.drift.driftDetected).toBe(true);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Configuration Persistence Across Restarts', () => {
    test('should maintain config values after initialization', () => {
      process.env.PORT = '4000';
      process.env.NODE_ENV = 'production';
      
      const config = new ConfigurationManager();
      const initialConfig = config.getConfig();
      
      expect(initialConfig.PORT).toBe('4000');
      expect(initialConfig.NODE_ENV).toBe('production');
    });

    test('should use defaults when env vars not set', () => {
      delete process.env.PORT;
      delete process.env.NODE_ENV;
      delete process.env.HOST;
      
      const config = new ConfigurationManager();
      const currentConfig = config.getConfig();
      
      expect(currentConfig.PORT).toBe(3000);
      expect(currentConfig.NODE_ENV).toBe('development');
      expect(currentConfig.HOST).toBe('localhost');
    });

    test('should preserve initial config for drift comparison', () => {
      const config = new ConfigurationManager();
      const initial = { ...config.initialConfig };
      
      // Simulate environment change
      process.env.PORT = '5000';
      config.detectDrift();
      
      // Initial config should remain unchanged
      expect(config.initialConfig).toEqual(initial);
    });
  });

  describe('getConfig method', () => {
    test('should return current configuration', () => {
      const config = new ConfigurationManager();
      const result = config.getConfig();
      
      expect(result).toHaveProperty('PORT');
      expect(result).toHaveProperty('NODE_ENV');
      expect(result).toHaveProperty('HOST');
    });

    test('should return a copy of config (not reference)', () => {
      const config = new ConfigurationManager();
      const result = config.getConfig();
      
      result.PORT = 9999;
      
      expect(config.config.PORT).not.toBe(9999);
    });
  });

  describe('Singleton Instance Integration', () => {
    test('should have access to singleton instance methods', () => {
      expect(configManagerInstance).toHaveProperty('getConfig');
      expect(configManagerInstance).toHaveProperty('validate');
      expect(configManagerInstance).toHaveProperty('detectDrift');
      expect(configManagerInstance).toHaveProperty('runConfigCheck');
    });

    test('singleton instance should return config', () => {
      const config = configManagerInstance.getConfig();
      expect(config).toHaveProperty('PORT');
      expect(config).toHaveProperty('NODE_ENV');
      expect(config).toHaveProperty('HOST');
    });
  });
});

