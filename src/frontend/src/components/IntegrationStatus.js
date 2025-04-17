import React, { useState, useEffect } from 'react';
import { checkHealth } from '../api/apiService';

const IntegrationStatus = () => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Vérification de la connexion au backend...');
  const [isVercel, setIsVercel] = useState(false);

  useEffect(() => {
    // Vérifier si nous sommes sur Vercel
    const checkVercel = window.location.hostname.includes('vercel.app');
    setIsVercel(checkVercel);

    const checkBackendStatus = async () => {
      try {
        // Utiliser la fonction checkHealth du service API qui gère aussi les mockups
        const healthData = await checkHealth();
        
        if (healthData.status === 'ok') {
          if (checkVercel) {
            setStatus('warning');
            setMessage('Mode démo activé : utilisation de données simulées.');
          } else {
            setStatus('success');
            setMessage('Backend connecté et opérationnel! Les modèles sont chargés.');
          }
        } else {
          setStatus('warning');
          setMessage(`Backend connecté mais avec des avertissements: ${healthData.detail || 'Modèles non chargés'}`);
        }
      } catch (error) {
        if (checkVercel) {
          setStatus('warning');
          setMessage('Mode démo activé : utilisation de données simulées.');
        } else {
          setStatus('error');
          setMessage(`Impossible de se connecter au backend: ${error.message}`);
        }
      }
    };

    checkBackendStatus();
  }, []);

  const getStatusStyle = () => {
    switch (status) {
      case 'checking':
        return { backgroundColor: '#f0f0f0', borderColor: '#ccc' };
      case 'success':
        return { backgroundColor: '#e7f5e7', borderColor: '#28a745' };
      case 'warning':
        return { backgroundColor: '#fff3cd', borderColor: '#ffc107' };
      case 'error':
        return { backgroundColor: '#f8d7da', borderColor: '#dc3545' };
      default:
        return { backgroundColor: '#f0f0f0', borderColor: '#ccc' };
    }
  };

  return (
    <div style={{
      padding: '10px 15px',
      marginBottom: '20px',
      borderLeft: '4px solid',
      borderRadius: '4px',
      ...getStatusStyle()
    }}>
      <h5 style={{ marginTop: '0', fontWeight: '600' }}>
        {status === 'checking' ? 'Vérification...' : 
         status === 'success' ? 'Connecté' :
         status === 'warning' ? 'Mode limité' : 'Erreur de connexion'}
      </h5>
      <p style={{ margin: '0' }}>{message}</p>
      {isVercel && (
        <p style={{ marginTop: '8px', fontSize: '0.9em' }}>
          <strong>Note:</strong> Cette version déployée utilise des données simulées pour la démonstration.
          {status === 'warning' && ' Toutes les fonctionnalités ne sont pas disponibles.'}
        </p>
      )}
    </div>
  );
};

export default IntegrationStatus; 