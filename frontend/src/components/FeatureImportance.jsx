import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function FeatureImportance() {
  const [features, setFeatures] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/feature-importance')
      .then(res => res.json())
      .then(data => {
        // Convert to array
        const arr = Object.keys(data).map(key => ({
          name: key,
          importance: parseFloat((data[key] * 100).toFixed(2))
        }));
        setFeatures(arr);
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

  if (!features || features.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
        Feature importance is not available for the best performing model.
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        This chart displays the relative importance of each feature in predicting lung cancer risk according to the trained AI model. Higher percentage means the factor strongly influences the prediction outcome.
      </p>

      <div style={{ height: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={features}
            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" stroke="var(--text-muted)" tick={{ fontSize: 12 }} domain={[0, 'dataMax']} />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="var(--text-muted)" 
              tick={{ fontSize: 11 }} 
              width={140}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }} 
              contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              formatter={(value) => [`${value}%`, 'Importance']}
            />
            <Bar dataKey="importance" fill="var(--accent-teal)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
