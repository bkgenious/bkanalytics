import { useState, useCallback } from 'react';

/**
 * Hook to handle API errors standardized by the backend.
 * returns { error, handleError, clearError, isValidationError, getFieldError }
 */
export function useApiError() {
    const [error, setError] = useState(null);

    const handleError = useCallback((err) => {
        console.error('API Error caught:', err);
        setError(err);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const isValidationError = useCallback(() => {
        return error?.code === 'VALIDATION_ERROR';
    }, [error]);

    const getFieldError = useCallback((fieldName) => {
        if (!isValidationError() || !error?.details) return null;
        // details is array of { path: 'field.subfield', message: '' }
        const fieldErr = error.details.find(d => d.path === fieldName);
        return fieldErr ? fieldErr.message : null;
    }, [error, isValidationError]);

    return {
        error,
        handleError,
        clearError,
        isValidationError,
        getFieldError
    };
}
