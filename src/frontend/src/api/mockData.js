/**
 * Données simulées pour fonctionner sans backend
 * À utiliser uniquement en développement et pendant le déploiement sans backend
 */

// Résultats d'analyse simulés
export const mockAnalyzeResponse = {
  success: true,
  face_shape: "oval",
  face_metrics: {
    width_to_height_ratio: 0.75,
    jaw_width: 0.42,
    forehead_width: 0.38,
    face_length: 0.65
  },
  confidence: 0.92
};

// Recommandations simulées
export const mockRecommendations = {
  success: true,
  face_shape: "oval",
  recommendations: [
    {
      model_id: "purple1",
      score: 0.92,
      reason: "Parfait pour les visages ovales"
    },
    {
      model_id: "blue_aviator",
      score: 0.88,
      reason: "Style complémentaire pour votre visage"
    },
    {
      model_id: "black_round",
      score: 0.85,
      reason: "Design équilibré qui s'adapte bien"
    }
  ]
};

// Analyse et recommandations combinées
export const mockAnalyzeAndRecommend = {
  analysis: mockAnalyzeResponse,
  recommendations: mockRecommendations.recommendations
};

// Statut du serveur simulé
export const mockHealthCheck = {
  status: "ok",
  version: "1.0.0",
  models_loaded: true
}; 