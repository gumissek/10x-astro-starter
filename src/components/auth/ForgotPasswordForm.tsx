import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface ForgotPasswordFormViewModel {
  email: string;
}

interface ValidationErrors {
  email?: string;
  general?: string;
}

const ForgotPasswordForm: React.FC = () => {
  const [formData, setFormData] = useState<ForgotPasswordFormViewModel>({
    email: '',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  // Sprawdź czy formularz jest valid
  const isFormValid = (): boolean => {
    return validateEmail(formData.email) === undefined;
  };

  // Obsługa zmiany wartości pól
  const handleFieldChange = useCallback((value: string) => {
    setFormData({ email: value });
    
    // Walidacja w czasie rzeczywistym
    const error = validateEmail(value);
    setValidationErrors(prev => ({
      ...prev,
      email: error,
      general: undefined, // Wyczyść błąd globalny przy zmianie danych
    }));
  }, [validateEmail]);

  // Obsługa blur - walidacja po opuszczeniu pola
  const handleBlur = useCallback(() => {
    const error = validateEmail(formData.email);
    setValidationErrors(prev => ({
      ...prev,
      email: error,
    }));
  }, [formData.email, validateEmail]);

  // Obsługa wysłania formularza
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setValidationErrors({
        email: validateEmail(formData.email),
      });
      return;
    }
    
    setIsLoading(true);
    setValidationErrors({});
    
    try {
      // TODO: Implementacja odzyskiwania hasła z Supabase
      // await supabase.auth.resetPasswordForEmail(formData.email.trim(), {
      //   redirectTo: `${window.location.origin}/password-reset`,
      // });
      
      // Symulacja wywołania API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      console.log('Link resetujący wysłany na:', formData.email);
      
    } catch (error) {
      console.error('Error during password reset:', error);
      setValidationErrors({
        general: error instanceof Error 
          ? error.message 
          : 'Wystąpił błąd podczas wysyłania linku resetującego'
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
          <h1 className="text-2xl font-bold">Link został wysłany</h1>
          <p className="text-muted-foreground">
            Jeśli konto z podanym adresem email istnieje, został na nie wysłany link do resetowania hasła.
          </p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-700">
            Sprawdź swoją skrzynkę pocztową i kliknij w link, aby zresetować hasło.
            Link jest ważny przez 1 godzinę.
          </p>
        </div>

        <div className="text-center space-y-4">
          <a href="/login" className="block text-primary hover:underline">
            Wróć do logowania
          </a>
          <button
            onClick={() => {
              setIsSuccess(false);
              setFormData({ email: '' });
            }}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Wyślij ponownie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Resetuj hasło</h1>
        <p className="text-muted-foreground">
          Wprowadź swój adres email, a wyślemy Ci link do resetowania hasła
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
              handleFieldChange(e.target.value)
            }
            onBlur={handleBlur}
            placeholder="twoj.email@example.com"
            className={validationErrors.email ? 'border-red-500' : ''}
            disabled={isLoading}
            autoComplete="email"
          />
          {validationErrors.email && (
            <span className="text-sm text-red-600">{validationErrors.email}</span>
          )}
        </div>

        {/* Błąd globalny */}
        {validationErrors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">{validationErrors.general}</p>
          </div>
        )}

        {/* Przycisk wysłania */}
        <Button
          type="submit"
          disabled={!isFormValid() || isLoading}
          className="w-full"
        >
          {isLoading ? 'Wysyłanie...' : 'Wyślij link resetujący'}
        </Button>
      </form>

      {/* Link powrotu do logowania */}
      <div className="text-center text-sm">
        <a href="/login" className="text-primary hover:underline">
          Wróć do logowania
        </a>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;