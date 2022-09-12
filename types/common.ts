export interface TLooseObj {
  [key: string]: any;
}

export type Profile = {
  sub: number;
  username: string;
  email: string;
  iat?: string | null;
  uat?: string | null;
}
