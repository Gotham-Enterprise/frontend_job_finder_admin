/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Formats a date string to a readable format
 * @param dateString - The date string to format
 * @param fallback - The fallback text to display if date is invalid (default: 'Not specified')
 * @returns Formatted date string or fallback text
 */
export const formatDate = (dateString: string | undefined | null, fallback: string = 'Not specified'): string => {
    if (!dateString || dateString.trim() === '' || dateString.toLowerCase() === 'null') {
        return fallback;
    }
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return fallback;
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return fallback;
    }
};

/**
 * Formats a date string to a readable format with custom options
 * @param dateString - The date string to format
 * @param options - Intl.DateTimeFormatOptions for custom formatting
 * @param fallback - The fallback text to display if date is invalid
 * @returns Formatted date string or fallback text
 */
export const formatDateCustom = (
    dateString: string | undefined | null, 
    options: Intl.DateTimeFormatOptions,
    fallback: string = 'Not specified'
): string => {
    if (!dateString || dateString.trim() === '' || dateString.toLowerCase() === 'null') {
        return fallback;
    }
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return fallback;
        }
        
        return date.toLocaleDateString('en-US', options);
    } catch {
        return fallback;
    }
};

/**
 * Formats a date for display in forms (YYYY-MM-DD format)
 * @param dateString - The date string to format
 * @returns Formatted date string for input fields or empty string
 */
export const formatDateForInput = (dateString: string | undefined | null): string => {
    if (!dateString || dateString.trim() === '' || dateString.toLowerCase() === 'null') {
        return '';
    }
    
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return '';
        }
        
        return date.toISOString().split('T')[0];
    } catch {
        return '';
    }
};

/**
 * Checks if a date string is valid
 * @param dateString - The date string to validate
 * @returns True if the date is valid, false otherwise
 */
export const isValidDate = (dateString: string | undefined | null): boolean => {
    if (!dateString || dateString.trim() === '' || dateString.toLowerCase() === 'null') {
        return false;
    }
    
    try {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    } catch {
        return false;
    }
};
