const {Sequelize} = require('sequelize');

module.exports = function (sequelize) {
    return sequelize.define("Users", {
        id : {
            type: Sequelize.INTEGER(),
            autoIncrement: true,
            primaryKey : true
        },
        name : {
            type: Sequelize.STRING(),
        },
        role : {
            type: Sequelize.STRING(),
        },
        password : {
            type: Sequelize.STRING(),
        }
    },
    {
        timestamps: false,
        tableName: 'users'
    });
}