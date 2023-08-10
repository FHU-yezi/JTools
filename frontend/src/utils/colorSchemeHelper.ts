import { effect, signal } from "@preact/signals";

// 如果用户的设备设置了深色模式，跟随其偏好
if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.className = "dark";
} else {
  document.documentElement.className = "light";
}

const colorScheme = signal(
  document.documentElement.className as unknown as "light" | "dark",
);

effect(() => (document.documentElement.className = colorScheme.value));

export function getColorScheme() {
  return colorScheme.value;
}

export function toggleColorScheme() {
  if (colorScheme.value === "light") {
    colorScheme.value = "dark";
  } else {
    colorScheme.value = "light";
  }
}

export function useColorScheme() {
  return {
    colorScheme: colorScheme.value,
    toggleColorScheme,
  };
}
