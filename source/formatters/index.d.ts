export interface StyleInfo {
	modifiers: string[];
	foreground: string | null;
	background: string | null;
	rgb: any;
	hex: any;
	ansi256: any;
}

export interface Styler {
	open: string;
	close: string;
	openAll: string;
	closeAll: string;
	parent?: Styler;
}

export abstract class BaseFormatter {
	styles: any;
	format(string: string, styler: Styler): string;
	getStyleInfo(styler: Styler): StyleInfo;
	parseAnsiCodes(ansiString: string): number[];
	mergeStyleInfo(styleInfo: StyleInfo, codes: number[]): void;
}

export class AnsiFormatter extends BaseFormatter {
	encaseCRLF(
		string: string,
		prefix: string,
		postfix: string,
		index: number
	): string;
}

export class HtmlFormatter extends BaseFormatter {
	buildCssStyles(styleInfo: StyleInfo): string[];
	getColorValue(colorName: string): string | undefined;
}

export class MarkdownFormatter extends BaseFormatter {
	applyMarkdownStyles(string: string, styleInfo: StyleInfo): string;
}

export class JsonFormatter extends BaseFormatter {
	format(string: string, styler: Styler): string;
}

export class FormatterRegistry {
	formatters: Map<string, BaseFormatter>;
	defaultFormatter: string;
	register(name: string, formatter: BaseFormatter): void;
	get(name: string): BaseFormatter;
	getDefault(): BaseFormatter;
	setDefault(name: string): void;
	list(): string[];
}

export const formatterRegistry: FormatterRegistry;
