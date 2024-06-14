const {Sequelize} = require('sequelize');
const Users = require('./Users');
const Movies = require('./Movies');

module.exports = function (sequelize) {
    const FavoriteMovies = sequelize.define("Favorite_movies", {
        id : {
            type: Sequelize.INTEGER(),
            autoIncrement: true,
            primaryKey : true
        },
        user_id : {
            type: Sequelize.INTEGER(),
            references: {
                model: Users,
                key: 'id'
            }
        },
        movie_id : {
            type: Sequelize.INTEGER(),
            references: {
                model: Movies,
                key: 'id'
            }
        }
        
    },
    {
        
        timestamps: false,
        tableName: 'favorite_movies'
    });
    return FavoriteMovies;
}