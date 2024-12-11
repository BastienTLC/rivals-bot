const selectedPlayers = {}; // Tableau associatif avec channel comme clé et joueur comme valeur

/**
 * Ajoute ou met à jour les données du joueur pour un channel spécifique.
 * @param {string} channel - Le nom du channel.
 * @param {Object} playerData - Les données du joueur.
 */
function setSelectedPlayer(channel, playerData) {
    selectedPlayers[channel] = playerData;
}

/**
 * Récupère les données du joueur pour un channel spécifique.
 * @param {string} channel - Le nom du channel.
 * @returns {Object|null} Les données du joueur ou null si aucune donnée.
 */
function getSelectedPlayer(channel) {
    return selectedPlayers[channel] || null;
}

module.exports = {
    setSelectedPlayer,
    getSelectedPlayer,
};
