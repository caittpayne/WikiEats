const ApplicationPolicy = require('./application');

module.exports = class PrivateWikiPolicy extends ApplicationPolicy {
    
    new() {
        return this._isPremium() || this._isAdmin();
    }

    show() {
        return this._isOwner() || this._isAdmin() || this._isCollaborator();
    }

    edit() {
        return this.show();
    }

    create() {
        return this.new();
    }

    update() {
        return this.edit();
    }

    destroy() {
        return this._isOwner() || this._isAdmin();
    }
}