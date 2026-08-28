import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FormField } from '../components/forms/FormField';
import { Eye, EyeOff, Facebook, Youtube, Instagram, GraduationCap } from 'lucide-react';
import logoImg from '../assets/logo.jpg';
import studentReadingImg from '../assets/student_reading.png';

// Dynamic transparent image helper to remove white backgrounds in browser canvas
function TransparentImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [processedSrc, setProcessedSrc] = useState<string>('');

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        // Loop through pixels and make white/near-white pixels transparent
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // alpha = 0
          }
        }
        ctx.putImageData(imgData, 0, 0);
        setProcessedSrc(canvas.toDataURL());
      }
    };
  }, [src]);

  return <img src={processedSrc || src} alt={alt} className={className} />;
}

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
    <div className="grid grid-cols-1 lg:grid-cols-10 min-h-screen w-full bg-white select-none">
      
      {/* Left Column (Branding - 40% Width) */}
      <div className="hidden lg:flex lg:col-span-4 bg-purple-700 flex-col items-center justify-between p-12 text-white relative overflow-hidden h-screen sticky top-0">
        
        {/* Subtle, elegant concentric circle lines in the background for texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="55" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="70" fill="none" stroke="white" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="85" fill="none" stroke="white" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Top Header Title */}
        <div className="w-full text-center z-10 pt-4">
          <h2 className="text-xl font-bold tracking-[0.2em] uppercase text-white font-sans">
            LA PETITE FLEUR
          </h2>
        </div>

        {/* Centered High-Quality Cutout Image */}
        <div className="w-full flex items-center justify-center my-auto z-10">
          <TransparentImage 
            src={studentReadingImg} 
            alt="Student Reading" 
            className="max-h-[380px] w-auto object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-[1.02]" 
          />
        </div>

        {/* Bottom Small Text */}
        <div className="w-full text-center text-xs text-purple-200/50 z-10 pb-4">
          Est. 1993
        </div>
      </div>

      {/* Right Column (Login Form - 60% Width) */}
      <div className="col-span-12 lg:col-span-6 flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-white min-h-screen">
        
        {/* Empty placeholder for alignment / top spacing */}
        <div className="hidden lg:block h-6" />

        {/* Form Container (perfectly centered) */}
        <div className="w-full max-w-[420px] mx-auto my-auto space-y-8">
          
          {/* Header Area */}
          <div className="space-y-4">
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="LPF Logo" className="w-12 h-auto rounded-xl border border-gray-150 shadow-sm" />
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 leading-tight">LPF IntelliLearn</h3>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Academic Portal</p>
              </div>
            </div>

            {/* Welcome Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100/50 rounded-full text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5" />
              Welcome to LPF Academy
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Login</h1>
              <p className="text-sm text-gray-500 font-medium">
                Please enter your credentials to access your account.
              </p>
            </div>

          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm transition-all duration-300">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email Field */}
            <FormField label={<span className="text-gray-600 font-semibold text-xs">Email Address <span className="text-red-500">*</span></span>}>
              <input
                type="email"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm text-gray-800 placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example.educationpro@gmail.com"
                required
              />
            </FormField>

            {/* Password Field */}
            <FormField label={<span className="text-gray-600 font-semibold text-xs">Password <span className="text-red-500">*</span></span>}>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none text-sm text-gray-800 placeholder-gray-400 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
              <label className="flex items-center gap-2 text-gray-500 cursor-pointer select-none text-xs font-semibold">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500/20 w-4 h-4" 
                />
                Remember me
              </label>
              <a href="/login" className="text-purple-700 hover:text-purple-800 hover:underline font-bold text-xs" onClick={(e) => e.preventDefault()}>
                Forgot Password?
              </a>
            </div>

            {/* Buttons Group */}
            <div className="space-y-3 pt-2">
              
              {/* Sign In (Primary) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg shadow-sm transition-all duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Sign in with Google (Secondary) */}
              <button
                type="button"
                className="flex items-center justify-center gap-2.5 w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-150"
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
            </div>

          </form>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full text-[10px] text-gray-400 mt-8 border-t border-gray-100 pt-4 max-w-[420px] mx-auto">
          <p>© 2026 LPF Academy. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-purple-700 transition-colors">
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-purple-700 transition-colors">
              <Youtube className="w-3.5 h-3.5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-purple-700 transition-colors">
              <Instagram className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
