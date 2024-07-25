import { Common } from "@strapi/types/dist/types";
import { Context } from "koa";
import { FORM_MODULE_UID } from "../constants";
import pbEntityService from "../services/pbEntityService";
import { createNewLocalizedForm } from "../services/pbform";
import { PbForm } from "../types/pbform";
import { PbPage } from "../types/pbpage";

/**
 * Returns the locale from the context, either from the query parameter or the cookie.
 * @param ctx - The strapi koa context object.
 * @returns The locale string or undefined if none is found.
 */
export const localeFromContext = (ctx: Context): string | undefined => {
  const { locale } = ctx.request.query;
  const cookieLocale = ctx.cookies.get("NEXT_LOCALE");
  return Array.isArray(locale) ? locale[0] : locale || cookieLocale;
};

/**
 * Returns the default locale from the global strapi store or a fallback language.
 * @param defaultLanguage - The fallback language to use if the strapi store is not available or does not have a default locale. Defaults to "en".
 * @returns The default locale string.
 */
export const i18nDefaultLocale = async (
  defaultLanguage: string = "en"
): Promise<string> => {
  if (!global.strapi?.store) {
    return defaultLanguage;
  }
  const strapiDefaultLocale = await global.strapi
    ?.store({ type: "plugin", name: "i18n" })
    ?.get({ key: "default_locale" });
  return (strapiDefaultLocale as string) || defaultLanguage;
};

/**
 * Checks if the given locale exists in the global strapi store.
 * @param locale - The locale string to check.
 * @returns A boolean value indicating whether the locale exists or not.
 */
export const i18nLocaleExists = async (locale: string) => {
  const strapiLocales: string[] = await global.strapi
    .query("plugin::i18n.locale")
    .findMany({})
    .then((locales) => locales.map((local: any) => local.code));

  return strapiLocales.some((strapiLocale) => strapiLocale === locale);
};

/**
 * Clones the content of a page for a specific locale.
 * @param page - The page whose content is to be cloned.
 * @param locale - The target locale for the cloned content.
 * @param includeDefaultLocaleValues - Flag to include default locale values in the cloned content.
 * @returns An array containing the cloned content for the specified locale.
 */
export const clonePageContentForLocale = async (
  page: PbPage,
  locale: string,
  includeDefaultLocaleValues: boolean
) => {
  const newContentArray = page.content.map((content) => {
    const defaultLocaleValues: any = includeDefaultLocaleValues
      ? {
          ...content,
          defaultLocaleValue: true,
        }
      : {};

    delete defaultLocaleValues.id;

    if (defaultLocaleValues.content) {
      defaultLocaleValues.content.forEach(
        (contentElement: any) => delete contentElement.id
      );
    }

    return {
      localized: locale,
      ...defaultLocaleValues,
    };
  });

  await createOrAssignLocalizedFormCopy(newContentArray, locale);

  return newContentArray;
};

/**
 * Creates a temporary localized entry by assigning a locale to the provided entity.
 * This function deep clones the input entity to avoid modifying the original object.
 * It also sets the specified locale and removes any existing localizations.
 *
 * @param {any} entity - The entity to create a temporary localized entry for.
 * @param {string} locale - The locale to assign to the entity.
 * @returns A new entity with the specified locale and without localizations.
 */
export const createTemporaryLocalizedEntry = (entity: any, locale: string) => {
  entity = JSON.parse(JSON.stringify(entity));
  entity.locale = locale;
  delete entity.localizations;
  return entity;
};

