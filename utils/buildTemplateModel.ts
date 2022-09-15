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

export default function buildTemplateModel(user: UserData, client: ClientData): TemplateModel {
  return {
    product_name: 'Prisma & Express',
    name: user.username,
    username: user.email,
    product_url: client.host,
    action_path: `${client.host}${client.action_path}/${user.verifyToken}`,
    login_path: `${client.host}${client.login_path}`,
    support_email: constants.emailData.supportEmail,
    sender_name: 'Support Team',
    help_url: `${client.host}$/help`,
    company_name: constants.emailData.companyName,
    company_address: constants.emailData.companyAddress,
  };
}
