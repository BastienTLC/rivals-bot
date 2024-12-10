import React from 'react';
import axios from 'axios';
import { Button } from 'primereact/button';

function UnRegister() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const twitchUsername = localStorage.getItem('twitchUsername');

    const handleUnregister = () => {
        axios.delete(`${backendUrl}/api/users/${twitchUsername}`)
            .then(() => {
                console.log('User unregistered successfully');
                document.cookie.split(";").forEach((c) => {
                    document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
                });
                window.location.reload();
            })
            .catch((error) => {
                console.error('Error unregistering user:', error);
            });
    };

    return (
        <div className="flex-center">
            <div className="card">
                <h1>UnRegister</h1>
                <Button label="Unregister" icon="pi pi-times" className="p-button-danger" onClick={handleUnregister} />
            </div>
        </div>
    );
}

export default UnRegister;
