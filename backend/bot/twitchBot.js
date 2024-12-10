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
    console.log('[INFO] Fetching all teams...');
    const res = await axios.get(`${API_BASE}/teams`);
    console.log(`[INFO] ${res.data.length} teams fetched successfully.`);
    return res.data;
}

/**
 * Récupère les détails d'une équipe (dont les membres).
 */
async function fetchTeamDetails(teamName) {
    console.log(`[INFO] Fetching details for team: ${teamName}`);
    const res = await axios.get(`${API_BASE}/teams/${teamName}`);
    console.log(`[INFO] Details fetched for team: ${teamName}`);
    return res.data;
}

/**
 * Commande !rank
 * Affiche le classement global des équipes par points (idTagsDeposited).
 */
async function handleRankCommand(client, channel) {
    console.log(`[COMMAND] !rank called in channel: ${channel}`);
    try {
        const teams = await fetchAllTeams();

        // Trier par points décroissants
        const sortedTeams = teams.sort((a, b) => b.idTagsDeposited - a.idTagsDeposited);
        const topTeams = sortedTeams.map((team, i) => `${i + 1}. ${team.name} - ${team.idTagsDeposited} pts 🏅`).slice(0, 10);

        console.log('[INFO] Global rank generated successfully.');
        client.say(channel, `🌍 Classement global des équipes : ${topTeams.join(' | ')}`).catch(err => console.error('[ERROR]', err));
    } catch (err) {
        console.error('[ERROR] Failed to fetch global rank:', err.message);
        client.say(channel, `❗ Erreur lors de la récupération du classement global.`).catch(e => console.error('[ERROR]', e));
    }
}

/**
 * Commande !teamrank {teamName}
 * Affiche le classement interne d'une équipe par kills.
 */
async function handleTeamRankCommand(client, channel, teamName) {
    console.log(`[COMMAND] !teamrank called in channel: ${channel} for team: ${teamName}`);
    if (!teamName) {
        client.say(channel, `❗ Utilisation: !teamrank {teamName}`).catch(err => console.error('[ERROR]', err));
        return;
    }

    try {
        const teamData = await fetchTeamDetails(teamName);
        if (!teamData || !teamData.members) {
            console.warn(`[WARN] No data found for team: ${teamName}`);
            client.say(channel, `❗ Aucune donnée trouvée pour l'équipe ${teamName}`).catch(err => console.error('[ERROR]', err));
            return;
        }

        const sortedPlayers = teamData.members.sort((a, b) => b.kills - a.kills);
        const topPlayers = sortedPlayers.slice(0, 5)
            .map((p, i) => `${i + 1}. ${p.name} - ${p.kills}💀`);

        console.log(`[INFO] Team rank generated successfully for team: ${teamName}`);
        client.say(channel, `🏆 Classement des joueurs de l'équipe ${teamName} (par Kills) : ${topPlayers.join(' | ')}`).catch(err => console.error('[ERROR]', err));
    } catch (err) {
        console.error(`[ERROR] Failed to fetch data for team: ${teamName}`, err.message);
        client.say(channel, `❗ Erreur lors de la récupération des données de l'équipe.`).catch(e => console.error('[ERROR]', e));
    }
}

/**
 * Commande !stats {playerName}
 * On récupère d'abord TOUTES les équipes, puis pour chacune, on récupère leurs membres.
 */
async function handleStatsCommand(client, channel, playerName) {
    console.log(`[COMMAND] !stats called in channel: ${channel} for player: ${playerName}`);
    if (!playerName) {
        client.say(channel, `❗ Utilisation: !stats {playerName}`).catch(err => console.error('[ERROR]', err));
        playerName = channel.slice(1); // Défaut au nom du channel
    }

    try {
        const teams = await fetchAllTeams();
        console.log('[INFO] Fetching all players from teams...');

        const teamsData = await Promise.all(
            teams.map(team => fetchTeamDetails(team.id).catch(() => null))
        );

        const allPlayers = [];
        for (const teamData of teamsData) {
            if (teamData && Array.isArray(teamData.members)) {
                for (const member of teamData.members) {
                    allPlayers.push({ ...member, teamName: teamData.name });
                }
            }
        }

        const player = allPlayers.find(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (!player) {
            console.warn(`[WARN] Player ${playerName} not found.`);
            client.say(channel, `❗ Joueur ${playerName} non trouvé.`).catch(err => console.error('[ERROR]', err));
            return;
        }

        const statsMessage = `📊 Stats de ${playerName} (${player.teamName}) : ...`; // Simplifié
        console.log(`[INFO] Stats retrieved successfully for player: ${playerName}`);
        client.say(channel, statsMessage).catch(err => console.error('[ERROR]', err));
    } catch (err) {
        console.error(`[ERROR] Failed to fetch stats for player: ${playerName}`, err.message);
        client.say(channel, `❗ Erreur lors de la récupération des stats.`).catch(e => console.error('[ERROR]', e));
    }
}

/**
 * Commande !help
 */
function handleHelpCommand(client, channel) {
    console.log(`[COMMAND] !help called in channel: ${channel}`);
    const helpMessage = `📜 Liste des commandes :
!rank - Classement global des équipes par points.
!teamrank {teamName} - Classement interne d'une équipe par kills.
!stats {playerName} - Stats détaillées d'un joueur (toutes équipes).
!teams - Liste toutes les équipes.
!help - Affiche cette aide.
`;
    client.say(channel, helpMessage).catch(err => console.error('[ERROR]', err));
}

/**
 * Fonction principale pour démarrer les bots
 */
async function loadChannels() {
    console.log('[INFO] Loading Twitch channels...');
    try {
        const users = await User.find();
        if (!users || users.length === 0) {
            console.warn('[WARN] No users found in the database.');
            return;
        }

        for (const user of users) {
            const { twitchUsername, twitchToken } = user;
            if (!twitchUsername || !twitchToken) {
                console.warn(`[WARN] Missing information for user: ${twitchUsername || 'unknown'}`);
                continue;
            }

            if (clients[twitchUsername]) {
                console.log(`[INFO] Bot already running for ${twitchUsername}. Skipping.`);
                continue;
            }

            console.log(`[INFO] Starting bot for ${twitchUsername}...`);
            // Configuration du bot
            const botOptions = {
                options: { debug: false },
                connection: { reconnect: true, secure: true },
                identity: { username: twitchUsername, password: twitchToken },
                channels: [twitchUsername],
            };

            const client = new tmi.Client(botOptions);

            client.on('message', (channel, tags, message, self) => {
                if (self) return;
                const args = message.trim().split(' ');
                const command = args.shift().toLowerCase();
                switch (command) {
                    case '!help': handleHelpCommand(client, channel); break;
                    case '!rank': handleRankCommand(client, channel); break;
                    case '!teamrank': handleTeamRankCommand(client, channel, args[0]); break;
                    case '!stats': handleStatsCommand(client, channel, args.join(' ')); break;
                    default: console.log(`[INFO] Unknown command: ${command}`); break;
                }
            });

            await client.connect();
            clients[twitchUsername] = client;
            console.log(`[INFO] Bot successfully connected for ${twitchUsername}`);
        }
    } catch (err) {
        console.error('[ERROR] Failed to load channels:', err.message);
    }
}

module.exports = {
    startBot: loadChannels,
};
