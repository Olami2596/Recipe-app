import { createSlice } from '@reduxjs/toolkit';

const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState: {
    ingredientsList: [],
    shoppingList: [],
    favoriteList: [],
    selectedRecipes: [],
  },
  reducers: {
    setIngredientsList: (state, action) => {
      if (JSON.stringify(state.ingredientsList) !== JSON.stringify(action.payload)) {
        state.ingredientsList = action.payload;
      }
    },
    setShoppingList: (state, action) => {
      if (JSON.stringify(state.shoppingList) !== JSON.stringify(action.payload)) {
        state.shoppingList = action.payload;
      }
    },
    setFavoriteList: (state, action) => {
      if (JSON.stringify(state.favoriteList) !== JSON.stringify(action.payload)) {
        state.favoriteList = action.payload;
      }
    },
    setSelectedRecipes: (state, action) => {
      if (JSON.stringify(state.selectedRecipes) !== JSON.stringify(action.payload)) {
        state.selectedRecipes = action.payload;
      }
    },
  },
});

export const {
  setIngredientsList,
  setShoppingList,
  setFavoriteList,
  setSelectedRecipes,
} = shoppingListSlice.actions;

export default shoppingListSlice.reducer;