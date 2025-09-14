// Accessibility utilities

export const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };
  
  export const focusElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  export const getAriaLabel = (fieldName: string, required: boolean = false) => {
    return `${fieldName}${required ? ' (required)' : ''}`;
  };
  
  export const getAriaDescribedBy = (fieldId: string, hasError: boolean, hasHelp: boolean) => {
    const parts = [];
    if (hasError) parts.push(`error-${fieldId}`);
    if (hasHelp) parts.push(`help-${fieldId}`);
    return parts.length > 0 ? parts.join(' ') : undefined;
  };
  
  // Form validation with accessibility
  export const validateField = (value: any, rules: any) => {
    const errors: string[] = [];
    
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors.push(`${rules.label || 'This field'} is required`);
    }
    
    if (rules.minLength && value && value.length < rules.minLength) {
      errors.push(`${rules.label || 'This field'} must be at least ${rules.minLength} characters`);
    }
    
    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors.push(`${rules.label || 'This field'} must be no more than ${rules.maxLength} characters`);
    }
    
    if (rules.pattern && value && !rules.pattern.test(value)) {
      errors.push(`${rules.label || 'This field'} format is invalid`);
    }
    
    if (rules.min && value && Number(value) < rules.min) {
      errors.push(`${rules.label || 'This field'} must be at least ${rules.min}`);
    }
    
    if (rules.max && value && Number(value) > rules.max) {
      errors.push(`${rules.label || 'This field'} must be no more than ${rules.max}`);
    }
    
    return errors;
  };
  
  // Keyboard navigation helpers
  export const handleKeyNavigation = (
    event: React.KeyboardEvent,
    onEnter?: () => void,
    onEscape?: () => void,
    onArrowUp?: () => void,
    onArrowDown?: () => void
  ) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        onEnter?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        onArrowUp?.();
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowDown?.();
        break;
    }
  };
  
  // Skip link component
  export const createSkipLink = (targetId: string, text: string = 'Skip to main content') => {
    return {
      href: `#${targetId}`,
      text,
      style: {
        position: 'absolute',
        top: '-40px',
        left: '6px',
        background: '#000',
        color: '#fff',
        padding: '8px',
        textDecoration: 'none',
        borderRadius: '4px',
        zIndex: 1000,
        transition: 'top 0.3s',
      } as React.CSSProperties
    };
  };