const Collaborator = require('./models').Collaborator;
const Wiki = require('./models').Wiki;

const Authorizer = require('../policies/collaborator.js');

module.exports = {
    
    createCollaborator(newCollaborator, callback) {
        Collaborator.findOne({where: {
            userId: newCollaborator.userId,
            wikiId: newCollaborator.wikiId
        }})
        .then((collaborator) => {
            if(collaborator) {
                callback(err)
            } else {
                return Collaborator.create(newCollaborator)
                .then((collaborator) => {
                    callback(null, collaborator);
                })
                .catch((err) => {
                    callback(err);
                });
            }
        })
        .catch((err) => {
            callback(err);
        })
    },

    deleteCollaborator(req, callback) {
        return Collaborator.findById(req.params.id)
        .then((collaborator) => {

            Wiki.findById(collaborator.wikiId)
            .then((wiki) => {
                const authorized = new Authorizer(req.user, wiki).destroy();

                if(authorized) { 
                    collaborator.destroy();
                    callback(null, collaborator)
                } else { 
                    req.flash('notice', 'You are not authorized to do that.');
                    callback(401);
               } 
            })
            .catch((err) => {
                callback(err);
            })    
            
        });
    },

    getCollaborator(user, wiki) {
        Collaborator.findAll(
            {where: 
                {
                    wikiId: wiki.id,
                    userId: user.id
                }
            })
        .then((collab) => {
            if(err || !collab) {
                callback(false);
            } else {
                callback(true);
            }
        })
        .catch((err) => {
            callback(err);
        })
    },

    removeCollaborators(wiki, callback) {
       Collaborator.destroy(
           {
               where: 
               {
                   wikiId: wiki.id
               }
           }
       )
       .then((collaborator) => {
         callback(null, collaborator);
       })
       .catch((err) => {
           callback(err);
       })
    },
}