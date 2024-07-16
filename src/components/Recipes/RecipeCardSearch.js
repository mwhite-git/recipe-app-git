import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeCard.css';

const RecipeCardSearch = ({ recipe, handleFavorite, userFavorites }) => {
  const navigate = useNavigate();

  return (
    <div className="recipe-card">
      {recipe.imageURL && <img src={recipe.imageURL} alt={recipe.title} className="recipe-image" />}
      <h3 className="recipe-title">{recipe.title}</h3>
      <div className="tags-list">
        {recipe.tags && recipe.tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
      <div className="recipe-times">
        <p className="recipe-prep"><strong>Prep Time:</strong> {recipe.prepTime}</p>
        <p className="recipe-cook"><strong>Cook Time:</strong> {recipe.cookTime}</p>
        </div>
      <div className="button-container">
        <button onClick={() => navigate(`/recipe/${recipe.id}`)}>View</button>
        <button
          onClick={() => handleFavorite(recipe.id)}
          disabled={userFavorites.includes(recipe.id)}
          className={`favorite-button ${userFavorites.includes(recipe.id) ? 'favorited' : ''}`}
        >
          {userFavorites.includes(recipe.id) ? 'Favorited' : 'Favorite'}
        </button>
      </div>
    </div>
  );
};

export default RecipeCardSearch;
