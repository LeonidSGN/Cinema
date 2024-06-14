const {Sequelize} = require('sequelize');

const sequelize = new Sequelize ('cinema', 'postgres', 'postgres', {
    dialect: "postgres",
    host: "db",
    port: 5432, // порт базы данных PostgreSQL 
    logging: true // включаем логирование
});

const Users = require('./Users')(sequelize);
const Movies = require('./Movies')(sequelize);
const Favorite_movies = require('./Favorite_movies')(sequelize);

    // Определение ассоциаций
    Users.belongsToMany(Movies, { through: Favorite_movies, foreignKey: 'user_id' });
    Movies.belongsToMany(Users, { through: Favorite_movies, foreignKey: 'movie_id' });

module.exports = {
    sequelize : sequelize,
    users : Users,
    movies : Movies,
    favorite_movies : Favorite_movies
}