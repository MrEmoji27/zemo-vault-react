import React from 'react';

const Selector = ({ selectedYear, selectedSubject, selectedExperiment, onYearChange, onSubjectChange, onExperimentChange, labData }) => {
  const years = Object.keys(labData);
  const subjects = selectedYear ? Object.keys(labData[selectedYear]) : [];
  const experiments = selectedYear && selectedSubject ? Object.keys(labData[selectedYear][selectedSubject]) : [];

  return (
    <div className="glass-ui p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="year-select" className="block mb-2 text-sm font-medium text-cyberpunk-green">
            Academic Year
          </label>
          <select 
            id="year-select" 
            className="w-full p-3 bg-transparent border border-gray-600 rounded-lg focus:ring-cyberpunk-green focus:border-cyberpunk-green transition"
            value={selectedYear}
            onChange={(e) => {
              onYearChange(e.target.value);
              onSubjectChange('');
              onExperimentChange('');
            }}
          >
            <option value="">Select Year</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subject-select" className="block mb-2 text-sm font-medium text-cyberpunk-green">
            Subject
          </label>
          <select 
            id="subject-select" 
            className="w-full p-3 bg-transparent border border-gray-600 rounded-lg focus:ring-cyberpunk-green focus:border-cyberpunk-green transition"
            value={selectedSubject}
            onChange={(e) => {
              onSubjectChange(e.target.value);
              onExperimentChange('');
            }}
            disabled={!selectedYear}
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="experiment-select" className="block mb-2 text-sm font-medium text-cyberpunk-green">
            Experiment
          </label>
          <select 
            id="experiment-select" 
            className="w-full p-3 bg-transparent border border-gray-600 rounded-lg focus:ring-cyberpunk-green focus:border-cyberpunk-green transition"
            value={selectedExperiment}
            onChange={(e) => onExperimentChange(e.target.value)}
            disabled={!selectedSubject}
          >
            <option value="">Select Experiment</option>
            {experiments.map(exp => (
              <option key={exp} value={exp}>
                {labData[selectedYear]?.[selectedSubject]?.[exp]?.title || exp}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Selector;
