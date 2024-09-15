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
import ManualCreateRecipePage from './pages/ManualCreateRecipePage';
import TakeRecipePicturePage from './pages/TakeRecipePicturePage';
import ExtractedTextRecipePage from './pages/ExtractedTextRecipePage';
import LoginPage from './pages/LoginPage';
import './App.css';
import { SearchProvider } from './contexts/SearchContext';
import { ShoppingListProvider } from './contexts/ShoppingListContext';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // No need to use navigate here, as the AuthProvider will handle redirection
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <SearchProvider>
      <Router>
        <ShoppingListProvider>
          <div className="App">
            <nav>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/saved-recipes">Saved Recipes</Link></li>
                <li><Link to="/create">Create Recipe</Link></li>
                <li><Link to="/shopping-list">Shopping List</Link></li>
                {user ? (
                  <li><button onClick={handleLogout}>Logout</button></li>
                ) : (
                  <li><Link to="/login">Login</Link></li>
                )}
              </ul>
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
              <Route path="/create-recipe/manual" element={<PrivateRoute><ManualCreateRecipePage /></PrivateRoute>} />
              <Route path="/take-recipe-picture" element={<PrivateRoute><TakeRecipePicturePage /></PrivateRoute>} />
              <Route path="/create-recipe/extracted-text" element={<PrivateRoute><ExtractedTextRecipePage /></PrivateRoute>} />
            </Routes>
          </div>
        </ShoppingListProvider>
      </Router>
    </SearchProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;