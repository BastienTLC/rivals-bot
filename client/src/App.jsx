import React, { useState, useEffect } from 'react';

function App() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleAuth = () => {
        window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=v5ow6jdcrqa6s1f5pmvezomn7pgwdm&redirect_uri=${backendUrl}/api/twitch/callback&response_type=code&scope=chat:read+chat:edit`;
    };

    useEffect(() => {
        handleAuth();
    }, []);

    return (
        <div>
            <h1>Bot Twitch</h1>
            <button onClick={handleAuth}>Connecter ma chaîne</button>
        </div>
    );
}

export default App;