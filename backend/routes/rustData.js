const express = require('express');
const router = express.Router();
const { fetchAllTeams, fetchTeamDetails, fetchAllPlayers, fetchPlayerDetails } = require('../rustApi/fetchData');

// Route pour récupérer toutes les équipes
router.get('/teams', async (req, res) => {
    try {
        const teams = await fetchAllTeams();
        res.json(teams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route pour récupérer les détails d'une équipe par son nom
router.get('/teams/:teamName', async (req, res) => {
    try {
        const teamDetails = await fetchTeamDetails(req.params.teamName);
        res.json(teamDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route pour récupérer tous les joueurs de toutes les équipes
router.get('/players', async (req, res) => {
    try {
        const players = await fetchAllPlayers();
        res.json(players);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Route pour récupérer les détails d'un joueur par son nom
router.get('/players/:playerName', async (req, res) => {
    try {
        const playerDetails = await fetchPlayerDetails(req.params.playerName);
        res.json(playerDetails);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;