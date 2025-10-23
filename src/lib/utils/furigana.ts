/**
 * Furigana 处理模块
 * 支持多种 Furigana 数据格式和渲染方式
 */

export interface FuriganaToken {
  text: string;
  reading?: string;
  isRuby?: boolean;
}

export interface FuriganaData {
  tokens: FuriganaToken[];
  originalText: string;
}

export interface ParsedFurigana {
  html: string;
  text: string;
  hasFurigana: boolean;
}

// 支持的 Furigana 格式类型
export type FuriganaFormat =
  | "json" // JSON 格式: {"日本語":"にほんご","学習":"がくしゅう"}
  | "ruby" // Ruby 标签格式: <ruby>日本語<rt>にほんご</rt></ruby>
  | "brackets" // 括号格式: 日本語(にほんご)
  | "spaced" // 空格分隔: 日本語 にほんご
  | "mecab" // MeCab 输出格式
  | "kuromoji"; // Kuromoji 输出格式

/**
 * 解析不同格式的 Furigana 数据
 */
export function parseFurigana(
  furiganaString: string,
  originalText: string,
  format: FuriganaFormat = "json",
): ParsedFurigana {
  if (!furiganaString || !furiganaString.trim()) {
    return {
      html: escapeHtml(originalText),
      text: originalText,
      hasFurigana: false,
    };
  }

  try {
    let tokens: FuriganaToken[] = [];

    switch (format) {
      case "json":
        tokens = parseJsonFormat(furiganaString, originalText);
        break;
      case "ruby":
        tokens = parseRubyFormat(furiganaString);
        break;
      case "brackets":
        tokens = parseBracketsFormat(furiganaString, originalText);
        break;
      case "spaced":
        tokens = parseSpacedFormat(furiganaString, originalText);
        break;
      case "mecab":
        tokens = parseMecabFormat(furiganaString);
        break;
      case "kuromoji":
        tokens = parseKuromojiFormat(furiganaString);
        break;
      default:
        // 降级处理
        return {
          html: escapeHtml(originalText),
          text: originalText,
          hasFurigana: false,
        };
    }

    return {
      html: renderFuriganaHtml(tokens),
      text: originalText,
      hasFurigana: tokens.some((token) => token.reading && token.reading !== token.text),
    };
  } catch (error) {
    console.warn("Furigana parsing failed:", error);
    // 错误时降级为纯文本
    return {
      html: escapeHtml(originalText),
      text: originalText,
      hasFurigana: false,
    };
  }
}

/**
 * 解析 JSON 格式: {"日本語":"にほんご","学習":"がくしゅう"}
 */
function parseJsonFormat(furiganaString: string, originalText: string): FuriganaToken[] {
  try {
    const data = JSON.parse(furiganaString);
    const tokens: FuriganaToken[] = [];

    // 如果是对象格式 {word: reading}
    if (typeof data === "object" && data !== null) {
      let remainingText = originalText;

      for (const [text, reading] of Object.entries(data)) {
        const index = remainingText.indexOf(text);
        if (index !== -1) {
          // 添加前面的文本（如果有的话）
          if (index > 0) {
            const beforeText = remainingText.substring(0, index);
            tokens.push({ text: beforeText });
          }

          // 添加带假名的文本
          tokens.push({
            text,
            reading: reading as string,
            isRuby: true,
          });

          // 移除已处理的部分
          remainingText = remainingText.substring(index + text.length);
        }
      }

      // 添加剩余的文本
      if (remainingText) {
        tokens.push({ text: remainingText });
      }
    }

    return tokens;
  } catch {
    // 如果解析失败，尝试其他格式
    return parseAlternativeFormats(furiganaString, originalText);
  }
}

/**
 * 解析 Ruby 标签格式
 */
function parseRubyFormat(furiganaString: string): FuriganaToken[] {
  const tokens: FuriganaToken[] = [];
  const rubyRegex = /<ruby>([^<]+)<rt>([^<]+)<\/rt><\/ruby>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while (true) {
    match = rubyRegex.exec(furiganaString);
    if (match === null) break;
    // 添加前面的文本
    if (match.index > lastIndex) {
      const beforeText = furiganaString.substring(lastIndex, match.index);
      if (beforeText.trim()) {
        tokens.push({ text: beforeText });
      }
    }

    // 添加 Ruby 文本
    tokens.push({
      text: match[1],
      reading: match[2],
      isRuby: true,
    });

    lastIndex = match.index + match[0].length;
  }

  // 添加剩余的文本
  if (lastIndex < furiganaString.length) {
    const remainingText = furiganaString.substring(lastIndex);
    if (remainingText.trim()) {
      tokens.push({ text: remainingText });
    }
  }

  return tokens;
}

/**
 * 解析括号格式: 日本語(にほんご)
 */
function parseBracketsFormat(furiganaString: string, originalText: string): FuriganaToken[] {
  const tokens: FuriganaToken[] = [];
  const bracketRegex = /([^(]+)\(([^)]+)\)/g;
  let remainingText = originalText;
  let match: RegExpExecArray | null;

  // 从 furiganaString 中提取匹配的部分
  while (true) {
    match = bracketRegex.exec(furiganaString);
    if (match === null) break;
    const [_fullMatch, text, reading] = match;
    const index = remainingText.indexOf(text);

    if (index !== -1) {
      // 添加前面的文本
      if (index > 0) {
        tokens.push({ text: remainingText.substring(0, index) });
      }

      // 添加带假名的文本
      tokens.push({
        text,
        reading,
        isRuby: true,
      });

      remainingText = remainingText.substring(index + text.length);
    }
  }

  // 添加剩余的文本
  if (remainingText) {
    tokens.push({ text: remainingText });
  }

  return tokens;
}

