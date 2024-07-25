import { Strapi } from "@strapi/strapi";
import axios from "axios";
import { fromBuffer } from "file-type";
import { FORM_MODULE_UID } from "../constants";
import { CmsSettings } from "../types/pbcmssetting";
import { EmailTemplateSetting } from "../types/pbemail";
import {
  CreateFormRequest,
  FormFieldDate,
  FormFieldEmail,
  FormFieldEnum,
  FormFieldFile,
  FormFieldString,
  FormFieldText,
  PbForm,
  SubmitFormRequest,
  UpdateFormRequest,
} from "../types/pbform";
import { getService, isValueUnique } from "../utils/functions";
import {
  createTemporaryLocalizedEntry,
  findLocalizedEntity,
  i18nDefaultLocale,
  i18nLocaleExists,
  synchronizeLocalizations,
} from "../utils/localization";
import pbEntityService from "./pbEntityService";

export default ({ strapi }: { strapi: Strapi }) => ({
  async findForms(locale: string): Promise<Array<PbForm>> {
    if (!(await i18nLocaleExists(locale))) {
      locale = await i18nDefaultLocale(
        process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
      );
    }
    const forms = await pbEntityService.findMany(FORM_MODULE_UID, {
      fields: ["*"],
      filters: {},
      locale: locale,
      sort: {},
      populate: "pb-deep",
    });
    return forms as Array<PbForm>;
  },
  async findFormById(id: number): Promise<Partial<PbForm>> {
    const form: any = await pbEntityService.findOne(FORM_MODULE_UID, id, {
      fields: ["*"],
      filters: {},
      sort: {},
      populate: "pb-deep",
    });
    if (form) {
      delete form.mailRecipients;
      delete form.mailSubject;
      delete form.name;
    }
    return form as Partial<PbForm>;
  },
  async submitForm(form: SubmitFormRequest): Promise<boolean> {
    if (!form.formId) {
      return Promise.reject(new Error("A valid form.formId is required!"));
    }

    const originalForm = (await pbEntityService.findOne(
      FORM_MODULE_UID,
      form.formId,
      {
        fields: ["*"],
        filters: {},
        sort: {},
        populate: "pb-deep",
      }
    )) as PbForm;
    if (!originalForm) {
      return Promise.reject(new Error("A valid form.formId is required!"));
    }

    const globalConfigData = await strapi
      .service("plugin::pabu.settings")
      .fetchSettingsData("glbl");

    if (
      globalConfigData?.captchatype?.formCaptchaType !== "none" &&
      originalForm.cfgWithCaptcha
    ) {
      const captchaVerified = await verifyCaptchaServerSide(
        form.captchaResponse
      );

      if (!captchaVerified) {
        return Promise.reject(new Error("could not validate captcha"));
      }
    }

    // Check for validity
    let validatedFields: boolean[] = [];
    if (form.data.length === originalForm.fields.length) {
      if (form.data.length > 0) {
        for (let i = 0; i < form.data.length; i++) {
          const formField = form.data[i];
          let fieldIsValid = false;
          if (formField.cfgFieldName === originalForm.fields[i].cfgFieldName) {
            const originalFormField = originalForm.fields[i];
            switch (formField.__component) {
              case "pb.frmstr": // field string
                // Prevent exceeding max. allowed characters DB-Limit:
                if (formField.fieldValue && formField.fieldValue.length > 250) {
                  formField.fieldValue = formField.fieldValue.substring(0, 250);
                }
                fieldIsValid = isFormFieldsStringValid(
                  formField.fieldValue,
                  originalFormField as FormFieldString
                );
                break;
              case "pb.frmbl": // field boolean
                if (originalForm.fields[i].cfgFieldIsMandatory) {
                  fieldIsValid = formField.fieldValue === true ? true : false;
                } else {
                  fieldIsValid = true;
                }
                break;
              case "pb.frmtxt": // field text
                fieldIsValid = isFormFieldsTextValid(
                  formField.fieldValue,
                  originalFormField as FormFieldText
                );
                break;
              case "pb.frmml": // field email
                fieldIsValid = isFormFieldsEmailValid(
                  formField.fieldValue,
                  originalFormField as FormFieldEmail
                );
                break;
              case "pb.frmfl": // field file
                fieldIsValid = await isFormFieldsFileValid(
                  formField.fieldValue,
                  originalFormField as FormFieldFile
                );
                break;
              case "pb.frmdt": // field date
                fieldIsValid = isFormFieldsDateValid(
                  formField.fieldValue,
                  originalFormField as FormFieldDate
                );
                break;
              case "pb.frmnm": // field enum
                fieldIsValid = isFormFieldsDropdownValid(
                  formField.fieldValue,
                  originalFormField as FormFieldEnum
                );
                break;
              default:
                break;
            }
          }

          validatedFields.push(fieldIsValid);
          if (!fieldIsValid) {
            strapi.log.error(
              `Couldn't successfully validate ${formField.cfgFieldName}-formField (mandatory: ${originalForm.fields[i].cfgFieldIsMandatory}) of ${originalForm.name}-Form.`
            );
          }
        }
      } else {
        strapi.log.info(`${originalForm.name} has no fields.`);
      }
    }

    // only returning: true/false
    let response = false;
    if (validatedFields.length === form.data.length) {
      if (!validatedFields.some((element) => element === false)) {
        // Form is valid:

        for (let i = 0; i < form.data.length; i++) {
          delete form.data[i].id;
        }

        const createdFormEntry = await strapi
          .plugin("pabu")
          .service("pbformentry")
          .createFormentry(form);

        if (createdFormEntry.id) {
          response = true;
          strapi.log.info(
            `Successfully created formEntry (formId: ${form.formId}).`
          );
        } else {
          strapi.log.error(
            `Could not create formEntry (formId: ${form.formId}).`
          );
        }
      }
    }

    return response;
  },
  async cmsFindForm(
    id: number,
    locale: string
  ): Promise<{
    form: PbForm;
    availableFormFields: any;
    availableFormEmailTemplates: any;
  }> {
    const strapiDefaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );

    if (!(await i18nLocaleExists(locale))) {
      locale = await i18nDefaultLocale(
        process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
      );
    }

    if (locale === strapiDefaultLocale) {
      const form = await pbEntityService.findOne(FORM_MODULE_UID, id, {
        fields: ["*"],
        filters: {},
        sort: {},
        locale: locale,
        populate: "pb-deep",
      });

      let availableFormFields: any = [];
      const formFieldComponentNames =
        strapi.contentTypes[FORM_MODULE_UID].attributes.fields["components"];
      const availableFormEmailTemplates = await getFormEmailTemplates();
      for (let formFieldName of formFieldComponentNames) {
        availableFormFields.push({
          name: strapi.components[formFieldName].uid,
          attributes: strapi.components[formFieldName].attributes,
        });
      }

      if (form) {
        return {
          form: form as PbForm,
          availableFormFields,
          availableFormEmailTemplates,
        };
      }
    } else {
      // get the default locale to get the localizations, then get the localized entity
      let existingFormDefaultLocale: any = await pbEntityService.findOne(
        FORM_MODULE_UID,
        id,
        {
          fields: ["*"],
          filters: {},
          sort: {},
          locale: strapiDefaultLocale,
          populate: "pb-deep",
        }
      );

      if (!existingFormDefaultLocale) {
        return Promise.reject(
          new Error("[cmsFindForm] coult not find default locale entry")
        );
      }

      // get the localized object with the id
      const existingLocalizedForm = await findLocalizedEntity(
        FORM_MODULE_UID,
        existingFormDefaultLocale.id,
        locale
      );

      // get form fields and values that are needed for create/edit
      let availableFormFields: any = [];
      const formFieldComponentNames =
        strapi.contentTypes[FORM_MODULE_UID].attributes.fields["components"];
      const availableFormEmailTemplates = await getFormEmailTemplates();
      for (let formFieldName of formFieldComponentNames) {
        availableFormFields.push({
          name: strapi.components[formFieldName].uid,
          attributes: strapi.components[formFieldName].attributes,
        });
      }

      if (existingLocalizedForm) {
        return {
          form: existingLocalizedForm as PbForm,
          availableFormFields,
          availableFormEmailTemplates,
        };
      } else {
        // if localized entity does not exist -> create a temporary one and return it
        if (existingFormDefaultLocale) {
          let newTempForm = createTemporaryLocalizedEntry(
            existingFormDefaultLocale,
            locale
          );

          strapi.log.info(
            `returning new temp form for locale ${locale} and name ${newTempForm.name}`
          );
          return {
            form: newTempForm as PbForm,
            availableFormFields,
            availableFormEmailTemplates,
          };
        }
      }
    }

    return Promise.reject(new Error("form not found"));
  },
  async cmsCreateValuesForm(): Promise<{
    availableFormFields: any;
    availableFormEmailTemplates: any;
  }> {
    // get form fields and values that are needed for create/edit
    let availableFormFields: any = [];
    const formFieldComponentNames =
      strapi.contentTypes[FORM_MODULE_UID].attributes.fields["components"];
    const availableFormEmailTemplates = await getFormEmailTemplates();
    for (let formFieldName of formFieldComponentNames) {
      availableFormFields.push({
        name: strapi.components[formFieldName].uid,
        attributes: strapi.components[formFieldName].attributes,
      });
    }
    return {
      availableFormFields,
      availableFormEmailTemplates,
    };
  },
  async cmsCreateForm(form: CreateFormRequest): Promise<PbForm> {
    const strapiDefaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );

    form.locale = strapiDefaultLocale;

    form.cfgMailTemplate = await getValidFormEmailTemplateId(
      form.cfgMailTemplate
    );

    if (!form.name) {
      return Promise.reject(
        new Error("[cmsCreateForm] form name can not be empty")
      );
    }

    const formNameExist = !(await isValueUnique(
      FORM_MODULE_UID,
      "name",
      form.name,
      null,
      strapiDefaultLocale
    ));

    if (formNameExist) {
      return Promise.reject(
        new Error("[cmsCreateForm] form name does already exist")
      );
    }

    const data = setCfgFieldName(form as PbForm);

    const entity = await pbEntityService.create(FORM_MODULE_UID, {
      data: { ...data },
    });
    return entity as PbForm;
  },
  async cmsUpdateForm(form: UpdateFormRequest): Promise<PbForm> {
    const id = form.id;

    let locale = form.locale;

    form.cfgMailTemplate = await getValidFormEmailTemplateId(
      form.cfgMailTemplate
    );

    const strapiDefaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );

    if (!(await i18nLocaleExists(locale))) {
      locale = await i18nDefaultLocale(
        process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
      );
    }

    if (!form.name) {
      return Promise.reject(
        new Error("[cmsUpdateForm] form name can not be empty")
      );
    }

    if (locale === strapiDefaultLocale) {
      const data = setCfgFieldName(form as PbForm);

      const entity = await pbEntityService.updateAndReturnPopulated(
        FORM_MODULE_UID,
        id,
        {
          data: {
            ...data,
          },
        }
      );
      return entity;
    } else {
      const existingFormDefaultLocale = await pbEntityService.findOneByQuery(
        FORM_MODULE_UID,
        {
          fields: ["*"],
          filters: {
            name: form.name,
          },
          locale: strapiDefaultLocale,
          sort: {},
          populate: "pb-deep",
        }
      );

      // the name is unique so you can also search by name
      const localizedForm = await findLocalizedEntity(
        FORM_MODULE_UID,
        existingFormDefaultLocale.id,
        locale
      );

      if (localizedForm) {
        const data = setCfgFieldName(form as PbForm);

        let entity = await pbEntityService.updateAndReturnPopulated(
          FORM_MODULE_UID,
          localizedForm.id,
          {
            data: {
              ...data,
            },
          }
        );
        return entity;
      } else {
        // create new localized entry
        const newLocalizedForm = await createNewLocalizedForm(form, locale);

        if (!newLocalizedForm) {
          return Promise.reject(
            new Error("[cmsUpdateForm] could not create new localized form")
          );
        }

        // sync locales
        const synchronizeFormsResult = await synchronizeLocalizations(
          existingFormDefaultLocale,
          {
            locale: locale,
            id: newLocalizedForm.id as number,
          },
          FORM_MODULE_UID
        );

        if (!synchronizeFormsResult) {
          strapi.log.error(
            `form created for ${locale} but localizations array could not be synced`
          );
          return Promise.reject(new Error("errorCreatingLocalizedForm"));
        }
        return newLocalizedForm;
      }
    }
  },
  async cmsDeleteForm(id: number): Promise<PbForm> {
    const form: any = await pbEntityService.findOne(FORM_MODULE_UID, id, {
      populate: "pb-deep",
    });
    if (!form) {
      return Promise.reject(new Error("form not found"));
    }

    const strapiDefaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );

    if (form.locale === strapiDefaultLocale) {
      for (const formLocalization of form.localizations) {
        await pbEntityService.delete(FORM_MODULE_UID, formLocalization.id);
      }
    }

    const deletedEntity = await pbEntityService.delete(
      FORM_MODULE_UID,
      form.id
    );

    return deletedEntity as unknown as PbForm;
  },
});

