import React, { useEffect, useState, useRef } from 'react';
import '../style/TryOn.style.css';
import { IntializeEngine, IntializeThreejs, getAnalysisResults } from './render.js';
import { VIRTUAL_TRYON_CONFIG } from '../config';

export const TryOn = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [faceShape, setFaceShape] = useState(null);
    const analysisTimerRef = useRef(null);
    const [faceDetectionHistory, setFaceDetectionHistory] = useState([]);

    // Fonction pour mettre à jour les résultats d'analyse
    const updateAnalysisResults = () => {
        const results = getAnalysisResults();
        if (results.faceShape && results.faceShape !== 'non détectée') {
            // Ajouter la nouvelle détection à l'historique
            setFaceDetectionHistory(prevHistory => {
                const newHistory = [...prevHistory, results.faceShape];
                
                // Garder seulement les 5 dernières détections
                if (newHistory.length > 5) {
                    return newHistory.slice(-5);
                }
                return newHistory;
            });
        }
    };

    // Effet pour vérifier l'historique des détections
    useEffect(() => {
        // Vérifier si les 3 dernières détections sont identiques
        if (faceDetectionHistory.length >= 3) {
            const lastThreeDetections = faceDetectionHistory.slice(-3);
            const allSame = lastThreeDetections.every(shape => shape === lastThreeDetections[0]);
            
            if (allSame) {
                setFaceShape(lastThreeDetections[0]);
            }
        }
    }, [faceDetectionHistory]);

    useEffect(() => {
        let videoElement = null;
        let cleanupCalled = false;

        async function init() {
            try {
                setIsLoading(true);
                
                // Utiliser l'élément vidéo déjà présent dans le DOM
                videoElement = document.getElementById('tryon-video');
                if (!videoElement) {
                    throw new Error("Élément vidéo non trouvé dans le DOM");
                }

                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
                        video: {
                            facingMode: 'user',
                            width: { ideal: VIRTUAL_TRYON_CONFIG.videoWidth },
                            height: { ideal: VIRTUAL_TRYON_CONFIG.videoHeight }
                        }
                    });
                    
                    // Vérifier si le flux est valide
                    if (!stream) {
                        throw new Error("Flux vidéo non disponible");
                    }
                    
                    videoElement.srcObject = stream;
                    console.log("Flux vidéo connecté à l'élément vidéo");
                    
                    // Forcer la lecture immédiate
                    videoElement.play().catch(e => console.error("Erreur au démarrage initial:", e));
                } catch (mediaError) {
                    console.error("Erreur d'accès à la caméra:", mediaError);
                    setError("Impossible d'accéder à votre caméra. Veuillez vérifier vos permissions.");
                    setIsLoading(false);
                    return;
                }

                videoElement.addEventListener('loadeddata', () => {
                    console.log("Vidéo chargée avec dimensions:", videoElement.videoWidth, "x", videoElement.videoHeight);
                });

                videoElement.addEventListener('error', (e) => {
                    console.error("Erreur de chargement vidéo:", e);
                });

                // Utiliser plusieurs événements pour plus de fiabilité
                const setupThreeJs = () => {
                    if (cleanupCalled) return;
                    
                    console.log("Vidéo démarrée, taille:", videoElement.videoWidth, "x", videoElement.videoHeight);
                    
                    // Une fois la vidéo lancée, initialiser Three.js
                    IntializeThreejs(VIRTUAL_TRYON_CONFIG.initialModel);
                    IntializeEngine();
                    setIsLoading(false);
                    
                    // Démarrer la vérification périodique des résultats d'analyse
                    analysisTimerRef.current = setInterval(updateAnalysisResults, 2000);
                    
                    // Retirer le gestionnaire après utilisation
                    videoElement.removeEventListener('canplay', setupThreeJs);
                    videoElement.removeEventListener('loadedmetadata', setupThreeJs);
                };

                videoElement.addEventListener('canplay', setupThreeJs);
                videoElement.addEventListener('loadedmetadata', setupThreeJs);
                
                // Si vidéo déjà prête, initialiser tout de suite
                if (videoElement.readyState >= 2) {
                    setupThreeJs();
                }
            } catch (err) {
                console.error("Erreur d'initialisation:", err);
                setError("Une erreur s'est produite lors de l'initialisation de l'essayage virtuel.");
                setIsLoading(false);
            }
        }

        init();

        // Nettoyage lors du démontage du composant
        return () => {
            cleanupCalled = true;
            
            // Nettoyer le timer d'analyse
            if (analysisTimerRef.current) {
                clearInterval(analysisTimerRef.current);
            }
            
            // Nettoyer la caméra
            if (videoElement && videoElement.srcObject) {
                const tracks = videoElement.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            
            // Supprimer tous les canvas et contenus Three.js
            const container = document.getElementById('threejsContainer');
            if (container) {
                // Ne pas supprimer la vidéo, seulement les autres éléments
                const videoEl = document.getElementById('tryon-video');
                const canvasElements = container.querySelectorAll('canvas');
                canvasElements.forEach(canvas => canvas.remove());
            }
        };
    }, []);

    return (
        <div className="tryon-container">
            {isLoading && (
                <div className="tryon-loader">
                    <div className="tryon-loader__spinner"></div>
                    <p className="tryon-loader__text">Initialisation de l'essayage virtuel...</p>
                </div>
            )}
            
            {error && (
                <div className="tryon-error">
                    <p className="tryon-error__message">{error}</p>
                    <button className="button button--primary" onClick={() => window.location.reload()}>
                        Réessayer
                    </button>
                </div>
            )}
            
            <div id="threejsContainer" className={isLoading || error ? 'hidden' : ''}>
                {/* Vidéo créée directement dans le DOM pour plus de fiabilité */}
                <video 
                    id="tryon-video"
                    playsInline
                    muted
                    autoPlay
                    style={{opacity: '0.01', position: 'absolute', width: '1px', height: '1px', zIndex: -1}}
                    width={VIRTUAL_TRYON_CONFIG.videoWidth}
                    height={VIRTUAL_TRYON_CONFIG.videoHeight}
                />
                <div className="tryon-overlay">
                    <div className="tryon-instructions">
                        <p>Pour un meilleur résultat, positionnez votre visage dans le cadre et gardez la tête droite</p>
                    </div>
                    
                    {faceShape && (
                        <div className="face-shape-indicator">
                            <span>Forme détectée: <strong>{faceShape}</strong></span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};