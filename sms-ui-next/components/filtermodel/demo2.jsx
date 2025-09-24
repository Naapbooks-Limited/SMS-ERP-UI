import React from 'react';
import SearchComponent from './SearchComponent';

const MainComponent = () => {
  const page1Fields = [
    { name: 'keyword', label: 'Keyword', type: 'text' },
    { name: 'category', label: 'Category', type: 'select', options: [{ value: 'cat1', label: 'Category 1' }, { value: 'cat2', label: 'Category 2' }] }
  ];

  const page2Fields = [
    { name: 'startDate', label: 'Start Date', type: 'dateRange' },
    { name: 'endDate', label: 'End Date', type: 'dateRange' }
  ];

  const handleSearch = async (filters) => {
    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(filters)
      });
      const data = await response.json();
      console.log(data); // Handle the data as needed
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Search Page</h1>
      <SearchComponent fields={page1Fields} onSearch={handleSearch} />
      {/* For another page */}
      {/* <SearchComponent fields={page2Fields} onSearch={handleSearch} /> */}
    </div>
  );
};

export default MainComponent;
