import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const createUserDocument = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  const docSnap = await getDoc(userDocRef);
  if (!docSnap.exists()) {
    await setDoc(userDocRef, {
      favoriteList: [],
      ingredientsList: [],
      shoppingList: []
    });
  }
};