/**
 * Synchronizes all entries that include the defaultLocaleEntry in their localizations-Array.
 *
 * NOTE: if there is no localized entity and only the default language entity the
 * existing localizations array is empty ([]).
 *
 * this function takes all localizations persisted in the default language and adds
 * itself (the default language) AND the new language to it. After that you have
 * an array with **ALL** localization objects in it.
 *
 * Then the all localizations array will be iterated through and will update each localized
 * entity with the other/new locales from the array.
 *
 * if you use deleteLocale = true as a param the localeObjectToSync will be removed from the
 * localizations array and this array is synced then for all other locales. This is the way to
 * remove locales for all other localized entities.
 *
 * NOTE: The current locale-object does not contain its own language in the localizations array!
 *       This is the reason the default language gets added at the beginning.
 *
 * example: available languages are de, en, fr
 * 1. if you add an 'de' (default language object)
 * the localized entity will look like this:
 * 'deObject': {id:220, ...deObject, localizations: []}
 *
 * 2. if you then add an 'en' object
 * the 'de' and 'en' object will get a localization object array containing the other one.
 * the localized entities will look like this:
 * 'deObject': {id:220, ...deObject, localizations: [{ locale: 'en-Us', id: 221 }]}
 * 'enObject': {id:221, ...enObject, localizations: [{ locale: 'de-De', id: 220 }]}
 *
 * 3. if you add an 'fr' object
 * the localized entities will look like this:
 * 'deObject': {id:220, ...deObject, localizations: [{ locale: 'en-Us', id: 221 }, { locale: 'fr', id: 222 }]}
 * 'enObject': {id:221, ...enObject, localizations: [{ locale: 'de-De', id: 220 }, { locale: 'fr', id: 222 }]}
 * 'frObject': {id:222, ...enObject, localizations: [{ locale: 'de-De', id: 220 }, { locale: 'en-Us', id: 221 }]}
 *
 *
 * @param {Object} defaultLocaleEntry the entity with the default language (the master entity of all localized ones)
 * @param {Object} localeObjectToSync the locale object that has to be synced (added or removed)
 * @param {String} api enitity type (api::page.page/api::draftpage.draftpage/api::navigation.navigation etc.)
 * @param {boolean} deleteLocale defaults to false. true = localeObjectToSync gets added / false = localeObjectToSync gets removed
 * @returns
 */
export const synchronizeLocalizations = async (
  defaultLocaleEntry: any,
  localeObjectToSync: { locale: string; id: number },
  api: Common.UID.ContentType,
  deleteLocale?: boolean
): Promise<boolean> => {
  let result: boolean = false;
  let existingEntityLocalizations = defaultLocaleEntry.localizations;

  const strapiDefaultLocale = await i18nDefaultLocale(
    process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
  );

  existingEntityLocalizations.push({
    locale: strapiDefaultLocale,
    id: defaultLocaleEntry.id,
  });

  if (deleteLocale) {
    // if you are deleting a locale
    existingEntityLocalizations = existingEntityLocalizations.filter(
      (localeObject) => localeObject.locale !== localeObjectToSync.locale
    );
  } else {
    // if you are adding a locale
    existingEntityLocalizations.push(localeObjectToSync);
  }

  // Update each localization
  let updatedEntityLocalizations = 0;
  for (let i = 0; i < existingEntityLocalizations.length; i++) {
    const currentLocalization = existingEntityLocalizations[i];
    if (currentLocalization.id) {
      // Create updated localizationsArray for this localization
      const localizationsArray = await createLocalizationsArray(
        existingEntityLocalizations,
        currentLocalization
      );
      const updatedLocalization = await strapi.query(api).update({
        where: { id: currentLocalization.id },
        data: { localizations: localizationsArray },
      });
      if (updatedLocalization) {
        updatedEntityLocalizations++;
      }
    }
  }

  if (existingEntityLocalizations.length === updatedEntityLocalizations) {
    result = true;
    strapi.log.debug(`Success: Updated all ${api} localizations:`);
  }

  if (!result) {
    strapi.log.warn(`Error: Couldn't update all ${api} localizations:`);
  }

  return result;
};

/**
 * Creates a valid localizations array (without strapis default draft/publish-system)
 * Removes currentLocalization from allLocalizations and returns the result.
 * @param {*} allLocalizations
 * @param {*} currentLocalization
 * @returns
 */
export const createLocalizationsArray = async (
  allLocalizations: Array<{ locale: string; id: number }>,
  currentLocalization: { locale: string; id: number }
) => {
  return allLocalizations
    .filter((localization) => localization.id !== currentLocalization.id)
    .map((localization) => ({
      id: localization.id,
      locale: localization.locale,
    }));
};

/**
 * Synchronizes non-localized attributes for the specified entity.
 *
 * @param {Common.UID.ContentType} api - The entity API.
 * @param {PbPage} page - The entity to synchronize.
 * @returns Returns a promise that resolves once the synchronization is complete.
 */
export const syncNonLocalizedAttributes = async (
  api: Common.UID.ContentType,
  entry: any
) => {
  if (!Array.isArray(entry.localizations)) {
    entry = (await pbEntityService.findOne(api, entry.id, {
      fields: ["*"],
      filters: {},
      sort: {},
      populate: "pb-deep",
    })) as any;
  }

  const model = strapi.getModel(api);
  await strapi.services[
    "plugin::i18n.localizations"
  ].syncNonLocalizedAttributes(entry, { model });
};

