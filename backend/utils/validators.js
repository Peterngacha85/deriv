const SYMBOL_PATTERN = /^[A-Za-z0-9_]{2,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidSymbol(value) {
  return typeof value === 'string' && SYMBOL_PATTERN.test(value);
}

function isValidEmail(value) {
  return typeof value === 'string' && value.length <= 254 && EMAIL_PATTERN.test(value);
}

function isNumberInRange(value, min, max) {
  const num = Number(value);
  return !Number.isNaN(num) && num >= min && num <= max;
}

module.exports = { isValidSymbol, isValidEmail, isNumberInRange };
