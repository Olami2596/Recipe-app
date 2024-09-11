import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

function CreateRecipePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({
    title: '',
    image: '',
    ingredients: [''],
    instructions: [''],
    readyInMinutes: 0,
    servings: 1
  });

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
      const docRef = await addDoc(collection(db, 'recipes'), {
        title: recipe.title,
        image: recipe.image,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        readyInMinutes: parseInt(recipe.readyInMinutes),
        servings: parseInt(recipe.servings),
        userId: user.uid,
        createdAt: new Date()
      });
      console.log("Document written with ID: ", docRef.id);
      navigate('/saved-recipes');
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('Failed to create recipe. Please try again.');
    }
  };

  return (
    <div>
      <h1>Create New Recipe</h1>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
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
        <button type="submit">Create Recipe</button>
      </form>
    </div>
  );
}

export default CreateRecipePage;