import React from 'react';


export const numericOnly = (e: React.KeyboardEvent<HTMLInputElement>) => {

  if ([8, 9, 27, 13, 37, 38, 39, 40, 46].includes(e.keyCode)) {
    return;
  }

  if ((e.ctrlKey || e.metaKey) && [65, 67, 86, 88].includes(e.keyCode)) {
    return;
  }
  

  if ((e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
    e.preventDefault();
  }
};

export const validateNumericInput = (value: string): number => {
  if (value === '' || /^\d+$/.test(value)) {
    return parseInt(value) || 0;
  }
  return 0;
};

export const sanitizeNumericInput = (value: string): string => {
  let cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  if (parts[1] && parts[1].length > 2) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  return cleaned;
};

export const isValidNumericKeyPress = (e: React.KeyboardEvent): boolean => {

  if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
      (e.keyCode === 65 && e.ctrlKey === true) ||
      (e.keyCode === 67 && e.ctrlKey === true) ||
      (e.keyCode === 86 && e.ctrlKey === true) ||
      (e.keyCode === 88 && e.ctrlKey === true) ||
      (e.keyCode >= 35 && e.keyCode <= 39)) {
    return true;
  }

  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && 
      (e.keyCode < 96 || e.keyCode > 105) && 
      e.keyCode !== 190 && e.keyCode !== 110) {
    return false;
  }
  
  return true;
};
