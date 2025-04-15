/**
 * Configuration de l'application
 */

// URL de base de l'API
export const API_URL = 'http://localhost:8000';

// Configuration de l'essayage virtuel
export const VIRTUAL_TRYON_CONFIG = {
  initialModel: 'purple1',
  videoWidth: 640,
  videoHeight: 480
};

// Liste des modèles de lunettes disponibles
export const GLASSES_MODELS = [
  { id: "purple1", name: "Purple Style 1", category: "Mode" },
  { id: "red", name: "Red Classic", category: "Classique" },
  { id: "blue_aviator", name: "Blue Aviator", category: "Sport" },
  { id: "black_round", name: "Black Round", category: "Rétro" }
];

// Chemins possibles pour les ressources 3D
export const RESOURCE_PATHS = [
  "/obj/",
  "/src/frontend/obj/",
  "/src/frontend/public/obj/",
  "https://optical-factory-front.vercel.app/obj/",
  "/public/obj/"
]; 