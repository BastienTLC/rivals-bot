const axios = require('axios');
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
 * Récupère la liste de tous les joueurs de toutes les équipes.
 */
async function fetchAllPlayers() {
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

        return allPlayers;
    } catch (err) {
        console.error('Erreur dans fetchAllPlayers:', err.message);
        throw new Error('Erreur lors de la récupération de la liste des joueurs.');
    }
}

/**
 * Fonction qui retourne les détails d'une joueur par son nom. il faut utiliser la fonction fetchAllPlayers() avant.
 * resiste a la casse
 */

async function fetchPlayerDetails(playerName) {
    const players = await fetchAllPlayers();
    return players.find(player => player.name.toLowerCase() === playerName.toLowerCase());
}

module.exports = {
    fetchAllTeams,
    fetchTeamDetails,
    fetchAllPlayers,
    fetchPlayerDetails,
};