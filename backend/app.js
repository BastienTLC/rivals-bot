var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var { startBot } = require('./bot/twitchBot');
var connectDB = require('./config/config');

const cron = require('node-cron');
require('dotenv').config(); // Charger les variables d'environnement
var { refreshAllTokens } = require('./scheduled/scheduled');

// Importer les routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var twitchRouter = require('./routes/twitch');
var rustData = require('./routes/rustData');

var app = express();

// Middleware généraux
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// Connexion à la base de données
connectDB().then(r => console.log('connected'));

// Utiliser les routes API avant le frontend
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/twitch', twitchRouter);
app.use('/api/rustData', rustData);

// Servir les fichiers statiques et le frontend en production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));

    // Catch-all pour renvoyer le frontend sur les routes non-API
    app.get('*', (req, res) => {
        if (!req.originalUrl.startsWith('/api')) {
            res.sendFile(path.join(__dirname, 'public', 'index.html'));
        }
    });
}

// Gestion des erreurs 404
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Gestion des erreurs génériques
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({ error: err.message });
});

// Démarrer le bot Twitch
startBot().then(r => console.log("started"));

cron.schedule('0 * * * *', async () => {
    console.log('Scheduled task triggered...');
    try {
        await refreshAllTokens();
        console.log('Scheduled task completed.');
    } catch (err) {
        console.error('Error in scheduled task:', err.message);
    }
});


module.exports = app;