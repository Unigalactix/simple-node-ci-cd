const request = require('supertest');
const app = require('../app'); 

describe('GET /', () => {
  it('responds with hello message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Hello');
  });
});

describe('GET /health', () => {
  it('should return health status with configuration', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('config');
    expect(res.body).toHaveProperty('validation');
    expect(res.body).toHaveProperty('drift');
  });

  it('should include PORT in config', async () => {
    const res = await request(app).get('/health');
    expect(res.body.config).toHaveProperty('PORT');
  });

  it('should include NODE_ENV in config', async () => {
    const res = await request(app).get('/health');
    expect(res.body.config).toHaveProperty('NODE_ENV');
  });

  it('should validate configuration on health check', async () => {
    const res = await request(app).get('/health');
    expect(res.body.validation).toHaveProperty('isValid');
    expect(res.body.validation).toHaveProperty('errors');
  });
});

