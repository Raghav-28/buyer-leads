'use client';

import React from 'react';

interface AccessibleFormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select';
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  options?: { value: string; label: string }[];
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  style?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
}

export default function AccessibleFormField({
  id,
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helpText,
  options = [],
  rows = 4,
  min,
  max,
  step,
  style,
  labelStyle,
  inputStyle
}: AccessibleFormFieldProps) {
  const inputId = `input-${id}`;
  const errorId = `error-${id}`;
  const helpId = `help-${id}`;
  const describedBy = [errorId, helpId].filter(Boolean).join(' ');

  const baseInputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 16px",
    border: error ? "2px solid #dc3545" : "2px solid #e9ecef",
    borderRadius: "8px",
    fontSize: "16px",
    transition: "border-color 0.3s ease",
    outline: "none",
    backgroundColor: "white",
    ...inputStyle
  };

  const baseLabelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: error ? "#dc3545" : "#495057",
    ...labelStyle
  };

  const renderInput = () => {
    const commonProps = {
      id: inputId,
      name,
      value: value || '',
      onChange,
      placeholder,
      required,
      'aria-describedby': describedBy || undefined,
      'aria-invalid': error ? 'true' : 'false',
      style: baseInputStyle,
      onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        e.target.style.borderColor = error ? "#dc3545" : "#0070f3";
      },
      onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLInputElement | HTMLTextAreaElement>) => {
        e.target.style.borderColor = error ? "#dc3545" : "#e9ecef";
      }
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
            style={{ ...baseInputStyle, resize: "vertical", fontFamily: "inherit" }}
          />
        );

      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            min={min}
            max={max}
            step={step}
          />
        );

      default:
        return <input {...commonProps} type={type} />;
    }
  };

  return (
    <div style={style}>
      <label htmlFor={inputId} style={baseLabelStyle}>
        {label}
        {required && <span style={{ color: "#dc3545", marginLeft: "4px" }}>*</span>}
      </label>
      
      {renderInput()}
      
      {helpText && (
        <div
          id={helpId}
          style={{
            fontSize: "12px",
            color: "#6c757d",
            marginTop: "4px"
          }}
        >
          {helpText}
        </div>
      )}
      
      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          style={{
            fontSize: "12px",
            color: "#dc3545",
            marginTop: "4px",
            fontWeight: "500"
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}