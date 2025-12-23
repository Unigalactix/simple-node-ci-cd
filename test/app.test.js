const request = require('supertest');
const app = require('../app'); 

describe('GET /', () => {
  it('responds with deployment dashboard HTML', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Deployment Dashboard');
    expect(res.text).toContain('Dependencies');
    expect(res.text).toContain('Last Commit');
    expect(res.text).toContain('Deployment Status');
  });
});

describe('API Endpoints', () => {
  describe('GET /api/dependencies', () => {
    it('returns dependency information', async () => {
      const res = await request(app).get('/api/dependencies');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('dependencies');
      expect(res.body).toHaveProperty('devDependencies');
      expect(typeof res.body.dependencies).toBe('object');
      expect(typeof res.body.devDependencies).toBe('object');
    });

    it('includes express in dependencies', async () => {
      const res = await request(app).get('/api/dependencies');
      expect(res.statusCode).toEqual(200);
      expect(res.body.dependencies).toHaveProperty('express');
    });
  });

  describe('GET /api/last-commit', () => {
    it('returns commit information', async () => {
      const res = await request(app).get('/api/last-commit');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('hash');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('timestamp');
    });

    it('returns valid commit data structure', async () => {
      const res = await request(app).get('/api/last-commit');
      expect(res.statusCode).toEqual(200);
      expect(typeof res.body.hash).toBe('string');
      expect(typeof res.body.message).toBe('string');
      expect(typeof res.body.timestamp).toBe('string');
    });
  });

  describe('GET /api/deployment-status', () => {
    it('returns deployment status information', async () => {
      const res = await request(app).get('/api/deployment-status');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('environment');
    });

    it('returns valid status values', async () => {
      const res = await request(app).get('/api/deployment-status');
      expect(res.statusCode).toEqual(200);
      expect(typeof res.body.status).toBe('string');
      expect(typeof res.body.timestamp).toBe('string');
      expect(typeof res.body.environment).toBe('string');
    });
  });
});

describe('Error Handling', () => {
  it('handles non-existent routes with 404', async () => {
    const res = await request(app).get('/nonexistent');
    expect(res.statusCode).toEqual(404);
  });
});
