/**
 * Service API pour communiquer avec le backend
 */

// URL de l'API backend (définie dans .env)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Analyser une image de visage
 * @param {File} imageFile - Fichier image à analyser
 * @returns {Promise} - Résultat de l'analyse
 */
export const analyzeFace = async (imageFile) => {
  try {
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
    throw error;
  }
};

/**
 * Obtenir des recommandations basées sur la forme du visage
 * @param {string} faceShape - Forme du visage (long, proportionné, autre, etc.)
 * @returns {Promise} - Résultat de la recommandation
 */
export const getRecommendations = async (faceShape) => {
  try {
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
    throw error;
  }
};

/**
 * Analyser et obtenir des recommandations en une seule requête
 * @param {File} imageFile - Fichier image à analyser
 * @returns {Promise} - Résultat de l'analyse et des recommandations
 */
export const analyzeAndRecommend = async (imageFile) => {
  try {
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
    throw error;
  }
}; 