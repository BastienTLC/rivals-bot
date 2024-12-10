// src/pages/Customs/Customs.js
import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import Top20Table from '../component/Top20Table';
import PlayerPositionCard from '../component/PlayerPositionCard';
import PlayerStatsChart from '../component/PlayerStatsChart';

import 'primeflex/primeflex.css'; // PrimeFlex for layout utilities

function Customs() {
    const { player } = useParams();
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    useEffect(() => {
        axios.get(`${backendUrl}/api/rustData/players/`)
            .then(response => {
                setPlayers(response.data);
                console.log("Players fetched:", response.data);
            })
            .catch(error => {
                console.error("Error fetching players:", error);
            })
            .finally(() => setLoading(false));
    }, [backendUrl]);

    // Tri des joueurs par kills décroissants
    const sortedPlayers = useMemo(() => {
        return [...players].sort((a, b) => b.kills - a.kills);
    }, [players]);

    // Données du joueur cible
    const playerData = useMemo(() => {
        return sortedPlayers.find(p => p.name === player);
    }, [sortedPlayers, player]);

    const playerRank = useMemo(() => {
        if (!playerData) return null;
        return sortedPlayers.findIndex(p => p.name === player) + 1;
    }, [sortedPlayers, playerData, player]);

    // Moyennes globales
    const averageStats = useMemo(() => {
        if (players.length === 0) return { kills: 0, kdr: 0, accuracy: 0 };
        const totalKills = players.reduce((acc, p) => acc + p.kills, 0);
        const totalKD = players.reduce((acc, p) => acc + p.kdr, 0);
        const totalAccuracy = players.reduce((acc, p) => acc + p.accuracy, 0);
        return {
            kills: (totalKills / players.length) || 0,
            kdr: (totalKD / players.length) || 0,
            accuracy: (totalAccuracy / players.length) || 0
        };
    }, [players]);

    return (
        <div className="content p-p-4">
            <button onClick={handleGoHome} className="p-button p-mb-4">Go Home</button>
            <h1 className="p-mb-4 p-text-center">Overall Leaderboard</h1>
            {loading && <p className="p-text-center">Loading...</p>}
            {!loading && (
                <div className="p-grid p-align-start p-justify-between">
                    <div className="p-col-12 p-md-4">
                        <Top20Table top20={sortedPlayers} />
                    </div>
                    <div className="p-col-12 p-md-3">
                        <PlayerPositionCard playerData={playerData} playerRank={playerRank} />
                    </div>
                    <div className="p-col-12 p-md-5">
                        <PlayerStatsChart playerStats={playerData} averageStats={averageStats} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Customs;
