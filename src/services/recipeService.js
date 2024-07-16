import { db, auth } from '../firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { userTiers } from '../config/userTiers';
import { isAdmin } from '../utils/authUtils';

export const canCreateRecipe = async (user) => {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userRole = userDoc.data().role;
    const maxRecipes = userTiers[userRole].maxRecipes;

    const recipesQuery = query(collection(db, "recipes"), where("userId", "==", user.uid));
    const recipesSnapshot = await getDocs(recipesQuery);
    const userRecipesCount = recipesSnapshot.size;

    return userRecipesCount < maxRecipes;
  } catch (error) {
    console.error("Error checking recipe limit:", error);
    return false;
  }
};

export const createRecipe = async (recipeData) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const allowedToCreate = await canCreateRecipe(user);

  if (allowedToCreate) {
    await addDoc(collection(db, "recipes"), {
      ...recipeData,
      userId: user.uid
    });
    console.log("Recipe created");
  } else {
    console.log("Recipe limit reached");
  }
};

export const deleteRecipe = async (recipeId) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const admin = await isAdmin(user);

  if (admin) {
    await deleteDoc(doc(db, "recipes", recipeId));
    console.log("Recipe deleted by admin");
  } else {
    console.log("Only admins can delete recipes");
  }
};
