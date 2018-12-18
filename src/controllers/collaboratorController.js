const collaboratorQueries = require('../db/queries.collaborators.js');
const userQueries = require('../db/queries.users.js');
const wikiQueries = require('../db/queries.wikis.js');
const Authorizer = require('../policies/collaborator.js');



module.exports = {

    create(req, res, next) {
        console.log(req);
        console.log('create invoked')
        const authorized = new Authorizer(req.user).create();
        if(authorized) {
            console.log('request' + req)
            if(req.body.email != req.user.email) {
                userQueries.getCollabUser(req.body.email, (err, user) => {
                    if(err || !user) {
                        req.flash('User not found');
                        res.redirect(req.headers.referer);
                    } else {
                        wikiQueries.getWiki(req.params.id, (err, wiki) => {
                            if(err || !wiki) {
                                res.redirect(err, req.headers.referer);
                            } else {

                                let newCollaborator = {
                                    userId: user.id,
                                    wikiId: wiki.id,
                                    name: user.name,
                                    wikiName: wiki.title
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
                    }
                })
            } else {
                req.flash('notice', 'You cannot add yourself as a collaborator');
                res.redirect(req.headers.referer);
            }
       

        } else {
            console.log('failed')
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