/**
 * 解析空格分隔格式: 日本語 にほんご
 */
function parseSpacedFormat(furiganaString: string, _originalText: string): FuriganaToken[] {
  const parts = furiganaString.split(/\s+/);
  const tokens: FuriganaToken[] = [];

  // 假设格式为: 文本1 假名1 文本2 假名2 ...
  for (let i = 0; i < parts.length; i += 2) {
    const text = parts[i];
    const reading = parts[i + 1];

    if (text) {
      tokens.push({
        text,
        reading: reading || undefined,
        isRuby: !!reading,
      });
    }
  }

  return tokens;
}

/**
 * 解析 MeCab 格式
 */
function parseMecabFormat(furiganaString: string): FuriganaToken[] {
  const tokens: FuriganaToken[] = [];
  const lines = furiganaString.split("\n");

  for (const line of lines) {
    if (line.trim() === "EOS") continue;

    const parts = line.split("\t");
    if (parts.length >= 2) {
      const text = parts[0];
      const features = parts[1].split(",");

      // MeCab 的读法通常在第 8 个位置 (索引 7)
      const reading = features[7] !== "*" ? features[7] : undefined;

      tokens.push({
        text,
        reading,
        isRuby: !!reading && reading !== text,
      });
    }
  }

  return tokens;
}

/**
 * 解析 Kuromoji 格式
 */
function parseKuromojiFormat(furiganaString: string): FuriganaToken[] {
  try {
    const data = JSON.parse(furiganaString);
    const tokens: FuriganaToken[] = [];

    if (Array.isArray(data)) {
      for (const token of data) {
        tokens.push({
          text: token.surface_form || token.text || "",
          reading: token.reading,
          isRuby: !!(token.reading && token.reading !== token.surface_form),
        });
      }
    }

    return tokens;
  } catch {
    return [];
  }
}

/**
 * 尝试解析其他可能的格式
 */
function parseAlternativeFormats(furiganaString: string, originalText: string): FuriganaToken[] {
  // 尝试简单的 key:value 格式
  const kvRegex = /([^:,\s]+):([^,\s]+)/g;
  const tokens: FuriganaToken[] = [];
  let remainingText = originalText;
  let match: RegExpExecArray | null;

  while (true) {
    match = kvRegex.exec(furiganaString);
    if (match === null) break;
    const [_fullMatch, text, reading] = match;
    const index = remainingText.indexOf(text);

    if (index !== -1) {
      // 添加前面的文本
      if (index > 0) {
        tokens.push({ text: remainingText.substring(0, index) });
      }

      // 添加带假名的文本
      tokens.push({
        text,
        reading,
        isRuby: true,
      });

      remainingText = remainingText.substring(index + text.length);
    }
  }

  // 添加剩余的文本
  if (remainingText) {
    tokens.push({ text: remainingText });
  }

  return tokens;
}

/**
 * 渲染 Furigana 为 HTML
 */
function renderFuriganaHtml(tokens: FuriganaToken[]): string {
  return tokens
    .map((token) => {
      if (token.reading && token.reading !== token.text && token.isRuby) {
        return `<ruby>${escapeHtml(token.text)}<rt>${escapeHtml(token.reading)}</rt></ruby>`;
      }
      return escapeHtml(token.text);
    })
    .join("");
}

/**
 * HTML 转义
 */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 检测 Furigana 格式
 */
export function detectFuriganaFormat(furiganaString: string): FuriganaFormat {
  if (!furiganaString) return "json";

  // 检查 JSON 格式
  if (furiganaString.trim().startsWith("{") && furiganaString.trim().endsWith("}")) {
    try {
      JSON.parse(furiganaString);
      return "json";
    } catch {
      // 不是有效的 JSON
    }
  }

  // 检查 Ruby 标签格式
  if (furiganaString.includes("<ruby>") && furiganaString.includes("<rt>")) {
    return "ruby";
  }

  // 检查括号格式
  if (/\([^)]+\)/.test(furiganaString)) {
    return "brackets";
  }

  // 检查空格分隔格式
  if (furiganaString.split(/\s+/).length >= 4) {
    return "spaced";
  }

  // 检查 MeCab 格式
  if (furiganaString.includes("\t") && furiganaString.includes(",")) {
    return "mecab";
  }

  // 检查 Kuromoji 格式
  if (furiganaString.trim().startsWith("[") && furiganaString.trim().endsWith("]")) {
    try {
      const parsed = JSON.parse(furiganaString);
      if (Array.isArray(parsed)) {
        return "kuromoji";
      }
    } catch {
      // 不是有效的 JSON 数组
    }
  }

  // 默认为 JSON 格式
  return "json";
}

/**
 * 验证 Furigana 数据
 */
export function validateFurigana(furiganaString: string, originalText: string): boolean {
  try {
    const format = detectFuriganaFormat(furiganaString);
    const parsed = parseFurigana(furiganaString, originalText, format);
    return parsed.hasFurigana;
  } catch {
    return false;
  }
}

/**
 * 智能 Furigana 解析（自动检测格式）
 */
export function parseFuriganaAuto(furiganaString: string, originalText: string): ParsedFurigana {
  const format = detectFuriganaFormat(furiganaString);
  return parseFurigana(furiganaString, originalText, format);
}
