import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Register from '../component/Register';
import UnRegister from '../component/UnRegister';
import { ProgressSpinner } from 'primereact/progressspinner';

function Home() {
    const [isRegistered, setIsRegistered] = useState(null);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        const twitchUsername = localStorage.getItem('twitchUsername');
        if (twitchUsername) {
            axios.get(`${backendUrl}/api/users/${twitchUsername}`)
                .then(() => setIsRegistered(true))
                .catch(() => setIsRegistered(false));
        } else {
            setIsRegistered(false);
        }
    }, [backendUrl]);

    if (isRegistered === null) {
        return (
            <div className="flex-center">
                <ProgressSpinner />
            </div>
        );
    }

    return (
        <div className="p-5">
            {isRegistered ? <UnRegister /> : <Register />}
        </div>
    );
}

export default Home;
