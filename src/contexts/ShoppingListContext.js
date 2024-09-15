import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ShoppingListContext = createContext();

export const useShoppingList = () => useContext(ShoppingListContext);

export const ShoppingListProvider = ({ children }) => {
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [ingredientsList, setIngredientsList] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [favoriteList, setFavoriteList] = useState([]);
  const { user } = useAuth();

  // Fetch lists from Firebase on component mount
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

  const fetchAllLists = useCallback(async () => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSelectedRecipes(data.selectedRecipes || []);
          setIngredientsList(data.ingredientsList || []);
          setShoppingList(data.shoppingList || []);
          setFavoriteList(data.favoriteList || []);
        }
      } catch (error) {
        console.error("Error fetching all lists:", error);
      }
    }
  }, [user]);

  // Update lists in Firebase whenever local state changes
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

  // Save favorite list separately
  const saveFavoriteList = useCallback(async (newList) => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { favoriteList: newList });
      } catch (error) {
        console.error("Error saving favorite list:", error);
      }
    }
  }, [user]);

  // Fetch all lists on component mount
  useEffect(() => {
    if (user) {
      fetchLists();
    }
  }, [user, fetchLists]);

  // Watch for changes in any list and save them to Firebase
  useEffect(() => {
    updateLists();
  }, [selectedRecipes, ingredientsList, shoppingList, favoriteList, updateLists]);

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
    updateLists,
    saveFavoriteList,
    fetchAllLists,
  };

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
};
