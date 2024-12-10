var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { startBot } = require('./bot/twitchBot');
var connectDB = require('./config/config');
require('dotenv').config(); // Charger les variables d'environnement

// Importer les routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var twitchRouter = require('./routes/twitch');

var app = express();

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Connexion à la base de données
connectDB().then(r => console.log('connected'));

// Utiliser les routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/twitch', twitchRouter);

// Gestion des erreurs
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({ error: err.message });
});

startBot().then(r => console.log("started")); // Démarrer le bot Twitch

module.exports = app;
