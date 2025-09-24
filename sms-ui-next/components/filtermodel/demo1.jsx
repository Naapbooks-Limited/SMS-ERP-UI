import React, { useState } from 'react';

const SearchComponent = ({ fields, onSearch }) => {
  const [filters, setFilters] = useState(
    fields.reduce((acc, field) => {
      acc[field.name] = field.type === 'dateRange' ? { startDate: '', endDate: '' } : '';
      return acc;
    }, {})
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const [key, subKey] = name.split('.');
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: {
        ...prevFilters[key],
        [subKey]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.name}>
          <label>
            {field.label}:
            {field.type === 'text' && (
              <input
                type="text"
                name={field.name}
                value={filters[field.name]}
                onChange={handleInputChange}
              />
            )}
            {field.type === 'select' && (
              <select
                name={field.name}
                value={filters[field.name]}
                onChange={handleInputChange}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            {field.type === 'dateRange' && (
              <>
                <input
                  type="date"
                  name={`${field.name}.startDate`}
                  value={filters[field.name].startDate}
                  onChange={handleDateChange}
                />
                <input
                  type="date"
                  name={`${field.name}.endDate`}
                  value={filters[field.name].endDate}
                  onChange={handleDateChange}
                />
              </>
            )}
          </label>
        </div>
      ))}
      <button type="submit">Search</button>
    </form>
  );
};

export default SearchComponent;
