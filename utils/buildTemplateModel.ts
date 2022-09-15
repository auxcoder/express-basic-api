import constants from '../config/constants';
import {TemplateModel} from '../types/common';

type UserData = {
  username: string; email: string; verifyToken: string;
}
type ClientData = {
  host: string;
  action_path: string;
  login_path: string
}

export default function buildTemplateModel(user: UserData, clientData: ClientData): TemplateModel {
  return {
    product_name: 'Prisma & Express',
    name: user.username,
    username: user.email,
    product_url: clientData.host,
    action_path: `${clientData.host}${clientData.action_path}/${user.verifyToken}`,
    login_path: `${clientData.host}${clientData.login_path}`,
    support_email: constants.emailData.supportEmail,
    sender_name: 'Support Team',
    help_url: `${clientData.host}$/help`,
    company_name: constants.emailData.companyName,
    company_address: constants.emailData.companyAddress,
  };
}
