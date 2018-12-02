'use strict';

const faker = require('faker');
let users = [];

for(let i = 1; i <= 15; i++) {
  users.push({
    name: faker.name.firstName(),
    email: faker.internet.exampleEmail(),
    password: '1234567',
    role: faker.helpers.shuffle(['standard', 'premium', 'admin']),
    createdAt: new Date(),
    updatedAt: new Date()
  });
}

module.exports = {
  up: (queryInterface, Sequelize) => {
  
    return queryInterface.bulkInsert('Users', users, {});

  },

  down: (queryInterface, Sequelize) => {
  
    return queryInterface.bulkDelete('Users', null, {});
  }
};
