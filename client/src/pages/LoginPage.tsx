import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../assets/logo.jpg';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 'Invalid email or password'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6 md:p-12 select-none">
      <div className="w-full max-w-[860px] grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Solid Purple Rounded Rectangle */}
        <div className="hidden md:block w-full h-[520px] bg-[#6b21a8] rounded-[16px] shadow-sm" />

        {/* Right Column: Login Form */}
        <div className="w-full max-w-[340px] mx-auto flex flex-col space-y-6">
          
          {/* Logo */}
          <div className="flex justify-center">
            <img src={logoImg} alt="LPF Logo" className="w-[120px] h-auto object-contain" />
          </div>

          {/* Titles */}
          <div className="space-y-1">
            <h2 className="text-[20px] font-semibold text-black tracking-tight">
              Welcome to LPF Academy
            </h2>
            <h3 className="text-[18px] text-gray-400 font-medium">
              Login
            </h3>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-2.5 rounded text-xs">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            
            {/* Email Address */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-800 font-medium mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-2.5 bg-gray-200 rounded-[8px] outline-none text-sm text-gray-800 border-none focus:bg-gray-250 transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-800 font-medium mb-1.5">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2.5 bg-gray-200 rounded-[8px] outline-none text-sm text-gray-800 border-none focus:bg-gray-250 transition-colors"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Forget Password Link */}
            <div className="flex justify-end pt-0.5">
              <a href="/login" className="text-purple-800 hover:text-purple-900 font-semibold text-sm" onClick={(e) => e.preventDefault()}>
                Forget Password
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#6b21a8] hover:bg-purple-900 text-white font-semibold rounded-[8px] shadow-sm transition-colors text-sm flex items-center justify-center"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign in'
              )}
            </button>

            {/* Google Sign In Button */}
            <button
              type="button"
              className="flex items-center justify-center gap-2 w-full border border-gray-400 hover:bg-gray-50 text-black py-2.5 rounded-[8px] font-semibold text-sm transition-colors"
              onClick={() => alert("Google Sign-In will be active once approved by the administrator.")}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5.04c1.67 0 3.2.58 4.38 1.69l3.27-3.27C17.67 1.47 15 0 12 0 7.35 0 3.37 2.67 1.39 6.56l3.86 3C6.18 6.78 8.87 5.04 12 5.04z" />
                <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.42 3.57v2.97h3.89c2.28-2.1 3.54-5.19 3.54-8.7z" />
                <path fill="#FBBC05" d="M5.25 14.44a7.12 7.12 0 0 1 0-4.88l-3.86-3a11.96 11.96 0 0 0 0 10.88l3.86-3z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.97-1.07 7.96-2.91l-3.89-2.97c-1.08.72-2.47 1.16-4.07 1.16-3.13 0-5.82-1.74-6.76-4.52l-3.86 3A11.97 11.97 0 0 0 12 24z" />
              </svg>
              Sign in with Google
            </button>

          </form>

          {/* Copyright Footer */}
          <div className="text-center text-[10px] text-gray-400 pt-6">
            © 2026 LPF Academy. All rights reserved.
          </div>

        </div>

      </div>
    </div>
  );
}
