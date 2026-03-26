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
      style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.45)', animation: 'fadeIn 200ms ease-out both' }}
    >
      <div
        className="bg-white w-full scale-in"
        style={{ maxWidth: '460px', borderRadius: '16px', padding: '36px 28px 28px', boxShadow: '0 12px 48px rgba(0,0,0,0.18)' }}
      >
        {/* Header */}
        <div className="text-center mb-7">
          <div className="text-4xl mb-3">🌐</div>
          <h2 className="text-xl font-black text-black mb-1">Choose your language</h2>
          <p className="text-sm text-gray-500">You can change this anytime from settings</p>
        </div>

        {/* Language chips */}
        <div className="grid grid-cols-2 gap-2 mb-7 stagger-children">
          {languages.map((lang) => {
            const isSelected = selected === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelected(lang.code)}
                className="fade-up flex items-center gap-3 px-4 py-3 text-left"
                style={{
                  borderRadius: '10px',
                  border: isSelected ? '2px solid #000' : '1.5px solid #e5e7eb',
                  background: isSelected ? '#000' : '#fff',
                  color: isSelected ? '#fff' : '#111827',
                  transition: 'all 150ms ease-out',
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold leading-tight">{lang.native}</div>
                  <div className="text-xs mt-0.5" style={{ opacity: 0.55 }}>{lang.label}</div>
                </div>
                <div
                  className="shrink-0 w-5 h-5 flex items-center justify-center"
                  style={{
                    borderRadius: '50%',
                    border: isSelected ? 'none' : '1.5px solid #d1d5db',
                    background: isSelected ? '#fff' : 'transparent',
                    transition: 'all 150ms ease-out',
                  }}
                >
                  {isSelected && (
                    <span className="check-in text-black font-black" style={{ fontSize: '11px', lineHeight: 1 }}>✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          className="w-full py-3.5 text-sm font-bold"
          style={{ background: '#000', color: '#fff', borderRadius: '999px' }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
