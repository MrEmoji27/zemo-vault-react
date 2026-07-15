import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import SpotlightCard from './SpotlightCard';

const LANG_MAP = {
  'python': 'python',
  'c': 'c',
  'c/cpp': 'cpp',
  'cpp': 'cpp',
  'javascript': 'javascript',
  'java': 'java',
  'bash': 'bash',
  'text': 'text',
};

function getPrismLanguage(language) {
  return LANG_MAP[language?.toLowerCase()] || 'text';
}

export default function ExperimentViewer({ experiment, selectedSubject }) {
  if (!experiment) return null;

  return (
    <SpotlightCard
      className="glass-panel-enhanced no-corner-accent"
      spotlightColor="rgba(0, 255, 140, 0.07)"
      style={{
        margin: '1.5rem auto',
        maxWidth: '1200px',
        padding: '1.5rem',
        border: '1px solid rgba(0, 255, 140, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(0, 255, 140, 0.03)',
      }}
    >
      <h2
        className="arcade-title"
        style={{ color: 'var(--color-accent-green)', textAlign: 'center', marginBottom: '1.5rem' }}
      >
        {experiment.title}
      </h2>

      {experiment.parts?.map((part, index) => (
        <div key={index} className="mb-4">
          {part.subtitle && (
            <h3 style={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: '1rem',
              color: 'rgba(255,255,255,0.75)',
              marginBottom: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}>
              {part.subtitle}
            </h3>
          )}

          {part.code && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="code-header-cyber">
                <h4 className="code-title-cyber">Code:</h4>
                <button
                  className="copy-btn-cyber"
                  onClick={() => {
                    let textToCopy = part.code;
                    if (selectedSubject === 'ML') {
                      textToCopy = textToCopy
                        .split(/\r?\n/)
                        .filter(line => !line.trim().startsWith('#'))
                        .join('\n');
                    }
                    navigator.clipboard.writeText(textToCopy);
                  }}
                >
                  Copy
                </button>
              </div>
              <SyntaxHighlighter
                language={getPrismLanguage(part.language)}
                style={oneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: 'var(--radius-lg)',
                  background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.85) 0%, rgba(15, 15, 20, 0.9) 100%)',
                  border: '1px solid rgba(0, 255, 140, 0.15)',
                  fontSize: '0.9rem',
                  lineHeight: '1.7',
                }}
                codeTagProps={{ style: { fontFamily: "'Fira Code', monospace" } }}
                showLineNumbers
                wrapLines
              >
                {part.code}
              </SyntaxHighlighter>
            </div>
          )}

          {part.explanation && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="code-title-cyber" style={{ marginBottom: '0.75rem' }}>Explanation:</div>
              <div className="terminal-output">
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                  <code>{part.explanation}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      ))}
    </SpotlightCard>
  );
}
