import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { getRecipeDetails } from '../services/recipeService'; // Import this function from your recipeService

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
        // First, try to fetch from Firestore
        const docRef = doc(db, 'recipes', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().userId === user.uid) {
          setRecipe({ id: docSnap.id, ...docSnap.data() });
          setIsSaved(true);
        } else {
          // If not in Firestore, fetch from Spoonacular API
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
        createdAt: new Date()
      };

      await setDoc(doc(db, 'recipes', id), recipeToSave);
      setIsSaved(true);
      alert('Recipe saved successfully!');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe. Please try again.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!recipe) return <p>No recipe found.</p>;

  return (
    <div>
      <h1>{recipe.title}</h1>
      {recipe.image && <img src={recipe.image} alt={recipe.title} />}
      
      <h2>Ingredients:</h2>
      <ul>
        {recipe.extendedIngredients ? (
          recipe.extendedIngredients.map((ingredient, index) => (
            <li key={index}>{ingredient.original}</li>
          ))
        ) : (
          recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))
        )}
      </ul>

      <h2>Instructions:</h2>
      {recipe.analyzedInstructions ? (
        <ol>
          {recipe.analyzedInstructions[0].steps.map((step, index) => (
            <li key={index}>{step.step}</li>
          ))}
        </ol>
      ) : (
        <ol>
          {recipe.instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      )}

      <p>Ready in {recipe.readyInMinutes} minutes</p>
      <p>Servings: {recipe.servings}</p>

      {!isSaved && (
        <button onClick={handleSaveRecipe}>Save Recipe</button>
      )}

      {isSaved && recipe.userId === user.uid && (
        <button onClick={() => navigate(`/edit/${recipe.id}`)}>Edit Recipe</button>
      )}
    </div>
  );
}

export default ViewRecipePage;