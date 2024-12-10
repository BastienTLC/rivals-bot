const tmi = require('tmi.js');
const axios = require('axios');
const User = require('../model/User'); // Modèle MongoDB pour charger les utilisateurs

// Liste des clients connectés, sous forme d'un objet { [twitchUsername]: client }
const clients = {};

const API_BASE = 'https://rustoria.co/twitch/api';

/**
 * Récupère la liste de toutes les équipes.
 */
async function fetchAllTeams() {
    const res = await axios.get(`${API_BASE}/teams`);
    return res.data;
}

/**
 * Récupère les détails d'une équipe (dont les membres).
 */
async function fetchTeamDetails(teamName) {
    const res = await axios.get(`${API_BASE}/teams/${teamName}`);
    return res.data;
}

/**
 * Commande !rank
 * Affiche le classement global des équipes par points (idTagsDeposited).
 */
async function handleRankCommand(client, channel) {
    try {
        const teams = await fetchAllTeams();

        // Trier par points décroissants
        const sortedTeams = teams.sort((a, b) => b.idTagsDeposited - a.idTagsDeposited);
        const topTeams = sortedTeams.map((team, i) => `${i+1}. ${team.name} - ${team.idTagsDeposited} pts 🏅`).slice(0, 10);

        client.say(channel, `🌍 Classement global des équipes : ${topTeams.join(' | ')}`).catch(err => console.error(err));
    } catch (err) {
        console.error(err.message);
        client.say(channel, `❗ Erreur lors de la récupération du classement global.`).catch(e => console.error(e));
    }
}

/**
 * Commande !teamrank {teamName}
 * Affiche le classement interne d'une équipe par kills.
 */
async function handleTeamRankCommand(client, channel, teamName) {
    if (!teamName) {
        client.say(channel, `❗ Utilisation: !teamrank {teamName}`).catch(err => console.error(err));
        return;
    }

    try {
        const teamData = await fetchTeamDetails(teamName);
        if (!teamData || !teamData.members) {
            client.say(channel, `❗ Aucune donnée trouvée pour l'équipe ${teamName}`).catch(err => console.error(err));
            return;
        }

        const sortedPlayers = teamData.members.sort((a, b) => b.kills - a.kills);
        const topPlayers = sortedPlayers.slice(0, 5)
            .map((p, i) => `${i+1}. ${p.name} - ${p.kills}💀`);

        client.say(channel, `🏆 Classement des joueurs de l'équipe ${teamName} (par Kills) : ${topPlayers.join(' | ')}`).catch(err => console.error(err));
    } catch (err) {
        console.error(err.message);
        client.say(channel, `❗ Erreur lors de la récupération des données de l'équipe.`).catch(e => console.error(e));
    }
}

/**
 * Commande !stats {playerName}
 * On récupère d'abord TOUTES les équipes, puis pour chacune, on récupère leurs membres.
 * On stocke tous les joueurs dans un tableau allPlayers avec leur équipe.
 * Ensuite, on recherche le player demandé.
 */
