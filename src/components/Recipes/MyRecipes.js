import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import './RecipesCommon.css';
import { useSelectedRecipes } from '../../contexts/SelectedRecipesContext';
import RecipeCard from './RecipeCard';
import RecipeCardFav from './RecipeCardFav';

const userTiers = {
  free: { maxRecipes: 15, maxFavorites: 15 },
  premium: { maxRecipes: 50, maxFavorites: 50 },
  pro: { maxRecipes: 200, maxFavorites: 200 },
  admin: { maxRecipes: Infinity, maxFavorites: Infinity } // Admins have no recipe or favorite limit
};

const predefinedTags = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Quick', 'Healthy', 'Dessert'];

const MyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [userTier, setUserTier] = useState('free'); // default to 'free' tier
  const { selectedRecipes, setSelectedRecipes } = useSelectedRecipes();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        fetchUserTier(user.uid); // Fetch the user tier
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserTier = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserTier(userDoc.data().tier || 'free'); // default to 'free' if no tier is set
      }
    } catch (error) {
      console.error("Error fetching user tier:", error);
    }
  };

  useEffect(() => {
    const fetchRecipes = async () => {
      if (currentUser) {
        try {
          const q = query(collection(db, 'recipes'), where('userId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          const recipesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRecipes(recipesList);
          setFilteredRecipes(recipesList);

          const savedQ = query(collection(db, 'savedRecipes'), where('userId', '==', currentUser.uid));
          const savedSnapshot = await getDocs(savedQ);
          const savedList = await Promise.all(savedSnapshot.docs.map(async savedDoc => {
            const recipeDocRef = doc(db, 'recipes', savedDoc.data().recipeId);
            const recipeDoc = await getDoc(recipeDocRef);
            if (recipeDoc.exists()) {
              return { id: recipeDoc.id, ...recipeDoc.data() };
            } else {
              return null;
            }
          }));
          setSavedRecipes(savedList.filter(recipe => recipe !== null));
        } catch (error) {
          console.error("Error fetching recipes:", error);
        }
      }
    };

    fetchRecipes();
  }, [currentUser]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'recipes', id));
      setRecipes(recipes.filter(recipe => recipe.id !== id));
      setFilteredRecipes(filteredRecipes.filter(recipe => recipe.id !== id));
    } catch (error) {
      console.error("Error deleting recipe:", error);
    }
  };

  const handleUnfavorite = async (recipeId) => {
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
      try {
        const favoriteDocRef = doc(db, 'savedRecipes', `${userId}_${recipeId}`);
        await deleteDoc(favoriteDocRef);
        setSavedRecipes(savedRecipes.filter(recipe => recipe.id !== recipeId));
        console.log('Recipe unfavorited successfully');
      } catch (error) {
        console.error('Error unfavoriting recipe:', error);
      }
    } else {
      console.error('User not authenticated');
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterRecipes(term, selectedTags);
  };

  const handleTagClick = (tag) => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updatedTags);
    filterRecipes(searchTerm, updatedTags);
  };

  const filterRecipes = (term, tags) => {
    const filtered = recipes.filter(recipe => {
      const matchesSearchTerm =
        recipe.title.toLowerCase().includes(term) ||
        recipe.description.toLowerCase().includes(term) ||
        recipe.ingredients.some(ingredient => ingredient.name.toLowerCase().includes(term)) ||
        recipe.tags.some(recipeTag => recipeTag.toLowerCase().includes(term));
      const matchesTags = tags.length === 0 || tags.every(tag => recipe.tags.includes(tag));
      return matchesSearchTerm && matchesTags;
    });
    setFilteredRecipes(filtered);
  };

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipes((prevSelected) =>
      prevSelected.includes(recipe)
        ? prevSelected.filter((r) => r !== recipe)
        : [...prevSelected, recipe]
    );
  };

  const navigateToShoppingList = () => {
    navigate('/shopping', { state: { selectedRecipes } });
  };

  const { maxRecipes, maxFavorites } = userTiers[userTier];

  return (
    <div className="my-recipes-container">
      <h1>Your Recipes</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search recipes..."
        className="search-input"
      />
      <div className="tags-container">
        {predefinedTags.map((tag, index) => (
          <button
            key={index}
            className={`tag-button ${selectedTags.includes(tag) ? 'tag-button active' : ''}`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <button onClick={() => navigate('/add-recipe')} className="button button--add-recipe">Add Recipe</button>
      <p className="recipe-amount">{recipes.length} / {maxRecipes === Infinity ? 'Unlimited' : maxRecipes}</p>
      <div className="recipes-list">
        {filteredRecipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            onDelete={handleDelete}
            onSelect={handleSelectRecipe}
            selected={selectedRecipes.includes(recipe)}
          />
        ))}
      </div>
      <h2>Your Favorites</h2>
      <p className="recipe-amount">{savedRecipes.length} / {maxFavorites === Infinity ? 'Unlimited' : maxFavorites}</p>
      <div className="recipes-list">
        {savedRecipes.map(recipe => (
          <RecipeCardFav
            key={recipe.id}
            recipe={recipe}
            onDelete={handleUnfavorite}
            onSelect={handleSelectRecipe}
            selected={selectedRecipes.includes(recipe)}
          />
        ))}
      </div>
      <button
        className="button"
        onClick={navigateToShoppingList}
        disabled={selectedRecipes.length === 0}
      >
        Go to Shopping List
      </button>
    </div>
  );
};

export default MyRecipes;
