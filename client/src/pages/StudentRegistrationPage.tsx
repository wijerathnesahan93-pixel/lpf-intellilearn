import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import logoImg from '../assets/logo.jpg';
import childrenBgImg from '../assets/children_bg.png';

export default function StudentRegistrationPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: 'MALE',
    gradeNumber: 10,
    classSection: 'A',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    relationship: 'Parent'
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'gradeNumber' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post('/auth/student/register', {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || null,
        dateOfBirth: formData.dateOfBirth || null,
        gender: formData.gender,
        address: formData.address || null,
        gradeNumber: formData.gradeNumber,
        classSection: formData.classSection,
        parentName: formData.parentName,
        parentEmail: formData.parentEmail,
        parentPhone: formData.parentPhone || null,
        relationship: formData.relationship
      });
      navigate('/register/student/success');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 font-golos bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${childrenBgImg})` }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1.5px] z-0" />

      <div className="relative z-10 bg-white p-6 md:p-8 rounded-[24px] shadow-2xl w-full max-w-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="w-full flex flex-col items-center mb-6">
          <img src={logoImg} alt="LPF Academy Logo" className="w-[100px] h-auto object-contain mb-3" />
          <h2 className="text-black text-[22px] font-bold text-center leading-tight">
            Student Registration
          </h2>
          <p className="text-gray-500 text-sm text-center mt-1">
            LPF Academy Learning Management System
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Student Information */}
          <div>
            <h3 className="text-purple-950 font-bold border-b pb-2 mb-4">1. Student Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  className="h-10 rounded-lg bg-gray-100 px-3 outline-none text-sm transition-colors focus:bg-gray-200"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  className="h-10 rounded-lg bg-gray-100 px-3 outline-none text-sm transition-colors focus:bg-gray-200"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Student Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="h-10 rounded-lg bg-gray-100 px-3 outline-none text-sm transition-colors focus:bg-gray-200"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="h-10 rounded-lg bg-gray-100 px-3 outline-none text-sm transition-colors focus:bg-gray-200"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  className="h-10 rounded-lg bg-gray-100 px-3 outline-none text-sm transition-colors focus:bg-gray-200"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Gender</label>
                <select
                  name="gender"
                  className="h-10 rounded-lg bg-gray-100 px-3 outline-none text-sm transition-colors focus:bg-gray-200"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-xs font-bold text-gray-700">Home Address</label>
                <textarea
                  name="address"
                  rows={2}
                  className="rounded-lg bg-gray-100 p-3 outline-none text-sm transition-colors focus:bg-gray-200"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="h-10 rounded-lg bg-gray-100 px-3 outline-none text-sm transition-colors focus:bg-gray-200"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="h-10 rounded-lg bg-gray-100 px-3 outline-none text-sm transition-colors focus:bg-gray-200"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2: Academic Program selection */}
          <div>
            <h3 className="text-purple-950 font-bold border-b pb-2 mb-4">2. Requested Grade</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Grade level *</label>
                <select
                  name="gradeNumber"
                  className="h-10 rounded-lg bg-gray-100 px-3 outline-none text-sm transition-colors focus:bg-gray-200"
                  value={formData.gradeNumber}
                  onChange={handleChange}
                >
                  {Array.from({ length: 13 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Parent details */}
          <div>
            <h3 className="text-purple-950 font-bold border-b pb-2 mb-4">3. Parent / Guardian Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Parent/Guardian Full Name *</label>
                <input
                  type="text"
                  name="parentName"
                  className="h-10 rounded-lg bg-gray-100 px-3 outline-none text-sm transition-colors focus:bg-gray-200"
                  value={formData.parentName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Parent Email Address *</label>
                <input
                  type="email"
                  name="parentEmail"
                  className="h-10 rounded-lg bg-gray-100 px-3 outline-none text-sm transition-colors focus:bg-gray-200"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Parent Phone Number</label>
                <input
                  type="text"
                  name="parentPhone"
                  className="h-10 rounded-lg bg-gray-100 px-3 outline-none text-sm transition-colors focus:bg-gray-200"
                  value={formData.parentPhone}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-gray-700">Relationship to Student</label>
                <select
                  name="relationship"
                  className="h-10 rounded-lg bg-gray-100 px-3 outline-none text-sm transition-colors focus:bg-gray-200"
                  value={formData.relationship}
                  onChange={handleChange}
                >
                  <option value="Parent">Parent</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex h-11 justify-center items-center rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors w-full sm:w-1/3"
            >
              Back to Login
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-11 justify-center items-center rounded-xl bg-[#6C2A77] hover:bg-[#5a2262] text-white text-sm font-semibold transition-colors w-full sm:w-2/3"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Submit Registration'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
