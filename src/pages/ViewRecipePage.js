import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getRecipeDetails } from '../services/recipeService';

function ViewRecipePage() {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, 'recipes', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data().userId === user.uid) {
          setRecipe({ id: docSnap.id, ...docSnap.data() });
          setIsSaved(true);
        } else {
          const apiRecipe = await getRecipeDetails(id);
          setRecipe(apiRecipe);
          setIsSaved(false);
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to fetch recipe. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, user.uid]);

  const handleSaveRecipe = async () => {
    try {
      const recipeToSave = {
        title: recipe.title,
        image: recipe.image,
        ingredients: recipe.extendedIngredients.map(ing => ing.original),
        instructions: recipe.analyzedInstructions[0].steps.map(step => step.step),
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        userId: user.uid,
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'recipes', id), recipeToSave);
      setIsSaved(true);
      alert('Recipe saved successfully!');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    }
  };

  if (loading) return <p className="text-center text-olive-600">Loading...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!recipe) return <p className="text-center text-olive-600">No recipe found.</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-olive-800 text-center mb-6">{recipe.title}</h1>

      {recipe.image && (
        <div className="flex justify-center mb-6">
          <img src={recipe.image} alt={recipe.title} className="rounded-md shadow-md max-w-full h-auto" />
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-olive-700 mb-4">Ingredients</h2>
        <ul className="list-disc list-inside space-y-2 text-olive-800">
          {recipe.extendedIngredients
            ? recipe.extendedIngredients.map((ingredient, index) => (
                <li key={index} className="border-b border-olive-200 pb-2">{ingredient.original}</li>
              ))
            : recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="border-b border-olive-200 pb-2">{ingredient}</li>
              ))}
        </ul>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-olive-700 mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-3 text-olive-800">
          {recipe.analyzedInstructions
            ? recipe.analyzedInstructions[0].steps.map((step, index) => (
                <li key={index} className="border-b border-olive-200 pb-2">{step.step}</li>
              ))
            : recipe.instructions.map((instruction, index) => (
                <li key={index} className="border-b border-olive-200 pb-2">{instruction}</li>
              ))}
        </ol>
      </div>

      <div className="text-olive-700 mb-6">
        <p className="mb-2">
          <strong>Ready in:</strong> {recipe.readyInMinutes} minutes
        </p>
        <p>
          <strong>Servings:</strong> {recipe.servings}
        </p>
      </div>

      <div className="flex justify-center space-x-4">
        {!isSaved && (
          <button
            onClick={handleSaveRecipe}
            className="bg-olive-800 text-olive-100 px-6 py-2 rounded hover:bg-olive-600 transition-all duration-300 ease-in-out"
          >
            Save Recipe
          </button>
        )}

        {isSaved && recipe.userId === user.uid && (
          <button
            onClick={() => navigate(`/edit/${recipe.id}`)}
            className="bg-olive-800 text-olive-100 px-6 py-2 rounded hover:bg-olive-600 transition-all duration-300 ease-in-out"
          >
            Edit Recipe
          </button>
        )}
      </div>
    </div>
  );
}

export default ViewRecipePage;
