import React, { Component } from 'react';
import { TryOn } from './TryOn';
// Importer seulement la fonction pour changer les lunettes
import { changeGlassesModel } from './render.js'; 
// Importer le service API et les résultats d'analyse
import { analyzeAndRecommend, analyzeLandmarks } from '../services/api';
import { getAnalysisResults } from './render.js';
// Importer la configuration
import { GLASSES_MODELS } from '../config';
// Importer le nouveau fichier CSS
import '../style/App.css';

// Liste statique de tous les modèles disponibles
const ALL_GLASSES_MODELS = GLASSES_MODELS;

export default class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      analysisResult: null,
      recommendedGlassesIds: [],
      currentDisplayModelId: GLASSES_MODELS[0].id, // Modèle initial
      error: null,
      isLoadingAnalysis: false,
      categories: this.getUniqueCategories(),
      activeCategory: 'Tous',
      selectedImage: null,
      isAnalyzingCamera: false,
      cameraAnalysisTimer: null
    };
    this.handleAnalyseClick = this.handleAnalyseClick.bind(this);
    this.handleSelectGlasses = this.handleSelectGlasses.bind(this);
    this.handleImageUpload = this.handleImageUpload.bind(this);
    this.handleAnalyzeCamera = this.handleAnalyzeCamera.bind(this);
    this.updateFromCameraAnalysis = this.updateFromCameraAnalysis.bind(this);
  }

  componentDidMount() {
    // Démarrer le timer pour surveiller les résultats d'analyse en temps réel
    const cameraAnalysisTimer = setInterval(this.updateFromCameraAnalysis, 2000);
    this.setState({ cameraAnalysisTimer });
  }

  componentWillUnmount() {
    // Nettoyer le timer lors de la destruction du composant
    if (this.state.cameraAnalysisTimer) {
      clearInterval(this.state.cameraAnalysisTimer);
    }
  }

  // Mettre à jour l'interface avec les résultats d'analyse de la caméra en temps réel
  updateFromCameraAnalysis() {
    const results = getAnalysisResults();
    if (results.faceShape && results.recommendations && results.recommendations.length > 0) {
      // Mettre à jour les recommandations uniquement si elles ont changé
      if (JSON.stringify(results.recommendations) !== JSON.stringify(this.state.recommendedGlassesIds)) {
        this.setState({
          analysisResult: results.faceShape,
          recommendedGlassesIds: results.recommendations,
          error: null
        });
      }
    }
  }

  // Extraire les catégories uniques
  getUniqueCategories = () => {
    const allCategories = ALL_GLASSES_MODELS.map(model => model.category);
    return ['Tous', ...new Set(allCategories)];
  }

  // Filtrer les modèles par catégorie
  filterModelsByCategory = (models, category) => {
    if (category === 'Tous') return models;
    return models.filter(model => model.category === category);
  }

  handleCategoryChange = (category) => {
    this.setState({ activeCategory: category });
  }

  handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      this.setState({ 
        selectedImage: file,
        error: null 
      });
    }
  }

  handleAnalyseClick() {
    const { selectedImage } = this.state;
    
    if (!selectedImage) {
      this.setState({ error: "Veuillez sélectionner une image avant l'analyse." });
      return;
    }

    this.setState({ 
      isLoadingAnalysis: true, 
      error: null, 
      analysisResult: null, 
      recommendedGlassesIds: [] 
    });

    analyzeAndRecommend(selectedImage)
      .then(data => {
        console.log("Résultat de l'analyse:", data);
        
        // Extraire les informations pertinentes
        const faceShape = data.analysis && data.analysis.detected_face_shape 
          ? data.analysis.detected_face_shape 
          : 'Forme non déterminée';
          
        const recommendedIds = data.recommendation && data.recommendation.recommended_glasses_ids 
          ? data.recommendation.recommended_glasses_ids 
          : [];
        
        // Mise à jour de l'état avec les données reçues
        this.setState({
          analysisResult: faceShape,
          recommendedGlassesIds: recommendedIds,
          isLoadingAnalysis: false,
          // Si un modèle recommandé est disponible, le sélectionner automatiquement
          currentDisplayModelId: recommendedIds.length > 0 ? recommendedIds[0] : this.state.currentDisplayModelId
        });
        
        // Si des recommandations sont disponibles, changer le modèle affiché
        if (recommendedIds.length > 0) {
          changeGlassesModel(recommendedIds[0]);
        }
      })
      .catch(error => {
        console.error("Erreur lors de l'analyse:", error);
        this.setState({ 
          error: `Erreur lors de l'analyse : ${error.message}`, 
          isLoadingAnalysis: false 
        });
      });
  }

  handleAnalyzeCamera() {
    this.setState({ 
      isAnalyzingCamera: true,
      isLoadingAnalysis: true,
      error: null,
      analysisResult: null,
      recommendedGlassesIds: []
    });

    // Récupérer les landmarks depuis le TryOn component
    const video = document.getElementById('tryon-video');
    if (!video) {
      this.setState({ 
        error: "La caméra n'est pas prête. Veuillez patienter.",
        isLoadingAnalysis: false,
        isAnalyzingCamera: false
      });
      return;
    }

    // Prendre une capture de l'image vidéo
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir le canvas en blob
    canvas.toBlob((blob) => {
      if (!blob) {
        this.setState({ 
          error: "Impossible de capturer l'image depuis la caméra.",
          isLoadingAnalysis: false,
          isAnalyzingCamera: false
        });
        return;
      }
      
      // Créer un fichier à partir du blob
      const imageFile = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      
      // Utiliser la même fonction que pour l'upload d'image
      analyzeAndRecommend(imageFile)
        .then(data => {
          console.log("Résultat de l'analyse par caméra:", data);
          
          // Extraire les informations pertinentes
          const faceShape = data.analysis && data.analysis.detected_face_shape 
            ? data.analysis.detected_face_shape 
            : 'Forme non déterminée';
            
          const recommendedIds = data.recommendation && data.recommendation.recommended_glasses_ids 
            ? data.recommendation.recommended_glasses_ids 
            : [];
          
          // Mise à jour de l'état avec les données reçues
          this.setState({
            analysisResult: faceShape,
            recommendedGlassesIds: recommendedIds,
            isLoadingAnalysis: false,
            isAnalyzingCamera: false,
            // Si un modèle recommandé est disponible, le sélectionner automatiquement
            currentDisplayModelId: recommendedIds.length > 0 ? recommendedIds[0] : this.state.currentDisplayModelId
          });
          
          // Si des recommandations sont disponibles, changer le modèle affiché
          if (recommendedIds.length > 0) {
            changeGlassesModel(recommendedIds[0]);
          }
        })
        .catch(error => {
          console.error("Erreur lors de l'analyse par caméra:", error);
          this.setState({ 
            error: `Erreur lors de l'analyse : ${error.message}`, 
            isLoadingAnalysis: false,
            isAnalyzingCamera: false
          });
        });
    }, 'image/jpeg', 0.9);
  }

  // Fonction appelée lorsqu'un bouton de lunettes est cliqué
  handleSelectGlasses(modelId) {
    if (modelId && modelId !== this.state.currentDisplayModelId) {
      console.log("Sélection des lunettes:", modelId);
      
      changeGlassesModel(modelId);
      
      this.setState({ currentDisplayModelId: modelId });
    }
  }

  renderGlassesButton = (model) => {
    const { currentDisplayModelId } = this.state;
    return (
      <button 
        key={model.id} 
        className={`button glasses-button ${model.id === currentDisplayModelId ? 'button--active' : ''}`}
        onClick={() => this.handleSelectGlasses(model.id)}
      >
        <span className="glasses-button__name">{model.name}</span>
        {model.category && (
          <span className="glasses-button__category">{model.category}</span>
        )}
      </button>
    );
  }

  renderCategoryTabs = () => {
    const { categories, activeCategory } = this.state;
    
    return (
      <div className="category-tabs">
        {categories.map(category => (
          <button
            key={category}
            className={`category-tab ${activeCategory === category ? 'category-tab--active' : ''}`}
            onClick={() => this.handleCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    );
  }

  render() {
    const { 
      analysisResult, 
      recommendedGlassesIds, 
      error, 
      isLoadingAnalysis,
      activeCategory,
      selectedImage,
      isAnalyzingCamera
    } = this.state;

    // Filtrer les lunettes par catégorie active
    const filteredModels = this.filterModelsByCategory(ALL_GLASSES_MODELS, activeCategory);

    // Trouver les objets complets des lunettes recommandées
    const recommendedGlassesObjects = ALL_GLASSES_MODELS.filter(model => 
        recommendedGlassesIds.includes(model.id)
    );

    // Afficher seulement 2 recommandations maximum
    const limitedRecommendations = recommendedGlassesObjects.slice(0, 2);

    return (
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">Optical Factory </h1>
          <p className="app-tagline">Essayez virtuellement nos lunettes pour trouver votre style parfait</p>
        </header>
        
        {/* Section Essai Virtuel */}
        <section className="tryon-section">
          <TryOn /> 
        </section>

        {/* Section Contrôles et Analyse */}
        <section className="controls-section">
          <h2 className="section-title">Analyser votre visage</h2>
          <p className="section-description">
            Analysez votre visage directement avec la caméra ou téléchargez une photo pour obtenir des recommandations personnalisées.
          </p>
          
          <div className="analysis-buttons">
            <button 
              className={`button button--primary ${isLoadingAnalysis && isAnalyzingCamera ? 'button--loading' : ''}`}
              onClick={this.handleAnalyzeCamera}
              disabled={isLoadingAnalysis}
            >
              {isLoadingAnalysis && isAnalyzingCamera ? (
                <span className="button__spinner"></span>
              ) : (
                'Analyser avec la caméra'
              )}
            </button>

            <div className="separator">ou</div>
            
            <div className="upload-container">
              <label className="file-upload">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={this.handleImageUpload}
                  className="file-input" 
                  disabled={isLoadingAnalysis}
                />
                <span className="upload-button">Sélectionner une photo</span>
              </label>
              {selectedImage && (
                <span className="selected-file">{selectedImage.name}</span>
              )}
            </div>
            
            {selectedImage && (
              <button 
                className={`button button--secondary button--fullwidth ${isLoadingAnalysis && !isAnalyzingCamera ? 'button--loading' : ''}`}
                onClick={this.handleAnalyseClick} 
                disabled={isLoadingAnalysis || !selectedImage}
              >
                {isLoadingAnalysis && !isAnalyzingCamera ? (
                  <span className="button__spinner"></span>
                ) : (
                  'Analyser la photo'
                )}
              </button>
            )}
          </div>
          
          {error && (
            <div className="alert alert--error">{error}</div>
          )}
          
          {analysisResult && !isLoadingAnalysis && (
             <div className="analysis-result">
               <h3 className="analysis-result__title">Résultat de l'analyse</h3>
               <p className="analysis-result__text">Forme de visage détectée : <strong>{analysisResult}</strong></p>
             </div>
          )}
        </section>

        {/* Section Recommandations */}
        {!isLoadingAnalysis && recommendedGlassesIds.length > 0 && (
          <section className="glasses-section recommendations-section">
            <h3 className="section-title">Recommandations personnalisées</h3>
            <p className="section-description">
              Ces 2 modèles sont sélectionnés spécifiquement pour la forme de votre visage.
            </p>
            
            <div className="glasses-grid">
              {limitedRecommendations.map(this.renderGlassesButton)}
            </div>
          </section>
        )}

        {/* Section Tous les Modèles */}
        <section className="glasses-section all-models-section">
          <h3 className="section-title">Tous nos modèles</h3>
          <p className="section-description">
            Explorez notre collection complète et trouvez le style qui vous correspond.
          </p>
          
          {this.renderCategoryTabs()}
          
          <div className="glasses-grid glasses-grid--all">
            {filteredModels.map(this.renderGlassesButton)}
          </div>
        </section>
        
        <footer className="app-footer">
          <p>© {new Date().getFullYear()} Optical Factory  - Application d'essayage virtuel de lunettes</p>
        </footer>
      </div>
    );
  }
}