/**
 * checks given fieldValue against all checks
 * Make sure to always sync validation-Changes with frontend!
 * @param {String} fieldValue value send by frontend
 * @param {Object} originalFormField original formField set in strapi,
 * check against this because frontend formField is not trustworthy
 * @returns true or false
 */
const isFormFieldsStringValid = (
  fieldValue: string | null | undefined,
  originalFormField: FormFieldString
): boolean => {
  // Null Check:
  if (originalFormField.cfgFieldIsMandatory) {
    if (!fieldValue || fieldValue.trim().length < 1) {
      return false;
    }
  }
  // no letters
  if (originalFormField.cfgFieldNoLetters) {
    // Make sure to always sync validation-Changes with frontend!
    if (fieldValue && /[a-zA-ZÄÖÜäöüß]/g.test(fieldValue.trim())) {
      return false;
    }
  }

  // no special characters except whitespace
  if (originalFormField.cfgFieldNoSpecialCharacters) {
    // Make sure to always sync validation-Changes with frontend!
    if (
      fieldValue &&
      /^[a-z A-ZÄÖÜäöüß\d]+$/.test(fieldValue.trim()) === false
    ) {
      return false;
    }
  }

  // no whitespaces (no .trim() is applied in the test)
  if (originalFormField.cfgFieldNoWhitespaceCharacters) {
    // Make sure to always sync validation-Changes with frontend!
    if (fieldValue && /^\S*$/.test(fieldValue) === false) {
      return false;
    }
  }

  // only numbers
  if (originalFormField.cfgFieldNoNumbers) {
    // Make sure to always sync validation-Changes with frontend!
    if (fieldValue && /\d/g.test(fieldValue.trim())) {
      return false;
    }
  }
  // max chars
  if (originalFormField.cfgFieldCharactersMax) {
    // Make sure to always sync validation-Changes with frontend!
    if (
      fieldValue &&
      fieldValue.length > originalFormField.cfgFieldCharactersMax
    ) {
      return false;
    }
  }
  // min chars
  if (originalFormField.cfgFieldCharactersMin) {
    // Make sure to always sync validation-Changes with frontend!
    if (
      fieldValue &&
      fieldValue.length < originalFormField.cfgFieldCharactersMin
    ) {
      return false;
    }
  }
  // custom regex
  // regex must be without beginning and ending escape slash
  // "/^[5]+$/" => "^[5]+$"
  // Make sure to always sync validation-Changes with frontend!
  if (originalFormField.cfgFieldCustomRegex) {
    strapi.log.info(
      "Make sure to remove /.../ when saving from cfgModal & maybe also on create/update from strapi."
    );
    const customRegEx = RegExp(originalFormField.cfgFieldCustomRegex);
    if (fieldValue && customRegEx.test(fieldValue) === false) {
      return false;
    }
  }
  return true;
};

