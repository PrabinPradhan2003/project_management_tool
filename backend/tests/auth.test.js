const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Very small smoke test to make sure test setup works
const app = express();
app.use(bodyParser.json());
app.get('/', (req, res) => res.json({ ok: true }));

describe('smoke', () => {
  it('root returns ok', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
