import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { auth, db, storage } from '../../firebase';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './RecipeForm.css';

const predefinedTags = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Quick', 'Healthy', 'Dessert'];

const RecipeForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '' }]);
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [methods, setMethods] = useState(['']);
  const [tags, setTags] = useState([]);
  const [image, setImage] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      if (id) {
        const docRef = doc(db, 'recipes', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const recipe = docSnap.data();
          setTitle(recipe.title);
          setDescription(recipe.description);
          setIngredients(recipe.ingredients || [{ name: '', quantity: '' }]);
          setPrepTime(recipe.prepTime);
          setCookTime(recipe.cookTime);
          setMethods(recipe.methods || ['']);
          setTags(recipe.tags || []);
          setImageURL(recipe.imageURL);
        }
      }
    };

    fetchRecipe();
  }, [id]);

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '' }]);
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    
    if (field === 'name') {
      // Capitalize the first letter
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }
    
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(newIngredients);
  };

  const handleAddMethod = () => {
    setMethods([...methods, '']);
  };

  const handleMethodChange = (index, value) => {
    const newMethods = [...methods];
    newMethods[index] = value;
    setMethods(newMethods);
  };

  const handleRemoveMethod = (index) => {
    const newMethods = methods.filter((_, i) => i !== index);
    setMethods(newMethods);
  };

  const handleTagChange = (tag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter(t => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (image && !['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
      setError('Please upload an image file (jpeg, png, or webp)');
      return;
    }

    let uploadedImageURL = imageURL;

    if (image) {
      const imageRef = ref(storage, `images/${auth.currentUser.uid}/${image.name}`);
      await uploadBytes(imageRef, image);
      uploadedImageURL = await getDownloadURL(imageRef);
    }

    const recipeData = {
      title,
      description,
      ingredients,
      prepTime,
      cookTime,
      methods,
      tags,
      imageURL: uploadedImageURL,
      userId: auth.currentUser.uid
    };

    try {
      if (id) {
        const docRef = doc(db, 'recipes', id);
        await updateDoc(docRef, recipeData);
      } else {
        await addDoc(collection(db, 'recipes'), recipeData);
      }
      navigate('/my-recipes');
    } catch (error) {
      console.error('Error adding/updating document: ', error);
      setError('Failed to save the recipe. Please try again.');
    }
  };

  return (
    <div className="recipe-form-container">
      <div className="recipe-form-header">
        <h2>{id ? 'Edit Recipe' : 'Add Recipe'}</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
          className="full-width-input"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          required
          className="full-width-input"
        />
        <div className="time-inputs">
          <input
            type="text"
            value={prepTime}
            onChange={(e) => setPrepTime(e.target.value)}
            placeholder="Prep Time"
            required
            className="half-width-input"
          />
          <input
            type="text"
            value={cookTime}
            onChange={(e) => setCookTime(e.target.value)}
            placeholder="Cook Time"
            required
            className="half-width-input"
          />
        </div>
        <h3>Ingredients</h3>
        <div className="ingredients-list">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-item">
              <input
                type="text"
                value={ingredient.name}
                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                placeholder={`Ingredient ${index + 1}`}
                required
              />
              <input
                type="text"
                value={ingredient.quantity}
                onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                placeholder="Quantity"
                className="quantity-input"
                required
              />
              <button type="button" className="remove-button" onClick={() => handleRemoveIngredient(index)}>Remove</button>
            </div>
          ))}
          <button type="button" className="add-button" onClick={handleAddIngredient}>Add Ingredient</button>
        </div>
        <h3>Method</h3>
        <div className="methods-list">
          {methods.map((method, index) => (
            <div key={index} className="method-item">
              <textarea
                value={method}
                onChange={(e) => handleMethodChange(index, e.target.value)}
                placeholder={`Step ${index + 1}`}
                required
                className="full-width-input"
              />
              <button type="button" className="remove-button" onClick={() => handleRemoveMethod(index)}>Remove</button>
            </div>
          ))}
          <button type="button" className="add-button" onClick={handleAddMethod}>Add Step</button>
        </div>
        <div className="tags-input">
          {predefinedTags.map((tag, index) => (
            <label key={index} className="tag-checkbox">
              <input
                type="checkbox"
                checked={tags.includes(tag)}
                onChange={() => handleTagChange(tag)}
              />
              {tag}
            </label>
          ))}
        </div>
        {imagePreview && <img src={imagePreview} alt={`Preview of ${title}`} className="image-preview" />}
        <input
          type="file"
          onChange={handleFileChange}
        />
        {error && <p className="error">{error}</p>}
        <div className="button-container">
          <button type="submit" className="main-button">{id ? 'Update Recipe' : 'Add Recipe'}</button>
          <button type="button" className="main-button" onClick={() => navigate('/my-recipes')}>Back</button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;
