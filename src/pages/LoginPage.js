import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage({ logoutOccurred }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Clear fields when component mounts or when switching between login and register
    setEmail('');
    setPassword('');
    setError('');
  }, [isRegistering]);

  useEffect(() => {
    // Clear fields when logout occurs
    if (logoutOccurred) {
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [logoutOccurred]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user);
        alert('Registration successful. Please check your email to verify your account.');
        // Clear fields after successful registration
        setEmail('');
        setPassword('');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        // Clear fields after successful login
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-olive-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-olive-800">
          {isRegistering ? 'Register' : 'Login'}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-olive-700 font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-olive-300 p-2 rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-olive-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-olive-300 p-2 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-olive-800 text-white py-2 px-4 rounded hover:bg-olive-600"
          >
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center">
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-olive-800 hover:underline"
          >
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </p>
        <p className="mt-2 text-center">
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-olive-800 hover:underline"
          >
            Forgot Password?
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
