'use strict';
module.exports = (sequelize, DataTypes) => {
  var Image = sequelize.define('Image', {
    type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    data: {
        type: DataTypes.BLOB,
        allowNull: false
    },
    wikiId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
  }, {});
  Image.associate = function(models) {
    
    Image.belongsTo(models.Wiki, {
        foreignKey: 'wikiId',
        onDelete: 'CASCADE'
      });
  };

  return Image;
};