'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { t } = useTranslation('auth');
  const { 
    login, 
    verifyTwoFactorCode, 
    isLoading, 
    error: authError, 
    requiresTwoFactor,
    accountLocked,
    lockoutUntil
  } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', twoFactorCode: '' });
  const [formError, setFormError] = useState('');

  // Update form error when auth error changes
  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  // Calculate lockout time remaining
  const getLockoutTimeRemaining = () => {
    if (!lockoutUntil) return '';
    
    const minutes = Math.ceil((lockoutUntil - Date.now()) / 60000);
    return t('try_again_in_minutes', { minutes });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '', twoFactorCode: '' };

    if (!email) {
      newErrors.email = t('email_required');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('email_invalid');
      valid = false;
    }

    if (!password) {
      newErrors.password = t('password_required');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const validateTwoFactorCode = () => {
    let valid = true;
    const newErrors = { email: '', password: '', twoFactorCode: '' };

    if (!twoFactorCode) {
      newErrors.twoFactorCode = t('code_required');
      valid = false;
    } else if (twoFactorCode.length !== 6 || !/^\d+$/.test(twoFactorCode)) {
      newErrors.twoFactorCode = t('code_invalid');
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (requiresTwoFactor) {
      if (validateTwoFactorCode()) {
        try {
          const success = await verifyTwoFactorCode(twoFactorCode);
          if (success) {
            onSuccess();
          }
        } catch (error) {
          setFormError(error instanceof Error ? error.message : 'Verification failed');
        }
      }
    } else {
      if (validateForm()) {
        try {
          await login({ email, password });
          if (!requiresTwoFactor) {
            onSuccess();
          }
        } catch (error) {
          setFormError(error instanceof Error ? error.message : 'Login failed');
        }
      }
    }
  };

  // If account is locked, show lockout message
  if (accountLocked) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center text-red-600 mb-4">
          <FiAlertTriangle className="h-12 w-12 mx-auto mb-2" />
          <h2 className="text-xl font-bold">{t('account_locked')}</h2>
          <p className="mt-2">{getLockoutTimeRemaining()}</p>
          <p className="mt-4">{t('contact_support')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {requiresTwoFactor ? t('two_factor_auth') : t('login_to_account')}
      </h2>

      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {requiresTwoFactor ? (
          // Two-factor authentication form
          <div className="mb-6">
            <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-1">
              {t('enter_code')}
            </label>
            <input
              id="twoFactorCode"
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.slice(0, 6))}
              className={`block w-full px-3 py-2 border ${
                errors.twoFactorCode ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              placeholder={t('code_placeholder')}
              maxLength={6}
              disabled={isLoading}
            />
            {errors.twoFactorCode && (
              <p className="mt-1 text-sm text-red-600">{errors.twoFactorCode}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              {t('verification_code_sent')}
            </p>
            <button
              type="button"
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
              onClick={() => {
                // In a real app, this would resend the code
                alert('Code resent!');
              }}
            >
              {t('resend_code')}
            </button>
          </div>
        ) : (
          // Regular login form
          <>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder={t('email_placeholder')}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                {t('password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-10 pr-10 py-2 border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder={t('password_placeholder')}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5" />
                    ) : (
                      <FiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  {t('remember_me')}
                </label>
              </div>
              <div className="text-sm">
                <a href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                  {t('forgot_password')}
                </a>
              </div>
            </div>
          </>
        )}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading
              ? requiresTwoFactor
                ? t('verifying')
                : t('logging_in')
              : requiresTwoFactor
              ? t('verify')
              : t('login')}
          </button>
        </div>
      </form>

      {!requiresTwoFactor && (
        <>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('or_continue_with')}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                aria-label="Sign in with Google"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064 5.963 5.963 0 014.123 1.632l2.917-2.917C17.477 2.496 15.102 1.5 12.545 1.5 6.839 1.5 2.182 6.156 2.182 11.861s4.657 10.361 10.363 10.361c5.988 0 10.549-4.266 10.549-10.276 0-.647-.057-1.237-.164-1.707H12.545z" />
                </svg>
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                aria-label="Sign in with GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t('dont_have_account')}{' '}
            <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              {t('sign_up')}
            </a>
          </p>
        </>
      )}
    </div>
  );
};

export default LoginForm;
