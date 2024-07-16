import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/Layout/NavBar';
import HomePage from './components/HomePage/HomePage';
import SignUp from './components/Auth/SignUp';
import SignIn from './components/Auth/SignIn';
import Profile from './components/Profile/Profile';
import RecipeList from './components/Recipes/RecipeList';
import RecipeForm from './components/Recipes/RecipeForm';
import RecipeDetail from './components/Recipes/RecipeDetail';
import MyRecipes from './components/Recipes/MyRecipes';
import SearchRecipes from './components/Recipes/SearchRecipes';
import ShoppingList from './components/Recipes/ShoppingList';
import UserManagement from './components/Admin/UserManagement';
import AdminRoute from './components/Admin/AdminRoute';
import Upgrade from './components/Upgrade/Upgrade';
import ProtectedRoute from './components/ProtectedRoute';  // Import ProtectedRoute
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
  return (
    <Router>
      <div>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/add-recipe" element={<ProtectedRoute><RecipeForm /></ProtectedRoute>} />
          <Route path="/edit-recipe/:id" element={<ProtectedRoute><RecipeForm /></ProtectedRoute>} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/my-recipes" element={<ProtectedRoute><MyRecipes /></ProtectedRoute>} />
          <Route path="/search" element={<SearchRecipes />} />
          <Route path="/shopping" element={<ProtectedRoute><ShoppingList /></ProtectedRoute>} />
          <Route path="/upgrade" element={<ProtectedRoute><Upgrade /></ProtectedRoute>} />
          <Route path="/admin/users" element={<AdminRoute element={UserManagement} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

