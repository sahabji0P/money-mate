'use client';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { FiDollarSign, FiLock, FiMail, FiUser } from 'react-icons/fi';

interface AuthenticationProps {
  onClose?: () => void;
}

export default function Authentication({ onClose }: AuthenticationProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = () => {
    console.log(isLogin ? 'Login:' : 'Register:', formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Panel - Clean Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
        {/* Minimal Background Element */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-l from-red-600/20 to-transparent rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-center px-16 py-8 text-white">
          {/* Hero Content */}
          <div className="max-w-lg">
            {/* Brand */}
            <div className="mb-16">
              <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
                MoneyMate
              </h1>
              <p className="text-2xl text-gray-300 font-light leading-relaxed">
                Split bills effortlessly with AI-powered receipt scanning
              </p>
            </div>

            {/* Key Features - Minimal List */}
            <div className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xl text-gray-200">Snap receipts, AI does the rest</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xl text-gray-200">Fair splitting in seconds</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xl text-gray-200">Keep friendships intact</span>
              </div>
            </div>

            {/* Bottom Statement */}
            <div className="mt-20">
              <p className="text-lg text-gray-400 italic">
                &quot;The smartest way to handle group expenses&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Subtle Bottom Accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-red-800"></div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex flex-col justify-center p-8 lg:p-12">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4 lg:hidden">
              <FiDollarSign className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back' : 'Join MoneyMate'}
            </h1>
            <p className="text-gray-600 text-lg">
              {isLogin ? 'Sign in to manage your expenses' : 'Start splitting bills the smart way'}
            </p>
          </div>

          {/* Auth Toggle */}
          <div className="flex mb-8 bg-gray-200 rounded-xl p-1.5">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${isLogin
                ? 'bg-red-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${!isLogin
                ? 'bg-red-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Name (Register only) */}
            {!isLogin && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                  <FiUser className="w-5 h-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Full name"
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900 placeholder-gray-500"
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                <FiMail className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Email address"
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                <FiLock className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={isLogin ? 'Password' : 'Create password'}
                className="w-full pl-12 pr-14 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors" />
                )}
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-red-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-red-600 focus:ring-4 focus:ring-red-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>

            {/* Additional Options */}
            <div className="space-y-4">
              {/* Forgot Password (Login only) */}
              {isLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    className="text-red-500 hover:text-red-600 font-semibold transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Terms (Register only) */}
              {!isLogin && (
                <p className="text-center text-sm text-gray-600 leading-relaxed">
                  By creating an account, you agree to our{' '}
                  <button className="text-red-500 hover:text-red-600 font-semibold hover:underline">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button className="text-red-500 hover:text-red-600 font-semibold hover:underline">
                    Privacy Policy
                  </button>
                </p>
              )}
            </div>
          </div>

          {/* Guest Option */}
          {onClose && (
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 font-medium transition-colors"
              >
                Continue as guest →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}