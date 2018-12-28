const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/users/";
const User = require("../../src/db/models").User;
const Wiki = require("../../src/db/models").Wiki;
const sequelize = require("../../src/db/models/index").sequelize;

describe("routes : users", () => {
  beforeEach(done => {
    sequelize
      .sync({ force: true })
      .then(() => {
        done();
      })
      .catch(err => {
        console.log(err);
        done();
      });
  });

  describe("GET /users/signup", () => {
    it("should render a view of the sign-up form", done => {
      request.get(`${base}signup`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain(
          "Choose from one of our plans to start collaborating"
        );
        done();
      });
    });
  });
  describe("POST /users", () => {
    it("should create a new user with valid values and redirect", done => {
      const options = {
        url: base,
        form: {
          email: "user@email.com",
          password: "1234567",
          name: "Bob"
        }
      };
      request.post(options, (err, res, body) => {
        User.findOne({ where: { email: "user@email.com" } })
          .then(user => {
            expect(user).not.toBeNull();
            expect(user.email).toBe("user@email.com");
            expect(user.name).toBe("Bob");
            expect(user.id).toBe(1);
            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
    });
    it("should not create a new user with invalid attributes and redirect", done => {
      request.post(
        {
          url: base,
          form: {
            email: "user",
            password: "1234567",
            name: "Bob"
          }
        },
        (err, res, body) => {
          User.findOne({ where: { email: "user" } })
            .then(user => {
              expect(user).toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        }
      );
    });
    it("should not create a new user with missing attributes and redirect", done => {
      request.post(
        {
          url: base,
          form: {
            email: "user@email.com",
            password: "1234567"
          }
        },
        (err, res, body) => {
          User.findOne({ where: { email: "user@email.com" } })
            .then(user => {
              expect(user).toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        }
      );
    });
  });
  describe("GET /users/signin", () => {
    it("should render a view with a sign in form", done => {
      request.get(`${base}signin`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Sign in");
        done();
      });
    });
  });

  describe("GET /users/:id", () => {
    beforeEach(done => {
      this.user;
      this.wiki;

      User.create({
        email: "sansa.stark@got.com",
        password: "12345678910",
        role: "standard",
        name: "Sansa Stark"
      }).then(res => {
        this.user = res;

        request.get(
          {
            url: "http://localhost:3000/auth/fake",
            form: {
              id: this.user.id,
              role: "standard",
              email: "sansa.stark@got.com",
              name: "Sansa Stark"
            }
          },
          (err, res, body) => {
            done();
          }
        );

        Wiki.create({
          title: "My first Wiki",
          body: "This is so cool",
          private: false,
          userId: this.user.id
        }).then(res => {
          this.wiki = res;
          done();
        });
      });
    });
    it("should present a list of wikis a user has created", done => {
      request.get(`${base}${this.user.id}`, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        expect(body).toContain("My first Wiki");
        expect(body).toContain(this.user.name);
        done();
      });
    });

    describe("POST /users/:id/upgrade", () => {
      it("should not upgrade the users account to premium without Stripe payment", done => {
        request.get(`${base}${this.user.id}/upgrade`, (err, res, body) => {
          expect(this.user.role).toBe("standard");
          done();
        });
      });
    });
    describe("POST /users/:id/downgrade", () => {
      it("should downgrade the users account to premium", done => {
        request.get(`${base}${this.user.id}/downgrade`, (err, res, body) => {
          User.findOne({ where: { email: "sansa.stark@got.com" } })
            .then(user => {
              expect(err).toBeNull();
              expect(this.user.role).toBe("standard");
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });
  });
});
