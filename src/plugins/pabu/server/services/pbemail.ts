import { Strapi } from "@strapi/strapi";
import { EMAIL_SETTING_MODULE_UID } from "../constants";
import {
  EmailSendRequest,
  EmailTemplate,
  EmailTemplateCategory,
  EmailTemplateSetting,
} from "../types/pbemail";
import { i18nDefaultLocale } from "../utils/localization";
import pbEntityService from "./pbEntityService";

export default ({ strapi }: { strapi: Strapi }) => ({
  async init() {
    const emailSettings: any = await this.settings();
    if (!emailSettings) {
      strapi.log.info("[PB] create default email settings");
      await pbEntityService.create(EMAIL_SETTING_MODULE_UID, {
        data: {
          email: {
            fromAddress: process.env.EMAIL_ADDRESS_FROM,
            replyAddress: process.env.EMAIL_ADDRESS_FROM,
          },
          template: [],
          locale: await i18nDefaultLocale(
            process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
          ),
        },
      });
    }
    return;
  },
  async getAllEmailTemplates() {
    const emailSettings: any = await this.settings();
    return emailSettings && emailSettings.template
      ? emailSettings.template
      : [];
  },
  async getEmailTemplateByCategory(category: EmailTemplateCategory) {
    const emailSettings: any = await this.settings();
    if (!emailSettings || !emailSettings.template) {
      return [];
    }
    return emailSettings.template.filter(
      (template: EmailTemplateSetting) => template.category === category
    );
  },
  async testEmail(templateName: string, recipientEmail: string): Promise<void> {
    const emailPlaceholderData: any = [];
    const emailConfig: EmailTemplate = await this.templateByName(templateName);
    if (emailConfig) {
      const bodyTemplateString = emailConfig.template.emailTemplateString;
      const pattern = /<%=\s*data\.(\w+)\s*%>/g;
      let match;
      while ((match = pattern.exec(bodyTemplateString))) {
        emailPlaceholderData[match[1]] = `PLACEHOLDER_${match[1]}`;
      }
    }
    try {
      await this.sendEmail({
        templateName,
        subject: "Test email subject",
        emailTemplateValues: emailPlaceholderData,
        mailTo: recipientEmail,
        fileRelatedFields: [],
        useOverridesFromSavedTemplate: true,
      });
    } catch (err) {
      return Promise.reject("could not send email");
    }

    return Promise.resolve();
  },
  async sendEmail(
    emailSendRequest: EmailSendRequest,
    useOptionalRecipients: boolean = true
  ): Promise<void> {
    const emailConfig = await this.templateByName(
      emailSendRequest.templateName
    );
    let bodyTemplate = "";
    let fromAddressOverride = "";
    let replyAddressOverride = "";
    let subjectOverride = "";
    let optionalRecipients = "";
    let emailCategory = "";

    if (emailConfig) {
      if (emailSendRequest.useOverridesFromSavedTemplate) {
        fromAddressOverride = emailConfig.fromAddress;
        replyAddressOverride = emailConfig.replyAddress;
        if (emailConfig.template) {
          bodyTemplate = emailConfig.template.emailTemplateString ?? "";
          subjectOverride = emailConfig.template.emailSubject ?? "";
          if (useOptionalRecipients) {
            optionalRecipients = emailConfig.template.optionalRecipients ?? "";
          }
          emailCategory = emailConfig.template.category ?? "";
        }
      }
    }

    const attachments: any = [];
    for (let i = 0; i < emailSendRequest.fileRelatedFields.length; i++) {
      const fileRelatedField = emailSendRequest.fileRelatedFields[i];
      if (emailSendRequest.emailTemplateValues[fileRelatedField]) {
        attachments.push({
          filename:
            emailSendRequest.emailTemplateValues[fileRelatedField]
              .originalFileName,
          content: emailSendRequest.emailTemplateValues[fileRelatedField].file,
          encoding: "base64",
        });
      }
      delete emailSendRequest.emailTemplateValues[fileRelatedField];
    }

    const template = {
      subject: subjectOverride ? subjectOverride : emailSendRequest.subject,
      text: "",
      html: bodyTemplate,
    };

    let data: any = { ...emailSendRequest.emailTemplateValues };

    const allRecipients: string[] = [];
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (emailSendRequest.mailTo) {
      if (emailSendRequest.mailTo.toLowerCase().trim().match(emailRegex)) {
        allRecipients.push(emailSendRequest.mailTo);
      } else {
        strapi.log.info(
          "[sendEmail] could not send email because the mailTo email address is not a valid email"
        );
        return Promise.reject();
      }
    }

    if (optionalRecipients && typeof optionalRecipients === "string") {
      if (optionalRecipients.indexOf(",") > -1) {
        const optionalRecipientsArray = optionalRecipients.split(",");
        for (const emailString of optionalRecipientsArray) {
          if (emailString.toLowerCase().trim().match(emailRegex)) {
            allRecipients.push(emailString.toLowerCase().trim());
          } else {
            strapi.log.info(
              `[sendEmail] optional recipient email '${emailString
                .toLowerCase()
                .trim()}' is no valid email address and will be skipped`
            );
          }
        }
      } else {
        if (optionalRecipients.toLowerCase().trim().match(emailRegex)) {
          allRecipients.push(optionalRecipients.toLowerCase().trim());
        } else {
          strapi.log.info(
            `[sendEmail] optional recipient email '${optionalRecipients
              .toLowerCase()
              .trim()}' is no valid email address and will be skipped`
          );
        }
      }
    }
    for (const recipientEmail of allRecipients) {
      if (bodyTemplate) {
        if (emailCategory === "form") {
          // if the email template category is forms inject all form values into the
          // email template string with the data attribute key "formData"
          const emailTemplateValuesString = Object.entries(
            emailSendRequest.emailTemplateValues
          ).reduce(
            (prev, curr) => prev + `<p>${curr[0]}:<br/> ${curr[1]} </p>`,
            ""
          );
          data = { ...data, formData: emailTemplateValuesString };
        }

        try {
          await strapi.plugins["email"].services.email.sendTemplatedEmail(
            {
              from: fromAddressOverride ? fromAddressOverride : "", // "" = use strapi settings default
              replyTo: replyAddressOverride ? replyAddressOverride : "", // "" = use strapi settings default
              to: recipientEmail,
              ...(attachments.length > 0 && {
                attachments: attachments,
              }),
            },
            template,
            { data }
          );
          strapi.log.info(
            `[sendEmail] email (template=${emailSendRequest.templateName}) successfully send to ${recipientEmail}`
          );
        } catch (error) {
          strapi.log.error(error);
          return Promise.reject(error);
        }
      } else {
        const emailTemplateValuesString = Object.entries(
          emailSendRequest.emailTemplateValues
        ).reduce(
          (prev, curr) => prev + `<p>${curr[0]}:<br/> ${curr[1]} </p>`,
          ""
        );
        data = { ...data, formData: emailTemplateValuesString };
        /* 
        example default template that you could into emailsettings in strapi:

        <!DOCTYPE html>
          <html language="de">
            <head>
              <meta charset="utf-8" />
              <title>Formular Daten</title>
            </head>

            <body>
              <div class="container">
                <h1>test</h1>
                <%= data.formData %>
              </div>
            </body>
          </html>
        */
        const htmlBody = `
        <h2>${emailSendRequest.subject}</h2>
        <hr />
        <div>
          <%= data.formData %>
        </div>
        <style>
          h2, p {
            font-family: Arial, sans-serif;
          }
        </style>`;

        const defaultEmailTemplate = {
          subject: emailSendRequest.subject,
          text: "",
          html: htmlBody,
        };

        try {
          await strapi.plugins["email"].services.email.sendTemplatedEmail(
            {
              from: fromAddressOverride ? fromAddressOverride : "", // "" = use strapi settings default
              replyTo: replyAddressOverride ? replyAddressOverride : "", // "" = use strapi settings default
              to: recipientEmail,
              ...(attachments.length > 0 && {
                attachments: attachments,
              }),
            },
            defaultEmailTemplate,
            { data }
          );
          strapi.log.info(
            "[sendEmail] email (unstyled) successfully send to " +
              recipientEmail
          );
        } catch (error) {
          strapi.log.error(error);
          return Promise.reject(error);
        }
      }
    }
    return Promise.resolve();
  },
  async templateByName(templateName: string): Promise<EmailTemplate | null> {
    const emailSettings: any = await this.settings();
    if (!emailSettings || !emailSettings.template) {
      return null;
    }
    const template = emailSettings.template.find(
      (template: EmailTemplateSetting) => template.templateName === templateName
    );
    return Promise.resolve({
      template,
      fromAddress: emailSettings.email.fromAddress,
      replyAddress: emailSettings.email.replyAddress,
    } as EmailTemplate);
  },
  async templateSettingById(
    templateId: number
  ): Promise<EmailTemplateSetting | null> {
    const emailSettings: any = await this.settings();
    if (!emailSettings || !emailSettings.template) {
      return null;
    }
    const templateSetting = emailSettings.template.find(
      (template: EmailTemplateSetting) => template.id === templateId
    );
    return Promise.resolve(templateSetting);
  },
  async settings() {
    return await pbEntityService.findMany(EMAIL_SETTING_MODULE_UID, {
      fields: ["*"],
      filters: {},
      locale: await i18nDefaultLocale(
        process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
      ),
      populate: "pb-deep",
    });
  },
});
