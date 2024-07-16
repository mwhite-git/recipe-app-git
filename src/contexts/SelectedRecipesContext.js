import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SelectedRecipesContext = createContext();

export const useSelectedRecipes = () => useContext(SelectedRecipesContext);

export const SelectedRecipesProvider = ({ children }) => {
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const { currentUser } = useAuth();

  const clearSelectedRecipes = () => {
    setSelectedRecipes([]);
    setShoppingList([]);
  };

  const clearShoppingList = () => {
    setShoppingList([]);
  };

  const saveData = useCallback(async (recipes, list) => {
    if (currentUser) {
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await setDoc(userDocRef, { selectedRecipes: recipes, shoppingList: list }, { merge: true });
        console.log('Saved data for user:', currentUser.uid);
      } catch (error) {
        console.error('Error saving data:', error);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const selectedRecipesData = userData.selectedRecipes || [];
          const shoppingListData = userData.shoppingList || [];
          setSelectedRecipes(selectedRecipesData);
          setShoppingList(shoppingListData);
        } else {
          console.log('No data found for user');
        }
      } else {
        clearSelectedRecipes();
      }
    };

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (selectedRecipes.length > 0 || shoppingList.length > 0) {
      saveData(selectedRecipes, shoppingList);
    }
  }, [selectedRecipes, shoppingList, saveData]);

  return (
    <SelectedRecipesContext.Provider value={{
      selectedRecipes,
      setSelectedRecipes,
      shoppingList,
      setShoppingList,
      clearSelectedRecipes,
      clearShoppingList
    }}>
      {children}
    </SelectedRecipesContext.Provider>
  );
};
