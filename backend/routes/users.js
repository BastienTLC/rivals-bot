var express = require('express');
var router = express.Router();
var User = require('../model/User');

// Obtenir tous les utilisateurs
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ajouter un utilisateur
router.post('/', async (req, res) => {
  const { twitchUsername, twitchToken } = req.body;
  if (!twitchUsername || !twitchToken) {
    return res.status(400).json({ error: 'Données manquantes' });
  }

  try {
    const user = new User({ twitchUsername, twitchToken });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Find user by twitchUsername
router.get('/:twitchUsername', async (req, res) => {
  try {
    const user = await User.findOne({ twitchUsername: req.params.twitchUsername });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete user by twitchUsername
router.delete('/:twitchUsername', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ twitchUsername: req.params.twitchUsername });
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
