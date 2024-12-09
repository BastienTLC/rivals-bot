require('dotenv').config();
const tmi = require('tmi.js');

// Configuration du client
const client = new tmi.Client({
    options: { debug: true },
    connection: {
        reconnect: true,
        secure: true,
    },
    identity: {
        username: process.env.TWITCH_USERNAME,
        password: process.env.TWITCH_OAUTH,
    },
    channels: [process.env.TWITCH_CHANNEL],
});

// Connexion au chat
client.connect();

// Écoute des messages
client.on('message', (channel, tags, message, self) => {
    if (self) return; // Ignore les messages du bot

    if (message.toLowerCase() === '!hello') {
        client.say(channel, `Salut @${tags.username} ! 👋`);
    }

    if (message.toLowerCase() === '!dice') {
        const diceRoll = Math.floor(Math.random() * 6) + 1;
        client.say(channel, `🎲 Tu as roulé un ${diceRoll} !`);
    }
});

console.log('Bot démarré...');
console.log("TWITCH_USERNAME:", process.env.TWITCH_USERNAME);
console.log("TWITCH_OAUTH:", process.env.TWITCH_OAUTH);
console.log("TWITCH_CHANNEL:", process.env.TWITCH_CHANNEL);
