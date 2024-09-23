import React, { createContext, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from './AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  setIngredientsList,
  setShoppingList,
  setFavoriteList,
  setSelectedRecipes,
} from '../store/shoppingListSlice';

const ShoppingListContext = createContext();
export const useShoppingList = () => useContext(ShoppingListContext);

export const ShoppingListProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const {
    ingredientsList = [],
    shoppingList = [],
    favoriteList = [],
    selectedRecipes = [],
  } = useSelector((state) => state.shoppingList);

  const fetchLists = useCallback(async () => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          dispatch(setSelectedRecipes(data.selectedRecipes || []));
          dispatch(setIngredientsList(data.ingredientsList || []));
          dispatch(setShoppingList(data.shoppingList || []));
          dispatch(setFavoriteList(data.favoriteList || []));
        }
      } catch (error) {
        console.error("Error fetching lists:", error);
      }
    }
  }, [user, dispatch]);

  const updateLists = useCallback(async () => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          selectedRecipes,
          ingredientsList,
          shoppingList,
          favoriteList,
        });
      } catch (error) {
        console.error("Error updating lists:", error);
      }
    }
  }, [user, selectedRecipes, ingredientsList, shoppingList, favoriteList]);

  const value = {
    selectedRecipes,
    setSelectedRecipes: (recipes) => dispatch(setSelectedRecipes(recipes)),
    ingredientsList,
    setIngredientsList: (ingredients) => dispatch(setIngredientsList(ingredients)),
    shoppingList,
    setShoppingList: (list) => dispatch(setShoppingList(list)),
    favoriteList,
    setFavoriteList: (list) => dispatch(setFavoriteList(list)),
    fetchLists,
    updateLists,
  };

  return (
    <ShoppingListContext.Provider value={value}>
      {children}
    </ShoppingListContext.Provider>
  );
};