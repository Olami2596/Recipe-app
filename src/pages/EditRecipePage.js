import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({
    title: '',
    image: '',
    ingredients: [],
    instructions: [],
    readyInMinutes: 0,
    servings: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    const fetchRecipe = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, 'recipes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().userId === user.uid) {
          setRecipe(docSnap.data());
        } else {
          setError('Recipe not found or you do not have permission to edit it.');
          navigate('/saved-recipes');
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        setError('Failed to fetch recipe. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, navigate, user.uid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      [name]: value
    }));
  };

  const handleIngredientChange = (index, value) => {
    setRecipe(prevRecipe => {
      const newIngredients = [...prevRecipe.ingredients];
      newIngredients[index] = value;
      return { ...prevRecipe, ingredients: newIngredients };
    });
  };

  const handleInstructionChange = (index, value) => {
    setRecipe(prevRecipe => {
      const newInstructions = [...prevRecipe.instructions];
      newInstructions[index] = value;
      return { ...prevRecipe, instructions: newInstructions };
    });
  };

  const addIngredient = () => {
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      ingredients: [...prevRecipe.ingredients, '']
    }));
  };

  const addInstruction = () => {
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      instructions: [...prevRecipe.instructions, '']
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, 'recipes', id);
      await updateDoc(docRef, recipe);
      navigate('/saved-recipes');
    } catch (error) {
      console.error('Error updating document: ', error);
      setError('Failed to update recipe. Please try again.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>Edit Recipe</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={recipe.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="image">Image URL:</label>
          <input
            type="url"
            id="image"
            name="image"
            value={recipe.image}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Ingredients:</label>
          {recipe.ingredients.map((ingredient, index) => (
            <input
              key={index}
              type="text"
              value={ingredient}
              onChange={(e) => handleIngredientChange(index, e.target.value)}
              required
            />
          ))}
          <button type="button" onClick={addIngredient}>Add Ingredient</button>
        </div>
        <div>
          <label>Instructions:</label>
          {recipe.instructions.map((instruction, index) => (
            <textarea
              key={index}
              value={instruction}
              onChange={(e) => handleInstructionChange(index, e.target.value)}
              required
            />
          ))}
          <button type="button" onClick={addInstruction}>Add Instruction</button>
        </div>
        <div>
          <label htmlFor="readyInMinutes">Ready in (minutes):</label>
          <input
            type="number"
            id="readyInMinutes"
            name="readyInMinutes"
            value={recipe.readyInMinutes}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="servings">Servings:</label>
          <input
            type="number"
            id="servings"
            name="servings"
            value={recipe.servings}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Update Recipe</button>
      </form>
    </div>
  );
}

export default EditRecipePage;