import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {OrbitControls, useGLTF, Environment, Stars} from '@react-three/drei';

function AK47Model(props) {
    const { scene } = useGLTF('/ak47.glb'); // Charger le modèle
    const ref = useRef();

    useFrame((state) => {
        if (ref.current) {
            // Effet de flottement : oscillation sur l'axe Y
            ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.1 - 1;

            // Rotation réactive à la souris :
            // La rotation Y suit le mouvement horizontal de la souris (state.mouse.x)
            // La rotation X suit le mouvement vertical de la souris (state.mouse.y)
            ref.current.rotation.x = state.mouse.y * 0.5; // Ajustez 0.5 pour contrôler la sensibilité
            ref.current.rotation.y = Math.PI / 2 + state.mouse.x * 0.5; // Ajustez 0.5 pour contrôler la sensibilité
        }
    });

    return <primitive ref={ref} object={scene} {...props} />;
}

function Background() {
    return (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            <Canvas>
                <Suspense fallback={null}>
                    {/* Arrière-plan HDRI */}
                    <Stars radius={100} depth={50} count={5000} factor={4} saturation={3} fade speed={2} />

                    {/* Modèle AK-47 avec interaction souris */}
                    <AK47Model scale={[4, 4, 4]} position={[0, 0, 0]} />

                    {/* Éclairage */}
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />
                </Suspense>

                {/* Contrôles (facultatif) */}
                <OrbitControls enableZoom={false} />
            </Canvas>
        </div>
    );
}

export default Background;