/**
 * checks given fieldValue against all checks
 * Make sure to always sync validation-Changes with frontend!
 * @param {String} fieldValue value send by frontend
 * @param {Object} originalFormField original formField set in strapi,
 * check against this because frontend formField is not trustworthy
 * @returns true or false
 */
const isFormFieldsTextValid = (
  fieldValue: string,
  originalFormField: FormFieldText
): boolean => {
  // Null Check:
  if (originalFormField.cfgFieldIsMandatory) {
    if (fieldValue === null || fieldValue.trim().length < 1) {
      return false;
    }
  }
  // no special characters except whitespace
  if (originalFormField.cfgFieldNoSpecialCharacters) {
    // Make sure to always sync validation-Changes with frontend!
    if (
      fieldValue &&
      /^[a-z A-ZÄÖÜäöüß\d]+$/.test(fieldValue.trim()) === false
    ) {
      return false;
    }
  }
  // max chars
  if (originalFormField.cfgFieldCharactersMax) {
    // Make sure to always sync validation-Changes with frontend!
    if (
      fieldValue &&
      fieldValue.length > originalFormField.cfgFieldCharactersMax
    ) {
      return false;
    }
  }
  // min chars
  if (originalFormField.cfgFieldCharactersMin) {
    // Make sure to always sync validation-Changes with frontend!
    if (
      fieldValue &&
      fieldValue.length < originalFormField.cfgFieldCharactersMin
    ) {
      return false;
    }
  }
  return true;
};

