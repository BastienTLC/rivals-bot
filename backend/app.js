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

// Connexion à la base de données
connectDB().then(r => console.log('connected'));

// Servir les fichiers statiques du frontend
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Utiliser les routes
app.use('/api', indexRouter); // Préfixez vos API avec `/api`
app.use('/api/users', usersRouter);
app.use('/api/twitch', twitchRouter);

// Catch-all pour rediriger toutes les requêtes vers l'index.html du frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

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

// Démarrer le bot Twitch
startBot().then(r => console.log("started"));

module.exports = app;
