import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './NavBar.css';

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [accountOpen, setAccountOpen] = useState(false);
    const [recipesOpen, setRecipesOpen] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const user = auth.currentUser;
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);
    const toggleAccountMenu = () => setAccountOpen(!accountOpen);
    const toggleRecipesMenu = () => setRecipesOpen(!recipesOpen);
    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark-mode');
        setDarkMode(!darkMode);
    };

    const handleSignOut = () => {
        auth.signOut();
        setAccountOpen(false); // Close account menu after sign out
        navigate('/'); // Redirect to home page after sign out
    };

    useEffect(() => {
        const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
        if (prefersDarkScheme.matches) {
            document.documentElement.classList.add('dark-mode');
            setDarkMode(true);
        }
    }, []);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (user) {
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserRole(docSnap.data().role);
                }
            }
        };

        fetchUserRole();
    }, [user]);

    return (
        <nav className="navbar">
            <div className="nav-left">
                <label className="switch">
                    <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
                    <span className="slider"></span>
                </label>
            </div>
            <div className="nav-center">
                <NavLink to="/" className="logo">RecipeAppLogo</NavLink>
            </div>
            <div className="nav-right">
                <div className="links">
                    <NavLink to="/" className="nav-link">Home</NavLink>
                    <div className="recipes-menu">
                        <span className="nav-link" onClick={toggleRecipesMenu}>Recipes</span>
                        <div className={recipesOpen ? "dropdown show" : "dropdown"}>
                            <NavLink to="/search" className="nav-link" onClick={toggleRecipesMenu}>Search</NavLink>
                            {user && <NavLink to="/my-recipes" className="nav-link" onClick={toggleRecipesMenu}>My Recipes</NavLink>}
                        </div>
                    </div>
                    <NavLink to="/shopping" className="nav-link">Shopping</NavLink>
                    {user ? (
                        <div className="account-menu">
                            <span className="nav-link" onClick={toggleAccountMenu}>Account</span>
                            <div className={accountOpen ? "dropdown show" : "dropdown"}>
                                <NavLink to="/profile" className="nav-link" onClick={toggleAccountMenu}>Profile</NavLink>
                                {userRole === 'free' && (
                                    <NavLink to="/upgrade" className="nav-link" onClick={toggleAccountMenu}>Upgrade</NavLink>
                                )}
                                <NavLink to="/" className="nav-link" onClick={handleSignOut}>Sign Out</NavLink>
                            </div>
                            <div className={accountOpen ? "nested-dropdown show" : "nested-dropdown"}>
                                <NavLink to="/profile" className="nav-link" onClick={toggleAccountMenu}>Profile</NavLink>
                                {userRole === 'free' && (
                                    <NavLink to="/upgrade" className="nav-link" onClick={toggleAccountMenu}>Upgrade</NavLink>
                                )}
                                <NavLink to="/" className="nav-link" onClick={handleSignOut}>Sign Out</NavLink>
                            </div>
                        </div>
                    ) : (
                        <NavLink to="/signin" className="nav-link">Login</NavLink>
                    )}
                </div>
                <button className="toggle" onClick={toggleMenu}>
                    <i className={isOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
                </button>
                <div className={isOpen ? "dropdown show" : "dropdown"}>
                    <NavLink to="/" className="nav-link" onClick={toggleMenu}>Home</NavLink>
                    <span className="nav-link" onClick={toggleRecipesMenu}>Recipes</span>
                    <div className={recipesOpen ? "nested-dropdown show" : "nested-dropdown"}>
                        <NavLink to="/search" className="nav-link" onClick={toggleMenu}>Search</NavLink>
                        {user && <NavLink to="/my-recipes" className="nav-link" onClick={toggleMenu}>My Recipes</NavLink>}
                    </div>
                    <NavLink to="/shopping" className="nav-link" onClick={toggleMenu}>Shopping</NavLink>
                    {user ? (
                        <>
                            <span className="nav-link" onClick={toggleAccountMenu}>Account</span>
                            <div className={accountOpen ? "nested-dropdown show" : "nested-dropdown"}>
                                <NavLink to="/profile" className="nav-link" onClick={toggleMenu}>Profile</NavLink>
                                {userRole === 'free' && (
                                    <NavLink to="/upgrade" className="nav-link" onClick={toggleMenu}>Upgrade</NavLink>
                                )}
                                <NavLink to="/" className="nav-link" onClick={handleSignOut}>Sign Out</NavLink>
                            </div>
                        </>
                    ) : (
                        <NavLink to="/signin" className="nav-link" onClick={toggleMenu}>Login</NavLink>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;

