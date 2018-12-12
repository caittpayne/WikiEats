const request = require('request');
const server = require('../../src/server');
const base = 'http://localhost:3000/wikis/';

const sequelize = require('../../src/db/models/index').sequelize;
const Wiki = require('../../src/db/models').Wiki;
const User = require('../../src/db/models').User;
const Collaborator = require('../../src/db/models').Collaborator;


describe('routes : collaborators', () => {
    beforeEach((done) => {
        this.user;
        this.wiki;
        this.collaborator;
        sequelize.sync({force: true}).then((res) => {
            User.create({
                email: "john.snow@got.com",
                password: "12345678910",
                name: "John Snow",
                role: 'premium'
            })
            .then((user) => {

                User.create({
                    email: 'arya.stark@got.com',
                    password: '1234567',
                    name: 'Arya Stark',
                    role: 'standard'
                })
                .then((user) => {

                    this.user = user;

                    Wiki.create({
                        title: 'Expeditions to north of the wall',
                        body: 'A compilation of reports from recent visits to the north',
                        userId: 1,
                        private: true,
                        collaborators: [{
                            userId: this.user.id,
                            wikiId: 1,
                            name: this.user.name
    
                        }]
                    }, {
                        include: {
                            model: Collaborator,
                            as: 'collaborators'
                         }
                    })
                    .then((wiki) => {
                        this.wiki = wiki;
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                })
                .catch((err) => {
                    console.log(err);
                    done();
                })
            })
            .catch((err) => {
                console.log(err);
                done();
            })
        });
    }); 
    
    describe('guest attempting to perform CRUD actions for Collaborator', () => {
      beforeEach((done) => {
            request.get({
                url: 'http://localhost:3000/auth/fake',
                form: {
                    userId: 0
                }
            }, (err, res, body) => {
                done();
            });
        }); 
        describe('GET /wikis/:id/collaborators/edit', () => {
            it('should not render a view to add collaborators', (done) => {
                request.get(`${base}${this.wiki.id}/collaborators/edit`, (err, res, body) => {
                    expect(body).not.toContain('Add Collaborators');
                    done();
                });
            });
        }); 
        describe('POST /wikis/:id/collaborators/create', () => {
            it('should not create new collaborator(s)', (done) => {

                const options = {
                    url: `${base}${this.wiki.id}/collaborators/create`,
                    form: {
                        userId: this.user.id,
                        name: this.user.name,
                        wikiId: this.wiki.id
                    }
                };

                request.post(options, (err, res, body) => {
                    Collaborator.findOne({where: {userId: 2}})
                    .then((collaborator) => {
                        expect(collaborator).toBeNull();
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    });
                });
            });
        });
        describe('POST /wikis/:wikiId/collaborators/:id/destroy', () => {
            beforeEach((done) => {
                User.create({
                    email: 'sansa.stark@got.com',
                    password: '1234567',
                    role: 'standard',
                    name: 'Sansa Stark'
                })
                .then((user) => {
                    this.user = user;

                    Collaborator.create({
                        userId: this.user.id,
                        wikiId: this.wiki.id,
                        name: this.user.name
                    })
                    .then((collaborator) => {
                        this.collaborator = collaborator;
                        done();
                    });
                });
            });
            it('should not delete the collaborator with the associated ID', (done) => {
                Collaborator.all()
                .then((collaborators) => {
                    const collabCountBeforeDelete = collaborators.length;

                    expect(collabCountBeforeDelete).toBe(2);

                    request.post(
                        `${base}${this.wiki.id}/collaborators/${this.collaborator.id}/destroy`, (err, res, body) => {
                            Collaborator.all()
                            .then((collaborators) => {
                                expect(err).toBeNull();
                                expect(collaborators.length).toBe(collabCountBeforeDelete);
                                done();
                            });
                       }
                    );
                });
            });
        }); 
    }); 
    describe('Standard attempting to perform CRUD actions for Collaborator', () => {
        beforeEach((done) => {
            request.get({
                url: 'http://localhost:3000/auth/fake',
                form: {
                    userId: this.user.id,
                    email: this.user.email,
                    name: this.user.name,
                    role: 'standard'
                }
            }, (err, res, body) => {
                done();
            });
        });
        describe('GET /wikis/:id/collaborators/edit', () => {
            it('should not render a view to add collaborators', (done) => {
                request.get(`${base}${this.wiki.id}/collaborators/edit`, (err, res, body) => {
                    expect(body).not.toContain('Add Collaborators');
                    done();
                })
            })
        })
        describe('POST /wikis/:id/collaborators/create', () => {
            it('should not create new collaborator(s)', (done) => {
                User.create({
                    email: "arya.stark@got.com",
                    password: "12345678910",
                    name: "Arya Stark",
                    role: 'premium'
                })
                .then((user) => {
                    this.user = user;

                    const options = {
                        url: `${base}${this.wiki.id}/collaborators/create`,
                        form: {
                            userId: this.user.id,
                            name: this.user.name,
                            wikiId: this.wiki.id
                        }
                    };

                    request.post(options, (err, res, body) => {
                        Collaborator.findOne({where: {userId: 2}})
                        .then((collaborator) => {
                            expect(collaborator).toBeNull();
                            done();
                        })
                        .catch((err) => {
                            console.log(err);
                            done();
                        });
                    });
                });
            });
        });
        describe('POST /wikis/:wikiId/collaborators/:id/destroy', () => {
            beforeEach((done) => {
                User.create({
                    email: 'sansa.stark@got.com',
                    password: '1234567',
                    role: 'standard',
                    name: 'Sansa Stark'
                })
                .then((user) => {
                    this.user = user;

                    Collaborator.create({
                        userId: this.user.id,
                        wikiId: this.wiki.id,
                        name: this.user.name
                    })
                    .then((collaborator) => {
                        this.collaborator = collaborator;
                        done();
                    });
                });
            });
            it('should not delete the collaborator with the associated ID', (done) => {
                Collaborator.all()
                .then((collaborators) => {
                    const collabCountBeforeDelete = collaborators.length;

                    expect(collabCountBeforeDelete).toBe(2);

                    request.post(
                        `${base}${this.wiki.id}/collaborators/${this.collaborator.id}/destroy`, (err, res, body) => {
                            Collaborator.all()
                            .then((collaborators) => {
                                expect(err).toBeNull();
                                expect(collaborators.length).toBe(collabCountBeforeDelete);
                                done();
                            });
                       }
                    );
                });
            });
        }); 
    });
    describe('Premium user attempting to perform CRUD actions for Collaborator', () => {
        beforeEach((done) => {
            request.get({
                url: 'http://localhost:3000/auth/fake',
                form: {
                    userId: this.user.id,
                    email: this.user.email,
                    name: this.user.name,
                    role: 'premium'
                }
            }, (err, res, body) => {
                done();
            });
        });
        describe('GET /wikis/:id/collaborators/edit', () => {
            it('should render a view to add collaborators', (done) => {
                request.get(`${base}${this.wiki.id}/collaborators/edit`, (err, res, body) => {
                    expect(body).toContain('Add Collaborators');
                    done();
                })
            })
        })
        describe('POST /wikis/:id/collaborators/create', () => {
            it('should create new collaborator(s)', (done) => {
                User.create({
                    email: "arya.stark@got.com",
                    password: "12345678910",
                    name: "Arya Stark",
                    role: 'premium'
                })
                .then((user) => {
                    this.user = user;

                    const options = {
                        url: `${base}${this.wiki.id}/collaborators/create`,
                        form: {
                            userId: this.user.id,
                            name: this.user.name,
                            wikiId: this.wiki.id
                        }
                    };

                    request.post(options, (err, res, body) => {
                        Collaborator.findOne({where: {userId: 2}})
                        .then((collaborator) => {
                            expect(collaborator).not.toBeNull();
                            done();
                        })
                        .catch((err) => {
                            console.log(err);
                            done();
                        });
                    });
                });
            });
        });
        describe('POST /wikis/:wikiId/collaborators/:id/destroy', () => {
            beforeEach((done) => {
                User.create({
                    email: 'sansa.stark@got.com',
                    password: '1234567',
                    role: 'standard',
                    name: 'Sansa Stark'
                })
                .then((user) => {
                    this.user = user;

                    Collaborator.create({
                        userId: this.user.id,
                        wikiId: this.wiki.id,
                        name: this.user.name
                    })
                    .then((collaborator) => {
                        this.collaborator = collaborator;
                        done();
                    });
                });
            });
            it('should delete the collaborator with the associated ID', (done) => {
     
                Collaborator.all()
                .then((collaborators) => {
                    const collabCountBeforeDelete = collaborators.length;

                    expect(collabCountBeforeDelete).toBe(2);

                    request.post(
                        `${base}${this.wiki.id}/collaborators/${this.collaborator.id}/destroy`, (err, res, body) => {
                            Collaborator.all()
                            .then((collaborators) => {
                                expect(err).toBeNull();
                                expect(collaborators.length).toBe(collabCountBeforeDelete - 1);
                                done();
                            });
                       }
                    );
                });
            });
        }); 
    });
    describe('Admin user attempting to perform CRUD actions for Collaborator', () => {
        beforeEach((done) => {
            request.get({
                url: 'http://localhost:3000/auth/fake',
                form: {
                    userId: this.user.id,
                    email: this.user.email,
                    name: this.user.name,
                    role: 'admin'
                }
            }, (err, res, body) => {
                done();
            });
        });
        describe('GET /wikis/:id/collaborators/edit', () => {
            it('should render a view to add collaborators', (done) => {
                request.get(`${base}${this.wiki.id}/collaborators/edit`, (err, res, body) => {
                    expect(body).toContain('Add Collaborators');
                    done();
                })
            })
        })
        describe('POST /wikis/:id/collaborators/create', () => {
            it('should create new collaborator(s)', (done) => {
                User.create({
                    email: "arya.stark@got.com",
                    password: "12345678910",
                    name: "Arya Stark",
                    role: 'premium'
                })
                .then((user) => {
                    this.user = user;

                    const options = {
                        url: `${base}${this.wiki.id}/collaborators/create`,
                        form: {
                            userId: this.user.id,
                            name: this.user.name,
                            wikiId: this.wiki.id
                        }
                    };

                    request.post(options, (err, res, body) => {
                        Collaborator.findOne({where: {userId: 2}})
                        .then((collaborator) => {
                            expect(collaborator).not.toBeNull();
                            done();
                        })
                        .catch((err) => {
                            console.log(err);
                            done();
                        });
                    });
                });
            });
        });
        describe('POST /wikis/:wikiId/collaborators/:id/destroy', () => {
            beforeEach((done) => {
                User.create({
                    email: 'sansa.stark@got.com',
                    password: '1234567',
                    role: 'standard',
                    name: 'Sansa Stark'
                })
                .then((user) => {
                    this.user = user;

                    Collaborator.create({
                        userId: this.user.id,
                        wikiId: this.wiki.id,
                        name: this.user.name
                    })
                    .then((collaborator) => {
                        this.collaborator = collaborator;
                        done();
                    });
                });
            });
            it('should delete the collaborator with the associated ID', (done) => {
                Collaborator.all()
                .then((collaborators) => {
                    const collabCountBeforeDelete = collaborators.length;

                    expect(collabCountBeforeDelete).toBe(1);

                    request.post(
                        `${base}${this.wiki.id}/collaborators/${this.collaborator.id}/destroy`, (err, res, body) => {
                            Collaborator.all()
                            .then((collaborators) => {
                                expect(err).toBeNull();
                                expect(collaborators.length).toBe(collabCountBeforeDelete - 1);
                                done();
                            });
                       }
                    );
                });
            });
        }); 
    }); 
});