/**
 * checks given fieldValue against all checks
 * Make sure to always sync validation-Changes with frontend!
 * @param {String} fieldValue value send by frontend
 * @param {Object} originalFormField original formField set in strapi,
 * check against this because frontend formField is not trustworthy
 * @returns true or false
 */
const isFormFieldsEmailValid = (
  fieldValue: string | null | undefined,
  originalFormField: FormFieldEmail
): boolean => {
  // Null Check:
  if (originalFormField.cfgFieldIsMandatory) {
    if (!fieldValue || fieldValue.trim().length < 1) {
      return false;
    }
  }
  // is email string
  if (
    fieldValue &&
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      fieldValue
    ) === false
  ) {
    return false;
  }
  return true;
};

/**
 * checks given fieldValue against all checks
 * Make sure to always sync validation-Changes with frontend!
 * @param {String} fieldValue value send by frontend
 * @param {Object} originalFormField original formField set in strapi,
 * check against this because frontend formField is not trustworthy
 * @returns true or false
 */
const isFormFieldsFileValid = async (
  fieldValue: any,
  originalFormField: FormFieldFile
): Promise<boolean> => {
  // Null Check:
  if (originalFormField.cfgFieldIsMandatory) {
    if (
      fieldValue === null ||
      fieldValue.file === null ||
      fieldValue.file.length < 1
    ) {
      return false;
    }
  }

  // Checking fileSize
  // Note: https://nextjs.org/docs/messages/api-routes-body-size-limit
  // Search in project for: sizeLimit
  // Roughly compare length of string (~33% bigger than file) in Bytes with allowed fileSize (2MB)
  // strapi.config.get("constants.maxFormFileSize", 2)
  // Comparing with 2.01 is for edge-cases.
  const maxFormFieldFileSize =
    originalFormField.cfgFieldMaxFileSizeInMB !== null
      ? originalFormField.cfgFieldMaxFileSizeInMB
      : strapi.config.get("constants.maxFormFileSize", 2);
  if (
    fieldValue !== null &&
    fieldValue.file.length * (3 / 4) >
      (maxFormFieldFileSize + 0.01) * 1024 * 1024
  ) {
    strapi.log.error(
      `Uploaded file ${fieldValue.originalFileName} exceeded fileSize-Limit of ${maxFormFieldFileSize}MB.`
    );
    return false;
  }

  const fileType = await fromBuffer(Buffer.from(fieldValue.file, "base64"));
  const fileMimeType = fieldValue.mimeType.match(/data:(.*?);base64/);

  if (!fileMimeType || fileType.mime !== fileMimeType[1]) {
    strapi.log.error("mime type is wrong or missing.");
    return false;
  }

  // Checking fileEnding
  if (fieldValue.originalFileName) {
    const allowedFileEndings =
      originalFormField.cfgFieldAllowedFileEndings.replace(/\s/g, "");
    if (allowedFileEndings.length > 0) {
      const allowedFileEndingsArray = allowedFileEndings
        .split(",")
        .filter((e) => e !== "");
      if (allowedFileEndingsArray.length > 0) {
        const doesNameContainAllowedEnding = () => {
          let value = false;
          value = allowedFileEndingsArray.some((element) => {
            return fieldValue.originalFileName.endsWith(element);
          });
          return value;
        };
        if (doesNameContainAllowedEnding()) {
          //  has an allowedFileEnding
          return true;
        } else {
          strapi.log.error("File has incorrect fileEnding.");
          return false;
        }
      } else {
        // No allowedFileEndings provided!
        return false;
      }
    } else {
      // No allowedFileEndings provided!
      return false;
    }
  } else {
    // non-mandatory- & non-existing-File.
    if (!originalFormField.cfgFieldIsMandatory) {
      return true;
    }
    // No fileName provided!
    return false;
  }
};

