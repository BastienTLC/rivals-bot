const tmi = require('tmi.js');
const User = require('../model/User'); // Modèle MongoDB pour charger les utilisateurs

// Liste des clients connectés
const clients = [];

// Charger les utilisateurs depuis MongoDB et créer une instance de bot pour chaque utilisateur
async function loadChannels() {
    try {
        const users = await User.find();

        if (users.length === 0) {
            console.error('Aucun utilisateur trouvé. Ajoutez des utilisateurs dans la base de données.');
            return;
        }

        for (const user of users) {
            const { twitchUsername, twitchToken } = user;

            // Vérifiez que les informations nécessaires sont présentes
            if (!twitchUsername || !twitchToken) {
                console.error(`Utilisateur ${twitchUsername || 'inconnu'} a des informations manquantes.`);
                continue;
            }

            // Configuration du bot pour cet utilisateur
            const botOptions = {
                options: { debug: true },
                connection: {
                    reconnect: true,
                    secure: true,
                },
                identity: {
                    username: twitchUsername,
                    password: twitchToken,
                },
                channels: [twitchUsername], // Le bot rejoint uniquement la chaîne de l'utilisateur
            };

            // Créer une instance du client TMI
            const client = new tmi.Client(botOptions);

            // Ajouter des commandes personnalisées
            client.on('message', (channel, tags, message, self) => {
                if (self) return;

                // Commande de test : !hello
                if (message.toLowerCase() === '!hello') {
                    client.say(channel, `Salut @${tags.username} ! 👋`).catch(error => {
                        console.error(`Erreur lors de l'envoi du message pour ${twitchUsername} :`, error.message);
                    });
                }

                // Commande de dés : !dice
                if (message.toLowerCase() === '!dice') {
                    const diceRoll = Math.floor(Math.random() * 6) + 1;
                    client.say(channel, `🎲 Tu as roulé un ${diceRoll} !`).catch(error => {
                        console.error(`Erreur lors de l'envoi du message pour ${twitchUsername} :`, error.message);
                    });
                }
            });

            // Gestion des erreurs
            client.on('connected', (address, port) => {
                console.log(`Bot connecté pour ${twitchUsername} à ${address}:${port}`);
            });

            client.on('disconnected', (reason) => {
                console.log(`Bot déconnecté pour ${twitchUsername} :`, reason);
            });

            // Connecter le client
            await client.connect();
            clients.push(client); // Ajouter le client à la liste des clients
        }

        console.log('Tous les bots sont connectés.');
    } catch (err) {
        console.error('Erreur lors du chargement des chaînes :', err.message);
    }
}

// Exporter une fonction pour initialiser les bots
module.exports = {
    startBot: loadChannels,
};
