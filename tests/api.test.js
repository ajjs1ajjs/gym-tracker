/**
 * Tests for Gym Tracker API
 */

const request = require('supertest');
const app = require('../server');
const db = require('../database');

describe('Gym Tracker API', () => {
    beforeAll(() => {
        db.initialize();
    });

    afterAll(() => {
        db.close();
    });

    describe('GET /api/health', () => {
        it('should return health status', async () => {
            const res = await request(app).get('/api/health');
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('ok');
        });
    });

    describe('GET /api/exercises', () => {
        it('should return all exercises', async () => {
            const res = await request(app).get('/api/exercises');
            expect(res.statusCode).toEqual(200);
            expect(res.body.exercises).toBeDefined();
            expect(Array.isArray(res.body.exercises)).toBe(true);
        });
    });

    describe('GET /api/exercises/groups/all', () => {
        it('should return all exercise groups', async () => {
            const res = await request(app).get('/api/exercises/groups/all');
            expect(res.statusCode).toEqual(200);
            expect(res.body.groups).toBeDefined();
            expect(Array.isArray(res.body.groups)).toBe(true);
        });
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user', async () => {
            const userData = {
                username: `testuser_${Date.now()}`,
                email: `test_${Date.now()}@example.com`,
                password: 'password123'
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.token).toBeDefined();
            expect(res.body.user).toBeDefined();
        });

        it('should fail with weak password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'test',
                    email: 'test@example.com',
                    password: '123'
                });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            // First register a user
            const userData = {
                username: `loginuser_${Date.now()}`,
                email: `login_${Date.now()}@example.com`,
                password: 'password123'
            };

            await request(app).post('/api/auth/register').send(userData);

            // Then login
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: userData.username,
                    password: userData.password
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.token).toBeDefined();
        });

        it('should fail with invalid credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    username: 'nonexistent',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
        });
    });
});
