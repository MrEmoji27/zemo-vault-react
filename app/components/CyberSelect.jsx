import { useState, useRef, useEffect, useId } from 'react';

const CyberSelect = ({ label, value, onChange, options = [], disabled = false, placeholder = 'Select...' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const ref = useRef(null);
  const listboxId = useId();
  const labelId = useId();

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close when disabled changes
  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  // Reset focused index when opening
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex(o => o.value === value);
      setFocusedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen]);

  const selectedLabel = options.find(o => o.value === value)?.label || '';

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && focusedIndex < options.length) {
          onChange(options[focusedIndex].value);
          setIsOpen(false);
        } else {
          setIsOpen(!isOpen);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setFocusedIndex(prev => Math.min(prev + 1, options.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex(prev => Math.max(prev - 1, 0));
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Home':
        if (isOpen) { e.preventDefault(); setFocusedIndex(0); }
        break;
      case 'End':
        if (isOpen) { e.preventDefault(); setFocusedIndex(options.length - 1); }
        break;
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && (
        <label
          id={labelId}
          style={{
            color: 'var(--color-accent-green)',
            marginBottom: '0.5rem',
            display: 'block',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontFamily: "'Roboto Mono', monospace",
          }}
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-labelledby={label ? labelId : undefined}
        aria-activedescendant={isOpen && focusedIndex >= 0 ? `${listboxId}-opt-${focusedIndex}` : undefined}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          background: disabled ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.6)',
          border: `1px solid ${isOpen ? 'rgba(0, 255, 140, 0.5)' : disabled ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 255, 140, 0.2)'}`,
          borderRadius: '8px',
          color: value ? 'var(--color-text-primary)' : 'rgba(255, 255, 255, 0.35)',
          fontSize: '0.9rem',
          fontFamily: "'Roboto Mono', monospace",
          textAlign: 'left',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.4 : 1,
          transition: 'all 0.25s ease',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: isOpen ? '0 0 15px rgba(0, 255, 140, 0.1), inset 0 0 15px rgba(0, 255, 140, 0.03)' : 'none',
        }}
      >
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1,
        }}>
          {selectedLabel || placeholder}
        </span>

        {/* Chevron */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          style={{
            marginLeft: '0.5rem',
            flexShrink: 0,
            transition: 'transform 0.25s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <path d="M3 5.5L7 9.5L11 5.5" stroke="rgba(0, 255, 140, 0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Dropdown */}
      <div
        role="listbox"
        id={listboxId}
        aria-labelledby={label ? labelId : undefined}
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          background: 'rgba(5, 5, 10, 0.95)',
          border: '1px solid rgba(0, 255, 140, 0.25)',
          borderRadius: '8px',
          backdropFilter: 'blur(20px)',
          zIndex: 100,
          maxHeight: isOpen ? '220px' : '0px',
          overflow: 'hidden',
          opacity: isOpen ? 1 : 0,
          transition: 'max-height 0.3s ease, opacity 0.2s ease',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 255, 140, 0.05)',
        }}
      >
        <div style={{ overflowY: 'auto', maxHeight: '220px', padding: '4px' }}>
          {options.map((opt, idx) => {
            const isFocused = isOpen && focusedIndex === idx;
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                id={`${listboxId}-opt-${idx}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.85rem',
                  fontFamily: "'Roboto Mono', monospace",
                  color: isSelected ? '#00ff8c' : 'rgba(255, 255, 255, 0.7)',
                  background: isFocused ? 'rgba(0, 255, 140, 0.1)' : isSelected ? 'rgba(0, 255, 140, 0.08)' : 'transparent',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderLeft: isSelected ? '2px solid #00ff8c' : '2px solid transparent',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  outline: isFocused ? '1px solid rgba(0, 255, 140, 0.4)' : 'none',
                }}
                onMouseEnter={(e) => {
                  setFocusedIndex(idx);
                  if (!isSelected) {
                    e.currentTarget.style.background = 'rgba(0, 255, 140, 0.05)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  }
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CyberSelect;
