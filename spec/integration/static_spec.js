const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/';

describe('routes : static ', () => {
    describe('GET /', () => {
        it("should return a status code 200 and contain 'A space to create'", (done) => {
            request.get(base, (err, res, body) => {
                expect(res.statusCode).toBe(200);
                expect(body).toContain('A space to create');
                done();
            });
        });
    });
});