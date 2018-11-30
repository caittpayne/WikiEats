const sequelize = require('../../src/db/models/index').sequelize;
const User = require('../../src/db/models').User;
const Wiki = require('../../src/db/models').Wiki;

describe('Wiki', () => {
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
    describe('#create()', () => {
        it('should create a wiki object with a title, body, private flag, and assigned user', (done) => {

            Wiki.create({
                title: 'This is the best Wiki',
                body: 'Here are all the reasons why.',
                private: false,
                userId: this.user.id
            })
            .then((wiki) => {
                expect(wiki.title).toBe('This is the best Wiki');
                expect(wiki.body).toBe('Here are all the reasons why.');
                expect(wiki.private).toBe(false);
                done();
            })
            .catch((err) => {
                console.log(err);
                done();
            });
        });
        it('should not create a wiki with a missing title, body, private flag, or assigned user', (done) => {
            Wiki.create({
                title: 'The stars in the galaxy'
            })
            .then((wiki) => {

                done();
            })
            .catch((err) => {
                expect(err.message).toContain('Wiki.body cannot be null');
                expect(err.message).toContain('Wiki.userId cannot be null');
                expect(err.message).toContain('Wiki.private cannot be null');
                done();
            });
        });
    });
    describe('#setUser()', () => {
        it('should associate a user and a wiki together', (done) => {
            
            User.create({
                email: 'user@example.com',
                password: '12345678910',
                name: 'bob'
            })
            .then((newUser) => {
                expect(this.wiki.userId).toBe(this.user.id);

                this.wiki.setUser(newUser)
                .then((wiki) => {
                    expect(wiki.userId).toBe(newUser.id);
                    done();
                });
            });
        });
    });
    describe('#getUser()', () => {
        it('should return the associate user', (done) => {
            this.wiki.getUser()
            .then((associatedUser) => {
                expect(associatedUser.email).toBe('user@example.com');
                done();
            });
        });
    });
});