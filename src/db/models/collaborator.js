'use strict';
module.exports = (sequelize, DataTypes) => {
  var Collaborator = sequelize.define('Collaborator', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    wikiId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    wikiName: {
        type: DataTypes.STRING,
        allowNull: false
    }
  }, {});
  Collaborator.associate = function(models) {
    
    Collaborator.belongsTo(models.Wiki, {
        foreignKey: 'wikiId',
        onDelete: 'CASCADE'
      });
  
      Collaborator.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE'
      });
  };

  Collaborator.addScope('allCollaborations', (userId) => {
    return {
        where: { userId: userId },
        order: [['createdAt', 'DESC']]
    }
});

  return Collaborator;
};