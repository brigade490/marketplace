'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'karobarrr_language';

const languages = [
  { code: 'en', native: 'English',   label: 'English'  },
  { code: 'hi', native: 'हिन्दी',      label: 'Hindi'    },
  { code: 'mr', native: 'मराठी',       label: 'Marathi'  },
  { code: 'gu', native: 'ગુજરાતી',     label: 'Gujarati' },
  { code: 'ta', native: 'தமிழ்',       label: 'Tamil'    },
  { code: 'te', native: 'తెలుగు',      label: 'Telugu'   },
  { code: 'bn', native: 'বাংলা',        label: 'Bengali'  },
  { code: 'kn', native: 'ಕನ್ನಡ',       label: 'Kannada'  },
];

export default function LanguagePopup() {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState('en');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setShow(true);
    else setSelected(stored);
  }, []);

  function handleConfirm() {
    localStorage.setItem(STORAGE_KEY, selected);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', background: 'rgba(160,160,170,0.35)', animation: 'fadeIn 200ms ease-out both' }}
    >
      <div
        className="w-full scale-in"
        style={{
          maxWidth: '460px',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-raised)',
          borderRadius: 'var(--radius-md)',
          padding: '36px 28px 28px',
        }}
      >
        <div className="text-center mb-7">
          <div className="text-4xl mb-3">🌐</div>
          <h2 className="text-xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>Choose your language</h2>
          <p className="text-sm" style={{ color: 'var(--text-inactive)' }}>You can change this anytime from settings</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-7 stagger-children">
          {languages.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelected(lang.code)}
                className="fade-up flex items-center gap-3 px-4 py-3 text-left"
                style={{
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'var(--active-bg)' : 'var(--surface)',
                  boxShadow: isSelected ? 'var(--shadow-active)' : 'var(--shadow-raised)',
                  color: isSelected ? '#fff' : 'var(--text-primary)',
                  transition: 'var(--transition)',
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-tight">{lang.native}</div>
                  <div className="text-xs mt-0.5" style={{ opacity: 0.6 }}>{lang.label}</div>
                </div>
                <div
                  className="shrink-0 w-5 h-5 flex items-center justify-center"
                  style={{
                    borderRadius: '50%',
                    background: isSelected ? 'rgba(255,255,255,0.2)' : 'transparent',
                    boxShadow: isSelected ? 'none' : 'var(--shadow-inset)',
                    transition: 'var(--transition)',
                  }}
                >
                  {isSelected && (
                    <span className="check-in font-black" style={{ fontSize: '11px', lineHeight: 1, color: '#fff' }}>✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={handleConfirm}
          className="w-full py-3.5 text-sm font-bold"
          style={{ background: 'var(--active-bg)', color: '#fff', borderRadius: 'var(--radius-pill)', boxShadow: 'var(--shadow-active)' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
