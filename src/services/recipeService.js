import axios from 'axios';

const API_BASE_URL = 'https://api.spoonacular.com/recipes';
const API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY;

export const searchRecipes = async (query, page = 1, pageSize = 10, cuisine = '') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/complexSearch`, {
      params: {
        apiKey: API_KEY,
        query,
        number: pageSize,
        offset: (page - 1) * pageSize,
        cuisine,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
};

export const getRecipeDetails = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}/information`, {
      params: {
        apiKey: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    throw error;
  }
};