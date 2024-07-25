import { Strapi } from "@strapi/strapi";
import { FORMENTRY_MODULE_UID, FORM_MODULE_UID } from "../constants";
import { EmailTemplateSetting } from "../types/pbemail";
import { getService } from "../utils/functions";
import { i18nDefaultLocale } from "../utils/localization";
import pbEntityService from "./pbEntityService";

export default ({ strapi }: { strapi: Strapi }) => ({
  formEntryBeforeCreate: async (form) => {
    strapi.log.debug("formEntryBeforeCreate");
    if (form.formId) {
      let locale = form.locale;

      if (!locale) {
        locale = await i18nDefaultLocale(
          process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
        );
      }

      // Create formCopy
      const originalForm: any = await pbEntityService.findOne(
        FORM_MODULE_UID,
        form.formId,
        {
          fields: ["*"],
          filters: {},
          sort: {},
          locale: locale,
          populate: "pb-deep",
        }
      );
      if (originalForm) {
        form.formCopy = originalForm;
      }

      // Create formDataValues (cfgFieldName & fieldValue-Pairs)
      // A rudimentary check if formData-Fields match form-Fields is done in controller.
      // Attach original cfgFieldName to formData.
      const formData = form.data.map((formField, index) => {
        return {
          ...formField,
          ...(formField.__component ===
            originalForm!.fields[index].__component && {
            cfgFieldName: originalForm!.fields[index].cfgFieldName,
          }),
        };
      });
      const formDataValues = formData.reduce((obj, item) => {
        return {
          ...obj,
          [item["cfgFieldName"]]: item["fieldValue"],
        };
      }, {});
      form.formDataValues = formDataValues;
      return form;
    }
  },
  createFormentry: async (form) => {
    form = await strapi
      .plugin("pabu")
      .service("pbformentry")
      .formEntryBeforeCreate(form);

    form = await pbEntityService.createAndReturnPopulated(
      FORMENTRY_MODULE_UID,
      {
        data: {
          ...form,
        },
      }
    );

    await strapi
      .plugin("pabu")
      .service("pbformentry")
      .formEntryAfterCreate(form);

    return form;
  },
  formEntryAfterCreate: async (result) => {
    if (result.formCopy) {
      const formCopy = result.formCopy;
      let mailRecipients = [];

      // file-Field handling:
      const fieldsWithFile: any = [];
      for (let i = 0; i < result.data.length; i++) {
        const field = result.data[i];
        if (
          field.__component === "pb.frmfl" && // file form field
          field.fieldValue !== null
        ) {
          // Keeping track of fields with files.
          fieldsWithFile.push(field.cfgFieldName);
        }
      }

      if (
        formCopy.mailRecipients !== null &&
        typeof formCopy.mailRecipients === "string"
      ) {
        mailRecipients = formCopy.mailRecipients.split(",");
      }

      mailRecipients.forEach(async (mailRecipient: string, index) => {
        const useOptionalRecipients = index === 0;
        const mailTo = mailRecipient.trim();
        if (strapi.service("plugin::pabu.pbformentry").validateEmail(mailTo)) {
          try {
            const emailTemplate = await getFormEmailTemplateById(
              formCopy.cfgMailTemplate
            );
            await strapi.service("plugin::pabu.pbemail").sendEmail(
              {
                templateName: emailTemplate ? emailTemplate.templateName : "",
                subject: result.formCopy.mailSubject,
                emailTemplateValues: result.formDataValues,
                mailTo: mailTo,
                fileRelatedFields: fieldsWithFile,
                useOverridesFromSavedTemplate: true,
              },
              useOptionalRecipients
            );
          } catch (error) {
            strapi.log.error(
              `There was an error trying to send an email via email.sendEmail!`
            );
          }
        } else {
          strapi.log.info(
            `Skip sendMail() - ${mailTo} is not a valid E-Mail-Address.`
          );
        }
      });
    }
  },
  validateEmail: (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  },
});

const getFormEmailTemplateById = async (
  templadeId: number
): Promise<EmailTemplateSetting | null> => {
  try {
    const pbEmailService = getService("pbemail");
    return await pbEmailService.templateSettingById(templadeId);
  } catch (error) {
    strapi.log.error("could not get email template by id");
    strapi.log.error(error);
    return null;
  }
};
