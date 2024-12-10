const express = require('express');
const axios = require('axios');
const User = require('../model/User'); // Modèle MongoDB pour les utilisateurs
const { startBot } = require('../bot/twitchBot'); // Fonction pour charger les chaînes
const { fetchAllPlayers } = require('../rustApi/fetchData'); // Fonction pour récupérer les joueurs
const router = express.Router();

router.get('/callback', async (req, res) => {
    console.log('[INFO] /callback endpoint hit.');
    const { code } = req.query; // Retrieve the authorization code
    if (!code) {
        console.error('[ERROR] Authorization code missing.');
        return res.status(400).send('Code missing');
    }

    try {
        console.log('[INFO] Exchanging authorization code for tokens...');
        const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.TWITCH_REDIRECT_URI,
            },
        });

        const { access_token, refresh_token } = tokenResponse.data;
        console.log('[INFO] Tokens retrieved successfully.');

        console.log('[INFO] Fetching user information from Twitch...');
        const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
        });

        const userData = userResponse.data.data[0]; // User information is in an array
        console.log(`[INFO] User information retrieved: ${userData.display_name}.`);

        // Vérifier si l'utilisateur est membre de Rustoria
        try {
            console.log('[INFO] Fetching all players from Rustoria...');
            const players = await fetchAllPlayers();
            const user = players.find(player => player.twitchUsername === userData.display_name);
            if (!user) {
                console.warn(`[WARN] User ${userData.display_name} is not a member of Twitch Rivals.`);
                res.redirect(`${process.env.FRONT_END_REDIRECTION}/error?message=You are not a member of twitch rivals`);
                return res.status(403).send('You are not a member of twitch rivals');
            }
            console.log(`[INFO] User ${userData.display_name} is a member of Twitch Rivals.`);
        } catch (err) {
            console.error('[ERROR] Error during fetchAllPlayers:', err.message);
            res.redirect(`${process.env.FRONT_END_REDIRECTION}/error?message=Error during fetchAllPlayers`);
            return res.status(500).send('Error during fetchAllPlayers');
        }

        // Ajouter ou mettre à jour l'utilisateur dans la base de données
        console.log(`[INFO] Checking database for user: ${userData.display_name}`);
        let user = await User.findOne({ twitchUsername: userData.display_name });
        if (!user) {
            console.log(`[INFO] Adding new user: ${userData.display_name}`);
            user = new User({
                twitchUsername: userData.display_name,
                twitchToken: access_token,
                twitchRefreshToken: refresh_token,
            });
        } else {
            console.log(`[INFO] Updating tokens for existing user: ${userData.display_name}`);
            user.twitchToken = access_token; // Update the token
            user.twitchRefreshToken = refresh_token; // Update the refresh token
        }

        await user.save();
        console.log(`[INFO] User ${userData.display_name} saved/updated successfully.`);

        const queryString = new URLSearchParams(user.toObject()).toString();
        console.log(`[INFO] Redirecting user ${userData.display_name} to success page.`);
        res.redirect(`${process.env.FRONT_END_REDIRECTION}/success?${queryString}`);
        startBot(); // Reload channels for the bot
    } catch (error) {
        console.error('[ERROR] Error during code exchange or user information retrieval:', error.message);
        if (!res.headersSent) {
            res.redirect(`${process.env.FRONT_END_REDIRECTION}/error`);
        }
    }
});

router.get('/user', async (req, res) => {
    console.log('[INFO] /user endpoint hit.');
    const token = req.headers.authorization; // Passez un token côté front si nécessaire
    if (!token) {
        console.error('[ERROR] Authorization token missing.');
        return res.status(401).send('Non authentifié');
    }

    try {
        console.log('[INFO] Fetching user information from Twitch...');
        const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
        });

        const userData = userResponse.data.data[0];
        console.log(`[INFO] User information retrieved successfully: ${userData.display_name}`);
        res.json({ displayName: userData.display_name });
    } catch (err) {
        console.error('[ERROR] Error fetching user information:', err.message);
        res.status(500).send('Erreur lors de la récupération de l\'utilisateur');
    }
});

module.exports = router;
