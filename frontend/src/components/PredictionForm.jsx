import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const emptyForm = {
  GENDER: 'M',
  AGE: 60,
  SMOKING: 'No',
  YELLOW_FINGERS: 'No',
  ANXIETY: 'No',
  PEER_PRESSURE: 'No',
  CHRONIC_DISEASE: 'No',
  FATIGUE: 'No',
  ALLERGY: 'No',
  WHEEZING: 'No',
  ALCOHOL_CONSUMING: 'No',
  COUGHING: 'No',
  SHORTNESS_OF_BREATH: 'No',
  SWALLOWING_DIFFICULTY: 'No',
  CHEST_PAIN: 'No',
  AGE_GROUP: 'Old'
};

export default function PredictionForm({ onSubmit, isLoading }) {
  const [formData, setFormData] = useState(emptyForm);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-compute AGE_GROUP based on AGE roughly as dataset does, 
    // or let user specify if we don't know exact binning. 
    // Let's do simple binning: <35 Young, 35-55 Middle, >55 Old if AGE changes
    if (name === 'AGE') {
      const ageNum = parseInt(value, 10);
      let group = 'Middle';
      if (ageNum < 40) group = 'Young';
      else if (ageNum > 55) group = 'Old';
      setFormData(prev => ({ ...prev, [name]: ageNum, AGE_GROUP: group }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderSelect = (label, name, options = ['No', 'Yes']) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select name={name} value={formData[name]} onChange={handleChange}>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-3">
        <div className="form-group">
          <label className="form-label">Age</label>
          <input 
            type="number" 
            name="AGE" 
            value={formData.AGE} 
            onChange={handleChange} 
            min="18" max="100" required 
          />
        </div>
        {renderSelect('Gender', 'GENDER', ['M', 'F'])}
        {renderSelect('Age Group', 'AGE_GROUP', ['Young', 'Middle', 'Old'])}
      </div>

      <h3 style={{ margin: '1rem 0', color: 'var(--text-muted)', fontSize: '1rem' }}>Symptoms & History</h3>
      
      <div className="grid grid-cols-2">
        {renderSelect('Smoking', 'SMOKING')}
        {renderSelect('Yellow Fingers', 'YELLOW_FINGERS')}
        {renderSelect('Anxiety', 'ANXIETY')}
        {renderSelect('Peer Pressure', 'PEER_PRESSURE')}
        {renderSelect('Chronic Disease', 'CHRONIC_DISEASE')}
        {renderSelect('Fatigue', 'FATIGUE')}
        {renderSelect('Allergy', 'ALLERGY')}
        {renderSelect('Wheezing', 'WHEEZING')}
        {renderSelect('Alcohol Consuming', 'ALCOHOL_CONSUMING')}
        {renderSelect('Coughing', 'COUGHING')}
        {renderSelect('Shortness of Breath', 'SHORTNESS_OF_BREATH')}
        {renderSelect('Swallowing Difficulty', 'SWALLOWING_DIFFICULTY')}
        {renderSelect('Chest Pain', 'CHEST_PAIN')}
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-outline" onClick={() => setFormData(emptyForm)} style={{ marginRight: '1rem' }}>
          Reset
        </button>
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
          {isLoading ? 'Analyzing...' : 'Analyze Risk'}
        </button>
      </div>
    </form>
  );
}
