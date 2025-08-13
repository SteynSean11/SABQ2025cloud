import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merge and normalize CSS class names, resolving conditional values and Tailwind conflicts.
 *
 * Accepts the same inputs as `clsx` (strings, arrays, objects, and falsy values), resolves them to
 * a single class string, then runs the result through `tailwind-merge` to collapse and resolve
 * conflicting Tailwind utility classes.
 *
 * @param inputs - One or more `ClassValue` items (strings, arrays, objects, etc.) accepted by `clsx`.
 * @returns The merged class string with Tailwind utilities deduplicated and conflicts resolved.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
