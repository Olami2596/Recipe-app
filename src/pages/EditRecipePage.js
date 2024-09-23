import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({
    title: '',
    image: '',
    ingredients: [''],
    instructions: [''],
    readyInMinutes: 0,
    servings: 1,
  });
  const [imageFile, setImageFile] = useState(null);
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
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      [name]: value,
    }));
  };

  const handleIngredientChange = (index, value) => {
    setRecipe((prevRecipe) => {
      const newIngredients = [...prevRecipe.ingredients];
      newIngredients[index] = value;
      return { ...prevRecipe, ingredients: newIngredients };
    });
  };

  const handleInstructionChange = (index, value) => {
    setRecipe((prevRecipe) => {
      const newInstructions = [...prevRecipe.instructions];
      newInstructions[index] = value;
      return { ...prevRecipe, instructions: newInstructions };
    });
  };

  const addIngredient = () => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      ingredients: [...prevRecipe.ingredients, ''],
    }));
  };

  const addInstruction = () => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      instructions: [...prevRecipe.instructions, ''],
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (imageFile) {
      const imageRef = ref(storage, `recipeImages/${uuidv4()}`);
      try {
        const snapshot = await uploadBytes(imageRef, imageFile);
        const url = await getDownloadURL(snapshot.ref);
        return url;
      } catch (error) {
        console.error("Error uploading image: ", error);
        setError(`Failed to upload image. Error: ${error.message}`);
        return null;
      }
    }
    return recipe.image;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imageUrl = await handleImageUpload();
      const docRef = doc(db, 'recipes', id);
      await updateDoc(docRef, { ...recipe, image: imageUrl });
      navigate('/saved-recipes');
    } catch (error) {
      console.error('Error updating document: ', error);
      setError('Failed to update recipe. Please try again.');
    }
  };

  const removeIngredient = (index) => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      ingredients: prevRecipe.ingredients.filter((_, i) => i !== index),
    }));
  };

  const removeInstruction = (index) => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      instructions: prevRecipe.instructions.filter((_, i) => i !== index),
    }));
  };

  if (loading) return <p className="text-center text-olive-600">Loading...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-olive-800 text-center mb-6">Edit Recipe</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-olive-700 font-medium mb-2">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={recipe.title || ''}
            onChange={handleChange}
            className="w-full border border-olive-300 p-2 rounded focus:ring-2 focus:ring-olive-600"
            required
          />
        </div>
        <div>
          <label htmlFor="image" className="block text-olive-700 font-medium mb-2">Image:</label>
          {recipe.image && (
            <div className="mb-4">
              <img
                src={recipe.image}
                alt="Recipe"
                className="w-48 h-48 object-cover rounded mb-2 shadow-md"
              />
            </div>
          )}
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full border border-olive-300 p-2 rounded focus:ring-2 focus:ring-olive-600"
          />
        </div>
        <div>
          <label className="block text-olive-700 font-medium mb-2">Ingredients:</label>
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={ingredient || ''}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                className="w-full border border-olive-300 p-2 rounded focus:ring-2 focus:ring-olive-600"
                required
              />
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className="bg-olive-800 text-white px-4 py-2 rounded hover:bg-olive-600"
          >
            Add Ingredient
          </button>
        </div>
        <div>
          <label className="block text-olive-700 font-medium mb-2">Instructions:</label>
          {recipe.instructions.map((instruction, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <textarea
                value={instruction || ''}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                className="w-full border border-olive-300 p-2 rounded focus:ring-2 focus:ring-olive-600"
                required
              />
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className="bg-olive-800 text-white px-4 py-2 rounded hover:bg-olive-600"
          >
            Add Instruction
          </button>
        </div>
        <div>
          <label htmlFor="readyInMinutes" className="block text-olive-700 font-medium mb-2">
            Ready in (minutes):
          </label>
          <input
            type="number"
            id="readyInMinutes"
            name="readyInMinutes"
            value={recipe.readyInMinutes || 0}
            onChange={handleChange}
            className="w-full border border-olive-300 p-2 rounded focus:ring-2 focus:ring-olive-600"
            required
          />
        </div>
        <div>
          <label htmlFor="servings" className="block text-olive-700 font-medium mb-2">Servings:</label>
          <input
            type="number"
            id="servings"
            name="servings"
            value={recipe.servings || 1}
            onChange={handleChange}
            className="w-full border border-olive-300 p-2 rounded focus:ring-2 focus:ring-olive-600"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-olive-800 text-white px-6 py-2 rounded hover:bg-olive-600 transition-all duration-300 ease-in-out"
        >
          Update Recipe
        </button>
      </form>
    </div>
  );
}

export default EditRecipePage;
