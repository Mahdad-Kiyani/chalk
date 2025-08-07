import test from "ava";
import chalk, {
	BaseFormatter,
	AnsiFormatter,
	HtmlFormatter,
	MarkdownFormatter,
	JsonFormatter,
	formatterRegistry,
} from "../source/index.js";

// Set chalk level for consistent testing
chalk.level = 3;

test("formatter registry has built-in formatters", (t) => {
	const formatters = formatterRegistry.list();
	t.true(formatters.includes("ansi"));
	t.true(formatters.includes("html"));
	t.true(formatters.includes("markdown"));
	t.true(formatters.includes("json"));
});

test("formatter registry can get formatters", (t) => {
	const ansiFormatter = formatterRegistry.get("ansi");
	const htmlFormatter = formatterRegistry.get("html");

	t.true(ansiFormatter instanceof AnsiFormatter);
	t.true(htmlFormatter instanceof HtmlFormatter);
});

test("formatter registry throws error for unknown formatter", (t) => {
	t.throws(
		() => {
			formatterRegistry.get("unknown");
		},
		{ message: /Formatter 'unknown' not found/ }
	);
});

test("can register custom formatter", (t) => {
	class CustomFormatter extends BaseFormatter {
		format(string, styler) {
			return `[${string}]`;
		}
	}

	formatterRegistry.register("custom", new CustomFormatter());
	t.true(formatterRegistry.list().includes("custom"));

	const customFormatter = formatterRegistry.get("custom");
	t.true(customFormatter instanceof CustomFormatter);
	t.is(customFormatter.format("test", null), "[test]");
});

test("can set formatter on chalk instance", (t) => {
	const testChalk = new chalk.constructor();
	testChalk.setFormatter("html");

	t.is(testChalk.red("hello"), '<span style="color: #e06c75">hello</span>');
});

test("can get current formatter", (t) => {
	const testChalk = new chalk.constructor();
	const formatter = testChalk.getFormatter();

	t.true(formatter instanceof AnsiFormatter);
});

test("can list formatters", (t) => {
	const formatters = chalk.listFormatters();
	t.true(Array.isArray(formatters));
	t.true(formatters.length >= 4);
});

test("HTML formatter produces correct HTML", (t) => {
	const htmlFormatter = new HtmlFormatter();

	// Test basic color
	const result = htmlFormatter.format("hello", {
		open: "\u001B[31m",
		close: "\u001B[39m",
		openAll: "\u001B[31m",
		closeAll: "\u001B[39m",
	});

	t.is(result, '<span style="color: #e06c75">hello</span>');
});

test("HTML formatter handles multiple styles", (t) => {
	const htmlFormatter = new HtmlFormatter();

	// Test bold and color
	const result = htmlFormatter.format("hello", {
		open: "\u001B[1m",
		close: "\u001B[22m",
		openAll: "\u001B[31m\u001B[1m",
		closeAll: "\u001B[22m\u001B[39m",
		parent: {
			open: "\u001B[31m",
			close: "\u001B[39m",
			openAll: "\u001B[31m",
			closeAll: "\u001B[39m",
		},
	});

	t.true(result.includes("font-weight: bold"));
	t.true(result.includes("color: #e06c75"));
});

test("Markdown formatter produces correct markdown", (t) => {
	const markdownFormatter = new MarkdownFormatter();

	// Test bold
	const result = markdownFormatter.format("hello", {
		open: "\u001B[1m",
		close: "\u001B[22m",
		openAll: "\u001B[1m",
		closeAll: "\u001B[22m",
	});

	t.is(result, "**hello**");
});

test("Markdown formatter handles multiple modifiers", (t) => {
	const markdownFormatter = new MarkdownFormatter();

	// Test bold and italic
	const result = markdownFormatter.format("hello", {
		open: "\u001B[3m",
		close: "\u001B[23m",
		openAll: "\u001B[1m\u001B[3m",
		closeAll: "\u001B[23m\u001B[22m",
		parent: {
			open: "\u001B[1m",
			close: "\u001B[22m",
			openAll: "\u001B[1m",
			closeAll: "\u001B[22m",
		},
	});

	t.is(result, "**_hello_**");
});

