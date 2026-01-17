import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow, tomorrowNight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeDisplay = ({ experiment, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!experiment || !experiment.parts) {
    return (
      <div className="glass-ui p-8 text-center">
        <p className="text-gray-400">Select an experiment to view its content</p>
      </div>
    );
  }

  const theme = isDarkMode ? tomorrowNight : tomorrow;

  return (
    <div className="glass-ui p-6">
      <h2 className="text-2xl font-bold text-cyberpunk-green mb-6">
        {experiment.title}
      </h2>

      {experiment.parts.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {experiment.parts.map((part, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === index
                  ? 'bg-cyberpunk-green text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {part.subtitle || `Part ${index + 1}`}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {experiment.parts.map((part, index) => (
          <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
            {part.subtitle && (
              <h3 className="text-xl font-semibold text-cyberpunk-green mb-4">
                {part.subtitle}
              </h3>
            )}

            {part.code && (
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-300 mb-3">Code:</h4>
                <div className="code-block">
                  <SyntaxHighlighter
                    language="c"
                    style={theme}
                    customStyle={{
                      margin: 0,
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      lineHeight: '1.5'
                    }}
                    showLineNumbers
                    wrapLines
                  >
                    {part.code}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}

            {part.output && (
              <div>
                <h4 className="text-lg font-medium text-gray-300 mb-3">Output:</h4>
                <div className="output-block">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {part.output}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {experiment.graphData && (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-300 mb-3">Graph Data:</h4>
          <div className="bg-gray-800 p-4 rounded-lg">
            <pre className="text-sm text-gray-300">
              {JSON.stringify(experiment.graphData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeDisplay;
