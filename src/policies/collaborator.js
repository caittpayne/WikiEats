const ApplicationPolicy = require('./application');

module.exports = class CollaboratorPolicy extends ApplicationPolicy {  
    new() {
        return this._isPremium() || this._isAdmin();
    }

    edit() {
        return this._isOwner() || this._isAdmin();
    }

    create() {
        return this.new();
    }

    destroy() {
        return this.update();
    }
}