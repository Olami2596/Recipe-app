import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Link,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import ViewRecipePage from "./pages/ViewRecipePage";
import EditRecipePage from "./pages/EditRecipePage";
import ShoppingListPage from "./pages/ShoppingListPage";
import SavedRecipesPage from "./pages/SavedRecipesPage";
import SavedShoppingListsPage from "./pages/SavedShoppingListsPage";
import ManualCreateRecipePage from "./pages/ManualCreateRecipePage";
import TakeRecipePicturePage from "./pages/TakeRecipePicturePage";
import ExtractedTextRecipePage from "./pages/ExtractedTextRecipePage";
import DocUploadPage from "./pages/DocUploadPage";
import LoginPage from "./pages/LoginPage";
import "./App.css";
import { SearchProvider } from "./contexts/SearchContext";
import { ShoppingListProvider } from "./contexts/ShoppingListContext";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";
import Navbar from "./components/Navbar";
import ExtractedDocPage from "./pages/ExtractedDocPage";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppContent() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SearchProvider>
          <Router>
            <ShoppingListProvider>
              <div className="App bg-olive-500">
              <Navbar user={user} handleLogout={handleLogout}/>

                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/saved-recipes"
                    element={
                      <PrivateRoute>
                        <SavedRecipesPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/discover"
                    element={
                      <PrivateRoute>
                        <HomePage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/recipe/:id"
                    element={
                      <PrivateRoute>
                        <ViewRecipePage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/edit/:id"
                    element={
                      <PrivateRoute>
                        <EditRecipePage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/shopping-list"
                    element={
                      <PrivateRoute>
                        <ShoppingListPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/saved-shopping-lists"
                    element={
                      <PrivateRoute>
                        <SavedShoppingListsPage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/create-recipe/manual"
                    element={
                      <PrivateRoute>
                        <ManualCreateRecipePage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/take-recipe-picture"
                    element={
                      <PrivateRoute>
                        <TakeRecipePicturePage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/create-recipe/extracted-text"
                    element={
                      <PrivateRoute>
                        <ExtractedTextRecipePage />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/"
                    element={<Navigate to="/saved-recipes" replace />}
                  />
                  <Route path="/upload-recipe" element={<PrivateRoute><DocUploadPage /></PrivateRoute>} />
                  <Route path="/extract-doc" element={<PrivateRoute><ExtractedDocPage /></PrivateRoute>}  />
                </Routes>
              </div>
            </ShoppingListProvider>
          </Router>
        </SearchProvider>
      </PersistGate>
    </Provider>
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
