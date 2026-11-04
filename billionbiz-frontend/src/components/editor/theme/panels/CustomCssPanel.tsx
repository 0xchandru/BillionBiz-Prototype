import React, { useState, useRef, useEffect } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  FileCode,
  Zap
} from 'lucide-react';
import { useSiteStore } from '../../../../store/siteStore';

interface SnippetPreset {
  id: string;
  name: string;
  description: string;
  code: string;
  isIncluded: (css: string) => boolean;
}

const SNIPPET_PRESETS: SnippetPreset[] = [
  {
    id: 'scrollbar',
    name: 'Sleek Scrollbar',
    description: 'Modern slim scrollbar for all containers',
    code: `/* Sleek custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.04);
}
::-webkit-scrollbar-thumb {
  background: var(--theme-brand-primary, #2563eb);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  filter: brightness(0.85);
}`,
    isIncluded: (css: string) => css.includes('::-webkit-scrollbar')
  },
  {
    id: 'button-glow',
    name: 'Primary Button Glow',
    description: 'Subtle glowing box shadow for buttons',
    code: `/* Glowing effect on button hover */
.preview-theme-wrapper button:hover {
  box-shadow: 0 0 16px rgba(37, 99, 235, 0.4);
  transform: translateY(-1px);
  transition: all 0.2s ease;
}`,
    isIncluded: (css: string) => 
      css.includes('0 0 16px rgba(37, 99, 235, 0.4)') || 
      css.includes('Glowing effect on button hover')
  },
  {
    id: 'card-lift',
    name: 'Card Hover Lift',
    description: 'Smooth hover lift and shadow for cards',
    code: `/* Interactive card lift animation */
.preview-theme-wrapper [class*="Card"],
.preview-theme-wrapper [class*="card"] {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
}
.preview-theme-wrapper [class*="Card"]:hover,
.preview-theme-wrapper [class*="card"]:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -6px rgba(0, 0, 0, 0.12);
}`,
    isIncluded: (css: string) => 
      css.includes('[class*="Card"]:hover') || 
      css.includes('[class*="card"]:hover') || 
      css.includes('Interactive card lift animation')
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphic Header',
    description: 'Translucent frosted glass background',
    code: `/* Frosted glass header */
.preview-theme-wrapper header,
.preview-theme-wrapper [class*="Header"] {
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  background-color: rgba(255, 255, 255, 0.85) !important;
}`,
    isIncluded: (css: string) => 
      css.includes('backdrop-filter: blur(12px)') || 
      css.includes('Frosted glass header')
  },
  {
    id: 'typography-enhancement',
    name: 'Modern Heading Gradient',
    description: 'Subtle gradient fill for H1 & hero titles',
    code: `/* Gradient hero titles */
.preview-theme-wrapper h1 {
  background: linear-gradient(135deg, var(--theme-brand-primary, #2563eb), var(--theme-brand-secondary, #4f46e5));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-block;
}`,
    isIncluded: (css: string) => 
      css.includes('-webkit-background-clip: text') || 
      css.includes('Gradient hero titles')
  }
];

const THEME_TOKENS = [
  { label: 'Primary Brand', varName: 'var(--theme-brand-primary)' },
  { label: 'Secondary Brand', varName: 'var(--theme-brand-secondary)' },
  { label: 'Accent Color', varName: 'var(--theme-brand-accent)' },
  { label: 'Background', varName: 'var(--theme-bg-background)' },
  { label: 'Surface Card', varName: 'var(--theme-bg-surface)' },
  { label: 'Heading Text', varName: 'var(--theme-text-heading)' },
  { label: 'Body Text', varName: 'var(--theme-text-body)' },
  { label: 'Muted Text', varName: 'var(--theme-text-muted)' },
  { label: 'Border Color', varName: 'var(--theme-border-border)' },
  { label: 'Border Radius', varName: 'var(--theme-radius)' },
  { label: 'Shadow Effect', varName: 'var(--theme-shadow)' },
];

