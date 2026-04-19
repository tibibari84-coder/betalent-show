/** HTTP-only session cookie name */
export const SESSION_COOKIE_NAME = "bt_session";

/** Session lifetime for opaque DB-backed sessions */
export const SESSION_MAX_DAYS = 14;

export const PASSWORD_MIN_LENGTH = 8;
/** bcrypt truncates at 72 bytes; enforce a clear upper bound */
export const PASSWORD_MAX_LENGTH = 72;
