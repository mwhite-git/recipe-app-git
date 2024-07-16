import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { deleteRecipe } from '../../services/recipeService';
import { auth } from '../../firebase';
import { isAdmin } from '../../utils/authUtils';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      setRecipes(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const checkAdmin = async () => {
      const user = auth.currentUser;
      if (user) {
        const adminStatus = await isAdmin(user);
        setAdmin(adminStatus);
      }
    };

    fetchRecipes();
    checkAdmin();
  }, []);

  const handleDelete = async (recipeId) => {
    await deleteRecipe(recipeId);
    setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
  };

  return (
    <div>
      <h2>Recipes</h2>
      <ul>
        {recipes.map(recipe => (
          <li key={recipe.id}>
            <h3>{recipe.title}</h3>
            <p>{recipe.content}</p>
            {admin && (
              <button onClick={() => handleDelete(recipe.id)}>Delete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecipeList;
