'use strict';
module.exports = (sequelize, DataTypes) => {
  var Wiki = sequelize.define('Wiki', {
    title: {
        allowNull: false,
        type: DataTypes.STRING
    },
    body: {
        allowNull: false,
        type: DataTypes.STRING
    },
    private: {
        allowNull: false,
        type: DataTypes.BOOLEAN
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
    
  }, {});
  Wiki.associate = function(models) {

    Wiki.belongsTo(models.User, {
        foreignKey: 'userId',
        onDelete: 'CASCADE'
    });

    Wiki.hasMany(models.Collaborator, {
        foreignKey: 'wikiId',
        as: 'collaborators'
    });
    
  };
  


  Wiki.addScope('lastFiveFor', (userId) => {
    return {
        where: { userId: userId },
        limit: 5,
        order: [['createdAt', 'DESC']]
    }
});

  return Wiki;
};