export const CustomCssPanel: React.FC = () => {
  const { theme, updateTheme } = useSiteStore();
  const [copied, setCopied] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [showSnippets, setShowSnippets] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const customCss = theme?.customCss || '';

  // Calculate lines for line-number gutter
  const lineCount = Math.max(customCss.split('\n').length, 16);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  // Synchronize gutter scroll with textarea
  const handleScroll = () => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [customCss]);

  // Simple validation checks
  const hasStyleTags = /<\/?style[^>]*>/i.test(customCss);
  const openBraces = (customCss.match(/\{/g) || []).length;
  const closeBraces = (customCss.match(/\}/g) || []).length;
  const isUnbalancedBraces = openBraces !== closeBraces;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateTheme({ customCss: e.target.value });
  };

  // Allow Tab key to indent with 2 spaces instead of losing focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = customCss.substring(0, start) + '  ' + customCss.substring(end);

      updateTheme({ customCss: newValue });

      // Restore cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleCopy = () => {
    if (!customCss) return;
    navigator.clipboard.writeText(customCss);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const insertAtCursor = (textToInsert: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      updateTheme({ customCss: (customCss ? customCss + '\n\n' : '') + textToInsert });
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = customCss.substring(0, start);
    const after = customCss.substring(end);

    // If inserting a whole block snippet and we aren't on a clean new line
    const separator = before.length > 0 && !before.endsWith('\n') ? '\n\n' : '';
    const updated = before + separator + textToInsert + after;

    updateTheme({ customCss: updated });

    setTimeout(() => {
      textarea.focus();
      const newPos = start + separator.length + textToInsert.length;
      textarea.selectionStart = textarea.selectionEnd = newPos;
    }, 0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <style>{`
        .custom-css-editor-textarea::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-css-editor-textarea::-webkit-scrollbar-track {
          background: #090d16;
        }
        .custom-css-editor-textarea::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 4px;
        }
        .custom-css-editor-textarea::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>

      {/* Information Header */}
      <div style={{
        padding: '12px 14px',
        borderRadius: '10px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Code2 size={16} color="var(--primary, #2563eb)" />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1e293b' }}>
              Custom CSS Overrides
            </span>
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '10px',
            fontWeight: 600,
            color: '#15803d',
            backgroundColor: '#dcfce7',
            padding: '2px 7px',
            borderRadius: '10px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }} />
            Live Preview
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b', lineHeight: 1.45 }}>
          Write custom CSS rules to customize section styles or override theme defaults. Changes update the preview canvas in real time.
        </p>
      </div>

      {/* Editor Container */}
      <div style={{
        border: '1px solid #1e293b',
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: '#0f172a',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.12)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Code Editor Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#1e293b',
          borderBottom: '1px solid #334155',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#eab308' }} />
              <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
            </div>
            <span style={{ 
              fontSize: '11px', 
              color: '#94a3b8', 
              fontFamily: 'monospace', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              paddingLeft: '6px'
            }}>
              <FileCode size={13} color="#38bdf8" /> custom.css
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace' }}>
              {customCss.length > 0 ? `${customCss.split('\n').length} lines · ${customCss.length} chars` : '0 lines'}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!customCss}
              title="Copy CSS to clipboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '5px',
                border: '1px solid #334155',
                backgroundColor: '#0f172a',
                color: copied ? '#22c55e' : '#cbd5e1',
                fontSize: '11px',
                cursor: customCss ? 'pointer' : 'not-allowed',
                opacity: customCss ? 1 : 0.5,
                transition: 'all 0.15s ease',
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Code Editor Body with Single Scrollbar on Textarea */}
        <div style={{
          display: 'flex',
          position: 'relative',
          height: '320px',
          overflow: 'hidden',
          backgroundColor: '#0f172a',
        }}>
          {/* Line Numbers Gutter */}
          <div 
            ref={gutterRef}
            style={{
              width: '38px',
              height: '100%',
              overflow: 'hidden',
              padding: '12px 6px',
              textAlign: 'right',
              userSelect: 'none',
              color: '#475569',
              fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
              fontSize: '12px',
              lineHeight: '20px',
              backgroundColor: '#090d16',
              borderRight: '1px solid #1e293b',
              flexShrink: 0,
              boxSizing: 'border-box',
            }}
          >
            {lineNumbers.map((num) => (
              <div key={num} style={{ height: '20px', lineHeight: '20px' }}>{num}</div>
            ))}
          </div>

          {/* Code Textarea with the single unified scrollbar */}
          <textarea
            ref={textareaRef}
            className="custom-css-editor-textarea"
            value={customCss}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            placeholder={`/* Add custom CSS rules here */\n\n.preview-theme-wrapper {\n  /* Custom styling */\n}\n\nbutton.primary-btn {\n  /* Override styles */\n}`}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            style={{
              flex: 1,
              height: '100%',
              padding: '12px',
              border: 'none',
              outline: 'none',
              resize: 'none',
              backgroundColor: 'transparent',
              color: '#e2e8f0',
              fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
              fontSize: '12px',
              lineHeight: '20px',
              whiteSpace: 'pre',
              overflowY: 'auto',
              overflowX: 'auto',
              tabSize: 2,
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Syntax Warnings / Guidance */}
      {hasStyleTags && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#b91c1c',
          fontSize: '11.5px',
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>Write pure CSS syntax only. Do not enclose rules within <code>&lt;style&gt;</code> tags.</span>
        </div>
      )}

      {isUnbalancedBraces && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: '#fffbeb',
          border: '1px solid #fef3c7',
          color: '#b45309',
          fontSize: '11.5px',
        }}>
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>Notice: Unmatched curly braces (<code>&#123;</code> vs <code>&#125;</code>) detected.</span>
        </div>
      )}

      {/* Snippets & Templates Section */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}>
        <button
          type="button"
          onClick={() => setShowSnippets(!showSnippets)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            backgroundColor: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={14} color="#eab308" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
              Quick Snippet Presets
            </span>
          </div>
          {showSnippets ? <ChevronUp size={15} color="#64748b" /> : <ChevronDown size={15} color="#64748b" />}
        </button>

        {showSnippets && (
          <div style={{
            padding: '10px 14px 14px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backgroundColor: '#f8fafc',
          }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Click any preset to append its CSS. Inserted presets are disabled until removed from the input:
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {SNIPPET_PRESETS.map((preset) => {
                const isInserted = preset.isIncluded(customCss) || (customCss.trim().length > 0 && customCss.includes(preset.code.trim()));

                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={isInserted}
                    onClick={() => {
                      if (!isInserted) {
                        insertAtCursor(preset.code);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: isInserted ? '#f8fafc' : '#ffffff',
                      border: isInserted ? '1px solid #e2e8f0' : '1px solid #e2e8f0',
                      cursor: isInserted ? 'not-allowed' : 'pointer',
                      opacity: isInserted ? 0.65 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isInserted) {
                        e.currentTarget.style.borderColor = '#93c5fd';
                        e.currentTarget.style.backgroundColor = '#eff6ff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isInserted) {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }
                    }}
                  >
                    <div style={{ paddingRight: '8px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 600, color: isInserted ? '#64748b' : '#1e293b' }}>
                        {preset.name}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                        {preset.description}
                      </div>
                    </div>
                    {isInserted ? (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: '#15803d',
                        backgroundColor: '#dcfce7',
                        border: '1px solid #bbf7d0',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        flexShrink: 0,
                      }}>
                        <Check size={11} /> Inserted
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '10.5px',
                        fontWeight: 600,
                        color: '#2563eb',
                        backgroundColor: '#dbeafe',
                        border: '1px solid #bfdbfe',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        flexShrink: 0,
                      }}>
                        + Insert
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Theme Variables Reference Drawer */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}>
        <button
          type="button"
          onClick={() => setShowTokens(!showTokens)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            backgroundColor: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={14} color="#6366f1" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
              Theme CSS Variables
            </span>
          </div>
          {showTokens ? <ChevronUp size={15} color="#64748b" /> : <ChevronDown size={15} color="#64748b" />}
        </button>

        {showTokens && (
          <div style={{
            padding: '10px 14px 14px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backgroundColor: '#f8fafc',
          }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Click any variable to insert it at your cursor:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {THEME_TOKENS.map((token) => (
                <button
                  key={token.varName}
                  type="button"
                  onClick={() => insertAtCursor(token.varName)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.color = '#1d4ed8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#cbd5e1';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  <span>{token.varName}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
