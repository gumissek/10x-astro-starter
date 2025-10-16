import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface LoginFormViewModel {
  email: string;
  password: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormViewModel>({
    email: '',
    password: '',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Walidacja email
  const validateEmail = useCallback((email: string): string | undefined => {
    if (!email.trim()) {
      return 'Email jest wymagany';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Wprowadź poprawny adres email';
    }
    
    return undefined;
  }, []);

  // Walidacja hasła
  const validatePassword = useCallback((password: string): string | undefined => {
    if (!password.trim()) {
      return 'Hasło jest wymagane';
    }
    
    return undefined;
  }, []);

  // Sprawdź czy formularz jest valid
  const isFormValid = (): boolean => {
    const emailValid = validateEmail(formData.email) === undefined;
    const passwordValid = validatePassword(formData.password) === undefined;
    
    return emailValid && passwordValid;
  };

  // Obsługa zmiany wartości pól
  const handleFieldChange = useCallback((field: keyof LoginFormViewModel, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Walidacja w czasie rzeczywistym
    let error: string | undefined;
    if (field === 'email') {
      error = validateEmail(value);
    } else if (field === 'password') {
      error = validatePassword(value);
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error,
      general: undefined, // Wyczyść błąd globalny przy zmianie danych
    }));
  }, [validateEmail, validatePassword]);

  // Obsługa blur - walidacja po opuszczeniu pola
  const handleBlur = useCallback((field: keyof LoginFormViewModel) => {
    const value = formData[field];
    let error: string | undefined;
    
    if (field === 'email') {
      error = validateEmail(value);
    } else if (field === 'password') {
      error = validatePassword(value);
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, [formData, validateEmail, validatePassword]);

  // Obsługa wysłania formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      // Pokazuj wszystkie błędy walidacji
      setValidationErrors({
        email: validateEmail(formData.email),
        password: validatePassword(formData.password),
      });
      return;
    }
    
    setIsLoading(true);
    setValidationErrors({});
    
    try {
      // TODO: Implementacja logowania z Supabase
      // await supabase.auth.signInWithPassword({
      //   email: formData.email.trim(),
      //   password: formData.password,
      // });
      
      // Symulacja wywołania API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Po sukcesie przekieruj do /dashboard
      console.log('Logowanie pomyślne:', formData.email);
      
    } catch (error) {
      console.error('Error during login:', error);
      setValidationErrors({
        general: error instanceof Error 
          ? error.message 
          : 'Nieprawidłowy email lub hasło'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Zaloguj się</h1>
        <p className="text-muted-foreground">
          Wprowadź swoje dane, aby uzyskać dostęp do konta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pole email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleFieldChange('email', e.target.value)
            }
            onBlur={() => handleBlur('email')}
            placeholder="twoj.email@example.com"
            className={validationErrors.email ? 'border-red-500' : ''}
            disabled={isLoading}
            autoComplete="email"
          />
          {validationErrors.email && (
            <span className="text-sm text-red-600">{validationErrors.email}</span>
          )}
        </div>

        {/* Pole hasła */}
        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleFieldChange('password', e.target.value)
            }
            onBlur={() => handleBlur('password')}
            placeholder="Wprowadź hasło"
            className={validationErrors.password ? 'border-red-500' : ''}
            disabled={isLoading}
            autoComplete="current-password"
          />
          {validationErrors.password && (
            <span className="text-sm text-red-600">{validationErrors.password}</span>
          )}
        </div>

        {/* Błąd globalny */}
        {validationErrors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{validationErrors.general}</p>
          </div>
        )}

        {/* Przycisk logowania */}
        <Button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className="w-full"
        >
          {isLoading ? 'Logowanie...' : 'Zaloguj się'}
        </Button>

        {/* Link do odzyskiwania hasła */}
        <div className="text-center">
          <a 
            href="/forgot-password" 
            className="text-sm text-primary hover:underline"
          >
            Zapomniałeś hasła?
          </a>
        </div>
      </form>

      {/* Link do rejestracji */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Nie masz konta? </span>
        <a href="/register" className="text-primary hover:underline">
          Zarejestruj się
        </a>
      </div>
    </div>
  );
};

export default LoginForm;