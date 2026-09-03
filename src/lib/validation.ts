// Password rules ported verbatim from the original signup wizard.
export function passwordErrors(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 6) errors.push("Must be at least 6 characters long.");
  if (!/[A-Za-z]/.test(password)) errors.push("Must contain at least one letter (A–Z or a–z).");
  if (!/\d/.test(password)) errors.push("Must contain at least one digit (0–9).");
  if (!/[^A-Za-z0-9]/.test(password))
    errors.push("Must contain at least one non-alphanumeric character (e.g., !@#$%).");
  return errors;
}

export const EMAIL_RE = /\S+@\S+\.\S+/;
