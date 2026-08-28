import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/logo.jpg';
import childrenBgImg from '../assets/children_bg.png';
import { CheckCircle } from 'lucide-react';

export default function StudentRegistrationSuccessPage() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 font-golos bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${childrenBgImg})` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px] z-0" />

      <div className="relative z-10 bg-white p-6 md:p-8 rounded-[24px] shadow-2xl w-full max-w-md border border-gray-100 text-center">
        <img src={logoImg} alt="LPF Academy Logo" className="w-[100px] h-auto object-contain mx-auto mb-4" />
        
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-bounce" />
        
        <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">
          Registration Submitted!
        </h2>
        
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Your student account has been successfully created. However, access to the LMS portal is restricted until an administrator reviews and approves your registration request.
        </p>

        <div className="bg-purple-50 rounded-xl p-4 text-xs text-purple-900 border border-purple-100 text-left mb-6 space-y-1">
          <p className="font-bold">Next Steps:</p>
          <p>• The admin will verify your enrollment details and assign your class.</p>
          <p>• A Parent profile has been linked to your registration email.</p>
          <p>• You will be able to log in once your status updates to active.</p>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="flex h-11 justify-center items-center rounded-xl bg-[#6C2A77] hover:bg-[#5a2262] text-white text-sm font-semibold transition-colors w-full"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}