/**
 * Finds the localized entity for a given entityId and locale using the specified API.
 *
 * @param {Common.UID.ContentType} api - The API to retrieve localized entities.
 * @param {number} entityId - The unique identifier of the entity to be localized.
 *  This can be any ID, even the localized one you are looking for the function will return
 *  the localized one when it is found in your given ID or localizations array of your given id entity.
 * @param {string} locale - The target locale for the localized entity.
 * @returns {Promise<any | null>} A Promise that resolves to the localized entity if found,
 *   or null if the entity is not found or if there is an error during the retrieval process.
 */
export const findLocalizedEntity = async (
  api: Common.UID.ContentType,
  entityId: number,
  locale: string
): Promise<any | null> => {
  const existingEntity: any = await pbEntityService.findOne(
    api,
    entityId,
    {
      populate: "pb-deep",
    }
  );

  if (!existingEntity) {
    strapi.log.error(`could not find Entity with id ${entityId}`);
    return null;
  }

  if (existingEntity.locale === locale) {
    return existingEntity;
  }

  const localizedEntityId = existingEntity.localizations.find(
    (entity) => entity.locale === locale
  )?.id;

  if (localizedEntityId) {
    const existingLocalizedEntity = await pbEntityService.findOne(
      api,
      localizedEntityId,
      {
        populate: "pb-deep",
      }
    );
    return existingLocalizedEntity;
  }

  return null;
};

/**
 * Creates a new localized form for the new created temporary contentpage/contenttype
 * or assigns an existing localized form entry for the new created temporary localized
 * contentpage/contenttype
 *
 * @param {Array} contentArray the content array where the form contentelement
 *      that should be created in a new locale can be found
 * @param {String} locale the new locale
 * @returns void
 */
export const createOrAssignLocalizedFormCopy = async (contentArray, locale) => {
  for (const contentElement of contentArray) {
    
    if (contentElement.__component === "pb.cfrm") {
      const defaultLocaleForm = (await pbEntityService.findOne(
        FORM_MODULE_UID,
        contentElement.cfgSelectFormId,
        {
          fields: ["*"],
          filters: {},
          sort: {},
          populate: "pb-deep",
        }
      )) as PbForm;

      if (!defaultLocaleForm) {
        return;
      }

      const localizedForm = await findLocalizedEntity(
        FORM_MODULE_UID,
        defaultLocaleForm.id,
        locale
      );

      strapi.log.debug(
        `[createOrAssignLocalizedFormCopy] [form] changed language` +
          `to a not created localized page with a form in content`
      );

      if (localizedForm) {
        // the localized form already exists
        // assign the localized form to the content array
        strapi.log.debug(
          `[createOrAssignLocalizedFormCopy] assigning localized form locale=` +
            `${locale} form.name=${defaultLocaleForm.name}`
        );
        delete contentElement.defaultLocaleValue;
        contentElement.cfgSelectFormId = localizedForm.id;
        return;
      } else {
        // the localized form does not exist create a localized
        // form copy so it can be assigned to the new contentarray
        strapi.log.debug(
          `[createOrAssignLocalizedFormCopy] trying to create new localized` +
            `form for locale=${locale} form.name=${defaultLocaleForm.name}`
        );
        // the copy is needed because the id and localizations
        // array is deleted in the createNewLocalizedForm call
        // so you cant use the defaultLocaleForm after that
        const defaultLocaleFormCopy = createTemporaryLocalizedEntry(
          defaultLocaleForm,
          locale
        );

        defaultLocaleFormCopy.title =
          defaultLocaleFormCopy.title + ` (copy (${locale}))`;

        // create new localized entry
        const newLocalizedForm = await createNewLocalizedForm(
          defaultLocaleFormCopy,
          locale
        );

        if (!newLocalizedForm) {
          strapi.log.debug(
            `[createOrAssignLocalizedFormCopy] localized form creation failed for` +
              `${locale} form.name=${defaultLocaleForm.name}`
          );
          return;
        }
        // synchronize the new localized form
        const synchronizeFormsResult = await synchronizeLocalizations(
          defaultLocaleForm,
          {
            locale: locale,
            id: newLocalizedForm.id as number,
          },
          FORM_MODULE_UID
        );

        if (!synchronizeFormsResult) {
          strapi.log.debug(
            `[createOrAssignLocalizedFormCopy] form created for ` +
              `${locale} but localizations array could not be synced`
          );
          return;
        }

        strapi.log.debug(
          `[createOrAssignLocalizedFormCopy] assigning new created localized` +
            `form locale=${locale} form.name=${defaultLocaleForm.name}`
        );
        // assign the new created form to the actual content
        delete contentElement.defaultLocaleValue;
        contentElement.cfgSelectFormId = newLocalizedForm.id;

        return;
      }
    }
  }
};
