const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/wikis/";
const sequelize = require("../../src/db/models/index").sequelize;
const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;

describe("routes : wikis", () => {
  beforeEach(done => {
    this.wiki;
    this.user;

    sequelize.sync({ force: true }).then(res => {
      User.create({
        email: "user@example.com",
        password: "12345678910",
        name: "bob",
        role: 'standard'
      })
        .then(user => {
          this.user = user;

          Wiki.create({
            title: "My first Wiki",
            body: "This is so cool",
            private: false,
            userId: this.user.id
          }).then(wiki => {

            this.wiki = wiki;
            done();

          });
        })
        .catch(err => {
          console.log(err);
          done();
        });
    });
  });

  // Guest Users
  describe('Guest user CRUD actions', () => {
    beforeEach(done => {
        request.get(
          {
            url: 'http://localhost:3000/auth/fake',
            form: {
              userId: '0'
            }
          },
          (err, res, body) => {
            done();
          }
        );
      });
    describe('GET /wikis/new', () => {
        it('should redirect to the wikis page', (done) => {
            request.get(`${base}new`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain('Wikis');
                done();
            });
        });
    });
    describe('POST /wikis/create', () => {
        it('should not create a new wiki', (done) => {
            const options = {
                url: `${base}create`,
                form: {
                  title: 'Guest posting wiki',
                  body: "should not post",
                  private: false
                }
              };
            request.post(options, (err, res, body) => {
                Wiki.findOne({where: {title: 'Guest posting wiki'}})
                .then((wiki) => {
                    expect(wiki).toBeNull();
                    done();
                });
            });
        });
    });
    describe("GET /wikis/:id", () => {
        it("should render a view with the selected wiki", done => {
          request.get(`${base}${this.wiki.id}`, (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("My first Wiki");
            done();
          });
        });
      });
      describe("GET /wikis/:id/edit", () => {
        it("should not render a view with an edit wiki form", done => {
          request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
            expect(body).not.toContain("Edit Wiki");
            done();
          });
        });
      });
      describe("DELETE /wikis/:id/destroy", () => {
        it("should not delete the wiki with the associated ID", done => {
          Wiki.all().then(wikis => {
            const wikiCountBeforeDelete = wikis.length;
            expect(wikiCountBeforeDelete).toBe(1);
  
            request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
              Wiki.all().then(wiki => {
                expect(err).toBeNull();
                expect(wiki.length).toBe(wikiCountBeforeDelete);
                done();
              });
            });
          });
        });
      });
      describe("POST /wikis/:id/update", () => {
        it("should not return a status code 302", done => {
          request.post(
            {
              url: `${base}${this.wiki.id}/update`,
              form: {
                title: "My first Wiki Test",
                body: "I love making wikis."
              }
            },
            (err, res, body) => {
              expect(res.statusCode).toBe(401);
              done();
            }
          );
        });
    });
  });

  // Standard Users

  describe("Standard user CRUD actions", () => {
    beforeEach(done => {
      User.create({
        email: "john.doe@example.com",
        password: "1234567",
        name: "John Doe",
        role: "standard"
      }).then(user => {
        request.get(
          {
            url: "http://localhost:3000/auth/fake",
            form: {
              userId: user.id,
              email: user.email,
              role: user.role
            }
          },
          (err, res, body) => {
            done();
          }
        );
      });
    });

    describe("GET /wikis", () => {
      it("should return a status code 200 and a list of wikis", done => {
        request.get(base, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          expect(err).toBeNull();
          expect(body).toContain("My first Wiki");
          done();
        });
      });
    });
    describe("GET /wikis/new", () => {
      it("should render a new wiki form", done => {
        request.get(`${base}new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Wiki");
          done();
        });
      });
    });
    describe("POST /wikis/create", () => {
      it("should create a public wiki and redirect", done => {
        const options = {
          url: `${base}create`,
          form: {
            title: "This is a wiki",
            body: "I am a wiki",
            private: false
          }
        };
        request.post(options, (err, res, body) => {
          Wiki.findOne({ where: { title: "This is a wiki" } })
            .then(wiki => {
              expect(res.statusCode).toBe(303);
              expect(wiki.title).toBe("This is a wiki");
              expect(wiki.body).toBe("I am a wiki");
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
      it("should not create a new wiki that fails validations", done => {
        const options = {
          url: `${base}create`,
          form: {
            title: "a",
            body: "b",
            private: false
          }
        };
        request.post(options, (err, res, body) => {
          Wiki.findOne({ where: { title: "a" } })
            .then(wiki => {
              expect(wiki).toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });
    describe("GET /wikis/:id", () => {
      it("should render a view with the selected wiki", done => {
        request.get(`${base}${this.wiki.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("My first Wiki");
          done();
        });
      });
    });
    describe("DELETE /wikis/:id/destroy", () => {
      it("should not delete the wiki with the associated ID", done => {
        Wiki.all().then(wikis => {
          const wikiCountBeforeDelete = wikis.length;
          expect(wikiCountBeforeDelete).toBe(1);

          request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
            Wiki.all().then(wiki => {
              expect(err).toBeNull();
              expect(wiki.length).toBe(wikiCountBeforeDelete);
              done();
            });
          });
        });
      });
    });
    describe("GET /wikis/:id/edit", () => {
      it("should render a view with an edit wiki form", done => {
        request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Wiki");
          expect(body).toContain("My first Wiki");
          done();
        });
      });
    });
    describe("POST /wikis/:id/update", () => {
      it("should return a status code 302", done => {
        request.post(
          {
            url: `${base}${this.wiki.id}/update`,
            form: {
              title: "My first Wiki Test",
              body: "I love making wikis."
            }
          },
          (err, res, body) => {
            expect(res.statusCode).toBe(302);
            done();
          }
        );
      });
      it("should update the public wiki with the given values", done => {
        const options = {
          url: `${base}${this.wiki.id}/update`,
          form: {
            title: "My First Wiki Test",
            body: "I love making wikis."
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Wiki.findOne({
            where: { id: this.wiki.id }
          }).then(wiki => {
            expect(wiki.title).toBe("My First Wiki Test");
            done();
          });
        });
      });
    });
    describe("Standard user attempting CRUD actions on Private Wikis", () => {
      beforeEach(done => {
        Wiki.create({
          title: "I am a private wiki",
          body: "You cannot edit me",
          private: true,
          userId: 1
        })
          .then(wiki => {
            this.wiki = wiki;
            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
      describe("POST /wikis/create", () => {
        it("should not create a private wiki", done => {
          const options = {
            url: `${base}create`,
            form: {
              title: "Trying to create private wiki",
              body: "can i do it?",
              private: true
            }
          };
          request.post(options, (err, res, body) => {
            Wiki.findOne({ where: { title: "Trying to create private wiki" } })
              .then(wiki => {
                expect(wiki.private).toBe(false);
                done();
              })
              .catch(err => {
                console.log(err);
                done();
              });
          });
        });
      });
      describe("GET /wikis/:id", () => {
        it("should not render a view with the private wiki", done => {
          request.get(`${base}${this.wiki.id}`, (err, res, body) => {
            expect(body).not.toContain("I am a private wiki");
            done();
          });
        });
      });
      describe("GET /wikis/:id/edit", () => {
        it("should not render a view with an edit wiki form", done => {
          request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
            expect(body).not.toContain("Edit Wiki");
            done();
          });
        });
      });
      describe("POST /wikis/:id/update (private post)", () => {
        it("should return a status code 401", done => {
          request.post(
            {
              url: `${base}${this.wiki.id}/update`,
              form: {
                title: "I want to update the private wiki",
                body: "I should not be able to"
              }
            },
            (err, res, body) => {
              expect(res.statusCode).toBe(401);
              done();
            }
          );
        });
        it("should not update private wiki with the given values", done => {
          const options = {
            url: `${base}${this.wiki.id}/update`,
            form: {
              title: "I want to update the private wiki",
              body: "I should not be able to"
            }
          };
          request.post(options, (err, res, body) => {
            expect(err).toBeNull();
            Wiki.findOne({
              where: { id: this.wiki.id }
            }).then(wiki => {
              expect(wiki.title).toBe("I am a private wiki");
              done();
            });
          });
        });
      });
    });
    describe('GET /wikis/:id/collaborators', () => {
        it('should not render a view to add collaborators', (done) => {
            request.get(`${base}${this.wiki.id}/collaborators`, (err, res, body) => {
                expect(body).not.toContain("Add Collaborators");
                done();
            });
        });
    });
  });
