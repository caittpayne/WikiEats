const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/users/';

describe('routes : users', () => {

    describe('GET /users/signup', () => {
        it('should render a view of the sign-up form', (done) => {
            request.get(`${base}signup`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain('Sign up');
                done();
            });
        });
    });
});