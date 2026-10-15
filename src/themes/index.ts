import type { Theme } from "@/engine/theme";
import { aurora } from "./aurora";

// Every theme the app can render, by WebsiteTheme.key. An unknown key (a theme
// row added before its code shipped) falls back to the default theme.
const THEMES: Record<string, Theme> = { aurora };
export const DEFAULT_THEME = aurora;

export function themeFor(key: string | null | undefined): Theme {
  return (key && THEMES[key]) || DEFAULT_THEME;
}
