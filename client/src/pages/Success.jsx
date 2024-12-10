import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';

function Success() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const twitchUsername = queryParams.get('twitchUsername');
        const twitchToken = queryParams.get('twitchToken');

        if (twitchUsername && twitchToken) {
            localStorage.setItem('twitchUsername', twitchUsername);
            localStorage.setItem('twitchToken', twitchToken);
            setIsValid(true);
        } else {
            navigate('/error');
        }
    }, [location, navigate]);

    if (!isValid) {
        return null;
    }

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="flex-center">
            <Card title="Success" className="card">
                <p>Welcome, {new URLSearchParams(location.search).get('twitchUsername')}!</p>
                <button onClick={handleGoHome}>Go Home</button>
            </Card>
        </div>
    );
}

export default Success;