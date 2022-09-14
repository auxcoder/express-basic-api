export interface TLooseObj {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export type Profile = {
  sub: number;
  username: string;
  email: string;
  iat?: string | null;
  uat?: string | null;
}
