const tmi = require('tmi.js');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

// Initialiser Express
const app = express();
app.use(bodyParser.json());

// Charger config.json
let config = {};
if (fs.existsSync('./config.json')) {
    config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
}

// Endpoint pour enregistrer le token dans config.json
app.post('/save-token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).send('Token manquant');
    }

    config.TWITCH_OAUTH = `oauth:${token}`;
    fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));
    res.send('Token enregistré avec succès');
});

// Route pour vérifier le statut
app.get('/', (req, res) => {
    res.send('Bot Twitch en cours d\'exécution');
});

// Lancer le serveur sur le port fourni par Heroku ou 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});

// Configuration du client TMI (Twitch)
const client = new tmi.Client({
    options: { debug: true },
    connection: {
        reconnect: true,
        secure: true,
    },
    identity: {
        username: config.TWITCH_USERNAME || process.env.TWITCH_USERNAME,
        password: config.TWITCH_OAUTH || process.env.TWITCH_OAUTH,
    },
    channels: [config.TWITCH_CHANNEL || process.env.TWITCH_CHANNEL],
});

// Connexion au chat Twitch
client.connect();

// Écoute des messages Twitch
client.on('message', (channel, tags, message, self) => {
    if (self) return;

    if (message.toLowerCase() === '!hello') {
        client.say(channel, `Salut @${tags.username} ! 👋`);
    }

    if (message.toLowerCase() === '!dice') {
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        client.say(channel, `🎲 Tu as roulé un ${diceRoll} !`);
    }
});

console.log('Bot démarré...');
