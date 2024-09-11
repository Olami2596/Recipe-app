import React, { createContext, useState, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ShoppingListContext = createContext();

export const useShoppingList = () => useContext(ShoppingListContext);

export const ShoppingListProvider = ({ children }) => {
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [favoriteList, setFavoriteList] = useState([]);
  const { user } = useAuth();

  const fetchLists = useCallback(async () => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.selectedRecipes) setSelectedRecipes(data.selectedRecipes);
          if (data.ingredientsList) setIngredientsList(data.ingredientsList);
          if (data.shoppingList) setShoppingList(data.shoppingList);
          if (data.favoriteList) setFavoriteList(data.favoriteList);
        }
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    }
  }, [user]);

  const updateLists = useCallback(async () => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          selectedRecipes,
          ingredientsList,
          shoppingList,
          favoriteList
        });
      } catch (error) {
        console.error("Error updating lists:", error);
      }
    }
  }, [user, selectedRecipes, ingredientsList, shoppingList, favoriteList]);

  const value = {
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
  };

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
};