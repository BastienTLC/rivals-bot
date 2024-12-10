import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [user, setUser] = useState(null);

    // Vérifie si l'utilisateur est authentifié
    useEffect(() => {
        axios
            .get(`${backendUrl}/twitch/user`)
            .then((response) => setUser(response.data))
            .catch(() => setUser(null)); // Si non connecté
    }, [backendUrl]);

    const handleAuth = () => {
        window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=v5ow6jdcrqa6s1f5pmvezomn7pgwdm&redirect_uri=${backendUrl}/api/twitch/callback&response_type=code&scope=chat:read+chat:edit`;
    };

    return (
        <div>
            <h1>Bot Twitch</h1>
            {user ? (
                <div>
                    <p>Connecté en tant que {user.displayName}</p>
                    <button onClick={() => alert('Bot activé')}>Activer le Bot</button>
                </div>
            ) : (
                <button onClick={handleAuth}>Connecter ma chaîne</button>
            )}
        </div>
    );
}

export default App;