/*

  // Premium User
  describe("Premium user CRUD actions", () => {
    beforeEach(done => {
      User.create({
        email: "jane.smith@email.com",
        password: "1234567",
        name: "Jane Smith",
        role: "premium"
      }).then(user => {
        request.get(
          {
            url: "http://localhost:3000/auth/fake",
            form: {
              userId: user.id,
              email: user.email,
              role: user.role
            }
          },
          (err, res, body) => {
            done();
          }
        );
      });
    });

    describe("GET /wikis", () => {
      it("should return a status code 200 and a list of wikis", done => {
        request.get(base, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          expect(err).toBeNull();
          expect(body).toContain("My first Wiki");
          done();
        });
      });
    });
    describe("GET /wikis/new", () => {
      it("should render a new wiki form", done => {
        request.get(`${base}new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Wiki");
          done();
        });
      });
    });
    describe("POST /wikis/create", () => {
      it("should create a private wiki and redirect", done => {
        const options = {
          url: `${base}create`,
          form: {
            title: "This is a wiki",
            body: "I am a wiki",
            private: true
          }
        };
        request.post(options, (err, res, body) => {
          Wiki.findOne({ where: { title: "This is a wiki" } })
            .then(wiki => {
              expect(res.statusCode).toBe(303);
              expect(wiki.title).toBe("This is a wiki");
              expect(wiki.body).toBe("I am a wiki");
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
      it("should not create a new wiki that fails validations", done => {
        const options = {
          url: `${base}create`,
          form: {
            title: "a",
            body: "b",
            private: true
          }
        };
        request.post(options, (err, res, body) => {
          Wiki.findOne({ where: { title: "a" } })
            .then(wiki => {
              expect(wiki).toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });
    describe("GET /wikis/:id", () => {
      it("should render a view with the selected wiki", done => {
        request.get(`${base}${this.wiki.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("My first Wiki");
          done();
        });
      });
    });
    describe("DELETE /wikis/:id/destroy", () => {
      it("should not delete the wiki with the associated ID", done => {
        Wiki.all().then(wikis => {
          const wikiCountBeforeDelete = wikis.length;
          expect(wikiCountBeforeDelete).toBe(1);

          request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
            Wiki.all().then(wiki => {
              expect(err).toBeNull();
              expect(wiki.length).toBe(wikiCountBeforeDelete);
              done();
            });
          });
        });
      });
    });
    describe("GET /wikis/:id/edit", () => {
      it("should render a view with an edit wiki form", done => {
        request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Wiki");
          expect(body).toContain("My first Wiki");
          done();
        });
      });
    });
    describe("POST /wikis/:id/update", () => {
      it("should return a status code 302", done => {
        request.post(
          {
            url: `${base}${this.wiki.id}/update`,
            form: {
              title: "My first Wiki Test",
              body: "I love making wikis."
            }
          },
          (err, res, body) => {
            expect(res.statusCode).toBe(302);
            done();
          }
        );
      });
      it("should update the public wiki with the given values", done => {
        const options = {
          url: `${base}${this.wiki.id}/update`,
          form: {
            title: "My First Wiki Test",
            body: "I love making wikis."
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Wiki.findOne({
            where: { id: this.wiki.id }
          }).then(wiki => {
            expect(wiki.title).toBe("My First Wiki Test");
            done();
          });
        });
      });
    });
    describe("Premium user attempting CRUD actions on Private Wikis", () => {
      beforeEach(done => {
        Wiki.create({
          title: "I am a private wiki",
          body: "You cannot edit me",
          private: true,
          userId: 1
        })
          .then(wiki => {
            this.wiki = wiki;
            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
      describe("POST /wikis/create", () => {
        it("should create a private wiki and redirect", done => {
          const options = {
            url: `${base}create`,
            form: {
              title: "Trying to create private wiki",
              body: "can i do it?",
              private: true
            }
          };
          request.post(options, (err, res, body) => {
            Wiki.findOne({ where: { title: "Trying to create private wiki" } })
              .then(wiki => {
                expect(wiki.private).toBe(true);
                done();
              })
              .catch(err => {
                console.log(err);
                done();
              });
          });
        });
      });
      describe("GET /wikis/:id", () => {
        it("should not render a view with the private wiki user does not own", done => {
          request.get(`${base}${this.wiki.id}`, (err, res, body) => {
            expect(body).not.toContain("I am a private wiki");
            done();
          });
        });
      });
      describe("GET /wikis/:id/edit", () => {
        it("should not render a view with an edit wiki form", done => {
          request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
            expect(body).not.toContain("Edit Wiki");
            done();
          });
        });
      });
      describe("POST /wikis/:id/update (private post)", () => {
        it("should return a status code 401", done => {
          request.post(
            {
              url: `${base}${this.wiki.id}/update`,
              form: {
                title: "I want to update the private wiki",
                body: "I should not be able to"
              }
            },
            (err, res, body) => {
              expect(res.statusCode).toBe(401);
              done();
            }
          );
        });
        it("should not update private wiki with the given values", done => {
          const options = {
            url: `${base}${this.wiki.id}/update`,
            form: {
              title: "I want to update the private wiki",
              body: "I should not be able to"
            }
          };
          request.post(options, (err, res, body) => {
            expect(err).toBeNull();
            Wiki.findOne({
              where: { id: this.wiki.id }
            }).then(wiki => {
              expect(wiki.title).toBe("I am a private wiki");
              done();
            });
          });
        });
      });
    });
  });

  // Admin User
  describe("Admin user CRUD actions", () => {
    beforeEach(done => {
      User.create({
        email: "admin@email.com",
        password: "1234567",
        name: "Admin User",
        role: "admin"
      }).then(user => {
        request.get(
          {
            url: "http://localhost:3000/auth/fake",
            form: {
              userId: user.id,
              email: user.email,
              role: user.role
            }
          },
          (err, res, body) => {
            done();
          }
        );
      });
    });

    describe("GET /wikis", () => {
      it("should return a status code 200 and a list of wikis", done => {
        request.get(base, (err, res, body) => {
          expect(res.statusCode).toBe(200);
          expect(err).toBeNull();
          expect(body).toContain("My first Wiki");
          done();
        });
      });
    });
    describe("GET /wikis/new", () => {
      it("should render a new wiki form", done => {
        request.get(`${base}new`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("New Wiki");
          done();
        });
      });
    });
    describe("POST /wikis/create", () => {
      it("should create a public wiki and redirect", done => {
        const options = {
          url: `${base}create`,
          form: {
            title: "This is a wiki",
            body: "I am a wiki",
            private: false
          }
        };
        request.post(options, (err, res, body) => {
          Wiki.findOne({ where: { title: "This is a wiki" } })
            .then(wiki => {
              expect(res.statusCode).toBe(303);
              expect(wiki.title).toBe("This is a wiki");
              expect(wiki.body).toBe("I am a wiki");
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
      it("should not create a new wiki that fails validations", done => {
        const options = {
          url: `${base}create`,
          form: {
            title: "a",
            body: "b",
            private: false
          }
        };
        request.post(options, (err, res, body) => {
          Wiki.findOne({ where: { title: "a" } })
            .then(wiki => {
              expect(wiki).toBeNull();
              done();
            })
            .catch(err => {
              console.log(err);
              done();
            });
        });
      });
    });
    describe("GET /wikis/:id", () => {
      it("should render a view with the selected wiki", done => {
        request.get(`${base}${this.wiki.id}`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("My first Wiki");
          done();
        });
      });
    });
    describe("DELETE /wikis/:id/destroy", () => {
      it("should delete the wiki with the associated ID", done => {
        Wiki.all().then(wikis => {
          const wikiCountBeforeDelete = wikis.length;
          expect(wikiCountBeforeDelete).toBe(1);

          request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
            Wiki.all().then(wiki => {
              expect(err).toBeNull();
              expect(wiki.length).toBe(wikiCountBeforeDelete - 1);
              done();
            });
          });
        });
      });
    });
    describe("GET /wikis/:id/edit", () => {
      it("should render a view with an edit wiki form", done => {
        request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
          expect(err).toBeNull();
          expect(body).toContain("Edit Wiki");
          expect(body).toContain("My first Wiki");
          done();
        });
      });
    });
    describe("POST /wikis/:id/update", () => {
      it("should return a status code 302", done => {
        request.post(
          {
            url: `${base}${this.wiki.id}/update`,
            form: {
              title: "My first Wiki Test",
              body: "I love making wikis."
            }
          },
          (err, res, body) => {
            expect(res.statusCode).toBe(302);
            done();
          }
        );
      });
      it("should update the public wiki with the given values", done => {
        const options = {
          url: `${base}${this.wiki.id}/update`,
          form: {
            title: "My First Wiki Test",
            body: "I love making wikis."
          }
        };
        request.post(options, (err, res, body) => {
          expect(err).toBeNull();
          Wiki.findOne({
            where: { id: this.wiki.id }
          }).then(wiki => {
            expect(wiki.title).toBe("My First Wiki Test");
            done();
          });
        });
      });
    });
    describe("Admin user attempting CRUD actions on Private Wikis", () => {
      beforeEach(done => {
        Wiki.create({
          title: "I am a private wiki",
          body: "You cannot edit me",
          private: true,
          userId: 1
        })
          .then(wiki => {
            this.wiki = wiki;
            done();
          })
          .catch(err => {
            console.log(err);
            done();
          });
      });
      describe("POST /wikis/create", () => {
        it("should create a private wiki", done => {
          const options = {
            url: `${base}create`,
            form: {
              title: "Trying to create private wiki",
              body: "can i do it?",
              private: true
            }
          };
          request.post(options, (err, res, body) => {
            Wiki.findOne({ where: { title: "Trying to create private wiki" } })
              .then(wiki => {
                expect(wiki.private).toBe(true);
                done();
              })
              .catch(err => {
                console.log(err);
                done();
              });
          });
        });
      });
      describe("GET /wikis/:id", () => {
        it("should render a view with the private wiki", done => {
          request.get(`${base}${this.wiki.id}`, (err, res, body) => {
            expect(body).toContain("I am a private wiki");
            done();
          });
        });
      });
      describe("GET /wikis/:id/edit", () => {
        it("should render a view with an edit wiki form", done => {
          request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
            expect(body).toContain("Edit Wiki");
            done();
          });
        });
      });
      describe("POST /wikis/:id/update (private post)", () => {
        it("should return a status code 302", done => {
          request.post(
            {
              url: `${base}${this.wiki.id}/update`,
              form: {
                title: "I want to update the private wiki",
                body: "I should not be able to"
              }
            },
            (err, res, body) => {
              expect(res.statusCode).toBe(302);
              done();
            }
          );
        });
        it("should update private wiki with the given values", done => {
          const options = {
            url: `${base}${this.wiki.id}/update`,
            form: {
              title: "I want to update the private wiki",
              body: "I should not be able to"
            }
          };
          request.post(options, (err, res, body) => {
            expect(err).toBeNull();
            Wiki.findOne({
              where: { id: this.wiki.id }
            }).then(wiki => {
              expect(wiki.title).toBe("I want to update the private wiki");
              done();
            });
          });
        });
      });
    });
  });  */
});
