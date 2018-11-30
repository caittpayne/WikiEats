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
    
  };
  return Wiki;
};