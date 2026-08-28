import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../assets/logo.jpg';
import childrenBgImg from '../assets/children_bg.png';
import { Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div 
      className="min-h-screen flex items-center justify-center p-4 font-golos select-none bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${childrenBgImg})` }}
    >
      {/* Semi-transparent dark overlay to make the login card stand out cleanly */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px] z-0" />

      {/* ප්‍රධාන සුදු පාට රාමුව (White Card Container) */}
      <div className="relative z-10 flex flex-col md:flex-row items-center bg-white p-6 md:p-8 rounded-[24px] shadow-2xl gap-10 lg:gap-14 w-fit border border-gray-100">

        {/* වම් පස කොටස: දම් පාට කොටුව (ප්‍රමාණය නිවැරදි කළා) */}
        <div className="hidden md:block w-[380px] h-[540px] bg-[#6C2A77] rounded-[20px] shrink-0" />

        {/* දකුණු පස කොටස: Login Form එක (පළල පාලනය කළා) */}
        <div className="w-full max-w-[360px] flex flex-col items-start lg:mr-4">

          {/* Logo සහ මාතෘකා */}
          <div className="w-full flex flex-col items-center mb-6">
            <img src={logoImg} alt="LPF Academy Logo" className="w-[130px] h-auto object-contain mb-3" />
            <h2 className="text-black text-[22px] sm:text-[24px] font-bold tracking-tight text-center leading-tight">
              Welcome to LPF Academy
            </h2>
            <h3 className="text-[#8E8E93] text-[18px] sm:text-[20px] font-medium text-center mt-1">
              Login
            </h3>
          </div>

          {error && (
            <div className="w-full bg-red-50 border-l-4 border-red-500 text-red-700 p-2.5 rounded text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            {/* Email Address */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-black text-[13px] font-bold">
                Email Address
              </label>
              <input
                type="email"
                className="h-[46px] w-full rounded-[12px] bg-[#EAEAEA] px-4 outline-none text-[14px] text-gray-800 transition-colors focus:bg-[#D9D9D9]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-black text-[13px] font-bold">
                Password
              </label>
              <div className="relative w-full">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="h-[46px] w-full rounded-[12px] bg-[#EAEAEA] pl-4 pr-10 outline-none text-[14px] text-gray-800 transition-colors focus:bg-[#D9D9D9]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-800 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full mt-2">
              <a
                href="/login"
                className="text-[#6C2A77] hover:text-[#5a2262] text-[13px] font-bold transition-colors text-right"
                onClick={(e) => e.preventDefault()}
              >
                Forget Password
              </a>

              {/* Sign In බොත්තම */}
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-[46px] justify-center items-center rounded-[12px] bg-[#6C2A77] hover:bg-[#5a2262] text-white text-[15px] font-medium transition-colors w-full mt-1"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Sign in'
                )}
              </button>

              {/* Google Sign In බොත්තම */}
              <button
                type="button"
                className="flex h-[46px] justify-center items-center gap-3 rounded-[12px] border border-gray-300 bg-white hover:bg-gray-50 text-black text-[15px] font-medium transition-colors w-full"
                onClick={() => alert('Google Sign-In will be active once approved by the administrator.')}
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 41 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M40.18 17.8977C40.18 16.6568 40.0495 15.4636 39.8073 14.3182H20.5V21.0875H31.5327C31.0575 23.275 29.6132 25.1284 27.442 26.3693V30.7602H34.0673C37.9436 27.7136 40.18 23.2273 40.18 17.8977Z" fill="#4285F4" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M20.5 35C26.035 35 30.6755 33.4329 34.0673 30.7602L27.4421 26.3693C25.6064 27.4193 23.2582 28.0397 20.5 28.0397C15.1607 28.0397 10.6414 24.9613 9.02934 20.825H2.18048V25.359C5.55366 31.0784 12.4864 35 20.5 35Z" fill="#34A853" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.02932 20.8249C8.61932 19.7749 8.38636 18.6533 8.38636 17.4999C8.38636 16.3465 8.61932 15.2249 9.02932 14.1749V9.64081H2.18045C0.792045 12.0033 0 14.676 0 17.4999C0 20.3238 0.792045 22.9965 2.18045 25.359L9.02932 20.8249Z" fill="#FBBC05" />
                  <path fillRule="evenodd" clipRule="evenodd" d="M20.5 6.96023C23.5098 6.96023 26.2121 7.84318 28.3366 9.57727L34.2164 4.55796C30.6662 1.73409 26.0257 0 20.5 0C12.4864 0 5.55366 3.92159 2.18048 9.64091L9.02934 14.175C10.6414 10.0386 15.1607 6.96023 20.5 6.96023Z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </button>
            </div>
          </form>

          <div className="w-full text-center text-[13px] mt-4 font-bold">
            <span className="text-gray-500">Don't have an account? </span>
            <a href="/register/student" className="text-[#6C2A77] hover:underline">
              Register as Student
            </a>
          </div>

          {/* Copyright Footer */}
          <div className="w-full text-center text-[#8E8E93] text-[11px] font-medium mt-6">
            © 2026 LPF Academy. All rights reserved.
          </div>

        </div>
      </div>
    </div>
  );
}