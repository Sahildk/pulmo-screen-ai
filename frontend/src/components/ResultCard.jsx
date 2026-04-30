import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export default function ResultCard({ result, onReset }) {
  const [progress, setProgress] = useState(0);

  const isHighRisk = result.prediction === 'YES';
  const prob = result.probability !== null ? (result.probability * 100).toFixed(1) : (isHighRisk ? '95.0' : '5.0');
  
  useEffect(() => {
    // Animate progress bar
    setTimeout(() => {
      setProgress(prob);
    }, 100);
  }, [prob]);

  return (
    <div className="result-card animate-fade-in">
      <div className={`result-icon-wrapper ${isHighRisk ? 'result-high' : 'result-low'}`}>
        {isHighRisk ? <AlertCircle size={40} /> : <CheckCircle2 size={40} />}
      </div>
      
      <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: isHighRisk ? 'var(--warning-red)' : 'var(--accent-teal)' }}>
        {isHighRisk ? 'High Risk' : 'Low Risk'}
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Based on our AI analysis of the provided patient data.
      </p>

      <div style={{ width: '100%', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>Risk Probability</span>
          <span style={{ fontWeight: 'bold' }}>{prob}%</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ 
              width: `${progress}%`, 
              backgroundColor: isHighRisk ? 'var(--warning-red)' : 'var(--accent-teal)' 
            }}
          />
        </div>
      </div>

      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'left', marginBottom: '2rem' }}>
        <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-light)' }}>Recommendation</h4>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isHighRisk 
            ? 'Immediate consultation with a pulmonologist is recommended. The patient exhibits significant risk factors associated with lung cancer.' 
            : 'Patient currently shows low risk factors. Routine screening and maintaining a healthy lifestyle is advised.'}
        </p>
      </div>

      <button onClick={onReset} className="btn btn-outline" style={{ width: '100%' }}>
        <RotateCcw size={18} /> New Assessment
      </button>
    </div>
  );
}
