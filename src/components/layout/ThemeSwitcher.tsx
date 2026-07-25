import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Palette, Check } from 'lucide-react';

export const ThemeSwitcher: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { theme, setTheme, options } = useTheme();

  const currentThemeObj = options.find((t) => t.id === theme) || options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
        title="থিম পরিবর্তন করুন"
        aria-label="থিম পরিবর্তন করুন"
      >
        <Palette className="w-5 h-5" />
        <span
          className="w-3 h-3 rounded-full inline-block border border-border shadow-2xs"
          style={{ backgroundColor: currentThemeObj.colorHex }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-xl p-2 z-50 space-y-1"
          onClick={() => setOpen(false)}
        >
          <div className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground border-b border-border mb-1">
            কালার থিম নির্বাচন করুন
          </div>
          {options.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                theme === t.id
                  ? 'bg-primary-light text-primary font-bold'
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-2xs flex-shrink-0"
                  style={{ backgroundColor: t.colorHex }}
                />
                <span>{t.nameBn}</span>
              </div>
              {theme === t.id && <Check className="w-4 h-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
