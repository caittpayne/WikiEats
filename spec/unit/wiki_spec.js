const sequelize = require('../../src/db/models/index').sequelize;

describe('Wiki', () => {
    beforeEach((done) => {
        this.wiki;
        sequelize.sync({force: true}).then((res) => {

            
        })
    })
})