async function handleStatsCommand(client, channel, playerName) {
    if (!playerName) {
        client.say(channel, `❗ Utilisation: !stats {playerName}`).catch(err => console.error(err));
        //playerName = channel sans le premier caractère
        playerName = channel.slice(1);
    }

    try {
        // Récupère la liste de toutes les équipes
        const teams = await fetchAllTeams();

        // Récupère les données détaillées de chaque équipe en parallèle
        const teamsData = await Promise.all(
            teams.map(team => fetchTeamDetails(team.id).catch(() => null))
        );

        // Construit un tableau global de tous les joueurs de toutes les équipes
        const allPlayers = [];
        for (const teamData of teamsData) {
            if (teamData && Array.isArray(teamData.members)) {
                // On itère sur chaque membre pour l'ajouter au tableau global
                for (const member of teamData.members) {
                    allPlayers.push({
                        ...member,
                        teamName: teamData.name
                    });
                }
            }
        }

        // Recherche du joueur dans ce tableau global (insensible à la casse)
        let player = null;
        for (const p of allPlayers) {
            if (p.name.toLowerCase() === playerName.toLowerCase()) {
                player = p;
                break;
            }
        }

        if (!player) {
            client.say(channel, `❗ Joueur ${playerName} non trouvé dans aucune équipe.`).catch(err => console.error(err));
            return;
        }

        // Extraction des stats avec valeurs par défaut
        const {
            kills = 0,
            deaths = 0,
            kdr,
            headshots = 0,
            accuracy,
            damageDone = 0,
            itemsCrafted = 0,
            npcKills = 0,
            animalKills = 0,
            collectedResources
        } = player;

        // Conversion du K/D ratio s'il est disponible
        const kdRatio = (typeof kdr === 'number') ? kdr.toFixed(2) : 'N/A';
        const accDisplay = (typeof accuracy === 'number') ? `${accuracy}%` : 'N/A';

        // Calcul des ressources totales collectées
        let totalResources = 0;
        if (Array.isArray(collectedResources)) {
            totalResources = collectedResources.reduce((sum, r) => sum + (r.amount || 0), 0);
        }

        // Affichage des stats dans le chat
        client.say(channel,
            `📊 Stats de ${playerName} (${player.teamName}) : ` +
            `Kills: ${kills}💀 | Deaths: ${deaths}⚰️ | KD: ${kdRatio}💥 | HS: ${headshots}🎯 | Acc: ${accDisplay}🔫 | ` +
            `Items: ${itemsCrafted}🛠️ | Damage: ${Math.round(damageDone)}💢 | NPC: ${npcKills}👾 | Animals: ${animalKills}🐗 | ` +
            `Ressources: ${totalResources}🪓 | ` +
            `Link: ${process.env.FRONT_END_REDIRECTION}/customs/${playerName}`
        ).catch(err => console.error(err));

    } catch (err) {
        console.error('Erreur dans handleStatsCommand:', err.message);
        client.say(channel, `❗ Erreur lors de la récupération des stats du joueur.`).catch(e => console.error(e));
    }
}

/**
 * Commande !teams
 * Affiche la liste de toutes les équipes.
 */
async function handleTeamsCommand(client, channel) {
    try {
        const teams = await fetchAllTeams();
        const teamNames = teams.map(t => t.name).join(', ');
        client.say(channel, `🌐 Équipes disponibles: ${teamNames}`).catch(err => console.error(err));
    } catch (err) {
        console.error(err.message);
        client.say(channel, `❗ Erreur lors de la récupération de la liste des équipes.`).catch(e => console.error(e));
    }
}

/**
 * Commande !help
 * Affiche la liste des commandes disponibles.
 */
function handleHelpCommand(client, channel) {
    const helpMessage = `📜 Liste des commandes :
!rank - Classement global des équipes par points.
!teamrank {teamName} - Classement interne d'une équipe par kills.
!stats {playerName} - Stats détaillées d'un joueur (toutes équipes).
!teams - Liste toutes les équipes.
!help - Affiche cette aide.
`;

    client.say(channel, helpMessage).catch(err => console.error(err));
}


// Fonction principale pour démarrer les bots
async function loadChannels() {
    try {
        const users = await User.find();

        if (users.length === 0) {
            console.error('Aucun utilisateur trouvé. Ajoutez des utilisateurs dans la base de données.');
            return;
        }

        for (const user of users) {
            const { twitchUsername, twitchToken } = user;

            // Vérifier si infos nécessaires présentes
            if (!twitchUsername || !twitchToken) {
                console.error(`Utilisateur ${twitchUsername || 'inconnu'} a des informations manquantes.`);
                continue;
            }

            // Vérifier si un bot est déjà lancé
            if (clients[twitchUsername]) {
                console.log(`Un bot est déjà en cours d'exécution pour ${twitchUsername}, on passe.`);
                continue;
            }

            // Configuration du bot
            const botOptions = {
                options: { debug: false },
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

            const client = new tmi.Client(botOptions);

            client.on('message', async (channel, tags, message, self) => {
                if (self) return;
                const args = message.trim().split(' ');
                const command = args.shift().toLowerCase();

                switch(command) {
                    case '!help':
                        handleHelpCommand(client, channel);
                        break;
                    case '!rank':
                        await handleRankCommand(client, channel);
                        break;
                    case '!teamrank':
                        await handleTeamRankCommand(client, channel, args[0]);
                        break;
                    case '!stats':
                        await handleStatsCommand(client, channel, args.join(' '));
                        break;
                    case '!teams':
                        await handleTeamsCommand(client, channel);
                        break;
                    default:
                        // Commande inconnue
                        break;
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
            clients[twitchUsername] = client;
        }

        console.log('Tous les bots sont connectés (sans doublons).');
    } catch (err) {
        console.error('Erreur lors du chargement des chaînes :', err.message);
    }
}

module.exports = {
    startBot: loadChannels,
};
