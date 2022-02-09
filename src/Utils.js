var bigDecimal = require('js-big-decimal');

export function roundString(inputString, numberOfDecimals) {
  if (isNaN(parseFloat(inputString))) {
    return inputString;
  }
  return bigDecimal.round(inputString, numberOfDecimals);
}