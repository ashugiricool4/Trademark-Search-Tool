import { GetServerSideProps, NextPage } from 'next';
import axios from 'axios';
import { useState, useEffect } from 'react';
import SearchForm, { SearchFilters } from '../components/SearchForm';
import { useRouter } from 'next/router';

interface SearchResult {
  key: string;
  doc_count: number;
}

interface HomeProps {
  initialResults: SearchResult[];
  initialFilters: SearchFilters;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { query } = context;
  const initialFilters: SearchFilters = {
    input_query: query.input_query as string || '',
    sort_by: query.sort_by as string || 'default',
    status: query.status ? [query.status as string] : ['Active'],
    exact_match: query.exact_match === 'true',
    page: parseInt(query.page as string) || 1,
    rows: parseInt(query.rows as string) || 10,
    classes: [],
    counties: [],
    states: [],
    sort_order: query.sort_order as string || 'desc',
    law_firm: query.law_firm as string || '',
    attorney: query.attorney as string || '',
  };

  try {
    const response = await axios.post(
      'https://vit-tm-task.api.trademarkia.app/api/v3/us',
      initialFilters,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const initialResults = response.data.body.aggregations.attorneys.buckets || [];

    context.res.setHeader(
      'Cache-Control',
      'public, s-maxage=10, stale-while-revalidate=59'
    );

    return {
      props: {
        initialResults,
        initialFilters,
      },
    };
  } catch (error) {
    return {
      props: {
        initialResults: [],
        initialFilters,
      },
    };
  }
};

const Home: NextPage<HomeProps> = ({ initialResults, initialFilters }) => {
  const [results, setResults] = useState<SearchResult[]>(initialResults);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>(initialFilters);
  const [shareableLink, setShareableLink] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const searchParams = new URLSearchParams(currentFilters as any);
    router.push(`/?${searchParams.toString()}`, undefined, { shallow: true });
    setShareableLink(`${window.location.origin}/?${searchParams.toString()}`);
  }, [currentFilters]);

  const handleSearch = async (filters: SearchFilters) => {
    setStatus('loading');
    setError('');
    setCurrentFilters(filters);
    setCurrentPage(1);

    try {
      const response = await axios.post(
        'https://vit-tm-task.api.trademarkia.app/api/v3/us',
        { ...filters, page: 1 },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setResults(response.data.body.aggregations.attorneys.buckets);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError('An error occurred while searching. Please try again.');
    }
  };

  const handlePageChange = async (newPage: number) => {
    setStatus('loading');
    try {
      const response = await axios.post(
        'https://vit-tm-task.api.trademarkia.app/api/v3/us',
        { ...currentFilters, page: newPage },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setResults(response.data.body.aggregations.attorneys.buckets);
      setCurrentPage(newPage);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError('An error occurred while fetching results. Please try again.');
    }
  };

  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.875rem',
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', color: '#333' }}>Search for Trademarks</h1>
      <SearchForm onSearch={handleSearch} />

      {status === 'loading' && (
        <div style={{ textAlign: 'center', color: '#3b82f6', marginTop: '20px' }}>
          <p>Searching...</p>
          <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '3px solid #3b82f6', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      )}
      {status === 'error' && <p style={{ textAlign: 'center', color: '#ef4444', marginTop: '20px' }}>{error}</p>}

      {results.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px', color: '#4b5563' }}>Search Results:</h2>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>Attorney</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', color: '#374151' }}>Doc Count</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white' }}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{result.key}</td>
                    <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>{result.doc_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '10px' }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                ...buttonStyle,
                backgroundColor: currentPage === 1 ? '#d1d5db' : '#3b82f6',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>Page {currentPage}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              style={buttonStyle}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {status === 'success' && results.length === 0 && (
        <p style={{ textAlign: 'center', color: '#6b7280', marginTop: '20px' }}>No results found</p>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', color: '#4b5563' }}>Shareable Link:</h3>
        <div style={{ display: 'flex' }}>
          <input
            type="text"
            value={shareableLink}
            readOnly
            style={{ flexGrow: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px 0 0 4px', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis' }}
          />
          <button
            onClick={() => navigator.clipboard.writeText(shareableLink)}
            style={{
              ...buttonStyle,
              borderRadius: '0 4px 4px 0',
            }}
          >
            Copy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;