import React, { useState, useEffect } from 'react';

const IntegrationStatus = () => {
  const [status, setStatus] = useState('checking');
  const [message, setMessage] = useState('Vérification de la connexion au backend...');

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/health`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ok') {
            setStatus('success');
            setMessage('Backend connecté et opérationnel! Les modèles sont chargés.');
          } else {
            setStatus('warning');
            setMessage(`Backend connecté mais avec des avertissements: ${data.detail || 'Modèles non chargés'}`);
          }
        } else {
          setStatus('error');
          setMessage('Le backend est accessible mais répond avec une erreur.');
        }
      } catch (error) {
        setStatus('error');
        setMessage(`Impossible de se connecter au backend: ${error.message}`);
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
    <div 
      style={{
        padding: '10px 15px',
        borderRadius: '5px',
        border: '1px solid',
        marginBottom: '20px',
        fontSize: '14px',
        ...getStatusStyle()
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            display: 'inline-block',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            marginRight: '10px',
            backgroundColor: 
              status === 'success' ? '#28a745' : 
              status === 'warning' ? '#ffc107' :
              status === 'error' ? '#dc3545' : '#ccc'
          }}
        />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default IntegrationStatus; 