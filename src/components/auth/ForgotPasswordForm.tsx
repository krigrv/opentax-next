'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMail, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
  const { t } = useTranslation('auth');
  const { requestPasswordReset, isLoading, error: authError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [securityAnswerError, setSecurityAnswerError] = useState('');
  const [showSecurityQuestion, setShowSecurityQuestion] = useState(false);

  // Update form error when auth error changes
  useEffect(() => {
    if (authError) {
      setFormError(authError);
    }
  }, [authError]);

  const validateEmail = () => {
    if (!email) {
      setEmailError(t('email_required'));
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t('email_invalid'));
      return false;
    }
    setEmailError('');
    return true;
  };

  const validateSecurityAnswer = () => {
    if (!securityAnswer.trim()) {
      setSecurityAnswerError(t('security_answer_required'));
      return false;
    }
    setSecurityAnswerError('');
    return true;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (validateEmail()) {
      try {
        // In a real app, this would check if the email exists and fetch the security question
        // For demo purposes, we'll simulate this with a mock security question
        setSecurityQuestion(t('security_question_example'));
        setShowSecurityQuestion(true);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Email verification failed');
      }
    }
  };

  const handleSecurityAnswerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (validateSecurityAnswer()) {
      try {
        // In a real app, this would verify the security answer and initiate the password reset
        await requestPasswordReset({ email, securityAnswer });
        setIsSubmitted(true);
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Security answer verification failed');
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <FiCheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-2 text-xl font-bold text-gray-800">{t('reset_link_sent')}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('reset_instructions_sent', { email })}
          </p>
          <div className="mt-6">
            <a
              href="/login"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              {t('back_to_login')}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {t('forgot_password')}
      </h2>

      {formError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md flex items-start">
          <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {!showSecurityQuestion ? (
        // Email form
        <form onSubmit={handleEmailSubmit}>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">{t('forgot_password_instructions')}</p>
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  emailError ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder={t('email_placeholder')}
                disabled={isLoading}
              />
            </div>
            {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? t('verifying') : t('continue')}
            </button>
          </div>
        </form>
      ) : (
        // Security question form
        <form onSubmit={handleSecurityAnswerSubmit}>
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              {t('security_question_instructions')}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('email')}
              </label>
              <p className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                {email}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('security_question')}
              </label>
              <p className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
                {securityQuestion}
              </p>
            </div>
            
            <div>
              <label htmlFor="securityAnswer" className="block text-sm font-medium text-gray-700 mb-1">
                {t('security_answer')}
              </label>
              <input
                id="securityAnswer"
                type="text"
                value={securityAnswer}
                onChange={(e) => {
                  setSecurityAnswer(e.target.value);
                  if (securityAnswerError) setSecurityAnswerError('');
                }}
                className={`block w-full px-3 py-2 border ${
                  securityAnswerError ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder={t('security_answer_placeholder')}
                disabled={isLoading}
              />
              {securityAnswerError && (
                <p className="mt-1 text-sm text-red-600">{securityAnswerError}</p>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowSecurityQuestion(false)}
              disabled={isLoading}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {t('back')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? t('verifying') : t('submit')}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 text-center">
        <a href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          {t('back_to_login')}
        </a>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
