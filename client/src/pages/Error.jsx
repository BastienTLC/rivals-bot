import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from 'primereact/card';

function Error() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const errorMessage = queryParams.get('message') || 'Invalid token';

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="flex-center">
            <Card title="Error" className="card">
                <p>{errorMessage}</p>
                <button onClick={handleGoHome}>Go Home</button>
            </Card>
        </div>
    );
}

export default Error;