import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

function ManualCreateRecipePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState({
    title: "",
    ingredients: [""],
    instructions: [""],
    readyInMinutes: 0,
    servings: 1,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
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
      ingredients: [...prevRecipe.ingredients, ""],
    }));
  };

  const addInstruction = () => {
    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      instructions: [...prevRecipe.instructions, ""],
    }));
  };

  const handleImageUpload = async () => {
    if (imageFile) {
      const imageRef = ref(storage, `recipeImages/${uuidv4()}`);
      try {
        const snapshot = await uploadBytes(imageRef, imageFile);
        const url = await getDownloadURL(snapshot.ref);
        setImageUrl(url);
        return url;
      } catch (error) {
        console.error("Error uploading image: ", error);
        alert(`Failed to upload image. Error: ${error.message}`);
        return null;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await handleImageUpload();
      }
      
      await addDoc(collection(db, "recipes"), {
        ...recipe,
        image: imageUrl,
        userId: user.uid,
        createdAt: new Date(),
      });

      // Clear the extracted text from localStorage
      localStorage.removeItem('extractedText');
      
      navigate("/saved-recipes");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert(`Failed to create recipe. Error: ${error.message}`);
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-olive-800 text-center mb-6">Create New Recipe Manually</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Field */}
        <div>
          <label htmlFor="title" className="block text-olive-700 font-medium mb-2">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={recipe.title}
            onChange={handleChange}
            className="w-full border border-olive-300 p-2 rounded focus:ring-2 focus:ring-olive-600"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="image" className="block text-olive-700 font-medium mb-2">Upload Image:</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-olive-300 p-2 rounded focus:ring-2 focus:ring-olive-600"
          />
          {imageUrl && (
            <div className="mt-4">
              <img src={imageUrl} alt="Uploaded recipe" className="w-48 h-48 object-cover rounded shadow-md" />
            </div>
          )}
        </div>

        {/* Ingredients Field */}
        <div>
          <label className="block text-olive-700 font-medium mb-2">Ingredients:</label>
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <input
                type="text"
                value={ingredient}
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

        {/* Instructions Field */}
        <div>
          <label className="block text-olive-700 font-medium mb-2">Instructions:</label>
          {recipe.instructions.map((instruction, index) => (
            <div key={index} className="flex space-x-2 mb-2">
              <textarea
                value={instruction}
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

        {/* Ready in Minutes */}
        <div>
          <label htmlFor="readyInMinutes" className="block text-olive-700 font-medium mb-2">
            Ready in (minutes):
          </label>
          <input
            type="number"
            id="readyInMinutes"
            name="readyInMinutes"
            value={recipe.readyInMinutes}
            onChange={handleChange}
            className="w-full border border-olive-300 p-2 rounded focus:ring-2 focus:ring-olive-600"
            required
          />
        </div>

        {/* Servings */}
        <div>
          <label htmlFor="servings" className="block text-olive-700 font-medium mb-2">Servings:</label>
          <input
            type="number"
            id="servings"
            name="servings"
            value={recipe.servings}
            onChange={handleChange}
            className="w-full border border-olive-300 p-2 rounded focus:ring-2 focus:ring-olive-600"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-olive-800 text-white px-6 py-2 rounded hover:bg-olive-600 transition-all duration-300 ease-in-out"
        >
          Create Recipe
        </button>
      </form>
    </div>
  );
}

export default ManualCreateRecipePage;
