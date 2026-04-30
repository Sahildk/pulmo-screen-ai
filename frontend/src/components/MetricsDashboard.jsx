import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/comparison')
      .then(res => res.json())
      .then(data => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Loader2 className="animate-spin" size={32} /></div>;
  }

  if (!metrics) {
    return <p>Failed to load metrics. Is the backend running?</p>;
  }

  // Find best model by F1
  let bestModel = '';
  let maxF1 = -1;
  Object.keys(metrics).forEach(model => {
    if (metrics[model].f1 > maxF1) {
      maxF1 = metrics[model].f1;
      bestModel = model;
    }
  });

  const chartData = Object.keys(metrics).map(model => ({
    name: model,
    Accuracy: (metrics[model].accuracy * 100).toFixed(1),
    F1: (metrics[model].f1 * 100).toFixed(1),
  }));

  // Confusion matrix for best model
  const cm = metrics[bestModel].confusion_matrix;

  return (
    <div>
      <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Model Comparison</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="metrics-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Accuracy</th>
                  <th>Precision</th>
                  <th>Recall</th>
                  <th>F1 Score</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(metrics).map(model => (
                  <tr key={model} className={model === bestModel ? 'highlight-row' : ''}>
                    <td>{model}{model === bestModel && ' (Best)'}</td>
                    <td>{(metrics[model].accuracy * 100).toFixed(1)}%</td>
                    <td>{(metrics[model].precision * 100).toFixed(1)}%</td>
                    <td>{(metrics[model].recall * 100).toFixed(1)}%</td>
                    <td>{(metrics[model].f1 * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Accuracy vs F1 Score</h3>
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
                <YAxis stroke="var(--text-muted)" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="Accuracy" fill="var(--accent-teal)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="F1" fill="var(--warning-red)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem', color: 'var(--text-light)' }}>Confusion Matrix ({bestModel})</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 100px 100px', gap: '8px', textAlign: 'center' }}>
              <div></div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pred NO</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pred YES</div>
              
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>Actual NO</div>
              <div style={{ background: 'rgba(0, 212, 170, 0.2)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--accent-teal)', fontWeight: 'bold' }}>
                {cm[0][0]} <br/><span style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>True Neg</span>
              </div>
              <div style={{ background: 'rgba(255, 75, 75, 0.2)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--warning-red)' }}>
                {cm[0][1]} <br/><span style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>False Pos</span>
              </div>

              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>Actual YES</div>
              <div style={{ background: 'rgba(255, 75, 75, 0.2)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--warning-red)' }}>
                {cm[1][0]} <br/><span style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>False Neg</span>
              </div>
              <div style={{ background: 'rgba(0, 212, 170, 0.2)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--accent-teal)', fontWeight: 'bold' }}>
                {cm[1][1]} <br/><span style={{ fontSize: '0.7rem', fontWeight: 'normal', opacity: 0.8 }}>True Pos</span>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>The confusion matrix shows how well the <strong>{bestModel}</strong> model predicted the test data.</p>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.8' }}>
              <li><strong>True Positives:</strong> High risk individuals correctly identified.</li>
              <li><strong>True Negatives:</strong> Low risk individuals correctly identified.</li>
              <li><strong>False Positives:</strong> Low risk individuals incorrectly flagged as high risk (cautionary alert).</li>
              <li><strong>False Negatives:</strong> High risk individuals missed by the model (critical error). The model is optimized to minimize this.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
