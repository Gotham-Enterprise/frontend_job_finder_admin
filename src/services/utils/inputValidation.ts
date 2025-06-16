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
