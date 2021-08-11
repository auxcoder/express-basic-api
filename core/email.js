import postmark from 'postmark';
import constants from '../config/constants.js';
const client = new postmark.Client(constants.postmarkId);
import nodemailer from "nodemailer";

async function mock() {
  let promise = new Promise((resolve, reject) => {
    setTimeout(
      () =>
        resolve({
          To: null, // <email@domain>
          SubmittedAt: null, // <timestampz>
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
   * Send an email using a template aliase name and passing a data object
   * @param {String} from
   * @param {String} to
   * @param {Object} [templateModel={}]
   * @returns A promise that's resolved with the sent email
   */
  sendWelcome: async function sendWelcome(from, to, templateModel = {}) {
    if (constants.env === 'test') return await mock();
    try {
      if (ENV === 'development') {
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
          subject: `Wellcome to ${constants.companyName}`, // Subject line
          text: `verify account at: ${constants.companyUrl}`, // plain text body
          html: `<a href="${constants.companyUrl}" target="_blank">Click to confirm account</a>` // html body
        };
        const info = await transporter.sendMail(mailOptions);
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
   * Send an email using a template aliase name and a collection of attachments
   * @param {String} from
   * @param {String} to
   * @param {String} subject
   * @param {Array} [attachments=[]]
   * @param {String} [templateId=null]
   * @param {Object} [template={}]
   * @returns A promise that's resolved with the sent email with
   */
  sendWithAttachments: async function sendWithAttachments(
    from,
    to,
    subject,
    attachments = [],
    templateId = null,
    template = {}
  ) {
    if (constants.env === 'test') return await mock();
    const email = {
      From: from,
      To: to,
      Subject: subject,
      Attachments: attachments,
      TemplateId: templateId,
      TemplateModel: template,
    };
    if (!email.TemplateId) delete email.TemplateModel;
    const resolvedData = await client.sendEmail(email);
    console.debug(resolvedData);
    return resolvedData;
  },
};
// module
export default emailRepository;
