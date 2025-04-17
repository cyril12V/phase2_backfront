/**
 * Service API pour communiquer avec le backend
 */

import { mockAnalyzeResponse, mockRecommendations, mockAnalyzeAndRecommend, mockHealthCheck } from './mockData';

// URL de l'API backend (définie dans .env)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Vérifier si nous sommes en mode production et sur Vercel
const isVercelProduction = process.env.NODE_ENV === 'production' && 
                          (window.location.hostname.includes('vercel.app') || 
                           process.env.REACT_APP_USE_MOCK === 'true');

// Fonction pour vérifier la disponibilité de l'API
const isApiAvailable = async () => {
  if (isVercelProduction) return false;
  
  try {
    const response = await fetch(`${API_URL}/health`, { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 3000 // 3 secondes de timeout
    });
    return response.ok;
  } catch (error) {
    console.warn('API non disponible, utilisation des données simulées');
    return false;
  }
};

/**
 * Vérifier l'état de santé de l'API
 * @returns {Promise} - État de santé de l'API
 */
export const checkHealth = async () => {
  try {
    if (isVercelProduction) return mockHealthCheck;
    
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) return mockHealthCheck;
    
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) return mockHealthCheck;
    
    return await response.json();
  } catch (error) {
    console.warn('Erreur lors de la vérification de santé de l\'API:', error);
    return mockHealthCheck;
  }
};

/**
 * Analyser une image de visage
 * @param {File} imageFile - Fichier image à analyser
 * @returns {Promise} - Résultat de l'analyse
 */
export const analyzeFace = async (imageFile) => {
  try {
    if (isVercelProduction) return mockAnalyzeResponse;
    
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) return mockAnalyzeResponse;
    
    const formData = new FormData();
    formData.append('image_file', imageFile);

    const response = await fetch(`${API_URL}/api/v1/analyze_face`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'analyse du visage:', error);
    // En cas d'erreur, retourner les données mockées
    console.warn('Utilisation des données simulées suite à une erreur');
    return mockAnalyzeResponse;
  }
};

/**
 * Obtenir des recommandations basées sur la forme du visage
 * @param {string} faceShape - Forme du visage (long, proportionné, autre, etc.)
 * @returns {Promise} - Résultat de la recommandation
 */
export const getRecommendations = async (faceShape) => {
  try {
    if (isVercelProduction) return mockRecommendations;
    
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) return mockRecommendations;
    
    const response = await fetch(`${API_URL}/api/v1/recommend_glasses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ face_shape: faceShape }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la recommandation:', error);
    return mockRecommendations;
  }
};

/**
 * Analyser et obtenir des recommandations en une seule requête
 * @param {File} imageFile - Fichier image à analyser
 * @returns {Promise} - Résultat de l'analyse et des recommandations
 */
export const analyzeAndRecommend = async (imageFile) => {
  try {
    if (isVercelProduction) return mockAnalyzeAndRecommend;
    
    const apiAvailable = await isApiAvailable();
    if (!apiAvailable) return mockAnalyzeAndRecommend;
    
    const formData = new FormData();
    formData.append('image_file', imageFile);

    const response = await fetch(`${API_URL}/api/v1/analyze_and_recommend`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Erreur HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur lors de l\'analyse et recommandation:', error);
    return mockAnalyzeAndRecommend;
  }
}; 