import constants from '../config/constants';

type UserData = {
  username: string; email: string; verify_token: string;
}
type ClientData = {
  host: string; action_url: string; login_url: string
}

export default function buildTemplateModel(user: UserData, client: ClientData) {
  return {
    product_name: 'Prisma & Express',
    name: user.username,
    username: user.email,
    product_url: client.host,
    action_url: `${client.host}${client.action_url}/${user.verify_token}`,
    login_url: `${client.host}${client.login_url}`,
    support_email: constants.emailData.supportEmail,
    sender_name: 'Support Team',
    help_url: `${client.host}$/help`,
    company_name: constants.emailData.companyName,
    company_address: constants.emailData.companyAddress,
  };
}
