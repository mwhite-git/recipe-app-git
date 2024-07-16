// src/utils/validatePassword.js
export const validatePassword = (password) => {
    const minLength = 8;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const digitRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  
    if (password.length < minLength) {
      return "Password must be at least 8 characters long.";
    }
    if (!uppercaseRegex.test(password)) {
      return "Password must contain at least one uppercase letter.";
    }
    if (!lowercaseRegex.test(password)) {
      return "Password must contain at least one lowercase letter.";
    }
    if (!digitRegex.test(password)) {
      return "Password must contain at least one digit.";
    }
    if (!specialCharRegex.test(password)) {
      return "Password must contain at least one special character.";
    }
    return null;
  };