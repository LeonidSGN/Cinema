const {Sequelize} = require('sequelize');

module.exports = function (sequelize) {
    return sequelize.define("Movies", {
        id : {
            type: Sequelize.INTEGER(),
            autoIncrement: true,
            primaryKey : true
        },
        title : {
            type: Sequelize.STRING(),
        }
    },
    {
        timestamps: false,
        tableName: 'movies'
    });
}