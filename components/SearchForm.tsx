import React, { useState } from 'react';

export interface SearchFilters {
  input_query: string;
  sort_by: string;
  status: string[];
  exact_match: boolean;
  page: number;
  rows: number;
  classes: string[];
  counties: string[];
  states: string[];
  sort_order: string;
  law_firm?: string;
  attorney?: string;
}

interface SearchFormProps {
  onSearch: (filters: SearchFilters) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [owner, setOwner] = useState('');
  const [lawFirm, setLawFirm] = useState('');
  const [attorney, setAttorney] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filters: SearchFilters = {
      input_query: owner,
      sort_by: 'default',
      status: status ? [status] : [],
      exact_match: false,
      page: 1,
      rows: 10,
      classes: [],
      counties: [],
      states: [],
      sort_order: 'desc',
      law_firm: lawFirm,
      attorney: attorney,
    };
    onSearch(filters);
  };

  const inputStyle = {
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '0.875rem',
    width: '100%',
  };

  const labelStyle = {
    fontSize: '0.875rem',
    fontWeight: 'bold',
    color: '#4b5563',
    marginBottom: '4px',
    display: 'block',
  };

  const buttonStyle = {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '8px 16px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    width: '100%',
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', padding: '20px', backgroundColor: 'white', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}>
      <div style={{ flex: '1 1 200px' }}>
        <label htmlFor="owner" style={labelStyle}>Owner</label>
        <input
          id="owner"
          type="text"
          placeholder="Enter owner"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={{ flex: '1 1 200px' }}>
        <label htmlFor="lawFirm" style={labelStyle}>Law Firm</label>
        <input
          id="lawFirm"
          type="text"
          placeholder="Enter law firm"
          value={lawFirm}
          onChange={(e) => setLawFirm(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={{ flex: '1 1 200px' }}>
        <label htmlFor="attorney" style={labelStyle}>Attorney</label>
        <input
          id="attorney"
          type="text"
          placeholder="Enter attorney"
          value={attorney}
          onChange={(e) => setAttorney(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={{ flex: '1 1 200px' }}>
        <label htmlFor="status" style={labelStyle}>Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Pending">Pending</option>
        </select>
      </div>
      <div style={{ flex: '1 1 100%', display: 'flex', alignItems: 'flex-end' }}>
        <button type="submit" style={buttonStyle}>
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchForm;