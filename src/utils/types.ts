export type ViewType =
  | "applicant-login"
  | "applicant-register"
  | "applicant-forgot"
  | "council-login"
  | "council-register"
  | "applicant-forgot"
  | "council-forgot";

export enum UserRole {
  APPLICANT = "student",
  SUPER_ADMIN = "super-admin",
  ADMIN = "admin",
  COUNSELLOR = "counsellor",
  EXECUTIVE = "executive",
  ISSUING_AUTHORITY = "issuing-authority",
  HR = "hr",
  ACCOUNT = "account",
}
