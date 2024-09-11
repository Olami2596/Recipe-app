import React, { useEffect, useCallback, useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useShoppingList } from '../contexts/ShoppingListContext';
import { Link } from 'react-router-dom';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableRow, TableCell } from 'docx';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import "jspdf-autotable";

function ShoppingListPage() {
  const [recipes, setRecipes] = useState([]);
  const { user } = useAuth();
  const {
    selectedRecipes,
    setSelectedRecipes,
    ingredientsList,
    setIngredientsList,
    shoppingList,
    setShoppingList,
    favoriteList,
    setFavoriteList,
    fetchLists,
    updateLists
  } = useShoppingList();

  const fetchRecipes = useCallback(async () => {
    try {
      const q = query(collection(db, 'recipes'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const fetchedRecipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecipes(fetchedRecipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
    }
  }, [user.uid]);

  useEffect(() => {
    fetchRecipes();
    fetchLists();
  }, [fetchRecipes, fetchLists]);

  const generateIngredientsList = useCallback(() => {
    const ingredients = selectedRecipes.flatMap(recipeId => {
      const recipe = recipes.find(r => r.id === recipeId);
      return recipe ? recipe.ingredients.map(ing => ({ name: ing, recipeId: recipe.id })) : [];
    });

    setIngredientsList(ingredients);
  }, [selectedRecipes, recipes, setIngredientsList]);

  useEffect(() => {
    generateIngredientsList();
  }, [selectedRecipes, generateIngredientsList]);

  useEffect(() => {
    updateLists();
  }, [selectedRecipes, ingredientsList, shoppingList, favoriteList, updateLists]);

  const handleRecipeSelection = (recipeId) => {
    setSelectedRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const addToShoppingList = (ingredient) => {
    setShoppingList(prev => {
      const existingItem = prev.find(item => item.name.toLowerCase() === ingredient.name.toLowerCase());
      if (existingItem) {
        return prev.map(item => 
          item.name.toLowerCase() === ingredient.name.toLowerCase() 
            ? { ...item, count: item.count + 1 }
            : item
        );
      } else {
        return [...prev, { ...ingredient, count: 1 }];
      }
    });
  };

  const removeFromShoppingList = (index) => {
    setShoppingList(prev => {
      const newList = [...prev];
      if (newList[index].count > 1) {
        newList[index] = { ...newList[index], count: newList[index].count - 1 };
      } else {
        newList.splice(index, 1);
      }
      return newList;
    });
  };

  const toggleFavorite = (item) => {
    setFavoriteList(prev => 
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const exportToDOCX = () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph("Shopping List"),
          new Table({
            rows: shoppingList.map(item => 
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(item.name)] }),
                  new TableCell({ children: [new Paragraph(item.count.toString())] }),
                ],
              })
            ),
          }),
        ],
      }],
    });

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, "shopping_list.docx");
    });
  };

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + shoppingList.map(item => `${item.name},${item.count}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "shopping_list.csv");
    document.body.appendChild(link);
    link.click();
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
      body: shoppingList.map(item => [item.name, item.count]),
    });
    doc.save("shopping_list.pdf");
  };

  const saveShoppingList = async () => {
    if (shoppingList.length === 0) {
      alert("Shopping list is empty. Please add items before saving.");
      return;
    }

    try {
      const shoppingListRef = collection(db, 'shoppingLists');
      await addDoc(shoppingListRef, {
        userId: user.uid,
        items: shoppingList,
        createdAt: new Date()
      });
      alert("Shopping list saved successfully!");
    } catch (error) {
      console.error("Error saving shopping list:", error);
      alert("Failed to save shopping list. Please try again.");
    }
  };

  const clearIngredientsList = () => {
    if (window.confirm("Are you sure you want to clear the ingredients list? This will unselect all recipes.")) {
      setSelectedRecipes([]);
      setIngredientsList([]);
    }
  };

  const clearShoppingList = () => {
    if (window.confirm("Are you sure you want to clear the shopping list?")) {
      setShoppingList([]);
    }
  };

  const clearFavoriteList = () => {
    if (window.confirm("Are you sure you want to clear the favorite list?")) {
      setFavoriteList([]);
    }
  };

  return (
    <div>
      <h1>Shopping List</h1>
      <h2>Select Recipes:</h2>
      <ul>
        {recipes.map(recipe => (
          <li key={recipe.id}>
            <label>
              <input
                type="checkbox"
                checked={selectedRecipes.includes(recipe.id)}
                onChange={() => handleRecipeSelection(recipe.id)}
              />
              {recipe.title}
            </label>
          </li>
        ))}
      </ul>

      {ingredientsList.length > 0 && (
        <div>
          <h2>Ingredients List:</h2>
          <button onClick={clearIngredientsList}>Clear Ingredients List</button>
          <ul>
            {ingredientsList.map((ingredient, index) => (
              <li key={index}>
                {ingredient.name}
                <button onClick={() => addToShoppingList(ingredient)}>Add to Shopping List</button>
                <button onClick={() => toggleFavorite(ingredient.name)}>
                  {favoriteList.includes(ingredient.name) ? 'Unfavorite' : 'Favorite'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {shoppingList.length > 0 && (
        <div>
          <h2>Shopping List:</h2>
          <button onClick={clearShoppingList}>Clear Shopping List</button>
          <ul>
            {shoppingList.map((item, index) => (
              <li key={index}>
                {item.name} {item.count > 1 ? `(x${item.count})` : ''}
                <button onClick={() => removeFromShoppingList(index)}>Remove</button>
                <button onClick={() => toggleFavorite(item.name)}>
                  {favoriteList.includes(item.name) ? 'Unfavorite' : 'Favorite'}
                </button>
              </li>
            ))}
          </ul>
          <button onClick={saveShoppingList}>Save Shopping List</button>
          <h3>Export Options:</h3>
          <button onClick={exportToDOCX}>Export to DOCX</button>
          <button onClick={exportToCSV}>Export to CSV</button>
          <button onClick={exportToExcel}>Export to Excel</button>
          <button onClick={exportToPDF}>Export to PDF</button>
        </div>
      )}

      <Link to="/saved-shopping-lists">View Saved Shopping Lists</Link>

      <h2>Favorite Items:</h2>
      <button onClick={clearFavoriteList}>Clear Favorite List</button>
      <ul>
        {favoriteList.map((item, index) => (
          <li key={index}>
            {item}
            <button onClick={() => toggleFavorite(item)}>Remove from Favorites</button>
            <button onClick={() => addToShoppingList({ name: item })}>Add to Shopping List</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ShoppingListPage;