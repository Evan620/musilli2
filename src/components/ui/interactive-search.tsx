import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Home, Building2, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'location' | 'property' | 'feature';
  icon: React.ReactNode;
}

const mockSuggestions: SearchSuggestion[] = [
  { id: '1', text: 'Nairobi, Kenya', type: 'location', icon: <MapPin className="w-4 h-4" /> },
  { id: '2', text: 'Mombasa, Kenya', type: 'location', icon: <MapPin className="w-4 h-4" /> },
  { id: '3', text: 'Kisumu, Kenya', type: 'location', icon: <MapPin className="w-4 h-4" /> },
  { id: '4', text: 'Luxury Villa', type: 'property', icon: <Home className="w-4 h-4" /> },
  { id: '5', text: 'Modern Apartment', type: 'property', icon: <Building2 className="w-4 h-4" /> },
  { id: '6', text: 'Garden Property', type: 'feature', icon: <Home className="w-4 h-4" /> },
  { id: '7', text: 'Pool & Spa', type: 'feature', icon: <Home className="w-4 h-4" /> },
  { id: '8', text: 'City View', type: 'feature', icon: <Home className="w-4 h-4" /> },
];

interface InteractiveSearchProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export const InteractiveSearch = ({ 
  placeholder = "Search by location, property type, or features...", 
  onSearch,
  className = ""
}: InteractiveSearchProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (onSearch) {
      onSearch(suggestion.text);
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="pl-12 pr-20 h-12 border-2 border-gray-200 bg-white text-black text-base rounded-xl shadow-lg focus:border-black transition-all duration-300"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <Button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-4 bg-black hover:bg-gray-800 text-white rounded-lg text-sm"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                index === selectedIndex ? 'bg-gray-50' : ''
              } ${index === 0 ? 'rounded-t-xl' : ''} ${
                index === suggestions.length - 1 ? 'rounded-b-xl' : ''
              }`}
            >
              <span className="text-gray-400">{suggestion.icon}</span>
              <span className="text-gray-900">{suggestion.text}</span>
              <span className="ml-auto text-xs text-gray-500 capitalize">
                {suggestion.type}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
