import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import ViewRecipePage from './pages/ViewRecipePage';
import CreateRecipePage from './pages/CreateRecipePage';
import EditRecipePage from './pages/EditRecipePage';
import ShoppingListPage from './pages/ShoppingListPage';
import SavedRecipesPage from './pages/SavedRecipesPage';
import SavedShoppingListsPage from './pages/SavedShoppingListsPage';
import LoginPage from './pages/LoginPage';
import './App.css';
import { SearchProvider } from './contexts/SearchContext';
import { ShoppingListProvider } from './contexts/ShoppingListContext';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <Router>
          <ShoppingListProvider>
            <div className="App">
              <nav>
              <li><Link to="/">Home</Link></li>
                <li><Link to="/saved-recipes">Saved Recipes</Link></li>
                <li><Link to="/create">Create Recipe</Link></li>
                <li><Link to="/shopping-list">Shopping List</Link></li>
              </nav>

              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
                <Route path="/recipe/:id" element={<PrivateRoute><ViewRecipePage /></PrivateRoute>} />
                <Route path="/create" element={<PrivateRoute><CreateRecipePage /></PrivateRoute>} />
                <Route path="/edit/:id" element={<PrivateRoute><EditRecipePage /></PrivateRoute>} />
                <Route path="/saved-recipes" element={<PrivateRoute><SavedRecipesPage /></PrivateRoute>} />
                <Route path="/shopping-list" element={<PrivateRoute><ShoppingListPage /></PrivateRoute>} />
                <Route path="/saved-shopping-lists" element={<PrivateRoute><SavedShoppingListsPage /></PrivateRoute>} />
              </Routes>
            </div>
          </ShoppingListProvider>
        </Router>
      </SearchProvider>
    </AuthProvider>
  );
}

export default App;