const getFormEmailTemplates = async (): Promise<
  Array<EmailTemplateSetting>
> => {
  try {
    const pbEmailService = getService("pbemail");
    return await pbEmailService.getEmailTemplateByCategory("form");
  } catch (error) {
    strapi.log.error(error);
    strapi.log.error("could not load form email templates");
    return [];
  }
};

const getValidFormEmailTemplateId = async (
  emailTemplateId?: number
): Promise<number> => {
  if (!emailTemplateId) {
    return 0;
  }

  const allEmailFormTemplates = await getFormEmailTemplates();

  if (allEmailFormTemplates.length === 0) {
    return 0;
  }

  if (allEmailFormTemplates && allEmailFormTemplates.length > 0) {
    for (const emailTemplate of allEmailFormTemplates) {
      if (emailTemplateId === emailTemplate.id) {
        return emailTemplate.id;
      }
    }
  }

  return 0;
};

/**
 * checks given fieldValue against all checks
 * Make sure to always sync validation-Changes with frontend!
 * @param {String} fieldValue value send by frontend
 * @param {Object} originalFormField original formField set in strapi,
 * check against this because frontend formField is not trustworthy
 * @returns true or false
 */
const isFormFieldsDateValid = (
  fieldValue: string | null | undefined,
  originalFormField: FormFieldDate
): boolean => {
  // Null Check:
  if (originalFormField.cfgFieldIsMandatory) {
    if (!fieldValue || fieldValue.trim().length < 1) {
      return false;
    }
  }

  return true;
};

