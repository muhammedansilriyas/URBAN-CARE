import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authStart, authSuccess, authFail, clearError } from '../store/slices/authSlice.js';
import API from '../services/api.js';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [age, setAge] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    setIsSubmitting(true);
    dispatch(authStart());

    try {
      if (isRegister) {
        // Register patient
        const { data } = await API.post('/auth/register', { 
          name, 
          email, 
          password, 
          phone, 
          gender, 
          age: Number(age), 
          role: 'Patient' 
        });
        dispatch(authSuccess(data));
        navigate('/');
      } else {
        // Unified Login
        const { data } = await API.post('/auth/login', { 
          email, 
          password
        });
        dispatch(authSuccess(data));
        
        // Redirect based on user role
        if (data.user?.role === 'Admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Authentication failed. Please check server connection and credentials.';
      dispatch(authFail(errorMsg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = (provider) => {
    alert(`${provider} login authentication placeholder.`);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)] bg-surface text-on-surface animate-fadeIn">
      {/* Split Layout - Image Side */}
      <div className="hidden md:block md:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent to-surface"></div>
        <div 
          className="w-full h-full bg-cover bg-center transition-transform duration-[10s] hover:scale-105" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDKYUSg_SZkoaPLkHNCHTYp0-YM_j2zKVJ8eDAKmUSO8rWVql7w02iibXcA_7_oNaRT4ISPcNztKTo1nNdo-XJkfOCVZ84-TyN5Ul-_VR67JLAOlNMNbnVzLqXBmKlycy8YY5eS2nb0-zXCAVxAv1f55e1HQsAxpmX6xkq5yoSv5mY-NXToKovFUYjYMdYwc0PR7iWTaRc3ht5zgtwWuqXIFJ2UthtRB8Jq5qhDjYUxgP3izzXUcqQvbw')" }}
        >
        </div>
        <div className="absolute bottom-16 left-16 z-20 max-w-md">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-4">Your journey to <span className="italic text-primary">vitality</span> begins here.</h1>
          <p className="text-on-surface-variant font-body-lg text-body-lg">Access your personalized care plan, consult with our world-class practitioners, and manage your holistic health journey.</p>
        </div>
      </div>

      {/* Split Layout - Form Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-surface">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface leading-tight">
              {isRegister ? 'Join Urban Patient Care' : 'Welcome Back'}
            </h2>
            <p className="text-on-surface-variant mt-2">
              {isRegister ? 'Create a secure account' : 'Sign in to your account'}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => dispatch(clearError())} className="font-bold text-red-900 ml-2">&times;</button>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {isRegister && (
                <>
                  <div className="group">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                      Full Name
                    </label>
                    <input 
                      className="w-full px-6 py-4 rounded-organic bg-surface-container border-none text-on-surface placeholder-outline-variant focus:ring-0 form-input-focus transition-all duration-300 outline-none" 
                      placeholder="John Doe" 
                      required 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                        Phone
                      </label>
                      <input 
                        className="w-full px-6 py-4 rounded-organic bg-surface-container border-none text-on-surface placeholder-outline-variant focus:ring-0 form-input-focus transition-all duration-300 outline-none" 
                        placeholder="+1 (555) 000-0000" 
                        required 
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="group">
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                        Age
                      </label>
                      <input 
                        className="w-full px-6 py-4 rounded-organic bg-surface-container border-none text-on-surface placeholder-outline-variant focus:ring-0 form-input-focus transition-all duration-300 outline-none" 
                        placeholder="e.g. 28" 
                        required 
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors">
                      Gender
                    </label>
                    <select 
                      className="w-full px-6 py-4 rounded-organic bg-surface-container border-none text-on-surface focus:ring-0 form-input-focus transition-all duration-300 outline-none"
                      required
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </>
              )}

              <div className="group">
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors" htmlFor="email">
                  Email Address
                </label>
                <input 
                  className="w-full px-6 py-4 rounded-organic bg-surface-container border-none text-on-surface placeholder-outline-variant focus:ring-0 form-input-focus transition-all duration-300 outline-none" 
                  id="email" 
                  placeholder="name@example.com" 
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="group">
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2 group-focus-within:text-primary transition-colors" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input 
                    className="w-full px-6 py-4 rounded-organic bg-surface-container border-none text-on-surface placeholder-outline-variant focus:ring-0 form-input-focus transition-all duration-300 outline-none" 
                    id="password" 
                    placeholder="••••••••" 
                    required
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline-variant hover:text-primary cursor-pointer select-none" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between font-label-sm text-label-sm">
              <label className="flex items-center cursor-pointer group select-none">
                <div className="relative">
                  <input 
                    className="sr-only peer" 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <div className="w-10 h-5 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                </div>
                <span className="ml-3 text-on-surface-variant group-hover:text-on-surface transition-colors">Remember Me</span>
              </label>
              <a 
                className="text-primary hover:underline decoration-2 underline-offset-4 font-semibold" 
                href="#"
                onClick={(e) => { e.preventDefault(); alert('Reset password link has been simulated.'); }}
              >
                Forgot Password?
              </a>
            </div>

            <button 
              className="w-full bg-primary text-on-primary font-label-sm text-label-sm py-4 rounded-full shadow-[0_8px_20px_rgba(100,110,87,0.15)] hover:shadow-[0_12px_24px_rgba(100,110,87,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2" 
              type="submit"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>


          <p className="text-center font-body-md text-on-surface-variant">
            {isRegister ? 'Already have a patient account? ' : 'New to Urban Patient Care? '}
            <a 
              className="text-primary font-semibold hover:underline decoration-2 underline-offset-4 ml-1 cursor-pointer" 
              onClick={() => {
                setIsRegister(!isRegister);
                dispatch(clearError());
              }}
            >
              {isRegister ? 'Sign In' : 'Create an Account'}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
