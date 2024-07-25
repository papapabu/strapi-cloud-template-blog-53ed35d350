import { Strapi } from "@strapi/strapi";
import { DYNAMICLIST_MODULE_UID } from "../constants";
import { CreateDynamicListRequest } from "../types/pbdynamiclist";
import {
  createTemporaryLocalizedEntry,
  findLocalizedEntity,
  i18nDefaultLocale,
  synchronizeLocalizations,
} from "../utils/localization";
import pbEntityService from "./pbEntityService";

export default ({ strapi }: { strapi: Strapi }) => ({
  async createDynamicList(createDynamicListRequest: CreateDynamicListRequest) {
    await validateCreateDynamicList(createDynamicListRequest).catch((err) =>
      Promise.reject(err)
    );
    const createdDynamicList = await strapi
      .entityService!.create(DYNAMICLIST_MODULE_UID, {
        data: {
          ...createDynamicListRequest,
        },
      })
      .catch(() => Promise.reject(new Error("dynamiclist cannot be created.")));

    return Promise.resolve(createdDynamicList);
  },
  async findOneByName(name: string, locale: string) {
    const defaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );

    if (locale === defaultLocale) {
      const existingDynamicList = await pbEntityService.findMany(
        DYNAMICLIST_MODULE_UID,
        {
          fields: ["*"],
          filters: {
            name: name,
          },
          locale: defaultLocale,
          populate: "pb-deep",
        }
      );

      if (existingDynamicList) {
        return existingDynamicList && existingDynamicList[0]
          ? existingDynamicList[0]
          : undefined;
      }
    } else {
      // get the default locale to get the localizations, then get the localized entity
      let existingDynamicListDefaultLocale: any =
        await pbEntityService.findMany(DYNAMICLIST_MODULE_UID, {
          fields: ["*"],
          filters: {
            name: name,
          },
          locale: defaultLocale,
          populate: "pb-deep",
        });

      // get the localized object with the id
      const existingLocalizedDynamicList = await findLocalizedEntity(
        DYNAMICLIST_MODULE_UID,
        existingDynamicListDefaultLocale[0].id,
        locale
      );

      if (existingLocalizedDynamicList) {
        return existingLocalizedDynamicList && existingLocalizedDynamicList
          ? existingLocalizedDynamicList
          : undefined;
      } else {
        // if localized entity does not exist -> create a temporary one and return it
        if (existingDynamicListDefaultLocale) {
          let newTempDynamicList = createTemporaryLocalizedEntry(
            existingDynamicListDefaultLocale[0],
            locale
          );
          strapi.log.debug(
            `returning new temp dynamicList for locale ${locale} and name ${newTempDynamicList.name}`
          );
          return newTempDynamicList;
        }
      }
    }
    return null;
  },
  async updateDynamicList(id: number, data: any) {
    let _locale = data.locale;
    const defaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );
    if (!_locale) {
      _locale = defaultLocale;
    }

    if (_locale === defaultLocale) {
      const existingDynamicList = await pbEntityService.findOne(
        DYNAMICLIST_MODULE_UID,
        id,
        {
          fields: ["*"],
          filters: {},
          sort: {},
          populate: "pb-deep",
        }
      );

      if (existingDynamicList) {
        let entity = null;
        entity = await pbEntityService.updateAndReturnPopulated(
          DYNAMICLIST_MODULE_UID,
          id,
          {
            data: {
              ...data,
            },
          }
        );
        if (entity) {
          return entity;
        }
      }
    } else {
      strapi.log.debug(
        `updating dynamic list (footer) for another locale (${_locale})`
      );

      // the name is unique so you can also search by name and default locale
      const existingDynamicListDefaultLocale =
        await pbEntityService.findOneByQuery(DYNAMICLIST_MODULE_UID, {
          fields: ["*"],
          filters: {
            name: data.name,
          },
          locale: defaultLocale,
          sort: {},
          populate: "pb-deep",
        });

      const localizedDynamicList = await findLocalizedEntity(
        DYNAMICLIST_MODULE_UID,
        existingDynamicListDefaultLocale.id,
        _locale
      );

      if (localizedDynamicList) {

        let updatedLocalizedEntity =
          await pbEntityService.updateAndReturnPopulated(
            DYNAMICLIST_MODULE_UID,
            localizedDynamicList.id,
            {
              data: {
                ...data,
              },
            }
          );

        if (updatedLocalizedEntity) {
          return updatedLocalizedEntity;
        }
      } else {
        // localized dynamiclist does not exist
        // create new localized entry
        let newLocalizedDynamicList: any = null;
        const incomingId = data.id;
        delete data.id;
        delete data.localizations;

        // remove ids from dynamiclist listitems (strapi listitem)
        for (let i = 0; i < data.content.length; i++) {
          delete data.content[i].id;
        }

        newLocalizedDynamicList =
          await pbEntityService.createAndReturnPopulated(
            DYNAMICLIST_MODULE_UID,
            {
              data: {
                ...data,
              },
            }
          );

        if (newLocalizedDynamicList) {
          const synchronizeDynamicLists = await synchronizeLocalizations(
            existingDynamicListDefaultLocale,
            { locale: _locale, id: newLocalizedDynamicList.id },
            DYNAMICLIST_MODULE_UID
          );

          if (!synchronizeDynamicLists) {
            strapi.log.debug(
              `dynamicList created for ${_locale} but localizations array could not be synced`
            );
            return Promise.reject("errorCreatingLocalizedDynamicList");
          }

          strapi.log.debug("sanitize and return newLocalizedDynamicList");
          return newLocalizedDynamicList;
        }
      }
    }
  },
  async createDynamicListJson() {
    const availableStrapiLocales = await strapi
      .service("plugin::pabu.pblocalization")
      .availableLocales();

    setTimeout(async () => {
      const defaultLocale = await i18nDefaultLocale(
        process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
      );
      const existingDefaultLocaleDynamicLists = (await pbEntityService.findMany(
        DYNAMICLIST_MODULE_UID,
        {
          fields: ["*"],
          filters: {},
          locale: defaultLocale,
          sort: {},
          populate: "pb-deep",
        }
      )) as Array<any>;

      for (let i = 0; i < availableStrapiLocales.length; i++) {
        let existingLocalizedDynamicLists = (await pbEntityService.findMany(
          DYNAMICLIST_MODULE_UID,
          {
            fields: ["*"],
            filters: {},
            locale: availableStrapiLocales[i].code,
            sort: {},
            populate: "pb-deep",
          }
        )) as Array<any>;

        // if it is not the default locale check if all other locales are fully localized
        // if not add the default language content to the localized json files
        if (availableStrapiLocales[i].code !== defaultLocale) {
          if (
            existingDefaultLocaleDynamicLists &&
            existingLocalizedDynamicLists &&
            existingDefaultLocaleDynamicLists.length !==
              existingLocalizedDynamicLists.length
          ) {
            let missingLocalizedDynamicLists: Array<any> = [];
            // if the localized dynamicLists find does not match the length of the
            // default locale something is missing in the localized one
            // prettier-ignore
            for (let j = 0;j < existingDefaultLocaleDynamicLists.length;j++) {
                  let existsLocalized = false;
                  for (let k = 0; k < existingLocalizedDynamicLists.length; k++) {
                    if (
                      existingDefaultLocaleDynamicLists[j].name ===
                      existingLocalizedDynamicLists[k].name
                    ) {
                      existsLocalized = true;
                    }
                  }
                  if (!existsLocalized) {
                    missingLocalizedDynamicLists.push(
                      existingDefaultLocaleDynamicLists[j]
                    );
                  }
                }

            // merge all missing dynamicLists into the localized json file
            existingLocalizedDynamicLists = [
              ...existingLocalizedDynamicLists,
              ...missingLocalizedDynamicLists,
            ];
          }
        }

        const sanitizedDynamicLists = existingLocalizedDynamicLists;

        // Note: previously createOrUpdateFile:
        await strapi
          .service("plugin::pabu.pbsystem")
          .createSystemStrapiFile(
            JSON.stringify(sanitizedDynamicLists),
            `${availableStrapiLocales[i].code}_content-dynamiclists`,
            "json",
            "application/json",
            null,
            "uploads",
            null
          );
      }
    }, 1000);
  },
});

/**
 * Validates a request to create a page.
 * @param createDynamicListRequest - The request object containing information to create a page.
 * @returns A promise that resolves if the validation is successful, or rejects with an error.
 */
const validateCreateDynamicList = async (
  createDynamicListRequest: CreateDynamicListRequest
) => {
  if (!createDynamicListRequest.name) {
    return Promise.reject(new Error("DYNAMICLIST_NAME_EMPTY"));
  }
  const nameExists = await strapi.db.query(DYNAMICLIST_MODULE_UID).findOne({
    where: {
      name: createDynamicListRequest.name,
    },
  });
  if (nameExists) {
    return Promise.reject(new Error("DYNAMICLIST_NAME_ALREADY_EXISTS"));
  }
  return Promise.resolve();
};