/**
 * checks given fieldValue against all checks
 * Make sure to always sync validation-Changes with frontend!
 * @param {String} fieldValue value send by frontend
 * @param {Object} originalFormField original formField set in strapi,
 * check against this because frontend formField is not trustworthy
 * @returns true or false
 */
const isFormFieldsDropdownValid = (
  fieldValue: string | null | undefined,
  originalFormField: FormFieldEnum
): boolean => {
  // Null Check:
  if (originalFormField.cfgFieldIsMandatory) {
    if (!fieldValue) {
      return false;
    } else {
      let valueExists = false;
      originalFormField.fieldDropdownValues.forEach((element) => {
        if (element.value === fieldValue) {
          valueExists = true;
        }
      });
      if (!valueExists) {
        return false;
      }
    }
  }

  return true;
};

/**
 * provides unique form field names
 * @param data
 * @returns
 */
const setCfgFieldName = (data: PbForm): PbForm => {
  if (!data.name) {
    data.name = data.title;
  }

  if (data.fields && data.fields.length > 0) {
    for (let i = 0; i < data.fields.length; i++) {
      const formField = data.fields[i];
      if (!formField.cfgFieldName) {
        data.fields[i].cfgFieldName = formField.fieldLabel
          ? formField.fieldLabel
          : `${data.title}-Field-${i}`;
      }
    }
  }

  if (data.fields && data.fields.length > 1) {
    for (let i = 0; i < data.fields.length; i++) {
      const formField = data.fields[i];
      for (let j = 0; j < data.fields.length; j++) {
        const formFieldToCompare = data.fields[j];
        if (i !== j) {
          if (formField.cfgFieldName === formFieldToCompare.cfgFieldName) {
            data.fields[
              j
            ].cfgFieldName = `${formField.cfgFieldName}-Field-${j}`;
          }
        }
      }
    }
  }
  return data;
};

