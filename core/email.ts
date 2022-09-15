import * as postmark from 'postmark';
import constants from '../config/constants';
import nodemailer from "nodemailer";
import {TemplateModel} from '../types/common';
const client = new postmark.ServerClient(constants.emailData.postmarkId);
const ENV = process.env.NODE_ENV || 'development';

async function mock() {
  const promise = new Promise((resolve, reject) => {
    setTimeout(
      () =>
        resolve({
          To: null, // <email@domain>
          SubmittedAt: null, // <timestamps>
          MessageID: null, // <uuid>
          ErrorCode: 0, //
          Message: 'OK', //
        }),
      1000
    );
  });
  return await promise;
}
/**
 * https://postmarkapp.com/developer/api/email-api
 * https://postmarkapp.com/developer/api/overview
 */
const emailRepository = {
  /**
   * Send an email using a template aliases name and passing a data object
   * @param {String} from
   * @param {String} to
   * @param {Object} [templateModel={}]
   * @returns A promise that's resolved with the sent email
   */
  sendWelcome: async function sendWelcome(from: string, to: string, templateModel: TemplateModel| Record<string, unknown> = {}) {
    if (ENV === 'test') return await mock();

    try {
      if (ENV === 'development') {
        console.log('log > templateModel >', templateModel);
        const account = await nodemailer.createTestAccount();
        const transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: account.user, // generated ethereal user
            pass: account.pass // generated ethereal password
          }
        });
        const mailOptions = {
          from: from, // sender address
          to: to, // list of receivers
          subject: `Welcome to ${constants.emailData.companyName}`, // Subject line
          text: `verify account at: ${templateModel.action_path}`, // plain text body
          html: `<a href="${templateModel.action_path}" target="_blank">Click to confirm account</a>` // html body
        };
        const info = await transporter.sendMail(mailOptions);

        // log send email for debug
        console.log("Email sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        return info;
      } else {
        const resolvedData = await client.sendEmailWithTemplate({
          From: from,
          To: to,
          TemplateAlias: 'welcome',
          TemplateModel: templateModel,
        });

        return resolvedData;
      }
    } catch (error) {
      return error;
    }
  },

  /**
   * Send an email using a template aliases name and a collection of attachments
   * @param {String} from
   * @param {String} to
   * @param {String} subject
   * @param {Array} [attachments=[]]
   * @param {String} [templateId=null]
   * @param {Object} [template={}]
   * @returns A promise that's resolved with the sent email with
   */
  sendWithAttachments: async (
    from: string,
    to: string,
    subject: string,
    attachments = [],
    templateId = null,
    template = {}
  ) => {
    if (ENV === 'test') return await mock();

    const email = {From: from, To: to, Subject: subject, Attachments: attachments, TemplateId: templateId};
    if (!email.TemplateId) Object.assign(email, {TemplateModel: template,});

    const resolvedData = await client.sendEmail(email);
    console.debug(resolvedData);
    return resolvedData;
  },
};
// module
export default emailRepository;
