import React from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeCard.css';

const RecipeCard = ({ recipe, onDelete, onSelect, selected }) => {
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
        <button onClick={() => navigate(`/edit-recipe/${recipe.id}`)}>Edit</button>
        <button onClick={() => onDelete(recipe.id)}>Delete</button>
      </div>
      <button
        className="button button--shopping"
        onClick={() => onSelect(recipe)}
      >
        {selected ? 'Remove from Shopping' : 'Add To Shopping'}
      </button>
    </div>
  );
};

export default RecipeCard;