/**
 * Create new localized form
 *
 * this exists as a service function because localized forms can be created
 * through form editor and creating new contentpage translations
 *
 * @param {*} form the form data that is used for the create call
 * @param {*} newLocale optional - the locale string (strapi locale)
 * @returns true or false
 */
export const createNewLocalizedForm = async (
  form: Partial<PbForm>,
  newLocale: string
): Promise<PbForm | null> => {
  if (newLocale) {
    form.locale = newLocale;
  }

  let newLocalizedForm = null;
  delete form.id;
  delete form.localizations;

  if (form.fields) {
    for (let i = 0; i < form.fields.length; i++) {
      delete form.fields[i].id;
    }
  }

  const data = setCfgFieldName(form as PbForm);

  newLocalizedForm = await pbEntityService.createAndReturnPopulated(
    FORM_MODULE_UID,
    {
      data: {
        ...data,
      },
    }
  );

  if (!newLocalizedForm) {
    strapi.log.error(
      `[createNewLocalizedForm] could not create form for form.name=${form.name} and locale ${form.locale}`
    );
    return null;
  }
  return newLocalizedForm as PbForm;
};

/**
 * Verify google recaptcha serverside
 */
const verifyCaptchaServerSide = async (
  captchaResponse: string | undefined
): Promise<boolean> => {
  strapi.log.info("verify captcha serverside");

  if (!captchaResponse) {
    return false;
  }

  const cmsSettings: CmsSettings = await strapi
    .plugin("pabu")
    .service("pbcmssettings")
    .getCmsSettings();

  if (!cmsSettings.googlerecaptchav2.recaptchav2privatekey) {
    strapi.log.error(
      "[verifyCaptchaServerSide] could not verify catpcha because" +
        "the recaptcha private key does not exist!"
    );
    return false;
  }

  const GOOGLE_RECAPTCHA_URL =
    "https://www.google.com/recaptcha/api/siteverify";
  let response;
  try {
    response = await axios.get(
      `${GOOGLE_RECAPTCHA_URL}?secret=${cmsSettings.googlerecaptchav2.recaptchav2privatekey}&response=${captchaResponse}`
    );
  } catch (error) {
    strapi.log.error("[verifyCaptchaServerSide] POST verify request failed");
    strapi.log.error(error);
    return false;
  }

  if (!response.data.success) {
    if (
      response.data["error-codes"] &&
      response.data["error-codes"].length > 0
    ) {
      strapi.log.error(
        "[verifyCaptchaServerSide] could not verify catpcha " +
          response["error-codes"]
      );
    }
    return false;
  }

  strapi.log.info(
    "[verifyCaptchaServerSide] catpcha was successfully verified!"
  );
  return true;
};
