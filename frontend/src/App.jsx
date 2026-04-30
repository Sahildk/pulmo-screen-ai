import React, { useState } from 'react';
import { Activity, Stethoscope, BarChart3, Info } from 'lucide-react';
import PredictionForm from './components/PredictionForm';
import MetricsDashboard from './components/MetricsDashboard';
import FeatureImportance from './components/FeatureImportance';
import ResultCard from './components/ResultCard';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('predict');
  const [predictionResult, setPredictionResult] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  const handlePredict = async (formData) => {
    setIsPredicting(true);
    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok && !data.error) {
        setPredictionResult(data);
      } else {
        alert('Error: ' + (data.error || 'Failed to analyze risk.'));
      }
    } catch (error) {
      console.error('Prediction failed:', error);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Navbar component inline for simplicity or we can separate it */}
      <nav className="navbar animate-fade-in">
        <div className="nav-logo">
          <Activity className="nav-icon" size={32} />
          PulmoScreen AI
        </div>
        <div className="nav-links">
          <button 
            className={`nav-link ${activeTab === 'predict' ? 'active' : ''}`}
            onClick={() => setActiveTab('predict')}
          >
            <Stethoscope size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }}/> 
            Diagnosis
          </button>
          <button 
            className={`nav-link ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            <BarChart3 size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }}/> 
            Model Metrics
          </button>
          <button 
            className={`nav-link ${activeTab === 'features' ? 'active' : ''}`}
            onClick={() => setActiveTab('features')}
          >
            <Info size={18} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }}/> 
            Risk Factors
          </button>
        </div>
      </nav>

      <main className="animate-fade-in delay-100">
        {activeTab === 'predict' && (
          <div className="grid grid-cols-2" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)' }}>
            <div className="glass-card">
              <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-teal)' }}>Patient Assessment Form</h2>
              <PredictionForm onSubmit={handlePredict} isLoading={isPredicting} />
            </div>
            <div className="glass-card result-container">
              {predictionResult ? (
                <ResultCard result={predictionResult} onReset={() => setPredictionResult(null)} />
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                  <Stethoscope size={64} style={{ marginBottom: '1rem' }} />
                  <p>Awaiting patient data...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="glass-card">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-teal)' }}>Model Performance Validation</h2>
            <MetricsDashboard />
          </div>
        )}

        {activeTab === 'features' && (
          <div className="glass-card">
            <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-teal)' }}>Key Risk Factor Analysis</h2>
            <FeatureImportance />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
