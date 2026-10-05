'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SearchableInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    name?: string;
    required?: boolean;
}

export default function SearchableInput({
    label,
    value,
    onChange,
    options,
    placeholder = 'Select option...',
    required = false
}: SearchableInputProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync external value with query only if needed, usually we trust query for input
    // But initially, if value is present, we show it
    useEffect(() => {
        // Only set query if it's different to avoid cursor jumping if we were editing
        // Actually for a combobox, the input IS the value.
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        setQuery(newValue);

        const filtered = options.filter(option =>
            option.toLowerCase().includes(newValue.toLowerCase())
        );
        setFilteredOptions(filtered);
        setIsOpen(true);
    };

    const handleOptionClick = (option: string) => {
        onChange(option);
        setQuery(option);
        setIsOpen(false);
    };

    const handleFocus = () => {
        // Reset filter to show all or current matches on focus?
        // Let's show all or matches based on current text
        const filtered = options.filter(option =>
            option.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredOptions(filtered);
        setIsOpen(true);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    required={required}
                    className="focus:ring-brand-primary focus:border-brand-primary block w-full sm:text-sm border-gray-300 rounded-md p-2 border pr-10"
                    placeholder={placeholder}
                    suppressHydrationWarning
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {filteredOptions.map((option, index) => (
                        <div
                            key={index}
                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-violet-50 text-gray-900"
                            onClick={() => handleOptionClick(option)}
                        >
                            <span className={`block truncate ${value === option ? 'font-semibold' : 'font-normal'}`}>
                                {option}
                            </span>
                            {value === option && (
                                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand-primary">
                                    <Check className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
