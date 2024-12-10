// src/pages/Customs/PlayerPositionCard.js
import React from 'react';
import { Card } from 'primereact/card'; // PrimeReact Card component
import { Tag } from 'primereact/tag'; // PrimeReact Tag for labels
import { Divider } from 'primereact/divider'; // PrimeReact Divider
import 'primeflex/primeflex.css'; // PrimeFlex for layout utilities
import 'primeicons/primeicons.css'; // PrimeIcons for icons

function PlayerPositionCard({ playerData, playerRank }) {
    // Vérifiez que les données nécessaires sont disponibles
    if (!playerData || playerRank == null) {
        return (
            <Card className="p-shadow-3" style={{ marginTop: '20px', padding: '10px' }}>
                <p className="p-text-center">Impossible de récupérer vos données pour l'instant.</p>
            </Card>
        );
    }

    return (
        <Card className="card" style={{ marginTop: '20px', padding: '10px' }}>
            <div className="p-d-flex p-jc-between p-ai-center">
                <h2 className="p-m-0">Votre position</h2>
                <Tag value={`#${playerRank}`} severity="info" icon="pi pi-star" />
            </div>
            <Divider />
            <div className="p-d-flex p-flex-column p-ai-start">
                <div className="p-d-flex p-ai-center p-mb-3">
                    <i className="pi pi-user p-mr-2" style={{ fontSize: '1.5em' }}></i>
                    <strong>{playerData.name}</strong>
                </div>
                <div className="p-d-flex p-ai-center p-mb-2">
                    <i className="pi pi-chart-line p-mr-2" style={{ fontSize: '1.5em' }}></i>
                    <span><strong>Kills:</strong> {playerData.kills}</span>
                </div>
                <div className="p-d-flex p-ai-center p-mb-2">
                    <i className="pi pi-percent p-mr-2" style={{ fontSize: '1.5em' }}></i>
                    <span><strong>KD:</strong> {playerData.kdr}</span>
                </div>
                <div className="p-d-flex p-ai-center">
                    <i className="pi pi-bullseye p-mr-2" style={{ fontSize: '1.5em' }}></i>
                    <span><strong>Précision:</strong> {playerData.accuracy}%</span>
                </div>
            </div>
        </Card>
    );
}

export default PlayerPositionCard;
