import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

function ExtractedTextRecipePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const extractedText = location.state?.extractedText;

  const [recipe, setRecipe] = useState({
    title: "",
    ingredients: [""],
    instructions: [""],
    readyInMinutes: 0,
    servings: 1,
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (extractedText) {
      const parsedRecipe = parseExtractedText(extractedText);
      setRecipe(parsedRecipe);
    }
  }, [extractedText]);

  const parseExtractedText = (text) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const parsedRecipe = {
      title: lines[0] || '',
      ingredients: [],
      instructions: [],
      readyInMinutes: 0,
      servings: 1,
    };

    let currentSection = 'ingredients';
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].toLowerCase().includes('instructions') || lines[i].toLowerCase().includes('directions')) {
        currentSection = 'instructions';
        continue;
      }
      parsedRecipe[currentSection].push(lines[i]);
    }

    return parsedRecipe;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      [name]: name === 'readyInMinutes' || name === 'servings' ? Number(value) : value
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

  const removeIngredient = (index) => {
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      ingredients: prevRecipe.ingredients.filter((_, i) => i !== index)
    }));
  };

  const removeInstruction = (index) => {
    setRecipe(prevRecipe => ({
      ...prevRecipe,
      instructions: prevRecipe.instructions.filter((_, i) => i !== index)
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
        return null;
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const imageUrl = await handleImageUpload();
      const docRef = await addDoc(collection(db, "recipes"), {
        ...recipe,
        image: imageUrl,
        userId: user.uid,
        createdAt: new Date(),
      });
      console.log("Document written with ID: ", docRef.id);
      navigate("/saved-recipes");
    } catch (error) {
      console.error("Error adding document: ", error);
      alert(`Failed to create recipe. Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Create Recipe from Extracted Text</h1>
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
          <label htmlFor="image">Upload Image:</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
        <div>
          <label>Ingredients:</label>
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index}>
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                required
              />
              <button type="button" onClick={() => removeIngredient(index)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={addIngredient}>Add Ingredient</button>
        </div>
        <div>
          <label>Instructions:</label>
          {recipe.instructions.map((instruction, index) => (
            <div key={index}>
              <textarea
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                required
              />
              <button type="button" onClick={() => removeInstruction(index)}>Remove</button>
            </div>
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

export default ExtractedTextRecipePage;