const collaboratorQueries = require('../db/queries.collaborators.js');
const userQueries = require('../db/queries.users.js');
const Authorizer = require('../policies/collaborator.js');

module.exports = {

    create(req, res, next) {
        const authorized = new Authorizer(req.user).create();

        if(authorized) {
            if(req.body.email != req.user.email) {
                userQueries.getCollabUser(req.body.email, (err, user) => {
                    if(err || !user) {
                        req.flash('User not found');
                        res.redirect(req.headers.referer);
                    } else {
    
                        let newCollaborator = {
                            userId: user.id,
                            wikiId: req.params.id,
                            name: user.name
                        };
    
                        collaboratorQueries.createCollaborator(newCollaborator, (err, collaborator) => {
                            if(err) {
                                req.flash('notice', 'User is already a collaborator')
                                res.redirect(req.headers.referer);
                            }
                            else {
                                res.redirect(req.headers.referer);
                            }
                        });
                    }
                })
            } else {
                req.flash('notice', 'You cannot add yourself as a collaborator');
                res.redirect(req.headers.referer);
            }
       

        } else {
            req.flash('notice', 'You must be signed in to do that.');
            res.redirect('/users/sign_in');
        }
    },

    destroy(req, res, next) {
        collaboratorQueries.deleteCollaborator(req, (err, collaborator) => {
            if(err) {
                res.redirect(err, req.headers.referer);
            } else {
                res.redirect(req.headers.referer);
            }
        });
    },
}