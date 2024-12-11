import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import axios from 'axios';
import { Slider } from 'primereact/slider';
import './Recap.css'; // Import custom CSS

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

function Recap() {
    const { channel } = useParams();
    const query = useQuery();
    const playerName = query.get('playerName');
    const [playerData, setPlayerData] = useState(null);
    const [channelData, setChannelData] = useState(null);
    const [teamData, setTeamData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [displayMode, setDisplayMode] = useState('single'); // 'single' or 'team'
    const [lastFetchedName, setLastFetchedName] = useState(null);
    const [counter, setCounter] = useState(0); // Counter to track time
    const [scrollSpeed, setScrollSpeed] = useState(100); // Vitesse par défaut : 5s

    useEffect(() => {
        const teamCardsElement = document.querySelector('.team-card-container');
        if (teamCardsElement) {
            teamCardsElement.style.setProperty('--scroll-duration', `${scrollSpeed}s`);
        }
    }, [scrollSpeed]);

    useEffect(async () => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await axios.get(`${backendUrl}/api/rustData/players/${channel}`);
        console.log('Channel data fetched:', response.data);
        setChannelData(response.data);
    }, [channel]);


    useEffect(() => {
        if (!channel) return;

        const fetchPlayerData = async () => {
            try {
                console.log(`Fetching player data for channel: ${channel}`);
                const backendUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await axios.get(`${backendUrl}/api/twitch/player/${channel}`);
                console.log('Player data fetched:', response.data);
                setPlayerData(response.data);

                if (response.data.name !== lastFetchedName) {
                    setLastFetchedName(response.data.name);
                    setCounter(0); // Reset counter if player changes
                    console.log('Updated lastFetchedName:', response.data.name);
                    setDisplayMode('single'); // Ensure single mode is active when player is updated
                } else {
                    setCounter(prev => prev + 5); // Increment counter if player is the same
                }
                if (lastFetchedName === null){
                    setDisplayMode('single'); // Ensure single mode is active when player is updated
                }
            } catch (err) {
                console.error("Erreur lors de la récupération des données du joueur:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerData();

        const interval = setInterval(fetchPlayerData, 5000);

        return () => clearInterval(interval);
    }, [channel, lastFetchedName]);

    useEffect(() => {
        if (!lastFetchedName || !playerData) {
            console.log('Skipping team fetch: lastFetchedName or playerData is missing.');
            return; // Prevent unnecessary team fetch
        }

        if (displayMode === 'team') {
            console.log('Already in team mode, skipping team fetch.');
            return;
        }

        if (counter >= 30) {
            console.log(`Fetching team data for team: ${playerData.teamName}`);
            const fetchTeamData = async () => {
                try {
                    const backendUrl = import.meta.env.VITE_BACKEND_URL;
                    const response = await axios.get(`${backendUrl}/api/rustData/teams/${channelData.teamName}`);
                    console.log('Team data fetched:', response.data);
                    setTeamData(response.data.members);
                    setDisplayMode('team');
                } catch (err) {
                    console.error("Erreur lors de la récupération des données de l'équipe:", err);
                }
            };

            fetchTeamData();
        }
    }, [lastFetchedName, playerData, displayMode, counter, channelData]);

    if (loading) {
        console.log('Loading player data...');
        return <div>Chargement...</div>;
    }

    if (!playerData) {
        console.log(`No data available for player: ${playerName}`);
        return <div>Aucune donnée disponible pour le joueur {playerName}.</div>;
    }

    const renderPlayerCard = (player) => {
        console.log('Rendering player card for:', player.name);
        return (
            <Card
                header={<h2 className="player-name">{player.name}</h2>}
                className="player-card"
                key={player.name}
            >
                <div className="player-stats">
                    <div>
                        <strong>Équipe:</strong> {player.teamName}
                    </div>
                    <div>
                        <strong>Kills:</strong> {player.kills}
                    </div>
                    <div>
                        <strong>Deaths:</strong> {player.deaths}
                    </div>
                    <div>
                        <strong>KD Ratio:</strong> {player.kdr?.toFixed(2) || 'N/A'}
                    </div>
                    <div>
                        <strong>Accuracy:</strong> {player.accuracy}%
                    </div>
                    <div>
                        <strong>Damage Done:</strong> {Math.round(player.damageDone)}
                    </div>
                </div>
            </Card>
        );
    };


    if (displayMode === 'single') {
        console.log('Displaying single player mode');
        return (
            <div className="recap-container">
                {renderPlayerCard(playerData)}
            </div>
        );
    }

    console.log('Displaying team mode');
    return (
        <div className="recap-container team-mode">
            <div
                className="team-cards"
                style={{
                    '--team-size': teamData.length, // Transmet le nombre de cartes au CSS
                }}
            >
                <div className="team-card-container">
                    {teamData.concat(teamData).map((player, index) => (
                        <div key={index} className="team-card">
                            {renderPlayerCard(player)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Recap;