test("JSON formatter produces correct JSON", (t) => {
	const jsonFormatter = new JsonFormatter();

	const result = jsonFormatter.format("hello", {
		open: "\u001B[31m",
		close: "\u001B[39m",
		openAll: "\u001B[31m",
		closeAll: "\u001B[39m",
	});

	const parsed = JSON.parse(result);
	t.is(parsed.text, "hello");
	t.true(parsed.styles.foreground === "red");
	t.true(parsed.raw.open === "\u001B[31m");
	t.true(parsed.raw.close === "\u001B[39m");
});

test("ANSI formatter maintains backward compatibility", (t) => {
	const ansiFormatter = new AnsiFormatter();

	const result = ansiFormatter.format("hello", {
		open: "\u001B[31m",
		close: "\u001B[39m",
		openAll: "\u001B[31m",
		closeAll: "\u001B[39m",
	});

	t.is(result, "\u001B[31mhello\u001B[39m");
});

test("formatters handle empty strings", (t) => {
	const htmlFormatter = new HtmlFormatter();
	const markdownFormatter = new MarkdownFormatter();
	const jsonFormatter = new JsonFormatter();

	t.is(htmlFormatter.format("", {}), "");
	t.is(markdownFormatter.format("", {}), "");
	t.is(jsonFormatter.format("", {}), '{"text":"","styles":null}');
});

test("formatters handle null styler", (t) => {
	const htmlFormatter = new HtmlFormatter();
	const markdownFormatter = new MarkdownFormatter();
	const jsonFormatter = new JsonFormatter();

	t.is(htmlFormatter.format("hello", null), "hello");
	t.is(markdownFormatter.format("hello", null), "hello");
	t.is(jsonFormatter.format("hello", null), '{"text":"hello","styles":null}');
});

test("chalk with HTML formatter produces HTML", (t) => {
	const htmlChalk = new chalk.constructor({ formatter: "html" });

	t.is(htmlChalk.red("hello"), '<span style="color: #e06c75">hello</span>');
	t.is(htmlChalk.bold("hello"), '<span style="font-weight: bold">hello</span>');
	t.is(
		htmlChalk.red.bold("hello"),
		'<span style="color: #e06c75; font-weight: bold">hello</span>'
	);
});

test("chalk with markdown formatter produces markdown", (t) => {
	const markdownChalk = new chalk.constructor({ formatter: "markdown" });

	t.is(markdownChalk.bold("hello"), "**hello**");
	t.is(markdownChalk.italic("hello"), "_hello_");
	t.is(markdownChalk.bold.italic("hello"), "**_hello_**");
});

test("chalk with JSON formatter produces JSON", (t) => {
	const jsonChalk = new chalk.constructor({ formatter: "json" });

	const result = jsonChalk.red("hello");
	const parsed = JSON.parse(result);

	t.is(parsed.text, "hello");
	t.true(parsed.styles.foreground === "red");
});

test("can chain formatter methods", (t) => {
	const testChalk = new chalk.constructor();

	class TestFormatter extends BaseFormatter {
		format(string, styler) {
			return `[${string}]`;
		}
	}

	testChalk
		.setFormatter("html")
		.registerFormatter("test", new TestFormatter())
		.setFormatter("ansi");

	t.true(testChalk.getFormatter() instanceof AnsiFormatter);
});

test("formatter registry maintains singleton behavior", (t) => {
	const registry1 = formatterRegistry;
	const registry2 = formatterRegistry;

	t.is(registry1, registry2);
});

test("can set default formatter", (t) => {
	const originalDefault = formatterRegistry.defaultFormatter;

	formatterRegistry.setDefault("html");
	t.is(formatterRegistry.defaultFormatter, "html");

	// Reset to original
	formatterRegistry.setDefault(originalDefault);
});

test("formatter registry validates formatter type", (t) => {
	t.throws(
		() => {
			formatterRegistry.register("invalid", {});
		},
		{ message: /Formatter must extend BaseFormatter/ }
	);
});
