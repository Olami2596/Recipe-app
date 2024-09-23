// LoginPage.js
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import the AuthContext to check user state

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth(); // Get the user from AuthContext
  const navigate = useNavigate();

  // Effect to clear the fields after logout
  useEffect(() => {
    if (!user) {
      setEmail('');
      setPassword('');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      navigate('/saved-recipes');
    } catch (error) {
      console.error('Authentication error:', error);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-olive-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-olive-800">{isLogin ? 'Login' : 'Sign Up'}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-2 border border-olive-300 rounded focus:outline-none focus:ring-2 focus:ring-olive-500"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full p-2 border border-olive-300 rounded focus:outline-none focus:ring-2 focus:ring-olive-500"
          />
          <button type="submit" className="w-full bg-olive-600 text-white py-2 rounded hover:bg-olive-700 transition duration-300">
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="mt-4 text-olive-600 hover:text-olive-800"
        >
          {isLogin ? 'Need to create an account?' : 'Already have an account?'}
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
