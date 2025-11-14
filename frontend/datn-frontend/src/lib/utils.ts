// Utility function to concatenate class names
export function cn(...classes: (string | undefined | null | false)[]): string {
    return classes.filter(Boolean).join(' ');
}

// Utility function to format ISO date strings to "dd/mm/yyyy"
export const formatTime = (iso: string) => {
  const d = new Date(iso.replace(" ", "T"));
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};