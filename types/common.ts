import emailRepository from '../core/email';
import {newUser} from '../routes/middleware/validateUser';
import buildTemplateModel from '../utils/buildTemplateModel';

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

export type TemplateModel = {
  product_name: string;
  name: string;
  username: string;
  product_url: string;
  action_path: string;
  login_path: string;
  support_email: string;
  sender_name: string;
  help_url: string;
  company_name: string;
  company_address: string;
}
