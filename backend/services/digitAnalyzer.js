/** Extracts the last digit of a price the way Deriv's digit contracts do (last digit of the full numeric string, ignoring the decimal point). */
function lastDigit(price) {
  const digitsOnly = String(price).replace(/[^0-9]/g, '');
  return Number(digitsOnly[digitsOnly.length - 1]);
}

/**
 * Analyzes the last N prices (typically candle closes) for digit patterns:
 * frequency distribution, over/under a threshold, even/odd split, and
 * adjacent-digit matches.
 */
function analyzeDigits(prices, { threshold = 5 } = {}) {
  const digits = prices.map(lastDigit);
  const total = digits.length;

  const frequency = Array(10).fill(0);
  digits.forEach((d) => frequency[d]++);

  let overCount = 0;
  let underCount = 0;
  let evenCount = 0;
  let oddCount = 0;
  let matchCount = 0;

  digits.forEach((d, i) => {
    if (d > threshold) overCount++;
    else if (d < threshold) underCount++;

    if (d % 2 === 0) evenCount++;
    else oddCount++;

    if (i > 0 && d === digits[i - 1]) matchCount++;
  });

  const pct = (count) => (total > 0 ? Math.round((count / total) * 1000) / 10 : 0);

  return {
    sampleSize: total,
    threshold,
    frequency: frequency.map((count, digit) => ({ digit, count, percentage: pct(count) })),
    overUnder: {
      over: overCount,
      under: underCount,
      overPercentage: pct(overCount),
      underPercentage: pct(underCount)
    },
    evenOdd: {
      even: evenCount,
      odd: oddCount,
      evenPercentage: pct(evenCount),
      oddPercentage: pct(oddCount)
    },
    matches: {
      count: matchCount,
      percentage: total > 1 ? Math.round((matchCount / (total - 1)) * 1000) / 10 : 0
    },
    lastDigits: digits.slice(-20)
  };
}

module.exports = { analyzeDigits, lastDigit };
