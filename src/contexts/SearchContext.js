import React, { createContext, useState, useContext } from 'react';

const SearchContext = createContext();

export function useSearch() {
  return useContext(SearchContext);
}

export function SearchProvider({ children }) {
  const [searchState, setSearchState] = useState({
    query: '',
    cuisine: '',
    recipes: [],
    page: 1,
    totalResults: 0,
    loading: false,
    error: null
  });

  return (
    <SearchContext.Provider value={{ searchState, setSearchState }}>
      {children}
    </SearchContext.Provider>
  );
}