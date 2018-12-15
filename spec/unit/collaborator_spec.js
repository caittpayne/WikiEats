const sequelize = require('../../src/db/models/index').sequelize;
const User = require('../../src/db/models').User;
const Wiki = require('../../src/db/models').Wiki;
const Collaborator = require("../../src/db/models").Collaborator;

describe("Collaborator", () => {

  beforeEach((done) => {
    this.user;
    this.wiki;
    this.collaborator;

    sequelize.sync({force: true}).then((res) => {

      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe",
        name: 'Starman',
        role: 'premium'
      })
      .then((user) => {
        this.user = user;

        Wiki.create({
          title: "Expeditions to Alpha Centauri",
          body: "A compilation of reports from recent visits to the star system.",
          private: true,
          userId: this.user.id
        })
        .then((wiki) => {
          this.wiki = wiki;

          Collaborator.create({
            userId: this.user.id,
            wikiId: this.wiki.id,
            name: this.user.name,
            wikiName: this.wiki.title
          })
          .then((collaborator) => {
            this.collaborator = collaborator;
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
        });
      });
    });
  }); 
  describe("#create()", () => {

    it("should create a collaborator object with a userId, wikiId and user name", (done) => {
      Collaborator.create({                
        userId: this.user.id,
        wikiId: this.wiki.id,
        name: this.user.name,
        wikiName: this.wiki.name
      })
      .then((collaborator) => {           
        expect(collaborator.userId).toBe(this.user.id);
        expect(collaborator.wikiId).toBe(this.wiki.id);
        expect(collaborator.name).toBe(this.user.name);
        done();

      })
      .catch((err) => {
        console.log(err);
        done();
      });
    });
    it("should not create a collaborator with missing userId, wikiId or user name", (done) => {
      Collaborator.create({
        userId: this.user.id
      })
      .then((collaborator) => {

        done();

      })
      .catch((err) => {
        expect(err.message).toContain("Collaborator.wikiId cannot be null");
        expect(err.message).toContain("Collaborator.name cannot be null");
        done();

      })
    });

  });
  describe("#setUser()", () => {

    it("should associate a comment and a user together", (done) => {

      User.create({               
        email: "bob@example.com",
        password: "password",
        role: 'premium',
        name: 'Bob'
      })
      .then((newUser) => {       

        expect(this.collaborator.userId).toBe(this.user.id); 

        this.collaborator.setUser(newUser)                   
        .then((collaborator) => {

          expect(collaborator.userId).toBe(newUser.id);      
          done();

        });
      })
    });

  });
  describe("#getUser()", () => {

    it("should return the associated user", (done) => {

      this.collaborator.getUser()
      .then((associatedUser) => {
        expect(associatedUser.email).toBe("starman@tesla.com");
        done();
      });

    });

  });
  describe("#setWiki()", () => {

    it("should associate a wiki and a collaborator together", (done) => {

      Wiki.create({       
        title: "Dress code on Proxima b",
        body: "Spacesuit, space helmet, space boots, and space gloves",
        private: true,
        userId: this.user.id
      })
      .then((newWiki) => {

        expect(this.collaborator.wikiId).toBe(this.wiki.id); 

        this.collaborator.setWiki(newWiki)                 
        .then((collaborator) => {

          expect(collaborator.wikiId).toBe(newWiki.id);      
          done();

        });
      })
    });

  });
  describe("#getWiki()", () => {

    it("should return the associated post", (done) => {

      this.collaborator.getWiki()
      .then((associatedWiki) => {
        expect(associatedWiki.title).toBe("Expeditions to Alpha Centauri");
        done();
      });

    });

  }); 
});