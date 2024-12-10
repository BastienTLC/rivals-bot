const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json()); // Pour lire les requêtes JSON

// Endpoint pour enregistrer le token dans config.json
app.post('/save-token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).send('Token manquant');
    }

    // Charger l'existant ou créer un nouvel objet
    const config = fs.existsSync('./config.json')
        ? JSON.parse(fs.readFileSync('./config.json', 'utf8'))
        : {};

    // Ajouter le token au fichier de configuration
    config.TWITCH_OAUTH = `oauth:${token}`;

    fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));
    res.send('Token enregistré avec succès');
});

app.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});
