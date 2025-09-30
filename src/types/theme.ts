/**
 * Theme type definitions for the shadow reading project
 * Provides type safety for CSS custom properties and theme values
 */

// Base color interface
interface BaseColor {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

// Brand colors
export interface BrandColors extends BaseColor {
  50: "#f0fdf4";
  100: "#dcfce7";
  200: "#bbf7d0";
  300: "#86efac";
  400: "#4ade80";
  500: "#22c55e";
  600: "#166534";
  700: "#15803d";
  800: "#166534";
  900: "#14532d";
}

// Semantic color variations
export interface SemanticColorVariation {
  DEFAULT: string;
  surface: string;
  border: string;
  strong: string;
}

// Primary color variations
export interface PrimaryColorVariation {
  DEFAULT: string;
  hover: string;
  active: string;
}

// Theme colors interface
export interface ThemeColors {
  // Brand colors
  brand: BrandColors;

  // Primary colors
  primary: PrimaryColorVariation;

  // Semantic colors
  success: SemanticColorVariation;
  warning: SemanticColorVariation;
  error: SemanticColorVariation;
  info: SemanticColorVariation;

  // Background colors
  background: {
    DEFAULT: string;
    secondary: string;
    tertiary: string;
    surface: string;
    inverse: string;
  };

  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
    inverse: string;
  };

  // Border colors
  border: {
    DEFAULT: string;
    secondary: string;
    muted: string;
    focus: string;
    error: string;
  };

  // Surface colors
  surface: {
    DEFAULT: string;
    base: string;
    muted: string;
    inverse: string;
  };

  // Card colors
  card: {
    DEFAULT: string;
    dark: string;
  };

  // Player-specific colors
  player: {
    accent: string;
    highlight: string;
    track: string;
    thumb: {
      fill: string;
      border: string;
    };
    hover: string;
    tooltip: string;
  };
}

// Spacing tokens
export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "card-sm": string;
  "card-lg": string;
  section: string;
}

// Border radius tokens
export interface ThemeBorderRadius {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  pill: string;
  card: string;
  "card-lg": string;
  control: string;
}

// Shadow tokens
export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "theme-sm": string;
  "theme-md": string;
  "theme-lg": string;
  "theme-xl": string;
}

// Complete theme interface
export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
}

// CSS Custom Properties interface
export interface CSSCustomProperties {
  // Brand colors
  "--brand-50": string;
  "--brand-100": string;
  "--brand-200": string;
  "--brand-300": string;
  "--brand-400": string;
  "--brand-500": string;
  "--brand-600": string;
  "--brand-700": string;
  "--brand-800": string;
  "--brand-900": string;

  // Primary colors
  "--color-primary": string;
  "--color-primary-hover": string;
  "--color-primary-active": string;

  // Semantic colors
  "--state-success-text": string;
  "--state-success-surface": string;
  "--state-success-border": string;
  "--state-success-strong": string;

  "--state-warning-text": string;
  "--state-warning-surface": string;
  "--state-warning-border": string;
  "--state-warning-strong": string;

  "--state-error-text": string;
  "--state-error-surface": string;
  "--state-error-border": string;
  "--state-error-strong": string;

  "--state-info-text": string;
  "--state-info-surface": string;
  "--state-info-border": string;
  "--state-info-strong": string;

  // Text colors
  "--text-primary": string;
  "--text-secondary": string;
  "--text-tertiary": string;
  "--text-muted": string;
  "--text-inverse": string;

  // Surface colors
  "--surface-base": string;
  "--surface-card": string;
  "--surface-muted": string;
  "--surface-inverse": string;

  // Background colors
  "--bg-primary": string;
  "--bg-secondary": string;
  "--bg-tertiary": string;
  "--bg-surface": string;
  "--bg-inverse": string;

  // Border colors
  "--border-primary": string;
  "--border-secondary": string;
  "--border-muted": string;
  "--border-focus": string;
  "--border-error": string;

  // Player colors
  "--player-accent-color": string;
  "--player-highlight-bg": string;
  "--player-track-color": string;
  "--player-thumb-fill": string;
  "--player-thumb-border": string;
  "--player-hover-indicator": string;
  "--player-tooltip-text": string;

  // Spacing
  "--space-xs": string;
  "--space-sm": string;
  "--space-md": string;
  "--space-lg": string;
  "--space-xl": string;
  "--space-card-padding-sm": string;
  "--space-card-padding-lg": string;
  "--space-section-gap": string;

  // Border radius
  "--radius-xs": string;
  "--radius-sm": string;
  "--radius-md": string;
  "--radius-lg": string;
  "--radius-xl": string;
  "--radius-2xl": string;
  "--radius-pill": string;
  "--radius-card": string;
  "--radius-card-large": string;
  "--radius-control": string;

  // Shadows
  "--shadow-sm": string;
  "--shadow-md": string;
  "--shadow-lg": string;
  "--shadow-xl": string;
}

// Theme mode type
export type ThemeMode = "light" | "dark";

// Theme context value interface
export interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: ThemeMode;
}

// Utility types for theme usage
export type ThemeColorKey = keyof ThemeColors;
export type ThemeColorValue<T extends ThemeColorKey> = ThemeColors[T];

// Type guard for theme colors
export function isThemeColor(key: string): key is ThemeColorKey {
  const validKeys: ThemeColorKey[] = [
    "brand",
    "primary",
    "success",
    "warning",
    "error",
    "info",
    "background",
    "text",
    "border",
    "surface",
    "card",
    "player",
  ];
  return validKeys.includes(key as ThemeColorKey);
}

// CSS variable utility type
export type CSSVariable<T extends string> = `var(--${T})`;

// Helper to create CSS variable types
export type ThemeCSSVariables = {
  [K in keyof CSSCustomProperties as CSSVariable<
    K extends `--${infer V}` ? V : never
  >]: CSSCustomProperties[K];
};
