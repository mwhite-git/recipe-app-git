import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import './RecipeDetail.css';

const RecipeDetail = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeDoc = await getDoc(doc(db, 'recipes', id));
        if (recipeDoc.exists()) {
          setRecipe({ id: recipeDoc.id, ...recipeDoc.data() });
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
      }
    };

    fetchRecipe();
  }, [id]);

  if (!recipe) return <div>Loading...</div>;

  return (
    <div className="recipe-detail-container">
      <h1>{recipe.title}</h1>
      {recipe.imageURL && <img src={recipe.imageURL} alt={recipe.title} />}
      <p><strong>Description:</strong> {recipe.description}</p>
      <p><strong>Prep Time:</strong> {recipe.prepTime}</p>
      <p><strong>Cook Time:</strong> {recipe.cookTime}</p>
      <h2>Ingredients</h2>
      <ul>
        {recipe.ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient.quantity} {ingredient.name}</li>
        ))}
      </ul>
      <h2>Method</h2>
      <ul>
        {recipe.methods && recipe.methods.map((method, index) => (
          <li key={index}>{method}</li>
        ))}
      </ul>
      <h2>Tags</h2>
      <div className="tags-list">
        {recipe.tags.map((tag, index) => (
          <span key={index} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
};

export default RecipeDetail;

