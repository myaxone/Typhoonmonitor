import React, { useState } from 'react';
import { expandLocation } from '../utils/abbreviations';

const SearchBar: React.FC<{ onSearch: (location: string) => void }> = ({ onSearch }) => {
    const [inputValue, setInputValue] = useState('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleSearch = () => {
    const raw = inputValue.trim();
        if (!raw) return;
    // Expand common abbreviations first (e.g. NYC -> New York, USA -> United States)
    const expanded = expandLocation(raw);
    // Accept formats like "City, Country" or just "City" after expansion
    const parts = expanded.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const query = parts.length === 1 ? parts[0] : `${parts[0]},${parts.slice(1).join(',')}`;

    onSearch(query);
        setInputValue('');
    };

    return (
        <div className="search-bar">
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch();
                    }
                }}
                placeholder="City, Country (e.g. Shanghai, China)"
            />
            <button onClick={handleSearch}>Search</button>
        </div>
    );
};

export default SearchBar;