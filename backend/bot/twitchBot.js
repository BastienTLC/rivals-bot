const tmi = require('tmi.js');
const axios = require('axios');
const User = require('../model/User'); // Modèle MongoDB pour charger les utilisateurs

// Liste des clients connectés, sous forme d'un objet { [twitchUsername]: client }
const clients = {};

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

            // Vérifier si un bot est déjà lancé pour cet utilisateur
            if (clients[twitchUsername]) {
                console.log(`Un bot est déjà en cours d'exécution pour ${twitchUsername}, passage.`);
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
                channels: [twitchUsername],
            };

            // Créer une instance du client TMI
            const client = new tmi.Client(botOptions);

            client.on('message', async (channel, tags, message, self) => {
                if (self) return;
                const args = message.trim().split(' ');
                const command = args.shift().toLowerCase();

                if (command === '!help') {
                    // Liste des commandes
                    client.say(channel, `📜 Commandes : 
!rank {teamName} - Classement des joueurs par kills 
!stats {player} - Stats d'un joueur (kills, deaths, kd) 
!help - Afficher l'aide`).catch(err => console.error(err));
                }

                if (command === '!rank') {
                    const teamName = args[0];
                    if (!teamName) {
                        client.say(channel, `❗ Utilisation: !rank {teamName}`).catch(err => console.error(err));
                        return;
                    }

                    try {
                        const res = await axios.get(`https://rustoria.co/twitch/api/teams/${teamName}`);
                        const data = res.data;
                        if (!data || !data.members) {
                            client.say(channel, `❗ Aucune donnée trouvée pour l'équipe ${teamName}`).catch(err => console.error(err));
                            return;
                        }

                        // Trier les membres par kills décroissants
                        const sorted = data.members.sort((a, b) => b.kills - a.kills);

                        // Afficher les 5 premiers (ou moins s'il y en a moins)
                        const topPlayers = sorted.slice(0, 5)
                            .map((player, i) => `${i+1}. ${player.name} - ${player.kills} 💀`);

                        client.say(channel, `🏆 Classement Kills de l'équipe ${teamName}:\n${topPlayers.join(' | ')}`).catch(err => console.error(err));
                    } catch (err) {
                        console.error(err.message);
                        client.say(channel, `❗ Erreur lors de la récupération des données.`).catch(e => console.error(e));
                    }
                }

                if (command === '!stats') {
                    const playerName = args.join(' ');
                    if (!playerName) {
                        client.say(channel, `❗ Utilisation: !stats {playerName}`).catch(err => console.error(err));
                        return;
                    }

                    // Ici, il faut connaître le nom de l'équipe. Si c'est toujours la même, on peut la hardcoder.
                    // Remplacez 'krolay' par le nom de l'équipe désirée ou adaptez selon votre logique.
                    const teamName = 'krolay';

                    try {
                        const res = await axios.get(`https://rustoria.co/twitch/api/teams/${teamName}`);
                        const data = res.data;
                        if (!data || !data.members) {
                            client.say(channel, `❗ Aucune donnée trouvée pour l'équipe ${teamName}`).catch(err => console.error(err));
                            return;
                        }

                        const player = data.members.find(m => m.name.toLowerCase() === playerName.toLowerCase());
                        if (!player) {
                            client.say(channel, `❗ Joueur ${playerName} non trouvé dans l'équipe ${teamName}`).catch(err => console.error(err));
                            return;
                        }

                        const { kills, deaths, kdr } = player;
                        client.say(channel, `📊 Stats pour ${playerName} : Kills: ${kills} 💀 | Deaths: ${deaths} ⚰️ | KD: ${kdr.toFixed(2)} 💥`).catch(err => console.error(err));
                    } catch (err) {
                        console.error(err.message);
                        client.say(channel, `❗ Erreur lors de la récupération des stats.`).catch(e => console.error(e));
                    }
                }
            });

            client.on('connected', (address, port) => {
                console.log(`Bot connecté pour ${twitchUsername} à ${address}:${port}`);
            });

            client.on('disconnected', (reason) => {
                console.log(`Bot déconnecté pour ${twitchUsername} :`, reason);
                delete clients[twitchUsername];
            });

            await client.connect();
            clients[twitchUsername] = client; // Associer le client au nom d'utilisateur
        }

        console.log('Tous les bots sont connectés (sans doublons).');
    } catch (err) {
        console.error('Erreur lors du chargement des chaînes :', err.message);
    }
}

// Exporter une fonction pour initialiser les bots
module.exports = {
    startBot: loadChannels,
};
