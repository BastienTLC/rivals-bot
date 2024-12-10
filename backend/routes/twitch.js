const express = require('express');
const axios = require('axios');
const User = require('../model/User'); // Modèle MongoDB pour les utilisateurs
const { startBot } = require('../bot/twitchBot'); // Fonction pour charger les chaînes
const { fetchAllPlayers } = require('../rustApi/fetchData'); // Fonction pour récupérer les joueurs
const router = express.Router();

router.get('/callback', async (req, res) => {
    const { code } = req.query; // Retrieve the authorization code
    if (!code) {
        return res.status(400).send('Code missing');
    }

    try {
        // Exchange the code for an access token
        const tokenResponse = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: process.env.TWITCH_REDIRECT_URI,
            },
        });

        const { access_token } = tokenResponse.data;

        // Retrieve user information using the access token
        const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
        });

        const userData = userResponse.data.data[0]; // User information is in an array

        //get all user from rustoria
        try {
            const players = await fetchAllPlayers();
            const user = players.find(player => player.twitchUsername === userData.display_name);
            if (!user) {
                res.redirect(`${process.env.FRONT_END_REDIRECTION}/error?message=You are not a member of twitch rivals`);
                return res.status(403).send('You are not a member of twitch rivals');
            }
        }catch (err) {
            console.error('Error during fetchAllPlayers:', err.message);
            res.redirect(`${process.env.FRONT_END_REDIRECTION}/error?message=Error during fetchAllPlayers`);
            return res.status(500).send('Error during fetchAllPlayers');
        }


        // Add or update the user in the database
        let user = await User.findOne({ twitchUsername: userData.display_name });
        if (!user) {
            user = new User({
                twitchUsername: userData.display_name,
                twitchToken: access_token,
            });
        } else {
            user.twitchToken = access_token; // Update the token
        }

        await user.save();

        const queryString = new URLSearchParams(user.toObject()).toString();
        res.redirect(`${process.env.FRONT_END_REDIRECTION}/success?${queryString}`);
        startBot(); // Reload channels for the bot
    } catch (error) {
        console.error('Error during code exchange or user information retrieval:', error.message);
        if (!res.headersSent) {
            res.redirect(`${process.env.FRONT_END_REDIRECTION}/error`);
        }
    }
});

router.get('/user', async (req, res) => {
    const token = req.headers.authorization; // Passez un token côté front si nécessaire
    if (!token) {
        return res.status(401).send('Non authentifié');
    }

    try {
        const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
            headers: {
                Authorization: `Bearer ${token}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
        });

        const userData = userResponse.data.data[0];
        res.json({ displayName: userData.display_name });
    } catch (err) {
        res.status(500).send('Erreur lors de la récupération de l\'utilisateur');
    }
});

module.exports = router;