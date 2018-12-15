'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
        "Collaborators",
        "wikiName",
        {
            type: Sequelize.STRING,
            allowNull: false,
        }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Collaborators", "wikiName");
  }
};
