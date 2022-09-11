import constants from '../config/constants';
import { User } from '@prisma/client'

export default function buildTemplateModel(user: User, client: {host: string; action_url: string; login_url: string}) {
  return {
    product_name: 'Evenement',
    name: user.username,
    username: user.email,
    product_url: client.host,
    action_url: `${client.host}${client.action_url}/${user.veroken}`,
    login_url: `${client.host}${client.login_url}`,
    support_email: constants.emailData.supportEmail,
    sender_name: 'Support Team',
    help_url: `${client.host}$/help`,
    company_name: constants.emailData.companyName,
    company_address: constants.emailData.companyAddress,
  };
}
