import ansiStyles from "../vendor/ansi-styles/index.js";

// Base formatter interface
export class BaseFormatter {
	constructor() {
		this.styles = ansiStyles;
	}

	format(string, styler) {
		throw new Error("format method must be implemented by subclass");
	}

	getStyleInfo(styler) {
		const styleInfo = {
			modifiers: [],
			foreground: null,
			background: null,
			rgb: null,
			hex: null,
			ansi256: null,
		};

		let currentStyler = styler;
		while (currentStyler) {
			// Extract style information from the styler
			if (currentStyler.open) {
				// Parse ANSI codes to determine style type
				const codes = this.parseAnsiCodes(currentStyler.open);
				this.mergeStyleInfo(styleInfo, codes);
			}
			currentStyler = currentStyler.parent;
		}

		return styleInfo;
	}

	parseAnsiCodes(ansiString) {
		const codes = [];
		const matches = ansiString.match(/\u001B\[(\d+(?:;\d+)*)m/g);

		if (matches) {
			for (const match of matches) {
				const codeString = match.replace(/\u001B\[(\d+(?:;\d+)*)m/, "$1");
				const codeArray = codeString.split(";").map(Number);
				codes.push(...codeArray);
			}
		}

		return codes;
	}

	mergeStyleInfo(styleInfo, codes) {
		for (const code of codes) {
			// Modifiers
			if (code >= 0 && code <= 9) {
				const modifierMap = {
					1: "bold",
					2: "dim",
					3: "italic",
					4: "underline",
					5: "blink",
					7: "inverse",
					8: "hidden",
					9: "strikethrough",
				};
				if (modifierMap[code]) {
					styleInfo.modifiers.push(modifierMap[code]);
				}
			}
			// Foreground colors
			else if (code >= 30 && code <= 37) {
				const colorMap = {
					30: "black",
					31: "red",
					32: "green",
					33: "yellow",
					34: "blue",
					35: "magenta",
					36: "cyan",
					37: "white",
				};
				styleInfo.foreground = colorMap[code];
			}
			// Bright foreground colors
			else if (code >= 90 && code <= 97) {
				const colorMap = {
					90: "blackBright",
					91: "redBright",
					92: "greenBright",
					93: "yellowBright",
					94: "blueBright",
					95: "magentaBright",
					96: "cyanBright",
					97: "whiteBright",
				};
				styleInfo.foreground = colorMap[code];
			}
			// Background colors
			else if (code >= 40 && code <= 47) {
				const colorMap = {
					40: "bgBlack",
					41: "bgRed",
					42: "bgGreen",
					43: "bgYellow",
					44: "bgBlue",
					45: "bgMagenta",
					46: "bgCyan",
					47: "bgWhite",
				};
				styleInfo.background = colorMap[code];
			}
			// Bright background colors
			else if (code >= 100 && code <= 107) {
				const colorMap = {
					100: "bgBlackBright",
					101: "bgRedBright",
					102: "bgGreenBright",
					103: "bgYellowBright",
					104: "bgBlueBright",
					105: "bgMagentaBright",
					106: "bgCyanBright",
					107: "bgWhiteBright",
				};
				styleInfo.background = colorMap[code];
			}
		}
	}
}

// ANSI formatter (default)
export class AnsiFormatter extends BaseFormatter {
	format(string, styler) {
		if (!styler || !string) {
			return string;
		}

		const { openAll, closeAll } = styler;

		// Handle existing ANSI codes in the string
		let processedString = string;
		if (string.includes("\u001B")) {
			let currentStyler = styler;
			while (currentStyler) {
				processedString = processedString.replace(
					new RegExp(currentStyler.close, "g"),
					currentStyler.open
				);
				currentStyler = currentStyler.parent;
			}
		}

		// Handle line breaks
		const lfIndex = processedString.indexOf("\n");
		if (lfIndex !== -1) {
			processedString = this.encaseCRLF(
				processedString,
				closeAll,
				openAll,
				lfIndex
			);
		}

		return openAll + processedString + closeAll;
	}

	encaseCRLF(string, prefix, postfix, index) {
		let endIndex = 0;
		let returnValue = "";
		do {
			const gotCR = string[index - 1] === "\r";
			returnValue +=
				string.slice(endIndex, gotCR ? index - 1 : index) +
				prefix +
				(gotCR ? "\r\n" : "\n") +
				postfix;
			endIndex = index + 1;
			index = string.indexOf("\n", endIndex);
		} while (index !== -1);

		returnValue += string.slice(endIndex);
		return returnValue;
	}
}

// HTML formatter
export class HtmlFormatter extends BaseFormatter {
	format(string, styler) {
		if (!styler || !string) {
			return string;
		}

		const styleInfo = this.getStyleInfo(styler);
		const styles = this.buildCssStyles(styleInfo);

		if (!styles.length) {
			return string;
		}

		return `<span style="${styles.join("; ")}">${string}</span>`;
	}

	buildCssStyles(styleInfo) {
		const styles = [];

		// Apply modifiers
		for (const modifier of styleInfo.modifiers) {
			switch (modifier) {
				case "bold":
					styles.push("font-weight: bold");
					break;
				case "dim":
					styles.push("opacity: 0.7");
					break;
				case "italic":
					styles.push("font-style: italic");
					break;
				case "underline":
					styles.push("text-decoration: underline");
					break;
				case "strikethrough":
					styles.push("text-decoration: line-through");
					break;
				case "inverse":
					styles.push("filter: invert(1)");
					break;
			}
		}

		// Apply colors
		if (styleInfo.foreground) {
			const color = this.getColorValue(styleInfo.foreground);
			if (color) {
				styles.push(`color: ${color}`);
			}
		}

		if (styleInfo.background) {
			const color = this.getColorValue(styleInfo.background);
			if (color) {
				styles.push(`background-color: ${color}`);
			}
		}

		return styles;
	}

	getColorValue(colorName) {
		const colorMap = {
			// Basic colors
			black: "#000000",
			red: "#e06c75",
			green: "#98c379",
			yellow: "#d19a66",
			blue: "#61afef",
			magenta: "#c678dd",
			cyan: "#56b6c2",
			white: "#ffffff",

			// Bright colors
			blackBright: "#5c6370",
			redBright: "#e06c75",
			greenBright: "#98c379",
			yellowBright: "#d19a66",
			blueBright: "#61afef",
			magentaBright: "#c678dd",
			cyanBright: "#56b6c2",
			whiteBright: "#ffffff",

			// Background colors
			bgBlack: "#000000",
			bgRed: "#e06c75",
			bgGreen: "#98c379",
			bgYellow: "#d19a66",
			bgBlue: "#61afef",
			bgMagenta: "#c678dd",
			bgCyan: "#56b6c2",
			bgWhite: "#ffffff",

			// Bright background colors
			bgBlackBright: "#5c6370",
			bgRedBright: "#e06c75",
			bgGreenBright: "#98c379",
			bgYellowBright: "#d19a66",
			bgBlueBright: "#61afef",
			bgMagentaBright: "#c678dd",
			bgCyanBright: "#56b6c2",
			bgWhiteBright: "#ffffff",
		};

		return colorMap[colorName];
	}
}

// Markdown formatter
export class MarkdownFormatter extends BaseFormatter {
	format(string, styler) {
		if (!styler || !string) {
			return string;
		}

		const styleInfo = this.getStyleInfo(styler);
		return this.applyMarkdownStyles(string, styleInfo);
	}

	applyMarkdownStyles(string, styleInfo) {
		let result = string;

		// Apply modifiers (Markdown has limited support)
		for (const modifier of styleInfo.modifiers) {
			switch (modifier) {
				case "bold":
					result = `**${result}**`;
					break;
				case "italic":
					result = `_${result}_`;
					break;
				case "strikethrough":
					result = `~~${result}~~`;
					break;
			}
		}

		// Note: Markdown doesn't support colors natively
		// We could add HTML spans for colors, but that would require HTML support
		// For now, we'll just return the styled text without colors
		return result;
	}
}

// JSON formatter
export class JsonFormatter extends BaseFormatter {
	format(string, styler) {
		if (!styler || !string) {
			return JSON.stringify({ text: string, styles: null });
		}

		const styleInfo = this.getStyleInfo(styler);
		return JSON.stringify({
			text: string,
			styles: styleInfo,
			raw: {
				open: styler.openAll,
				close: styler.closeAll,
			},
		});
	}
}

// Formatter registry
class FormatterRegistry {
	constructor() {
		this.formatters = new Map();
		this.defaultFormatter = "ansi";

		// Register built-in formatters
		this.register("ansi", new AnsiFormatter());
		this.register("html", new HtmlFormatter());
		this.register("markdown", new MarkdownFormatter());
		this.register("json", new JsonFormatter());
	}

	register(name, formatter) {
		if (!(formatter instanceof BaseFormatter)) {
			throw new Error("Formatter must extend BaseFormatter");
		}
		this.formatters.set(name, formatter);
	}

	get(name) {
		const formatter = this.formatters.get(name);
		if (!formatter) {
			throw new Error(
				`Formatter '${name}' not found. Available formatters: ${Array.from(
					this.formatters.keys()
				).join(", ")}`
			);
		}
		return formatter;
	}

	getDefault() {
		return this.get(this.defaultFormatter);
	}

	setDefault(name) {
		if (!this.formatters.has(name)) {
			throw new Error(`Formatter '${name}' not found`);
		}
		this.defaultFormatter = name;
	}

	list() {
		return Array.from(this.formatters.keys());
	}
}

// Export singleton instance
export const formatterRegistry = new FormatterRegistry();

// Export individual formatters for testing
export { AnsiFormatter, HtmlFormatter, MarkdownFormatter, JsonFormatter };
