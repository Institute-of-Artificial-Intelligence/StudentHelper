import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AccountForm, AccountFormValues } from '@/components/auth/AccountForm';
import { ProfileForm as RegisterProfileForm, ProfileFormValues } from '@/components/auth/ProfileForm';
import { EmailConfirmationDialog } from '@/components/auth/EmailConfirmationDialog';
const Register = () => {
  const navigate = useNavigate();
  const {
    signUp
  } = useAuth();
  const [step, setStep] = useState<'account' | 'profile'>('account');
  const [accountData, setAccountData] = useState<AccountFormValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const handleAccountSubmit = async (data: AccountFormValues) => {
    console.log('Account data submitted:', data);
    setAccountData(data);
    setStep('profile');
  };
  const handleProfileSubmit = async (profileData: ProfileFormValues) => {
    if (!accountData) return;
    setIsSubmitting(true);
    const success = await signUp(accountData.email, accountData.password, {
      name: accountData.name,
      user_type: profileData.user_type,
      phone: profileData.phone,
      school: profileData.school,
      referral_source: profileData.referral_source
    });
    setIsSubmitting(false);
    if (success) {
      setShowEmailConfirmation(true);
    }
  };
  const handleBackToAccount = () => {
    setStep('account');
  };
  const handleCloseEmailConfirmation = () => {
    setShowEmailConfirmation(false);
    navigate('/login');
  };
  return <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl space-y-8">
          {/* Welcome Section */}
          {step === 'account' && <div className="text-center space-y-6 mb-8">
              <div className="bg-gradient-to-r from-edu-light to-white p-8 rounded-2xl shadow-lg border">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold text-edu-primary">
                    🌟 Следующий шаг, и мы делаем его вместе! 🚀
                  </h1>
                  
                  <div className="space-y-3 text-left">
                    <p className="text-lg font-semibold text-gray-800 mb-4">
                      Наши эксклюзивные ресурсы:
                    </p>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start">
                        <span className="text-edu-secondary mr-2">•</span>
                        <span><strong>Составляем идеальный план поступления</strong> - Всё о сроках, документах и подготовке.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-edu-secondary mr-2">•</span>
                        <span><strong>Советы от студентов и преподавателей:</strong> актуальные и полезные рекомендации.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-edu-secondary mr-2">•</span>
                        <span><strong>Все для успеха!</strong> - Дальше доступ к общению с Искусственным Интеллектом.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <p className="text-xl font-semibold text-edu-primary mt-6">
                    Заполните форму ниже и открывайте двери к будущему! 🎓✨
                  </p>
                </div>
              </div>
            </div>}

          {step === 'profile' && <div className="text-center space-y-6 mb-8">
              <div className="bg-gradient-to-r from-edu-light to-white p-8 rounded-2xl shadow-lg border">
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-edu-primary">
                    Всегда сохраняйте возможность стать частью чего-то большого и вдохновляющего!
                  </h1>
                  
                  <p className="text-lg text-gray-700">
                    Заканчивая регистрацию пару уточнений…
                  </p>
                </div>
              </div>
            </div>}

          {/* Form Section */}
          <div className="w-full max-w-md mx-auto rounded-lg border bg-card p-6 shadow-md">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Регистрация</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {step === 'account' ? 'Создайте новую учетную запись' : 'Заполните информацию о себе'}
              </p>
            </div>

            {step === 'account' ? <AccountForm onSubmit={handleAccountSubmit} /> : <RegisterProfileForm onSubmit={handleProfileSubmit} onBack={handleBackToAccount} isLoading={isSubmitting} />}

            {step === 'account' && <div className="mt-4 text-center text-sm">
                <p>
                  Уже есть учетная запись?{' '}
                  <Link to="/login" className="text-sm font-bold text-edu-primary hover:text-edu-secondary underline decoration-2 transition-colors">
                    Войти
                  </Link>
                </p>
              </div>}
          </div>
        </div>
      </div>

      <EmailConfirmationDialog isOpen={showEmailConfirmation} onClose={handleCloseEmailConfirmation} />
    </>;
};
export default Register;