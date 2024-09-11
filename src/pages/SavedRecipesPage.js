import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

function SavedRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const q = query(collection(db, 'recipes'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedRecipes = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecipes(fetchedRecipes);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        alert('Failed to fetch recipes. Please try again.');
      }
    };

    fetchRecipes();
  }, [user.uid]);

  const deleteRecipe = async (id) => {
    try {
      await deleteDoc(doc(db, 'recipes', id));
      setRecipes(recipes.filter(recipe => recipe.id !== id));
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  // Render the recipes
  return (
    <div>
      <h1>Saved Recipes</h1>
      {recipes.map(recipe => (
        <div key={recipe.id}>
          <h2>{recipe.title}</h2>
          {recipe.image && <img src={recipe.image} alt={recipe.title} />}
          <Link to={`/recipe/${recipe.id}`}>View</Link>
          <Link to={`/edit/${recipe.id}`}>Edit</Link>
          <button onClick={() => deleteRecipe(recipe.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default SavedRecipesPage;