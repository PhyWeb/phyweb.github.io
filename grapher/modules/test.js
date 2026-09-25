const knownFunctions = ['sqrt', 'cbrt'];
const regex = new RegExp(`\\b(${knownFunctions.join('|')})\\b(?=\\s*\\()`, 'gi');
let expression = 'SQRT(x)';
console.log(expression.replace(regex, (match) => match.toLowerCase()));

