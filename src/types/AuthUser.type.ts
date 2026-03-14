export type AuthUser = {
  sub: string;
  name: string;
  email: string;
  picture: string;
  /** Google Workspace domain (e.g. company.com) when restricted */
  domain?: string;
};
