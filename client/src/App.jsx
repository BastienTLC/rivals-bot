// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Success from './pages/Success';
import Error from './pages/Error';
import Background from './component/Background';
import Customs from './pages/Customs';

function App() {
    const location = useLocation();

    return (
        <>
            {/* Afficher Background uniquement sur certaines routes */}
            {['/', '/success'].includes(location.pathname) && <Background />}

            {/* Contenu principal */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/success" element={<Success />} />
                    <Route path="/error" element={<Error />} />
                    <Route path="/customs/:player" element={<Customs />} />
                </Routes>
            </div>
        </>
    );
}

export default function AppWrapper() {
    return (
        <Router>
            <App />
        </Router>
    );
}