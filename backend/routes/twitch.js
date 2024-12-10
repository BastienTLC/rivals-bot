const express = require('express');
const axios = require('axios');
const User = require('../model/User'); // Modèle MongoDB pour les utilisateurs
const { startBot } = require('../bot/twitchBot'); // Fonction pour charger les chaînes
const router = express.Router();

router.get('/callback', async (req, res) => {
    const { code } = req.query; // Récupérer le code d'autorisation
    if (!code) {
        return res.status(400).send('Code manquant');
    }

    try {
        // Échanger le code contre un token d'accès
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

        // Récupérer les informations utilisateur à l'aide du token d'accès
        const userResponse = await axios.get('https://api.twitch.tv/helix/users', {
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Client-Id': process.env.TWITCH_CLIENT_ID,
            },
        });

        const userData = userResponse.data.data[0]; // Les informations utilisateur sont dans un tableau

        // Ajouter ou mettre à jour l'utilisateur dans la base de données
        let user = await User.findOne({ twitchUsername: userData.display_name });
        if (!user) {
            user = new User({
                twitchUsername: userData.display_name,
                twitchToken: access_token,
            });
        } else {
            user.twitchToken = access_token; // Mettre à jour le token
        }

        await user.save();

        res.json({ message: 'Utilisateur enregistré avec succès', user });
        startBot(); // Recharger les chaînes pour le bot
    } catch (error) {
        console.error('Erreur lors de l\'échange du code ou de la récupération des informations utilisateur :', error.message);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erreur serveur lors de l\'authentification OAuth' });
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