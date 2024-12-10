
const axios = require('axios');
const mongoose = require('mongoose');
var User = require('../model/User');// Assurez-vous que le modèle User est correctement défini

// Fonction pour rafraîchir un token Twitch
async function refreshTwitchToken(clientId, clientSecret, refreshToken) {
    try {
        const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                expires_in: 5215742,
                client_id: clientId,
                client_secret: clientSecret,
            },
        });

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;

        console.log('Token refreshed successfully for user.');
        return { newAccessToken, newRefreshToken };
    } catch (error) {
        console.error('Error refreshing token:', error.response?.data || error.message);
        throw error;
    }
}

// Fonction pour rafraîchir les tokens de tous les utilisateurs
async function refreshAllTokens() {
    try {
        // Récupérez les utilisateurs depuis la base de données
        const users = await User.find();
        if (!users || users.length === 0) {
            console.log('No users found in the database.');
            return;
        }

        console.log(`Refreshing tokens for ${users.length} users.`);

        for (const user of users) {
            const { twitchRefreshToken } = user;

            // Vérifiez si un Refresh Token est présent
            if (!twitchRefreshToken) {
                console.error(`User ${user.username} has no refresh token.`);
                continue;
            }

            try {
                // Rafraîchir le token
                const { newAccessToken, newRefreshToken } = await refreshTwitchToken(
                    process.env.TWITCH_CLIENT_ID,
                    process.env.TWITCH_CLIENT_SECRET,
                    twitchRefreshToken
                );

                // Mettre à jour l'utilisateur dans la base de données
                user.twitchToken = newAccessToken;
                user.twitchRefreshToken = newRefreshToken;
                await user.save();

                console.log(`Tokens updated for user: ${user.username}`);
            } catch (error) {
                console.error(`Failed to refresh token for user ${user.username}:`, error.message);
            }
        }

        console.log('All tokens refreshed successfully.');
    } catch (error) {
        console.error('Error refreshing all tokens:', error.message);
    }
}

module.exports = {
    refreshAllTokens
};



