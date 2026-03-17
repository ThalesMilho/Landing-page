import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

export function NavDropdown({ item, page, go }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!item.children) {
    // Simple button for items without children
    if (item.external) {
      return (
        <a
          href={item.external}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-white/10 hover:bg-white/20 text-white/90 hover:text-white"
        >
          <span>{item.label}</span>
          <ExternalLink size={16} />
        </a>
      );
    }

    return (
      <button
        onClick={() => go(item.p)}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          page === item.p
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-white/10 hover:bg-white/20 text-white/90 hover:text-white'
        }`}
      >
        {item.label}
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          page.startsWith(item.p)
            ? 'bg-blue-600 text-white shadow-lg'
            : 'bg-white/10 hover:bg-white/20 text-white/90 hover:text-white'
        }`}
      >
        <span>{item.label}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="absolute left-0 mt-1 w-48 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-white/10 z-50">
          <div className="py-1">
            {item.children.map((child) => (
              <div key={child.p}>
                {child.external ? (
                  <a
                    href={child.external}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span>{child.label}</span>
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      setOpen(false);
                      go(child.p);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      page === child.p
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {child.label}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
