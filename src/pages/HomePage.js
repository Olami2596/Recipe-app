import React, { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchRecipes } from '../services/recipeService';
import { useSearch } from '../contexts/SearchContext';
import useDebounce from '../hooks/useDebounce';

function HomePage() {
  const { searchState, setSearchState } = useSearch();
  const { query, cuisine, recipes, page, totalResults, loading, error } = searchState;

  const debouncedQuery = useDebounce(query, 300); // 300ms delay

  const pageSize = 10;

  const fetchRecipes = useCallback(async (pageNum, searchQuery) => {
    setSearchState(prev => ({ ...prev, loading: true, error: null, page: pageNum }));
    try {
      const data = await searchRecipes(searchQuery, pageNum, pageSize, cuisine);
      setSearchState(prev => ({
        ...prev,
        recipes: data.results,
        totalResults: data.totalResults,
        loading: false
      }));
    } catch (err) {
      console.error('An error occurred while fetching recipes:', err);
      setSearchState(prev => ({
        ...prev,
        error: 'Failed to fetch recipes. Please try again.',
        loading: false
      }));
    }
  }, [cuisine, setSearchState]);

  useEffect(() => {
    if (debouncedQuery) {
      fetchRecipes(1, debouncedQuery);
    } else {
      setSearchState(prev => ({ ...prev, recipes: [], totalResults: 0 }));
    }
  }, [debouncedQuery, fetchRecipes, setSearchState]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    fetchRecipes(1, query);
  }, [fetchRecipes, query]);

  const handleNextPage = useCallback(() => {
    if (page * pageSize < totalResults) {
      fetchRecipes(page + 1, query);
    }
  }, [page, pageSize, totalResults, fetchRecipes, query]);

  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      fetchRecipes(page - 1, query);
    }
  }, [page, fetchRecipes, query]);

  return (
    <div>
      <h1>Search Recipes</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setSearchState(prev => ({ ...prev, query: e.target.value }))}
          placeholder="Enter a food name"
        />
        <select 
          value={cuisine} 
          onChange={(e) => {
            setSearchState(prev => ({ ...prev, cuisine: e.target.value }));
            fetchRecipes(1, query);
          }}
        >
          <option value="">All Cuisines</option>
          <option value="italian">Italian</option>
          <option value="mexican">Mexican</option>
          <option value="chinese">Chinese</option>
          {/* Add more cuisine options as needed */}
        </select>
        <button type="submit">Search</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div>
          {recipes.map((recipe) => (
            <div key={recipe.id}>
              <h2>{recipe.title}</h2>
              <img src={recipe.image} alt={recipe.title} />
              <Link to={`/recipe/${recipe.id}`}>View Recipe</Link>
            </div>
          ))}
        </div>
      )}

      {totalResults > pageSize && (
        <div>
          <button onClick={handlePrevPage} disabled={page === 1 || loading}>
            Previous
          </button>
          <span>Page {page} of {Math.ceil(totalResults / pageSize)}</span>
          <button onClick={handleNextPage} disabled={page * pageSize >= totalResults || loading}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default HomePage;