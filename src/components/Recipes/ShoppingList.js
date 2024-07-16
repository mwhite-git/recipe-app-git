import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelectedRecipes } from '../../contexts/SelectedRecipesContext';
import { useAuth } from '../../contexts/AuthContext';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './ShoppingList.css';

const ShoppingList = () => {
  const navigate = useNavigate();
  const { selectedRecipes, shoppingList, setShoppingList, clearSelectedRecipes } = useSelectedRecipes(); // Remove setSelectedRecipes if not used
  const [checkboxState, setCheckboxState] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    // Initialize checkbox state
    setCheckboxState(shoppingList.map(item => item.completed || false));
  }, [shoppingList]);

  useEffect(() => {
    // Clear local state when currentUser changes
    if (!currentUser) {
      setShoppingList([]);
      setCheckboxState([]);
    }
  }, [currentUser, setShoppingList]);

  useEffect(() => {
    const generateShoppingList = () => {
      const ingredients = selectedRecipes.flatMap(recipe => recipe.ingredients);
      const uniqueIngredients = ingredients.reduce((acc, ingredient) => {
        const parsed = parseQuantity(ingredient.quantity);
        const found = acc.find(item => item.name === ingredient.name && item.unit === parsed.unit);
        if (found) {
          found.quantity += parsed.value;
        } else {
          const newIngredient = { ...ingredient, quantity: parsed.value, unit: parsed.unit, completed: false };
          acc.push(newIngredient);
        }
        return acc;
      }, []);
      setShoppingList(uniqueIngredients);
      setCheckboxState(uniqueIngredients.map(() => false)); // Initialize local checkbox state
    };

    if (selectedRecipes.length > 0) {
      generateShoppingList();
    }
  }, [selectedRecipes, setShoppingList]);

  const parseQuantity = (quantity) => {
    const match = quantity.match(/(\d+\.?\d*)\s*(.*)/);
    return match ? { value: parseFloat(match[1]), unit: match[2].trim() } : { value: 0, unit: quantity };
  };

  const toggleItemCompletion = (index) => {
    setCheckboxState(prevState => {
      const newState = [...prevState];
      newState[index] = !newState[index];
      const updatedShoppingList = [...shoppingList];
      updatedShoppingList[index].completed = newState[index];
      setShoppingList(updatedShoppingList);
      return newState;
    });
  };

  return (
    <div className="shopping-list-container">
      <h2>Meal Planner</h2>
      <div className="selected-recipes">
        <h3>Selected Recipes</h3>
        <ul>
          {selectedRecipes.map((recipe, index) => (
            <li key={index} className="selected-recipe-item">
              <span>{recipe.title}</span>
              <button onClick={() => navigate(`/recipe/${recipe.id}`)}>View</button>
            </li>
          ))}
        </ul>
      </div>
      <h3>Shopping List</h3>
      <ul className="shopping-list">
        {shoppingList.map((ingredient, index) => (
          <li
            key={index}
            className={`shopping-list-item ${checkboxState[index] ? 'completed' : ''}`}
            onClick={() => toggleItemCompletion(index)}
          >
            <div className="item-details">
              <span>{ingredient.quantity} {ingredient.unit} {ingredient.name}</span>
            </div>
            <span className={`icon ${checkboxState[index] ? 'completed' : ''}`}>
              {checkboxState[index] ? <FaCheckCircle /> : <FaTimesCircle />}
            </span>
          </li>
        ))}
      </ul>
      <button className="clear-button" onClick={() => {
        setShoppingList([]);
        setCheckboxState([]);
      }}>Clear Shopping List</button>
      <button className="clear-button" onClick={clearSelectedRecipes}>Clear All</button>
    </div>
  );
};

export default ShoppingList;