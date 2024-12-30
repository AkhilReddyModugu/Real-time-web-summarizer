import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/Input/PasswordInput';
import { validateEmail } from '../../utils/helper.js';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const {login}= useContext(AuthContext);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setError('');
    
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email: email,
        password: password
      });
      
      if (response.data && response.data.accessToken) {
        const user= response.data.user;

        login(response.data.accessToken,user);
        navigate('/');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('An unexpected error occurred while logging in');
      }
    }
  };

  return (
    <div className='flex items-center justify-center mt-24'>
      <div className='w-96 bg-white border rounded-lg shadow-lg p-8'>
        <h2 className='text-3xl font-semibold text-center mb-6'>Login</h2>
        <form onSubmit={handleLogin}>
          <div className='mb-4'>
            <input
              type='email'
              placeholder='Enter your email'
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className='mb-6'>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}

          <button type='submit' className='w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-dark transition'>
            Login
          </button>

          <div className='text-center mt-4'>
            <p className='text-sm'>
              Not Registered Yet?{' '}
              <Link to='/signup' className='text-primary font-medium hover:underline'>
                Create an Account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
