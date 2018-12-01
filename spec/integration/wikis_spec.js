const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/wikis/';
const sequelize = require('../../src/db/models/index').sequelize;
const Wiki = require('../../src/db/models').Wiki;
const User = require('../../src/db/models').User;

describe('routes : wikis', () => {
    beforeEach((done) => {
        this.wiki;
        this.user;

        sequelize.sync({force: true}).then((res) => {

            User.create({
                email: 'user@example.com',
                password: '12345678910',
                name: 'bob'
              })
              .then((user) => {
                this.user = user;

                Wiki.create({
                    title: 'My first Wiki',
                    body: 'This is so cool',
                    private: false,
                    userId: this.user.id
                })
                .then((wiki) => {
                    this.wiki = wiki;
                    done();
                });
              })
              .catch((err) => {
                console.log(err);
                done();
            });
        });         
    });
    describe('User CRUD actions', () => {
        beforeEach(done => {
            User.create({
                email: 'user@example.com',
                password: '1234567',
                name: 'John Doe'
            }).then((user) => {
                request.get(
                    {
                      url: 'http://localhost:3000/auth/fake',
                      form: {
                        userId: user.id,
                        email: user.email
                      }
                    },
                    (err, res, body) => {
                      done();
                    }
                );
            })
          }); 

    describe('GET /wikis', () => {
        it('should return a status code 200 and a list of wikis', (done) => {
            request.get(base, (err, res, body) => {
                expect(res.statusCode).toBe(200);
                expect(err).toBeNull();
                expect(body).toContain('My first Wiki');
                done();
            });
        });
    });
    describe('GET /wikis/new', () => {
        it('should render a new wiki form', (done) => {
            request.get(`${base}new`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain('New Wiki');
                done();
            });
        });
    }); 
    describe('POST /wikis/create', () => {
        it('should create a wiki and redirect', (done) => {
            const options = {
                url: `${base}create`,
                form: {
                    title: 'This is a wiki',
                    body: 'I am a wiki',
                    private: false
                }
            };
            request.post(options, (err, res, body) => {
                Wiki.findOne({where: {title: 'This is a wiki'}})
                .then((wiki) => {
                    expect(res.statusCode).toBe(303);
                    expect(wiki.title).toBe('This is a wiki');
                    expect(wiki.body).toBe('I am a wiki');
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    });
    describe('GET /wikis/:id', () => {
        it('should render a view with the selected wiki', (done) => {
            request.get(`${base}${this.wiki.id}`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain('My first Wiki');
                done();
            });
        });
    });
    describe('DELETE /wikis/:id/destroy', () => {
        it('should delete the wiki with the associated ID', (done) => {
            expect(this.wiki.id).toBe(1);
            request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
                Wiki.findById(1)
                .then((wiki) => {
                    expect(err).toBeNull();
                    expect(wiki).toBeNull();
                    done();
                });
            });
        });
    }); 
    describe('GET /wikis/:id/edit', () => {
        it('should render a view with an edit wiki form', (done) => {
            request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain('Edit Wiki');
                expect(body).toContain('My first Wiki');
                done();
            });
        });
    });
    describe('POST /wikis/:id/update', () => {
        it('should return a status code 302', (done) => {
            request.post({
                url: `${base}${this.wiki.id}/update`,
                form: {
                    title: 'My first Wiki Test',
                    body: 'I love making wikis.'
                }
            }, (err, res, body) => {
                expect(res.statusCode).toBe(302);
                done();
            });
        });
        it('should update the wiki with the given values', (done) => {
            const options = {
                url: `${base}${this.wiki.id}/update`,
                form: {
                    title: 'My First Wiki Test',
                    body: 'I love making wikis.'
                }
            };
            request.post(options, (err, res, body) => {
                expect(err).toBeNull();
                Wiki.findOne({
                    where: {id: this.wiki.id}
                })
                .then((wiki) => {
                    expect(wiki.title).toBe('My First Wiki Test');
                    done();
                });
            });
        });
    }); 
});
});