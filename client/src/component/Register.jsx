import React from 'react';
import { Button } from 'primereact/button';

function Register() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleAuth = () => {
        console.log(backendUrl);
        window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=v5ow6jdcrqa6s1f5pmvezomn7pgwdm&redirect_uri=${backendUrl}/api/twitch/callback&response_type=code&scope=chat:read+chat:edit`;
    };

    return (
        <div className="flex-center">
            <div className="card">
                <h1>Bot Twitch Rivals</h1>
                <Button label="Login my channel" icon="pi pi-link" className="p-button-success" onClick={handleAuth} />
            </div>
        </div>
    );
}

export default Register;
