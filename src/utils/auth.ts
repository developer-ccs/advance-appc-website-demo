export function setAuthCookie(token: string) {
  const maxAge = 7 * 24 * 60 * 60;
  document.cookie = `access_token=${token}; path=/; max-age=${maxAge}; SameSite=Lax${
    process.env.NODE_ENV === "production" ? "; Secure" : ""
  }`;
}

export function clearAuthCookie() {
  document.cookie = "access_token=; path=/; max-age=0";
}
