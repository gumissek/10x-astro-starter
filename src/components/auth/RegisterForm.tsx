import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface RegisterFormViewModel {
  email: string;
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormViewModel>({
    email: '',
    password: '',
    confirmPassword: '',
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
    if (!password) {
      return 'Hasło jest wymagane';
    }
    
    if (password.length < 8) {
      return 'Hasło musi mieć minimum 8 znaków';
    }
    
    if (!/[A-Z]/.test(password)) {
      return 'Hasło musi zawierać co najmniej jedną wielką literę';
    }
    
    if (!/[0-9]/.test(password)) {
      return 'Hasło musi zawierać co najmniej jedną cyfrę';
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Hasło musi zawierać co najmniej jeden znak specjalny';
    }
    
    return undefined;
  }, []);

  // Walidacja potwierdzenia hasła
  const validateConfirmPassword = useCallback((confirmPassword: string, password: string): string | undefined => {
    if (!confirmPassword) {
      return 'Potwierdzenie hasła jest wymagane';
    }
    
    if (confirmPassword !== password) {
      return 'Hasła muszą być identyczne';
    }
    
    return undefined;
  }, []);

  // Sprawdź czy formularz jest valid
  const isFormValid = (): boolean => {
    const emailValid = validateEmail(formData.email) === undefined;
    const passwordValid = validatePassword(formData.password) === undefined;
    const confirmPasswordValid = validateConfirmPassword(formData.confirmPassword, formData.password) === undefined;
    
    return emailValid && passwordValid && confirmPasswordValid;
  };

  // Obsługa zmiany wartości pól
  const handleFieldChange = useCallback((field: keyof RegisterFormViewModel, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Walidacja w czasie rzeczywistym
    let error: string | undefined;
    if (field === 'email') {
      error = validateEmail(value);
    } else if (field === 'password') {
      error = validatePassword(value);
      // Również zwaliduj potwierdzenie hasła jeśli już zostało wprowadzone
      if (formData.confirmPassword) {
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: validateConfirmPassword(formData.confirmPassword, value),
        }));
      }
    } else if (field === 'confirmPassword') {
      error = validateConfirmPassword(value, formData.password);
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error,
      general: undefined, // Wyczyść błąd globalny przy zmianie danych
    }));
  }, [formData.confirmPassword, formData.password, validateEmail, validatePassword, validateConfirmPassword]);

  // Obsługa blur - walidacja po opuszczeniu pola
  const handleBlur = useCallback((field: keyof RegisterFormViewModel) => {
    const value = formData[field];
    let error: string | undefined;
    
    if (field === 'email') {
      error = validateEmail(value);
    } else if (field === 'password') {
      error = validatePassword(value);
    } else if (field === 'confirmPassword') {
      error = validateConfirmPassword(value, formData.password);
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, [formData, validateEmail, validatePassword, validateConfirmPassword]);

  // Obsługa wysłania formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      // Pokazuj wszystkie błędy walidacji
      setValidationErrors({
        email: validateEmail(formData.email),
        password: validatePassword(formData.password),
        confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
      });
      return;
    }
    
    setIsLoading(true);
    setValidationErrors({});
    
    try {
      // TODO: Implementacja rejestracji z Supabase
      // await supabase.auth.signUp({
      //   email: formData.email.trim(),
      //   password: formData.password,
      // });
      
      // Symulacja wywołania API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Po sukcesie użytkownik będzie automatycznie zalogowany i przekierowany do /dashboard
      console.log('Rejestracja pomyślna:', formData.email);
      
    } catch (error) {
      console.error('Error during registration:', error);
      setValidationErrors({
        general: error instanceof Error 
          ? error.message 
          : 'Wystąpił błąd podczas rejestracji'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Utwórz konto</h1>
        <p className="text-muted-foreground">
          Wprowadź swoje dane, aby utworzyć nowe konto
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
            autoComplete="new-password"
          />
          {validationErrors.password && (
            <span className="text-sm text-red-600">{validationErrors.password}</span>
          )}
          {/* Wskazówki dotyczące hasła */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Hasło musi zawierać:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Co najmniej 8 znaków</li>
              <li>Co najmniej jedną wielką literę</li>
              <li>Co najmniej jedną cyfrę</li>
              <li>Co najmniej jeden znak specjalny</li>
            </ul>
          </div>
        </div>

        {/* Pole potwierdzenia hasła */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Powtórz hasło</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleFieldChange('confirmPassword', e.target.value)
            }
            onBlur={() => handleBlur('confirmPassword')}
            placeholder="Powtórz hasło"
            className={validationErrors.confirmPassword ? 'border-red-500' : ''}
            disabled={isLoading}
            autoComplete="new-password"
          />
          {validationErrors.confirmPassword && (
            <span className="text-sm text-red-600">{validationErrors.confirmPassword}</span>
          )}
        </div>

        {/* Błąd globalny */}
        {validationErrors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{validationErrors.general}</p>
          </div>
        )}

        {/* Przycisk rejestracji */}
        <Button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className="w-full"
        >
          {isLoading ? 'Tworzenie konta...' : 'Utwórz konto'}
        </Button>
      </form>

      {/* Link do logowania */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Masz już konto? </span>
        <a href="/login" className="text-primary hover:underline">
          Zaloguj się
        </a>
      </div>
    </div>
  );
};

export default RegisterForm;