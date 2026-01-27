export const getInitials = (name: string) => {
  if (!name) return "NA";

  const parts = name.trim().split(/\s+/); // maneja múltiples espacios

  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }

  const first = parts[0].charAt(0).toUpperCase();
  const last = parts[parts.length - 1].charAt(0).toUpperCase();

  return first + last;
};