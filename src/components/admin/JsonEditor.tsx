'use client';

import { useState, useEffect } from 'react';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export default function JsonEditor({ 
  value, 
  onChange, 
  placeholder = '[]',
  height = '400px'
}: JsonEditorProps) {
  const [jsonValue, setJsonValue] = useState(value || '[]');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setJsonValue(value || '[]');
  }, [value]);

  const handleChange = (newValue: string) => {
    setJsonValue(newValue);
    setError(null);
    
    // Validate JSON
    try {
      const parsed = JSON.parse(newValue);
      setIsValid(true);
      onChange(newValue);
    } catch (e: any) {
      setIsValid(false);
      setError(e.message || 'Invalid JSON');
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonValue(formatted);
      setIsValid(true);
      setError(null);
      onChange(formatted);
    } catch (e: any) {
      setError('Cannot format invalid JSON');
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      const minified = JSON.stringify(parsed);
      setJsonValue(minified);
      setIsValid(true);
      setError(null);
      onChange(minified);
    } catch (e: any) {
      setError('Cannot minify invalid JSON');
    }
  };

  return (
    <div>
      <div style={{ 
        border: `2px solid ${isValid ? '#ddd' : '#dc3545'}`,
        borderRadius: '4px',
        position: 'relative'
      }}>
        <div style={{ 
          padding: '8px 12px', 
          background: '#f8f9fa', 
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#666' }}>
            JSON Editor {isValid ? '✓' : '✗'}
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={formatJson}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                background: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Format
            </button>
            <button
              type="button"
              onClick={minifyJson}
              style={{
                padding: '4px 12px',
                fontSize: '12px',
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Minify
            </button>
          </div>
        </div>
        <textarea
          value={jsonValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: height,
            padding: '12px',
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: '13px',
            lineHeight: '1.5',
            border: 'none',
            outline: 'none',
            resize: 'vertical',
            background: isValid ? '#fff' : '#fff5f5'
          }}
          spellCheck={false}
        />
      </div>
      {error && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          background: '#f8d7da',
          color: '#721c24',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      <div style={{ marginTop: '12px' }}>
        <details style={{ marginBottom: '8px' }}>
          <summary style={{ cursor: 'pointer', color: '#007bff', fontSize: '13px', fontWeight: '600' }}>
            📋 Click to see JSON structure examples
          </summary>
          <div style={{ 
            marginTop: '12px', 
            padding: '12px', 
            background: '#f8f9fa', 
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            overflow: 'auto'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <strong>Features Section:</strong>
              <pre style={{ margin: '8px 0', padding: '8px', background: '#fff', borderRadius: '4px' }}>
{`{
  "type": "features",
  "title": "Key Compliance Areas",
  "items": [
    {
      "title": "HIPAA Compliance",
      "description": "Fully compliant with HIPAA regulations",
      "icon": "icon-18"
    }
  ]
}`}
              </pre>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Stats Section:</strong>
              <pre style={{ margin: '8px 0', padding: '8px', background: '#fff', borderRadius: '4px' }}>
{`{
  "type": "stats",
  "items": [
    {
      "label": "Years of Compliance",
      "value": "15",
      "suffix": "+",
      "icon": "icon-37"
    }
  ]
}`}
              </pre>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <strong>Form Section:</strong>
              <pre style={{ margin: '8px 0', padding: '8px', background: '#fff', borderRadius: '4px' }}>
{`{
  "type": "form",
  "title": "Contact Us",
  "description": "Fill out the form below"
}`}
              </pre>
            </div>
          </div>
        </details>
        <small className="text-muted" style={{ display: 'block', fontSize: '12px' }}>
          Enter a valid JSON array. Use <strong>Format</strong> button to beautify or <strong>Minify</strong> to compress. 
          Leave empty array <code>[]</code> if no sections needed.
        </small>
      </div>
    </div>
  );
}
