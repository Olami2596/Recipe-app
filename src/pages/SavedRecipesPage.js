import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

function SavedRecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const q = query(
          collection(db, 'recipes'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
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
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteDoc(doc(db, 'recipes', id));
        setRecipes(recipes.filter(recipe => recipe.id !== id));
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Failed to delete recipe. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-olive-800 mb-6 text-center">Saved Recipes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
          <div key={recipe.id} className="border bg-olive-50 border-olive-200 p-4 rounded-md shadow-md transition-transform transform hover:scale-105 hover:shadow-lg duration-300 ease-in-out">
            <h2 className="text-xl font-semibold text-olive-800 mb-2">{recipe.title}</h2>
            {recipe.image && <img src={recipe.image} alt={recipe.title} className="w-full h-48 object-cover rounded mb-4" />}
            <div className="flex space-x-4">
              <Link 
                to={`/recipe/${recipe.id}`} 
                className="bg-olive-800 text-white px-4 py-2 rounded hover:bg-olive-600"
              >
                View
              </Link>
              <Link 
                to={`/edit/${recipe.id}`} 
                className="bg-olive-800 text-white px-4 py-2 rounded hover:bg-olive-600 "
              >
                Edit
              </Link>
              <button 
                onClick={() => deleteRecipe(recipe.id)} 
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SavedRecipesPage;
