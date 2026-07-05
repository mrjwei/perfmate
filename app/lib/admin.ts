// There's no self-serve promotion flow — promoting a user to admin is a
// manual `UPDATE users SET role='admin' WHERE email=...` against prod.
export const ADMIN_ROLE = "admin"

export const isAdminRole = (role: string | undefined | null): boolean => role === ADMIN_ROLE
