import React, { useEffect, useCallback, useState, useRef } from "react";
import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from "docx";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import {
  setIngredientsList,
  setShoppingList,
  setFavoriteList,
  setSelectedRecipes,
} from "../store/shoppingListSlice";

function ShoppingListPage() {
  const [recipes, setRecipes] = useState([]);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const {
    selectedRecipes = [],
    ingredientsList = [],
    shoppingList = [],
    favoriteList = [],
  } = useSelector((state) => state.shoppingList);

  const navigate = useNavigate();
  const shoppingListRef = useRef(null);

  const fetchRecipes = useCallback(async () => {
    try {
      const q = query(
        collection(db, "recipes"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const fetchedRecipes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const generateIngredientsList = useCallback(() => {
    const ingredients = selectedRecipes.flatMap((recipeId) => {
      const recipe = recipes.find((r) => r.id === recipeId);
      return recipe
        ? recipe.ingredients.map((ing) => ({ name: ing, recipeId: recipe.id }))
        : [];
    });
    dispatch(setIngredientsList(ingredients));
  }, [selectedRecipes, recipes, dispatch]);

  useEffect(() => {
    generateIngredientsList();
  }, [selectedRecipes, generateIngredientsList]);

  const handleRecipeSelection = (recipeId) => {
    const newSelectedRecipes = selectedRecipes.includes(recipeId)
      ? selectedRecipes.filter((id) => id !== recipeId)
      : [...selectedRecipes, recipeId];
    dispatch(setSelectedRecipes(newSelectedRecipes));
  };

  const addToShoppingList = (ingredient) => {
    // Create a copy of the shopping list
    const newShoppingList = shoppingList.map(item => ({ ...item }));
  
    const existingItem = newShoppingList.find(
      (item) => item.name.toLowerCase() === ingredient.name.toLowerCase()
    );
    
    // If the item already exists, create a new object with an updated count
    if (existingItem) {
      const updatedItem = {
        ...existingItem,
        count: existingItem.count + 1
      };
      const updatedShoppingList = newShoppingList.map(item =>
        item.name.toLowerCase() === ingredient.name.toLowerCase() ? updatedItem : item
      );
      dispatch(setShoppingList(updatedShoppingList));
    } else {
      // If the item doesn't exist, add it to the list with a count of 1
      const updatedShoppingList = [...newShoppingList, { ...ingredient, count: 1 }];
      dispatch(setShoppingList(updatedShoppingList));
    }
  };
  

  const removeFromShoppingList = (index) => {
    const newShoppingList = [...shoppingList];
    if (newShoppingList[index].count > 1) {
      newShoppingList[index] = {
        ...newShoppingList[index],
        count: newShoppingList[index].count - 1,
      };
    } else {
      newShoppingList.splice(index, 1);
    }
    dispatch(setShoppingList(newShoppingList));
  };

  const toggleFavorite = (item) => {
    const newList = favoriteList.includes(item)
      ? favoriteList.filter((i) => i !== item)
      : [...favoriteList, item];
    dispatch(setFavoriteList(newList));
  };

  const exportToDOCX = () => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph("Shopping List"),
            new Table({
              rows: shoppingList.map(
                (item) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(item.name)] }),
                      new TableCell({
                        children: [new Paragraph(item.count.toString())],
                      }),
                    ],
                  })
              ),
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "shopping_list.docx");
    });
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(shoppingList);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shopping List");
    XLSX.writeFile(wb, "shopping_list.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Shopping List", 10, 10);
    doc.autoTable({
      head: [["Item", "Count"]],
      body: shoppingList.map((item) => [item.name, item.count]),
    });
    doc.save("shopping_list.pdf");
  };

  const exportToImage = async () => {
    const element = shoppingListRef.current;
    const canvas = await html2canvas(element);
    const dataURL = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "shopping_list.png";
    link.click();
  };

  const saveShoppingList = async () => {
    if (shoppingList.length === 0) {
      alert("Shopping list is empty. Please add items before saving.");
      return;
    }

    try {
      const shoppingListRef = collection(db, "shoppingLists");
      await addDoc(shoppingListRef, {
        userId: user.uid,
        items: shoppingList,
        createdAt: new Date(),
      });
      alert("Shopping list saved successfully!");
    } catch (error) {
      console.error("Error saving shopping list:", error);
      alert("Failed to save shopping list. Please try again.");
    }
  };

  const clearIngredientsList = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the ingredients list? This will unselect all recipes."
      )
    ) {
      dispatch(setSelectedRecipes([]));
      dispatch(setIngredientsList([]));
    }
  };

  const clearShoppingList = () => {
    if (window.confirm("Are you sure you want to clear the shopping list?")) {
      dispatch(setShoppingList([]));
    }
  };

  const clearFavoriteList = () => {
    if (window.confirm("Are you sure you want to clear the favorite list?")) {
      dispatch(setFavoriteList([]));
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center w-full md:w-3/4 mx-auto mb-6">
        <h1 className="text-3xl font-bold text-olive-800">Shopping List</h1>
        <button
          onClick={() => navigate("/saved-shopping-lists")}
          className="bg-olive-800 text-white px-6 py-2 rounded hover:bg-olive-600 mt-4 md:mt-0"
        >
          View Saved Shopping Lists
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-olive-700 mb-4">
          Select Recipes:
        </h2>
        <ul className="space-y-2">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedRecipes.includes(recipe.id)}
                  onChange={() => handleRecipeSelection(recipe.id)}
                  className="mr-2"
                />
                {recipe.title}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-olive-700 mb-4">
          Ingredients List:
        </h2>
        {ingredientsList.length > 0 && (
          <div>
            <button
              onClick={clearIngredientsList}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 mb-4"
            >
              Clear Ingredients List
            </button>
            <ul className="space-y-2">
              {ingredientsList.map((ingredient, index) => (
                <li key={index} className="flex justify-between items-center">
                  {ingredient.name}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => addToShoppingList(ingredient)}
                      className="bg-olive-800 text-white px-3 py-1 rounded hover:bg-olive-600 sm:px-2 sm:py-1 text-sm"
                    >
                      Add to Shopping List
                    </button>
                    <button
                      onClick={() => toggleFavorite(ingredient.name)}
                      className={`px-3 py-1 rounded sm:px-2 sm:py-1 text-sm ${
                        favoriteList.includes(ingredient.name)
                          ? "bg-yellow-400 hover:bg-yellow-500"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    >
                      {favoriteList.includes(ingredient.name)
                        ? "Unfavorite"
                        : "Favorite"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-olive-700 mb-4">
          Shopping List:
        </h2>
        {shoppingList.length > 0 && (
          <div>
            <button
              onClick={clearShoppingList}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 mb-4"
            >
              Clear Shopping List
            </button>
            <ul ref={shoppingListRef} className="space-y-2">
              {shoppingList.map((item, index) => (
                <li key={index} className="flex justify-between items-center">
                  {item.name} {item.count > 1 ? `(x${item.count})` : ""}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => removeFromShoppingList(index)}
                      className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => toggleFavorite(item.name)}
                      className={`px-3 py-1 rounded ${
                        favoriteList.includes(item.name)
                          ? "bg-yellow-400 hover:bg-yellow-500"
                          : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    >
                      {favoriteList.includes(item.name)
                        ? "Unfavorite"
                        : "Favorite"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <button
              onClick={saveShoppingList}
              className="bg-olive-800 text-white px-6 py-2 rounded hover:bg-olive-600 mt-4"
            >
              Save Shopping List
            </button>

            <h3 className="text-lg font-semibold text-olive-700 mt-6">
              Export Options:
            </h3>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={exportToDOCX}
                className="bg-olive-800 text-white px-4 py-2 rounded hover:bg-olive-600 "
              >
                DOCX
              </button>
              <button
                onClick={exportToExcel}
                className="bg-olive-800 text-white px-4 py-2 rounded hover:bg-olive-600 "
              >
                Excel
              </button>
              <button
                onClick={exportToPDF}
                className="bg-olive-800 text-white px-4 py-2 rounded hover:bg-olive-600 "
              >
                PDF
              </button>
              <button
                onClick={exportToImage}
                className="bg-olive-800 text-white px-4 py-2 rounded hover:bg-olive-600 "
              >
                Image
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold text-olive-700 mb-4">
          Favorite Items:
        </h2>
        <button
          onClick={clearFavoriteList}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 mb-4"
        >
          Clear Favorite List
        </button>
        <ul className="space-y-2">
          {ingredientsList.map((ingredient, index) => (
            <li
              key={index}
              className="flex justify-between items-center space-x-4"
            >
              {/* Ingredient name */}
              <span className="text-olive-700">{ingredient.name}</span>

              {/* Buttons */}
              <div className="flex space-x-2 sm:space-x-1">
                <button
                  onClick={() => addToShoppingList(ingredient)}
                  className="bg-olive-800 text-white px-3 py-1 rounded hover:bg-olive-600 sm:px-2 sm:py-1 text-sm"
                >
                  Add to Shopping List
                </button>
                <button
                  onClick={() => toggleFavorite(ingredient.name)}
                  className={`px-3 py-1 rounded sm:px-2 sm:py-1 text-sm ${
                    favoriteList.includes(ingredient.name)
                      ? "bg-yellow-400 hover:bg-yellow-500"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                >
                  {favoriteList.includes(ingredient.name)
                    ? "Unfavorite"
                    : "Favorite"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ShoppingListPage;
