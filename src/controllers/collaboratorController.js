const collaboratorQueries = require('../db/queries.collaborators.js');
const userQueries = require('../db/queries.users.js');
const Authorizer = require('../policies/collaborator.js');

module.exports = {

    create(req, res, next) {
        const authorized = new Authorizer(req.user).create();

        if(authorized) {
            let newCollaborator = {
                userId: req.user.id,
                postId: req.params.wikiId,
                name: req.user.name
            };

            collaboratorQueries.createCollaborator(newCollaborator, (err, collaborator) => {
                if(err) {
                    req.flash('error', err)
                }
                res.redirect(req.headers.referer);
            });
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

    edit(req, res, next) {
        userQueries.getAllUsers((err, results) => {
            if(err || results.length < 1) {
                req.flash('notice', 'No users');
                res.redirect(req.headers.referer);
            } else {
                res.render('collaborators/edit', {...results});
            }
        })
    },
}