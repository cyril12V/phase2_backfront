/**
 * Services API pour la communication avec le backend
 */

import { API_URL } from '../config';

// URL de base de l'API avec préfixe
const API_BASE_URL = `${API_URL}/api/v1`;

/**
 * Envoi d'une image pour analyse et recommandations
 * @param {File} imageFile - Le fichier image à analyser
 * @returns {Promise} - Promesse contenant le résultat de l'analyse et les recommandations
 */
export const analyzeAndRecommend = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image_file', imageFile);

    const response = await fetch(`${API_BASE_URL}/analyze_and_recommend`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erreur HTTP ${response.status}: ${errorData.detail || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de l'analyse et recommandation:", error);
    throw error;
  }
};

/**
 * Envoi d'une image pour analyse faciale uniquement
 * @param {File} imageFile - Le fichier image à analyser
 * @returns {Promise} - Promesse contenant le résultat de l'analyse
 */
export const analyzeFace = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image_file', imageFile);

    const response = await fetch(`${API_BASE_URL}/analyze_face`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erreur HTTP ${response.status}: ${errorData.detail || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de l'analyse faciale:", error);
    throw error;
  }
};

/**
 * Obtenir des recommandations basées sur une forme de visage
 * @param {string} faceShape - La forme du visage détectée
 * @returns {Promise} - Promesse contenant les recommandations
 */
export const getRecommendations = async (faceShape) => {
  try {
    const response = await fetch(`${API_BASE_URL}/recommend_glasses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ face_shape: faceShape }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erreur HTTP ${response.status}: ${errorData.detail || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Erreur lors de la recommandation:", error);
    throw error;
  }
};

/**
 * Envoi des landmarks du visage pour analyse en temps réel
 * @param {Array} landmarks - Les landmarks détectés par TensorFlow.js
 * @returns {Promise} - Promesse contenant les résultats de l'analyse
 */
export const analyzeLandmarks = async (landmarks) => {
  try {
    // Analyser les landmarks localement pour déterminer la forme du visage
    const faceShape = analyzeFaceShapeLocally(landmarks);
    console.log("Forme détectée localement:", faceShape);
    
    // Obtenir des recommandations pour cette forme
    const recommendations = await getRecommendationsForShape(faceShape);
    
    return {
      recommended_glasses_ids: recommendations,
      analysis_info: `Forme détectée: ${faceShape}` 
    };
  } catch (error) {
    console.error("Erreur lors de l'analyse des landmarks:", error);
    throw error;
  }
};

/**
 * Analyse la forme du visage localement à partir des landmarks
 * @param {Array} landmarks - Les landmarks détectés
 * @returns {string} - La forme du visage détectée
 */
const analyzeFaceShapeLocally = (landmarks) => {
  if (!landmarks || landmarks.length < 468) {
    return "indéterminée";
  }
  
  try {
    // Points pour la largeur au niveau des tempes (points approximatifs)
    const leftTemple = landmarks[54];
    const rightTemple = landmarks[284];
    
    // Points pour la largeur au niveau des joues
    const leftCheek = landmarks[58];
    const rightCheek = landmarks[288];
    
    // Points pour la mâchoire
    const leftJaw = landmarks[172];
    const rightJaw = landmarks[397];
    
    // Point du menton
    const chin = landmarks[152];
    
    // Point central du front
    const forehead = landmarks[10];
    
    // Calculer les largeurs à différents niveaux
    const templeWidth = Math.abs(rightTemple[0] - leftTemple[0]);
    const cheekWidth = Math.abs(rightCheek[0] - leftCheek[0]);
    const jawWidth = Math.abs(rightJaw[0] - leftJaw[0]);
    
    // Calculer la hauteur du visage
    const faceHeight = Math.abs(chin[1] - forehead[1]);
    
    // Ratios pour déterminer la forme
    const widthToHeight = templeWidth / faceHeight;
    const jawToTemple = jawWidth / templeWidth;
    const cheekToTemple = cheekWidth / templeWidth;
    
    console.log("Ratio largeur/hauteur:", widthToHeight);
    console.log("Ratio mâchoire/tempes:", jawToTemple);
    console.log("Ratio joues/tempes:", cheekToTemple);
    
    // Déterminer la forme du visage (seuils ajustés pour moins favoriser ovale)
    if (widthToHeight > 0.85) {
      // Visage plus large
      if (jawToTemple > 0.92) {
        return "carré";
      } else if (cheekToTemple > 0.95) {
        return "rond";
      } else {
        return "carré";
      }
    } else {
      // Visage plus long
      if (jawToTemple < 0.78) {
        return "triangle";
      } else if (jawToTemple > 0.95 && cheekToTemple > 0.9) {
        return "rond";
      } else if (jawToTemple > 1.05) {
        return "triangle";
      } else {
        // Seulement si vraiment proportionné
        return "ovale";
      }
    }
  } catch (e) {
    console.error("Erreur lors de l'analyse locale des landmarks:", e);
    return "indéterminée";
  }
};

/**
 * Obtient des recommandations pour une forme de visage spécifique
 * @param {string} faceShape - La forme du visage détectée
 * @returns {Promise<Array>} - Les IDs de lunettes recommandées
 */
const getRecommendationsForShape = async (faceShape) => {
  // Tableau de correspondance entre les formes en français et les modèles recommandés
  const recommendations = {
    'carré': ['black_round', 'blue_aviator'],
    'rond': ['red', 'purple1'],
    'ovale': ['purple1', 'blue_aviator'],
    'triangle': ['black_round', 'red'],
    'indéterminée': ['purple1', 'black_round']
  };

  // Correspondance avec les noms en anglais (pour compatibilité)
  const englishToFrench = {
    'square': 'carré',
    'round': 'rond',
    'oval': 'ovale',
    'triangle': 'triangle',
    'indeterminate': 'indéterminée'
  };

  // Si la forme est en anglais, la convertir en français
  const frenchShape = englishToFrench[faceShape] || faceShape;
  
  console.log("Recommandations pour la forme:", frenchShape);

  // S'assurer que nous renvoyons toujours exactement 2 recommandations
  if (recommendations[frenchShape] && recommendations[frenchShape].length >= 2) {
    const result = recommendations[frenchShape].slice(0, 2);
    console.log("Recommandations finales:", result);
    return result;
  } else {
    // Si la forme n'est pas reconnue ou n'a pas assez de recommandations, 
    // on utilise une forme par défaut
    console.warn(`Forme de visage ${frenchShape} non reconnue ou avec trop peu de recommandations`);
    return recommendations['indéterminée'];
  }
}; 