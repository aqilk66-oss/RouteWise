import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  ArrowRight, 
  Compass, 
  Users, 
  Bus, 
  Route, 
  MapPin, 
  Calendar, 
  FileText, 
  ShieldAlert, 
  Settings, 
  Bell, 
  ExternalLink,
  Command
} from 'lucide-react';
import { getSearchableRoutesForRole } from '../../routes/routeConfig';
import { useAuth } from '../../context/AuthContext';
import { USER_ROLES } from '../../constants/collections';

/**
 * Global Command Palette & Quick Search
 * Keyboard shortcut: Ctrl+K or Cmd+K
 * Scoped strictly to the authenticated user's role.
 * Does not download excessive Firestore documents on startup.
 */
export const GlobalSearchModal = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { role } = useAuth();

  // Permitted pages for current user
  const permittedRoutes = getSearchableRoutesForRole(role);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Handle escape key & keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredResults[selectedIndex]) {
          handleSelect(filteredResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, query]);

  // Filter routes based on query
  const trimmed = query.trim().toLowerCase();
  const filteredResults = trimmed
    ? permittedRoutes.filter((r) => {
        return (
          r.label.toLowerCase().includes(trimmed) ||
          r.category.toLowerCase().includes(trimmed) ||
          (r.description && r.description.toLowerCase().includes(trimmed)) ||
          r.path.toLowerCase().includes(trimmed)
        );
      })
    : permittedRoutes.slice(0, 8); // Default suggestions when query is empty

  const handleSelect = (item) => {
    onClose();
    navigate(item.path);
  };

  if (!isOpen) return null;

  // Group filtered results by category
  const groupedResults = filteredResults.reduce((acc, curr) => {
    const cat = curr.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {});

  // Flat index mapping for keyboard highlight
  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-label="Global RouteWise Search"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-brand-blue shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search pages, operations, fleet records... (e.g., 'trips', 'buses', 'safety')"
            className="flex-1 bg-transparent border-none outline-none text-sm text-brand-navy placeholder:text-slate-400 font-medium"
            aria-autocomplete="list"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs rounded-md bg-white border border-slate-200 text-slate-500 font-mono shadow-subtle hover:bg-slate-50"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center">
              <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-brand-navy">No matching RouteWise records found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for general terms like "attendance", "tracking", or "students"
              </p>
            </div>
          ) : (
            Object.entries(groupedResults).map(([category, items]) => (
              <div key={category} className="space-y-1">
                <p className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {category}
                </p>
                {items.map((item) => {
                  const currentIndex = flatIndex++;
                  const isSelected = currentIndex === selectedIndex;

                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'bg-blue-50 text-brand-blue border border-brand-blue/20 shadow-subtle'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-brand-blue text-white'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Command className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-brand-navy">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[340px] sm:max-w-md">
                            {item.description || item.path}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline-block">
                          {item.path}
                        </span>
                        <ArrowRight
                          className={`w-4 h-4 ${
                            isSelected ? 'text-brand-blue translate-x-0.5' : 'text-slate-300'
                          } transition-transform`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer info ribbon */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Role Scope:</span>
            <span className="font-semibold text-brand-navy uppercase tracking-wider text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200">
              {role}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span>Navigate <kbd className="font-mono bg-white px-1 rounded border">↑</kbd><kbd className="font-mono bg-white px-1 rounded border">↓</kbd></span>
            <span>Select <kbd className="font-mono bg-white px-1.5 rounded border">Enter</kbd></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
