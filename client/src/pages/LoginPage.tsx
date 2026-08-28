import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FormField } from '../components/forms/FormField';
import { Eye, EyeOff, Facebook, Youtube, Instagram } from 'lucide-react';
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
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen bg-white">
      
      {/* Left Panel: Curved Purple Card Container */}
      <div className="hidden lg:flex lg:col-span-5 items-center justify-center p-8 bg-white border-r border-gray-100 select-none">
        <div className="relative w-full max-w-[360px] h-[550px] bg-gradient-to-b from-purple-700 to-indigo-800 rounded-t-[24px] overflow-hidden flex flex-col justify-between p-8 text-white shadow-xl">
          
          {/* Subtle concentric SVG curves in background */}
          <div className="absolute inset-0 opacity-15 pointer-events-none z-0">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <circle cx="50" cy="-10" r="50" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="50" cy="-10" r="70" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="50" cy="-10" r="90" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="50" cy="-10" r="110" fill="none" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>

          {/* White Semi-Circle/Arch cutout at the bottom */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-[160px] bg-white rounded-t-[100%] translate-y-[35%] z-0 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]" />
          
          {/* Branding Content (centered) */}
          <div className="z-10 text-center mt-6">
            <h2 className="text-xl font-extrabold tracking-wider uppercase text-purple-100">
              La Petite Fleur
            </h2>
            <div className="w-12 h-0.5 bg-purple-400 mx-auto mt-2 rounded-full" />
          </div>

          {/* Student Reading Image overlapping the bottom white arch */}
          <div className="relative z-10 w-full flex justify-center mb-[-12px]">
            <TransparentImage 
              src={studentReadingImg} 
              alt="Student Reading" 
              className="max-h-[340px] w-auto drop-shadow-2xl object-contain" 
            />
          </div>
        </div>
      </div>

      {/* Right Panel: Login Form & Info Paragraph */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-white">
        
        {/* Top Header Logo */}
        <div className="flex justify-between items-center w-full mb-8 lg:mb-0">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="LPF Logo" className="w-12 h-auto rounded-xl border border-gray-100 shadow-sm" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">LPF IntelliLearn</h3>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Academic Portal</p>
            </div>
          </div>
        </div>

        {/* Form & Mission Paragraph */}
        <div className="w-full max-w-lg mx-auto my-auto space-y-6">
          <div className="space-y-3">
            <span className="inline-block text-xs font-bold text-purple-700 tracking-wider uppercase bg-purple-50 px-2.5 py-1 rounded-full">
              🎓 Welcome to LPF Academy
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Login</h1>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-medium">
              At La Petite Fleur Schools, we aim to establish a culture in which our children develop a passion for learning that will serve their needs throughout their careers at school and beyond. Our ethos encourages high standards, self-resilience, cooperation, enthusiasm, and initiative throughout each child’s life at school.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm transition-all duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email Address" required>
              <input
                type="email"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-sm text-gray-800 placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example.educationpro@gmail.com"
                required
              />
            </FormField>

            <FormField label="Password" required>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none text-sm text-gray-800 placeholder-gray-400 pr-10"
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
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4" 
                />
                Remember me
              </label>
              <a href="/login" className="text-purple-600 hover:underline font-semibold" onClick={(e) => e.preventDefault()}>
                Forgot Password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold rounded-lg shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>

            {/* Google Sign In Button */}
            <button
              type="button"
              className="flex items-center justify-center gap-2.5 w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-150 mt-3"
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
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full text-xs text-gray-400 mt-8 lg:mt-0 border-t border-gray-100 pt-4">
          <p>© 2026 LPF Academy. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-purple-600 transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-purple-600 transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-purple-600 transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
