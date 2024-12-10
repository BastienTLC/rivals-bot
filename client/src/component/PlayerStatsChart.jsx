// src/pages/Customs/PlayerStatsChart.js
import React from 'react';
import Chart from 'react-apexcharts';
import { Card } from 'primereact/card'; // PrimeReact Card
import { Tag } from 'primereact/tag'; // PrimeReact Tag for labels
import { Divider } from 'primereact/divider'; // PrimeReact Divider
import 'primeflex/primeflex.css'; // PrimeFlex for layout utilities
import 'primeicons/primeicons.css'; // PrimeIcons for icons

function PlayerStatsChart({ playerStats, averageStats }) {
    const series = [
        {
            name: playerStats.player,
            data: [playerStats.kills, playerStats.kdr, playerStats.accuracy]
        },
        {
            name: 'Average',
            data: [averageStats.kills, averageStats.kdr, averageStats.accuracy]
        }
    ];

    const options = {
        chart: {
            type: 'radar',
            toolbar: {
                show: true
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            }
        },
        xaxis: {
            categories: ['Kills', 'KDR', 'Accuracy']
        },
        colors: ['#2196f3', '#f44336'],
        stroke: {
            width: 2
        },
        title: {
            text: `Stats Comparison: ${playerStats.name} vs Average`,
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333'
            }
        },
        legend: {
            position: 'bottom'
        }
    };

    return (
        <Card className="card" style={{ marginTop: '20px', padding: '20px' }}>
            <div className="p-d-flex p-ai-center p-jc-between">
                <h2 className="p-m-0">
                    <i className="pi pi-chart-line p-mr-2"></i> Player vs Average Stats
                </h2>
                <Tag
                    value="Radar Chart"
                    icon="pi pi-compass"
                    severity="info"
                    className="p-mr-2"
                />
            </div>
            <Divider />
            <Chart options={options} series={series} type="radar" height={600} />
        </Card>
    );
}

export default PlayerStatsChart;
