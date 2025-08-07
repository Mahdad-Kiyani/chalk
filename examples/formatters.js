import chalk, { BaseFormatter } from "../source/index.js";

console.log("🎨 Chalk with Pluggable Formatters Demo\n");

// 1. Default ANSI formatter (backward compatibility)
console.log("1️⃣  Default ANSI Formatter:");
console.log(chalk.red("Red text") + " " + chalk.blue.bold("Bold blue text"));
console.log();

// 2. HTML formatter
console.log("2️⃣  HTML Formatter:");
const htmlChalk = new chalk.constructor({ formatter: "html" });
console.log(htmlChalk.red("Red text"));
console.log(htmlChalk.blue.bold("Bold blue text"));
console.log(htmlChalk.green.italic.underline("Green italic underlined text"));
console.log();

// 3. Markdown formatter
console.log("3️⃣  Markdown Formatter:");
const markdownChalk = new chalk.constructor({ formatter: "markdown" });
console.log(markdownChalk.bold("Bold text"));
console.log(markdownChalk.italic("Italic text"));
console.log(markdownChalk.bold.italic("Bold italic text"));
console.log(markdownChalk.strikethrough("Strikethrough text"));
console.log();

// 4. JSON formatter
console.log("4️⃣  JSON Formatter:");
const jsonChalk = new chalk.constructor({ formatter: "json" });
console.log(jsonChalk.red("Red text"));
console.log(jsonChalk.blue.bold("Bold blue text"));
console.log();

// 5. Dynamic formatter switching
console.log("5️⃣  Dynamic Formatter Switching:");
const dynamicChalk = new chalk.constructor();
console.log("Original:", dynamicChalk.red("Hello"));

dynamicChalk.setFormatter("html");
console.log("HTML:", dynamicChalk.red("Hello"));

dynamicChalk.setFormatter("markdown");
console.log("Markdown:", dynamicChalk.bold("Hello"));

dynamicChalk.setFormatter("json");
console.log("JSON:", dynamicChalk.blue("Hello"));

dynamicChalk.setFormatter("ansi");
console.log("Back to ANSI:", dynamicChalk.green("Hello"));
console.log();

// 6. Custom formatter
console.log("6️⃣  Custom Formatter:");
class EmojiFormatter extends BaseFormatter {
	format(string, styler) {
		if (!styler || !string) {
			return string;
		}

		const styleInfo = this.getStyleInfo(styler);
		let emoji = "📝";

		// Map styles to emojis
		if (styleInfo.foreground === "red") emoji = "🔴";
		else if (styleInfo.foreground === "green") emoji = "🟢";
		else if (styleInfo.foreground === "blue") emoji = "🔵";
		else if (styleInfo.foreground === "yellow") emoji = "🟡";

		if (styleInfo.modifiers.includes("bold")) emoji += "💪";
		if (styleInfo.modifiers.includes("italic")) emoji += "✨";

		return `${emoji} ${string}`;
	}
}

const customChalk = new chalk.constructor();
customChalk.registerFormatter("emoji", new EmojiFormatter());
customChalk.setFormatter("emoji");

console.log(customChalk.red("Red text"));
console.log(customChalk.green.bold("Bold green text"));
console.log(customChalk.blue.italic("Italic blue text"));
console.log();

// 7. List available formatters
console.log("7️⃣  Available Formatters:");
console.log("Built-in formatters:", chalk.listFormatters());
console.log();

// 8. Environment detection example
console.log("8️⃣  Environment Detection Example:");
function createEnvironmentAwareChalk() {
	// Detect if we're in a browser environment
	const isBrowser = typeof window !== "undefined";

	if (isBrowser) {
		return new chalk.constructor({ formatter: "html" });
	} else {
		return new chalk.constructor({ formatter: "ansi" });
	}
}

const envChalk = createEnvironmentAwareChalk();
console.log(
	"Environment-aware chalk formatter:",
	envChalk.getFormatter().constructor.name
);
console.log("Sample output:", envChalk.red("Environment-aware text"));
console.log();

// 9. Advanced HTML example with background colors
console.log("9️⃣  Advanced HTML Example:");
const advancedHtmlChalk = new chalk.constructor({ formatter: "html" });
console.log(advancedHtmlChalk.bgRed.white("White text on red background"));
console.log(
	advancedHtmlChalk.bgBlue.yellow.bold("Bold yellow text on blue background")
);
console.log();

// 10. Formatter chaining and composition
console.log("🔟  Formatter Composition:");
const composedChalk = new chalk.constructor()
	.setFormatter("html")
	.registerFormatter("debug", new BaseFormatter())
	.setFormatter("ansi");

console.log("Final formatter:", composedChalk.getFormatter().constructor.name);
console.log("Sample output:", composedChalk.cyan("Composed chalk instance"));

console.log(
	"\n✨ Demo completed! The new formatter system maintains full backward compatibility while adding powerful new output capabilities."
);
