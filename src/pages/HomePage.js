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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center text-olive-800 mb-6">Search Recipes</h1>

      <form 
        onSubmit={handleSearch} 
        className="flex flex-col lg:flex-row justify-center items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-6"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setSearchState(prev => ({ ...prev, query: e.target.value }))}
          placeholder="Enter a food name"
          className="border border-olive-800 p-2 rounded w-full lg:w-1/3 text-olive-800 focus:outline-none focus:ring-2 focus:ring-olive-600"
        />
        <select
          value={cuisine}
          onChange={(e) => {
            setSearchState(prev => ({ ...prev, cuisine: e.target.value }));
            fetchRecipes(1, query);
          }}
          className="border border-olive-800 p-2 rounded w-full lg:w-1/4 text-olive-800 focus:outline-none focus:ring-2 focus:ring-olive-600"
        >
          <option value="">All Cuisines</option>
          <option value="italian">Italian</option>
          <option value="mexican">Mexican</option>
          <option value="chinese">Chinese</option>
        </select>
        <button 
          type="submit" 
          className="bg-olive-800 text-olive-100 px-4 py-2 rounded hover:bg-olive-600 transition-all duration-300 ease-in-out"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-center text-olive-600">Loading...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="border bg-olive-50 border-olive-200 p-4 rounded-md shadow-md transform hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out"
            >
              <h2 className="text-xl font-semibold text-olive-800 mb-2">{recipe.title}</h2>
              <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover rounded mb-4" />
              <Link
                to={`/recipe/${recipe.id}`}
                className="text-olive-600 hover:text-olive-800 underline"
              >
                View Recipe
              </Link>
            </div>
          ))}
        </div>
      )}

      {totalResults > pageSize && (
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={handlePrevPage}
            disabled={page === 1 || loading}
            className={`px-4 py-2 border border-olive-800 rounded ${page === 1 || loading ? 'bg-gray-300' : 'bg-olive-800 text-olive-100 hover:bg-olive-600 transition-all duration-300 ease-in-out'}`}
          >
            Previous
          </button>
          <span className="text-olive-800">Page {page} of {Math.ceil(totalResults / pageSize)}</span>
          <button
            onClick={handleNextPage}
            disabled={page * pageSize >= totalResults || loading}
            className={`px-4 py-2 border border-olive-800 rounded ${page * pageSize >= totalResults || loading ? 'bg-gray-300' : 'bg-olive-800 text-olive-100 hover:bg-olive-600 transition-all duration-300 ease-in-out'}`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default HomePage;
