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
    <div className="min-h-screen flex items-center justify-center bg-white p-6 md:p-12 font-golos select-none overflow-hidden">
      <div className="w-full max-w-[1150px] flex items-center justify-center gap-12 lg:gap-24">

        {/* Left Column: Solid Purple Rounded Rectangle (Proportionally scaled) */}
        <div className="hidden md:block w-full max-w-[540px] h-[540px] max-h-[70vh] bg-[#6C2A77] rounded-[20px]" />

        {/* Right Column: Login Form */}
        <div className="w-full max-w-[420px] flex flex-col items-start gap-8">

          <div className="flex flex-col items-start gap-3 self-stretch">
            {/* Logo + Titles */}
            <div className="w-full flex flex-col justify-center items-center gap-2">
              <img src={logoImg} alt="LPF Academy Logo" className="w-[150px] h-auto object-contain mb-2" />
              <h2 className="self-stretch text-black text-[24px] sm:text-[26px] font-semibold tracking-tight text-center leading-tight">
                Welcome to LPF Academy
              </h2>
              <h3 className="self-stretch text-[#8E8E93] text-[20px] sm:text-[22px] font-normal text-center leading-tight">
                Login
              </h3>
            </div>

            {error && (
              <div className="w-full bg-red-50 border-l-4 border-red-500 text-red-700 p-2.5 rounded text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
              {/* Email Address */}
              <div className="flex flex-col gap-1.5 self-stretch">
                <label className="self-stretch text-black text-sm sm:text-base font-semibold">
                  Email Address
                </label>
                <input
                  type="email"
                  className="h-[48px] self-stretch rounded-[12px] bg-[#D9D9D9] px-4 outline-none text-sm sm:text-base text-gray-800 border-none transition-colors focus:bg-gray-300"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5 self-stretch">
                <label className="self-stretch text-black text-sm sm:text-base font-semibold">
                  Password
                </label>
                <input
                  type="password"
                  className="h-[48px] self-stretch rounded-[12px] bg-[#D9D9D9] px-4 outline-none text-sm sm:text-base text-gray-800 border-none transition-colors focus:bg-gray-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col justify-center items-start gap-4 self-stretch mt-3">
                <div className="flex flex-col justify-center items-center gap-3.5 self-stretch">
                  <a
                    href="/login"
                    className="self-stretch text-[#6C2A77] hover:text-[#5a2262] text-sm sm:text-base font-semibold transition-colors text-right"
                    onClick={(e) => e.preventDefault()}
                  >
                    Forget Password
                  </a>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex h-[50px] justify-center items-center gap-2 self-stretch rounded-[12px] bg-[#6C2A77] hover:bg-[#5a2262] text-white text-base sm:text-lg font-semibold transition-colors"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Sign in'
                    )}
                  </button>
                </div>

                {/* Google Sign In Button */}
                <button
                  type="button"
                  className="flex h-[50px] justify-center items-center gap-2 self-stretch rounded-[12px] border border-black bg-white hover:bg-gray-50 text-black text-sm sm:text-base font-semibold transition-colors"
                  onClick={() => alert('Google Sign-In will be active once approved by the administrator.')}
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
          </div>

          {/* Copyright Footer */}
          <div className="self-stretch text-[#8E8E93] text-[12px] font-normal">
            © 2026 LPF Academy. All rights reserved.
          </div>

        </div>

      </div>
    </div>
  );
}
