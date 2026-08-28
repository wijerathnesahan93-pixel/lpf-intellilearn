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
    <div className="min-h-screen flex items-center justify-center bg-white p-6 md:p-12 select-none overflow-hidden">
      <div className="w-full max-w-[1100px] grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Solid Purple Rounded Rectangle (Scaled dynamically) */}
        <div className="hidden md:block w-full h-[520px] max-h-[70vh] bg-[#6C2A77] rounded-[20px]" />

        {/* Right Column: Login Form (Scaled to normal web desktop sizing) */}
        <div className="w-full max-w-[420px] mx-auto flex flex-col justify-center">
          
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src={logoImg} alt="LPF Logo" className="w-[140px] h-auto object-contain" />
          </div>

          {/* Titles */}
          <div className="mb-6 space-y-1">
            <h2 className="text-[24px] sm:text-[26px] font-semibold text-black tracking-tight leading-tight">
              Welcome to LPF Academy
            </h2>
            <h3 className="text-[22px] sm:text-[24px] text-[#8E8E93] font-normal leading-tight">
              Login
            </h3>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-2.5 rounded text-xs mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            
            {/* Email Address */}
            <div className="flex flex-col">
              <label className="text-sm sm:text-base text-black font-semibold mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                className="w-full h-[48px] px-4 bg-[#D9D9D9] rounded-[12px] outline-none text-sm sm:text-base text-gray-800 border-none transition-colors focus:bg-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="text-sm sm:text-base text-black font-semibold mb-1.5">
                Password
              </label>
              <input
                type="password"
                className="w-full h-[48px] px-4 bg-[#D9D9D9] rounded-[12px] outline-none text-sm sm:text-base text-gray-800 border-none transition-colors focus:bg-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Forget Password Link */}
            <div className="flex justify-end pt-1">
              <a href="/login" className="text-sm sm:text-base text-[#6C2A77] hover:text-[#5a2262] font-semibold transition-colors" onClick={(e) => e.preventDefault()}>
                Forget Password
              </a>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[50px] bg-[#6C2A77] hover:bg-[#5a2262] text-white text-base sm:text-lg font-semibold rounded-[12px] transition-colors flex items-center justify-center"
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
                className="flex items-center justify-center gap-2.5 w-full h-[50px] border border-black hover:bg-gray-50 text-black text-base sm:text-lg font-semibold rounded-[12px] transition-colors"
                onClick={() => alert("Google Sign-In will be active once approved by the administrator.")}
              >
                <svg className="w-5 h-5" viewBox="0 0 41 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M40.18 17.8977C40.18 16.6568 40.0495 15.4636 39.8073 14.3182H20.5V21.0875H31.5327C31.0575 23.275 29.6132 25.1284 27.442 26.3693V30.7602H34.0673C37.9436 27.7136 40.18 23.2273 40.18 17.8977Z" fill="#4285F4"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M20.5 35C26.035 35 30.6755 33.4329 34.0673 30.7602L27.4421 26.3693C25.6064 27.4193 23.2582 28.0397 20.5 28.0397C15.1607 28.0397 10.6414 24.9613 9.02934 20.825H2.18048V25.359C5.55366 31.0784 12.4864 35 20.5 35Z" fill="#34A853"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.02932 20.8249C8.61932 19.7749 8.38636 18.6533 8.38636 17.4999C8.38636 16.3465 8.61932 15.2249 9.02932 14.1749V9.64081H2.18045C0.792045 12.0033 0 14.676 0 17.4999C0 20.3238 0.792045 22.9965 2.18045 25.359L9.02932 20.8249Z" fill="#FBBC05"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M20.5 6.96023C23.5098 6.96023 26.2121 7.84318 28.3366 9.57727L34.2164 4.55796C30.6662 1.73409 26.0257 0 20.5 0C12.4864 0 5.55366 3.92159 2.18048 9.64091L9.02934 14.175C10.6414 10.0386 15.1607 6.96023 20.5 6.96023Z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>
            </div>

          </form>

          {/* Copyright Footer */}
          <div className="text-[12px] text-[#8E8E93] pt-6 text-center">
            © 2026 LPF Academy. All rights reserved.
          </div>

        </div>

      </div>
    </div>
  );
}
