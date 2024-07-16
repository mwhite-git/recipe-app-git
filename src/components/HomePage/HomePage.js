import React from 'react';
import Typewriter from '../Typewriter/Typewriter';
import './HomePage.css';


const HomePage = () => {
  const phrases = ["something simple.", "a healthy option.", "a quick recipe.", "something new."];

  // Placeholder data, replace with dynamic content later
  const featuredRecipes = [
    { id: 1, title: "Recipe 1", image: "recipe1.jpg" },
    { id: 2, title: "Recipe 2", image: "recipe2.jpg" },
    { id: 3, title: "Recipe 3", image: "recipe3.jpg" },
  ];

  const latestRecipes = [
    { id: 4, title: "Latest Recipe 1", image: "recipe4.jpg" },
    { id: 5, title: "Latest Recipe 2", image: "recipe5.jpg" },
    { id: 6, title: "Latest Recipe 3", image: "recipe6.jpg" },
  ];

  return (
    <div className="homepage">
      <section className="hero">
        <div className="hero-content">
          <div className="message-container">
            <p className="message message1">What do you want for tea?</p>
            <p className="message message2">Oh, I don't mind.....</p>
            <p className="message message3">What do you fancy?</p>
            <p className="message message4">Ehhh maybe, </p>
            <p className="message message5">
              <Typewriter phrases={phrases} startDelay={1000} />
            </p>
          </div>
          <div className="get-started-container">

          </div>
        </div>
      </section>
      <section className="featured-recipes">
        <h2>Featured Recipes</h2>
        <div className="recipe-grid">
          {featuredRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <img src={recipe.image} alt={recipe.title} />
              <h3>{recipe.title}</h3>
            </div>
          ))}
        </div>
      </section>
      <section className="latest-recipes">
        <h2>Latest Recipes</h2>
        <div className="recipe-grid">
          {latestRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <img src={recipe.image} alt={recipe.title} />
              <h3>{recipe.title}</h3>
            </div>
          ))}
        </div>
      </section>
      <section className="testimonials">
        <h2>User Testimonials</h2>

      </section>

    </div>
  );
};

export default HomePage;
