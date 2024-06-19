const {Sequelize, where, Op} = require('sequelize');
const db = require("./db/init");
const express = require('express'); // Подключаем Express.js
const cookieParser = require('cookie-parser'); // Подключаем cookie-parser для работы с куками
const fs = require('fs');
const Users = db.users;
const Movies = db.movies;
const Favorite_movies = db.favorite_movies;

const app = express(); // Создаем экземпляр Express.js
// Подключаем и настраиваем шаблонизатор Liquid
var { Liquid } = require('liquidjs');
var engine = new Liquid();

// Регистрируем Liquid как движок для шаблонов
app.engine('liquid', engine.express());
// Устанавливаем директорию для шаблонов
app.set('views', './views');
// Устанавливаем Liquid как движок для шаблонов
app.set('view engine', 'liquid');


app.use(express.urlencoded({ extended: true }));

// Используем cookie-parser middleware для работы с куками
app.use(cookieParser());
// Используем middleware для парсинга данных из формы
app.use(express.urlencoded({ extended: true }));
// Подключаем и настраиваем сессии
const session = require('express-session');
const { title } = require('process');
app.set('trust proxy', 1) // trust first proxy
app.use(session({
    secret: 'asda21e2e', // Секретный ключ для подписания сессии
    resave: false,
    saveUninitialized: true,
}))

async function run() {

    try {
        const result = await Users.findAll();
    } catch (error) {
        console.error('Error fetching result:', error);
    }

    // Middleware для проверки аутентификации администратора
    function authAdmin(req, res, next) {
        if (req.session.user?.name != 'admin') {
            res.sendStatus(403); // Отправляем статус 403 Forbidden, если пользователь не администратор
            return;
        }
        next();
    }

    // Middleware для перенаправления на страницу входа, если пользователь не аутентифицирован
    function redirectLogin(req, res, next) {
        if (!req.session.user) {
            res.redirect('/login'); // Перенаправляем на страницу входа
            return;
        }
        next();
    }


    // Основной маршрут приложения, доступный только для аутентифицированных пользователей
    app.get('/', redirectLogin, async (req, res) => {
        
        if (req.session.user?.role == "admin")
        {
                const listOfFilms = await Movies.findAll({});
                await res.render('admin/index', {
                name: req.session.user?.name, // Передаем имя пользователя в шаблон при рендеринге
                role: req.session.user?.role,
                films: listOfFilms.map(x => x.title)
            });
        }
        else
        {            
            try {
                const usr = await Users.findByPk(req.session.user?.id, {
                    include: [{
                        model: Movies,
                        through: 'Favorite_movies' // Название промежуточной таблицы
                    }]
                });

                const NameFeaturedFilms = usr.Movies;

                await res.render('user/index', {
                    name: req.session.user?.name, // Передаем имя пользователя в шаблон при рендеринге
                    role: req.session.user?.role,
                    films: NameFeaturedFilms.map(x => x.title)
                });

            } catch (error) {
                console.error('Error fetching result:', error);
            }

        }
    });

    // Маршрут для страницы входа
    app.get('/login', async (req, res) => {
        res.render('login'); // Рендерим страницу входа
    })

    // Маршрут для обработки входа пользователя
    app.post('/login', async (req, res) => {
        const { username, password } = await req.body;

        try {
            const foundUser = await Users.findOne({
                where: {
                    name: username,
                    password: password
                }
            });

            if (foundUser) {
                req.session.user = foundUser;
                res.redirect('/');
            } else {
                console.log('Пользователь не найден');
                res.redirect('/login');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }


        
    })


    app.post('/aDeleteF', async (req, res) => {
        const nameFilm  = req.body.deleteFilm;
        console.log(nameFilm);
        await Movies.destroy({
            where: {
              title: nameFilm
            }
        })
        res.redirect('/');
    })

    app.post('/aAddF', async (req, res) => {
        const nameFilm  = req.body.addFilm;
        console.log(nameFilm);
        await Movies.create({
            title: nameFilm
        })
        res.redirect('/');
    })

    app.post('/aUpdateF', async (req, res) => {
        const currName  = req.body.updateFilmCurr;
        const newName = req.body.updateFilmNew;
        console.log(currName);
        console.log(newName);
        await Movies.update({ title: newName }, {
            where: {
              title: currName
            }
        })
        res.redirect('/');
    })

    app.get('/toCatalog', async (req, res) => {
        const listMovies = await Movies.findAll({});
        
        await res.render('user/catalog', {
            name: req.session.user?.name, // Передаем имя пользователя в шаблон при рендеринге
            films: listMovies.map(x => x.title)
        });
    });

    app.post('/uAddF', async (req, res) => {
        const nameFilm  = req.body.uAddFilm;
        console.log(nameFilm);
        
        const usr = await Users.findByPk(req.session.user?.id);
        const movie = await Movies.findOne({
            where : {
                title : nameFilm
            }
        }); 

        console.log(usr.id);
        console.log(movie.id);

        await Favorite_movies.create({
            user_id: usr.id,
            movie_id: movie.id
        });

        res.redirect('/');
    })

    app.post('/uDeleteF', async (req, res) => {
        const nameFilm  = req.body.uDeleteFilm;
        console.log(nameFilm);
        
        const usr = await Users.findByPk(req.session.user?.id);
        const movie = await Movies.findOne({
            where : {
                title : nameFilm
            }
        }); 

        console.log(usr.id);
        console.log(movie.id);

        await Favorite_movies.destroy({
            where: {
                user_id: usr.id,
                movie_id: movie.id
            }
        });

        res.redirect('/');
    })

    // Запуск сервера на порту
    const port = 3000;
    const server = app.listen(port, () => {
        console.log(`Сервер запущен на порту ${server.address().port}`);
    });
};

run();
