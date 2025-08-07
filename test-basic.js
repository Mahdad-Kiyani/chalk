import chalk from "./source/index.js";

console.log("Testing basic chalk functionality...");

// Test default ANSI formatter
console.log("Default ANSI:", chalk.red("Hello World"));

// Test HTML formatter
const htmlChalk = new chalk.constructor({ formatter: "html" });
console.log("HTML formatter:", htmlChalk.red("Hello World"));

// Test markdown formatter
const markdownChalk = new chalk.constructor({ formatter: "markdown" });
console.log("Markdown formatter:", markdownChalk.bold("Hello World"));

// Test JSON formatter
const jsonChalk = new chalk.constructor({ formatter: "json" });
console.log("JSON formatter:", jsonChalk.blue("Hello World"));

console.log("Available formatters:", chalk.listFormatters());

console.log("✅ Basic functionality test completed!");
