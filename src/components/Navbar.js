import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = ({ user, handleLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // For Create Recipe dropdown

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <nav className="bg-olive-100 p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-xl font-bold text-olive-800">Recipe App</div>

        {/* Hamburger Menu for Mobile */}
        <div className="block lg:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-olive-800 hover:text-olive-600 focus:outline-none"
          >
            {/* Hamburger Icon */}
            <svg
              className="h-6 w-6 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"
              />
            </svg>
          </button>
        </div>

        {/* Main Navigation - hidden on mobile */}
        <ul className="hidden lg:flex space-x-4 w-full justify-center">
          <li className="w-1/5">
            <Link to="/saved-recipes">
              <button className="w-full border border-olive-800 text-olive-800 px-4 py-2 rounded hover:bg-olive-800 hover:text-olive-100 transition-all duration-300 ease-in-out">
                Home
              </button>
            </Link>
          </li>
          <li className="relative group w-1/5">
            {/* Hover on large screens, click on mobile */}
            <button
              onClick={toggleDropdown}
              className="w-full border border-olive-800 text-olive-800 px-4 py-2 rounded hover:bg-olive-800 hover:text-olive-100 transition-all duration-300 ease-in-out"
            >
              Create Recipe
            </button>
            <div
              className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-olive-700 ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out z-50 ${
                isDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
              } group-hover:opacity-100 group-hover:visible lg:opacity-0 lg:invisible lg:group-hover:opacity-100 lg:group-hover:visible`}
            >
              <Link
                to="/create-recipe/manual"
                className="block px-4 py-2 text-sm text-olive-100 hover:bg-olive-600"
              >
                Create Manually
              </Link>
              <Link
                to="/discover"
                className="block px-4 py-2 text-sm text-olive-100 hover:bg-olive-600"
              >
                Discover Recipes
              </Link>
              <Link
                to="/take-recipe-picture"
                className="block px-4 py-2 text-sm text-olive-100 hover:bg-olive-600"
              >
                Upload a Recipe Picture
              </Link>
              <Link
                to="/upload-recipe"
                className="block px-4 py-2 text-sm text-olive-100 hover:bg-olive-600"
              >
                Upload a Recipe Document
              </Link>
            </div>
          </li>
          <li className="w-1/5">
            <Link to="/shopping-list">
              <button className="w-full border border-olive-800 text-olive-800 px-4 py-2 rounded hover:bg-olive-800 hover:text-olive-100 transition-all duration-300 ease-in-out">
                Shopping List
              </button>
            </Link>
          </li>
          <li className="w-1/5">
            {user ? (
              <button
                onClick={handleLogout}
                className="w-full border border-olive-800 text-olive-800 px-4 py-2 rounded hover:bg-olive-800 hover:text-olive-100 transition-all duration-300 ease-in-out"
              >
                Logout
              </button>
            ) : (
              <Link to="/login">
                <button className="w-full border border-olive-800 text-olive-800 px-4 py-2 rounded hover:bg-olive-800 hover:text-olive-100 transition-all duration-300 ease-in-out">
                  Login
                </button>
              </Link>
            )}
          </li>
        </ul>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <ul className="flex flex-col items-center space-y-4 mt-4">
            <li>
              <Link to="/saved-recipes">
                <button className="w-full border border-olive-800 text-olive-800 px-4 py-2 rounded hover:bg-olive-800 hover:text-olive-100 transition-all duration-300 ease-in-out">
                  Home
                </button>
              </Link>
            </li>
            <li>
              <button
                onClick={toggleDropdown}
                className="w-full border border-olive-800 text-olive-800 px-4 py-2 rounded hover:bg-olive-800 hover:text-olive-100 transition-all duration-300 ease-in-out"
              >
                Create Recipe
              </button>
              {isDropdownOpen && (
                <div className="flex flex-col items-center space-y-2 mt-2">
                  <Link
                    to="/create-recipe/manual"
                    className="block w-full border border-olive-800 text-olive-100 bg-olive-700 px-4 py-2 rounded hover:bg-olive-600"
                  >
                    Create Manually
                  </Link>
                  <Link
                    to="/discover"
                    className="block w-full border border-olive-800 text-olive-100 bg-olive-700 px-4 py-2 rounded hover:bg-olive-600"
                  >
                    Discover Recipes
                  </Link>
                  <Link
                    to="/take-recipe-picture"
                    className="block w-full border border-olive-800 text-olive-100 bg-olive-700 px-4 py-2 rounded hover:bg-olive-600"
                  >
                    Upload a Recipe Picture
                  </Link>
                  <Link
                    to="/upload-recipe"
                    className="block w-full border border-olive-800 text-olive-100 bg-olive-700 px-4 py-2 rounded hover:bg-olive-600"
                  >
                    Upload a Recipe Document
                  </Link>
                </div>
              )}
            </li>
            <li>
              <Link to="/shopping-list">
                <button className="w-full border border-olive-800 text-olive-800 px-4 py-2 rounded hover:bg-olive-800 hover:text-olive-100 transition-all duration-300 ease-in-out">
                  Shopping List
                </button>
              </Link>
            </li>
            <li>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="w-full border border-olive-800 text-olive-800 px-4 py-2 rounded hover:bg-olive-800 hover:text-olive-100 transition-all duration-300 ease-in-out"
                >
                  Logout
                </button>
              ) : (
                <Link to="/login">
                  <button className="w-full border border-olive-800 text-olive-800 px-4 py-2 rounded hover:bg-olive-800 hover:text-olive-100 transition-all duration-300 ease-in-out">
                    Login
                  </button>
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
