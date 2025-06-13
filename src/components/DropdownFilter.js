import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi'; // 원하는 아이콘 사용

export const DropdownFilter = ({ filters, selectedFilter, onChange }) => {
    const [open, setOpen] = useState(false);

    const selectedLabel =
        filters.find((f) => f.key === selectedFilter)?.label || '선택';

    return (
        <div className="custom-dropdown">
            <div className="dropdown-toggle" onClick={() => setOpen(!open)}>
                <span>{selectedLabel}</span>
                <FiChevronDown className="dropdown-icon" />
            </div>

            {open && (
                <ul className="dropdown-menu">
                    {filters.map((f) => (
                        <li
                            key={f.key}
                            className={`dropdown-item ${f.key === selectedFilter ? 'active' : ''}`}
                            onClick={() => {
                                onChange(f.key);
                                setOpen(false);
                            }}
                        >
                            {f.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
