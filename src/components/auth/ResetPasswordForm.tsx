import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ResetPasswordFormViewModel {
  password: string;
  confirmPassword: string;
}

interface ValidationErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const ResetPasswordForm: React.FC = () => {
  const [formData, setFormData] = useState<ResetPasswordFormViewModel>({
    password: '',
    confirmPassword: '',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
    const passwordValid = validatePassword(formData.password) === undefined;
    const confirmPasswordValid = validateConfirmPassword(formData.confirmPassword, formData.password) === undefined;
    
    return passwordValid && confirmPasswordValid;
  };

  // Obsługa zmiany wartości pól
  const handleFieldChange = useCallback((field: keyof ResetPasswordFormViewModel, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Walidacja w czasie rzeczywistym
    let error: string | undefined;
    if (field === 'password') {
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
  }, [formData.confirmPassword, formData.password, validatePassword, validateConfirmPassword]);

  // Obsługa blur - walidacja po opuszczeniu pola
  const handleBlur = useCallback((field: keyof ResetPasswordFormViewModel) => {
    const value = formData[field];
    let error: string | undefined;
    
    if (field === 'password') {
      error = validatePassword(value);
    } else if (field === 'confirmPassword') {
      error = validateConfirmPassword(value, formData.password);
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: error,
    }));
  }, [formData, validatePassword, validateConfirmPassword]);

  // Obsługa wysłania formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      // Pokazuj wszystkie błędy walidacji
      setValidationErrors({
        password: validatePassword(formData.password),
        confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
      });
      return;
    }
    
    setIsLoading(true);
    setValidationErrors({});
    
    try {
      // TODO: Implementacja resetowania hasła z Supabase
      // await supabase.auth.updateUser({
      //   password: formData.password,
      // });
      
      // Symulacja wywołania API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      console.log('Hasło zostało pomyślnie zresetowane');
      
    } catch (error) {
      console.error('Error during password reset:', error);
      setValidationErrors({
        general: error instanceof Error 
          ? error.message 
          : 'Wystąpił błąd podczas resetowania hasła'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Formularz sukcesu
  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Hasło zostało zmienione</h1>
          <p className="text-muted-foreground">
            Twoje hasło zostało pomyślnie zaktualizowane. 
            Możesz teraz zalogować się przy użyciu nowego hasła.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">
            Hasło zostało pomyślnie zmienione. Ze względów bezpieczeństwa
            zostałeś wylogowany ze wszystkich urządzeń.
          </p>
        </div>

        <div className="text-center">
          <a href="/login">
            <Button className="w-full">
              Przejdź do logowania
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Ustaw nowe hasło</h1>
        <p className="text-muted-foreground">
          Wprowadź nowe hasło dla swojego konta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pole nowego hasła */}
        <div className="space-y-2">
          <Label htmlFor="password">Nowe hasło</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleFieldChange('password', e.target.value)
            }
            onBlur={() => handleBlur('password')}
            placeholder="Wprowadź nowe hasło"
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
          <Label htmlFor="confirmPassword">Powtórz nowe hasło</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              handleFieldChange('confirmPassword', e.target.value)
            }
            onBlur={() => handleBlur('confirmPassword')}
            placeholder="Powtórz nowe hasło"
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

        {/* Przycisk resetowania */}
        <Button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className="w-full"
        >
          {isLoading ? 'Resetowanie hasła...' : 'Resetuj hasło'}
        </Button>
      </form>

      {/* Link do logowania */}
      <div className="text-center text-sm">
        <a href="/login" className="text-primary hover:underline">
          Wróć do logowania
        </a>
      </div>
    </div>
  );
};

export default ResetPasswordForm;