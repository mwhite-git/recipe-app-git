import React, { useEffect, useState } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, getDocs, doc, setDoc, where, getDoc, orderBy, limit, startAfter, startAt } from 'firebase/firestore';
import './RecipesCommon.css';
import RecipeCardSearch from './RecipeCardSearch'; // Import RecipeCardSearch

const userTiers = {
  free: { maxFavorites: 15 },
  premium: { maxFavorites: 50 },
  pro: { maxFavorites: 200 },
  admin: { maxFavorites: Infinity } // Admins have no favorite limit
};

const predefinedTags = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Quick', 'Healthy', 'Dessert'];

const SearchRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFavorites, setUserFavorites] = useState([]);
  const [maxFavorites, setMaxFavorites] = useState(userTiers.free.maxFavorites); // Default to free tier limit
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [lastDoc, setLastDoc] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const recipesPerPage = 20; // Number of recipes per page
  const [pageCursors, setPageCursors] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const q = query(
        collection(db, 'recipes'),
        orderBy('title'),
        limit(recipesPerPage)
      );
    
      const querySnapshot = await getDocs(q);
      const recipesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecipes(recipesList);
    
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastDoc(lastVisible);
    
      // Save the first cursor (the start of the first page)
      setPageCursors([querySnapshot.docs[0]]);
    
      // Calculate total pages
      const totalDocs = (await getDocs(collection(db, 'recipes'))).size;
      setTotalPages(Math.ceil(totalDocs / recipesPerPage));
    
      const user = auth.currentUser;
      if (user) {
        const favoritesQ = query(collection(db, 'savedRecipes'), where('userId', '==', user.uid));
        const favoritesSnapshot = await getDocs(favoritesQ);
        const favoritesList = favoritesSnapshot.docs.map(doc => doc.data().recipeId);
        setUserFavorites(favoritesList);
    
        // Fetch user role and set maxFavorites accordingly
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setMaxFavorites(userTiers[userData.role]?.maxFavorites || userTiers.free.maxFavorites);
        }
      }
    };

    fetchRecipes();
  }, []);

  const fetchMoreRecipes = async () => {
    const q = query(
      collection(db, 'recipes'),
      orderBy('title'),
      startAfter(lastDoc),
      limit(recipesPerPage)
    );
  
    const querySnapshot = await getDocs(q);
    const recipesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRecipes(recipesList);
  
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    setLastDoc(lastVisible);
  
    // Save the cursor for the current page
    setPageCursors(prevCursors => [...prevCursors, querySnapshot.docs[0]]);
  };

  const fetchPreviousRecipes = async () => {
    if (pageCursors.length > 1) {
      const newCursors = pageCursors.slice(0, -1); // Remove the last cursor
      const previousCursor = newCursors[newCursors.length - 1]; // Get the new last cursor
  
      const q = query(
        collection(db, 'recipes'),
        orderBy('title'),
        startAt(previousCursor),
        limit(recipesPerPage)
      );
  
      const querySnapshot = await getDocs(q);
      const recipesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecipes(recipesList);
  
      const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastDoc(lastVisible);
  
      // Update the page cursors stack
      setPageCursors(newCursors);
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = recipes.filter(recipe =>
      recipe.title.toLowerCase().includes(term) ||
      recipe.description.toLowerCase().includes(term) ||
      recipe.ingredients.some(ingredient => ingredient.name.toLowerCase().includes(term)) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(term))
    );
    setRecipes(filtered);
  };

  const handleFavorite = async (recipeId) => {
    const user = auth.currentUser;
    if (user) {
      const userId = user.uid;
  
      // Check if the user has reached the max favorites limit
      if (userFavorites.length >= maxFavorites) {
        console.error(`You have reached the maximum number of favorites (${maxFavorites}).`);
        return;
      }
  
      try {
        const favoriteDocRef = doc(db, 'savedRecipes', `${userId}_${recipeId}`);
        await setDoc(favoriteDocRef, { userId, recipeId });
        setUserFavorites([...userFavorites, recipeId]); // Update the userFavorites state
        console.log('Recipe favorited successfully');
      } catch (error) {
        console.error('Error favoriting recipe:', error);
      }
    } else {
      console.error('User not authenticated');
    }
  };
  

  const handleTagClick = (tag) => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updatedTags);
    
    const filtered = recipes.filter(recipe => 
      updatedTags.every(tag => recipe.tags.includes(tag))
    );
    setRecipes(filtered);
  };

  const handleNextPage = async () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      await fetchMoreRecipes();
    }
  };
  
  const handlePreviousPage = async () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      await fetchPreviousRecipes();
    }
  };

  return (
    <div className="search-recipes-container">
      <h1 className="try-something">Let's try something new!</h1>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder="Search recipes..."
        className="search-input"
        style={{ marginTop: '1rem' }} // Adjust margin-top to move it away from the nav bar
      />
      <div className="tags-container">
        {predefinedTags.map((tag, index) => (
          <button
            key={index}
            className={`tag-button ${selectedTags.includes(tag) ? 'active' : ''}`}
            onClick={() => handleTagClick(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="recipes-list">
        {recipes.map(recipe => (
          <RecipeCardSearch
            key={recipe.id}
            recipe={recipe}
            handleFavorite={handleFavorite}
            userFavorites={userFavorites}
          />
        ))}
      </div>
      <div className="pagination-controls">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default SearchRecipes;
