import { Strapi } from "@strapi/strapi";
import { NAVIGATION_MODULE_UID, PAGE_MODULE_UID } from "../constants";
import {
  createTemporaryLocalizedEntry,
  findLocalizedEntity,
  i18nDefaultLocale,
  i18nLocaleExists,
} from "../utils/localization";
import { synchronizeLocalizations } from "./../utils/localization";
import pbEntityService from "./pbEntityService";

export default ({ strapi }: { strapi: Strapi }) => ({
  async cmsListNavigations(locale: string) {
    const strapiLocaleExists = await i18nLocaleExists(locale);
    const strapiDefaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );
    if (!strapiLocaleExists) {
      locale = strapiDefaultLocale;
    }

    strapi.log.debug(`cms searching for navigations with locale ${locale}`);

    const existingNavigations: any = await pbEntityService.findMany(
      NAVIGATION_MODULE_UID,
      {
        fields: ["*"],
        filters: {},
        locale: locale,
        sort: {},
        populate: "pb-deep",
      }
    );

    if (existingNavigations) {
      existingNavigations.forEach((navigation) => {
        if (navigation && navigation.pages) {
          deleteAdditionalInformations(navigation.pages);
        }
      });
      return existingNavigations;
    }
    strapi.log.debug(
      `no navigations found existingNavigations=${existingNavigations}`
    );
    return [];
  },
  async cmsFindById(id, locale) {
    const incomingLocale = locale;
    const strapiLocaleExists = await i18nLocaleExists(locale);
    const strapiDefaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );
    if (!strapiLocaleExists) {
      locale = strapiDefaultLocale;
    }

    strapi.log.debug(
      "searching for navigation with id " + id + " and locale " + locale
    );

    if (locale === strapiDefaultLocale) {
      const existingNavigation: any = await pbEntityService.findOne(
        NAVIGATION_MODULE_UID,
        id,
        {
          fields: ["*"],
          filters: {},
          locale: strapiDefaultLocale,
          sort: {},
          populate: "pb-deep",
        }
      );

      if (existingNavigation) {
        if (existingNavigation && existingNavigation.pages) {
          deleteAdditionalInformations(existingNavigation.pages);
        }
        strapi.log.debug(
          `returning existing default locale navigation for locale ${locale} with name ${existingNavigation.name}`
        );
        return existingNavigation;
      }
    } else {
      // get the default locale to get the localizations, then get the localized entity
      let existingNavigationDefaultLocale: any = await pbEntityService.findOne(
        NAVIGATION_MODULE_UID,
        id,
        {
          fields: ["*"],
          filters: {},
          locale: await i18nDefaultLocale(
            process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
          ),
          sort: {},
          populate: "pb-deep",
        }
      );

      // get the localized object with the id
      const existingLocalizedNavigation: any = await findLocalizedEntity(
        NAVIGATION_MODULE_UID,
        id,
        locale
      );

      if (existingLocalizedNavigation) {
        if (existingLocalizedNavigation && existingLocalizedNavigation.pages) {
          deleteAdditionalInformations(existingLocalizedNavigation.pages);
        }
        strapi.log.debug(
          `returning existing navigation for locale ${locale} with name ${existingLocalizedNavigation.name}`
        );
        return existingLocalizedNavigation;
      } else {
        // if localized entity does not exist -> create a temporary one and return it

        if (existingNavigationDefaultLocale) {
          if (
            existingNavigationDefaultLocale &&
            existingNavigationDefaultLocale.pages
          ) {
            deleteAdditionalInformations(existingNavigationDefaultLocale.pages);
          }

          let newTempNavigation = await createTemporaryLocalizedEntry(
            existingNavigationDefaultLocale,
            locale
          );

          strapi.log.debug(
            `returning new temp navigation for locale ${locale} and name ${newTempNavigation.name}`
          );
          return newTempNavigation;
        }
      }
    }
    return null;
  },

  async cmsCreateNavigation(data: any) {
    let locale = data.locale;
    const strapiLocaleExists = await i18nLocaleExists(locale);
    const strapiDefaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );

    if (!strapiLocaleExists || locale !== strapiDefaultLocale) {
      return Promise.reject();
    }

    const existingNavigation = await pbEntityService.findOneByQuery(
      NAVIGATION_MODULE_UID,
      {
        fields: ["*"],
        filters: {
          name: data.name,
        },
        sort: {},
        populate: "pb-deep",
      }
    );

    if (existingNavigation) {
      return Promise.reject();
    }

    if (data) {
      data.pages.forEach((layer1Element) => {
        delete layer1Element.__editing;
        layer1Element.subPages?.forEach((layer2Element) => {
          delete layer2Element.__editing;
          layer2Element.subPages?.forEach((layer3Element) => {
            delete layer3Element.__editing;
          });
        });
      });
    }

    if (data.logo && data.logo.img) {
      data.logo = data.logo.img;
    }

    if (data.pages) {
      const sanitizedPages = await sanitizePages(data.pages);

      data.pages = sanitizedPages;
    }

    let entity: any = null;
    try {
      // create and update navigation
      entity = await pbEntityService.createAndReturnPopulated(
        NAVIGATION_MODULE_UID,
        {
          data: {
            ...data,
          },
        }
      );
    } catch (error) {
      strapi.log.error("could not update navigation");
      strapi.log.error(error);
      return Promise.reject();
    }

    if (entity && entity.pages) {
      deleteAdditionalInformations(entity.pages);
    }
    return entity;
  },

  async cmsUpdateNavigation(id: number, data: any) {
    strapi.log.debug("navigation update! " + id);
    let locale = data.locale;
    const strapiLocaleExists = await i18nLocaleExists(locale);
    const strapiDefaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );

    if (!strapiLocaleExists) {
      locale = strapiDefaultLocale;
    }

    if (data) {
      data.pages.forEach((layer1Element) => {
        delete layer1Element.__editing;
        layer1Element.subPages?.forEach((layer2Element) => {
          delete layer2Element.__editing;
          layer2Element.subPages?.forEach((layer3Element) => {
            delete layer3Element.__editing;
          });
        });
      });
    }

    if (data.logo && data.logo.img) {
      data.logo = data.logo.img;
    }

    if (data.logoUrl) {
      if (data.logoUrl.charAt(0) !== "/") {
        data.logoUrl = "/" + data.logoUrl;
      }
    }

    if (data.pages) {
      const sanitizedPages = await sanitizePages(data.pages);

      data.pages = sanitizedPages;
    }

    if (locale === strapiDefaultLocale) {
      const navigationNameExists: any = await pbEntityService.findOneByQuery(
        NAVIGATION_MODULE_UID,
        {
          fields: ["*"],
          filters: {
            name: data.name,
          },
          sort: {},
          populate: "pb-deep",
        }
      );

      const existingNavigation: any = await pbEntityService.findOne(
        NAVIGATION_MODULE_UID,
        id,
        {
          fields: ["*"],
          filters: {},
          locale: locale,
          sort: {},
          populate: "pb-deep",
        }
      );

      if (
        existingNavigation &&
        checkIfNavigationNameAlreadyExists(
          navigationNameExists,
          existingNavigation.id
        )
      ) {
        return Promise.reject();
      }

      if (existingNavigation) {
        let entity: any = null;
        try {
          // create and update navigation
          entity = await pbEntityService.updateAndReturnPopulated(
            NAVIGATION_MODULE_UID,
            id,
            {
              data: {
                ...data,
              },
            }
          );
        } catch (error) {
          strapi.log.error("could not update navigation");
          strapi.log.error(error);
          return Promise.reject();
        }

        if (entity && entity.pages) {
          deleteAdditionalInformations(entity.pages);
        }

        return entity;
      }
    } else {
      const existingNavigationDefaultLocale =
        await pbEntityService.findOneByQuery(NAVIGATION_MODULE_UID, {
          fields: ["*"],
          filters: {
            name: data.name,
          },
          sort: {},
          populate: "pb-deep",
        });

      // find the localized object by a default locale value
      const localizedNavigation: any = await findLocalizedEntity(
        NAVIGATION_MODULE_UID,
        existingNavigationDefaultLocale.id,
        locale
      );

      strapi.log.debug("navigation update for locale: " + locale);
      if (localizedNavigation) {
        // localized navigation does exist
        let entity: any = null;
        try {
          entity = await pbEntityService.updateAndReturnPopulated(
            NAVIGATION_MODULE_UID,
            id,
            {
              data: {
                ...data,
              },
            }
          );
        } catch (error) {
          strapi.log.error("could not update navigation");
          strapi.log.error(error);
        }

        if (entity && entity.pages) {
          deleteAdditionalInformations(entity.pages);
        }

        return entity;
      } else {
        let newLocalizedNavigation: any = null;
        try {
          // create a new navigation
          delete data.id;
          delete data.localizations;

          // strapi v4 delete page relation ids
          for (let i = 0; i < data.pages.length; i++) {
            if (data.pages[i].__component === "pb.nvtm") {
              delete data.pages[i].id;
            }
          }

          newLocalizedNavigation =
            await pbEntityService.createAndReturnPopulated(
              NAVIGATION_MODULE_UID,
              {
                data: {
                  ...data,
                },
              }
            );

          // sync locales
          const synchronizeNavigations = synchronizeLocalizations(
            existingNavigationDefaultLocale,
            { locale: locale, id: newLocalizedNavigation.id },
            NAVIGATION_MODULE_UID
          );

          if (!synchronizeNavigations) {
            strapi.log.debug(
              `navigation created for ${locale} but localizations array could not be synced`
            );

            return Promise.reject();
          }
        } catch (error) {
          strapi.log.error("could not update navigation");
          strapi.log.error(error);
          return Promise.reject();
        }

        if (newLocalizedNavigation && newLocalizedNavigation.pages) {
          deleteAdditionalInformations(newLocalizedNavigation.pages);
        }

        return newLocalizedNavigation;
      }
    }

    return Promise.reject();
  },

  async cmsDeleteNavigation(id: number, locale: string) {
    strapi.log.debug("navigation delete! " + id);

    if (!id) {
      return Promise.reject(new Error("parameter missing"));
    }

    const navigation: any = await pbEntityService.findOne(
      NAVIGATION_MODULE_UID,
      id,
      {
        populate: "pb-deep",
      }
    );
    if (!navigation) {
      return Promise.reject(new Error("navigation not found"));
    }

    const strapiDefaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );

    if (navigation.locale === strapiDefaultLocale) {
      for (const localeNavigation of navigation.localizations) {
        await pbEntityService.delete(
          NAVIGATION_MODULE_UID,
          localeNavigation.id
        );
      }
    }
    return await pbEntityService.delete(NAVIGATION_MODULE_UID, navigation.id);
  },
  async createNavigationJson() {
    // create static navigations json file
    // defer this call 1 second because on navigation update controller call
    // the lifecycle function gets triggered before the image is attached to
    // the DB entry. After waiting a bit the image relation is set.
    const availableStrapiLocales = await strapi
      .plugin("pabu")
      .service("pblocalization")
      .availableLocales();

    setTimeout(async () => {
      let existingDefaultLocaleNavigations: any =
        await pbEntityService.findMany(NAVIGATION_MODULE_UID, {
          fields: ["*"],
          filters: {},
          locale: await i18nDefaultLocale(
            process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
          ),
          sort: {},
          populate: "pb-deep",
        });

      strapi.log.debug(
        "existingDefaultLocaleNavigations",
        existingDefaultLocaleNavigations
      );

      // only work with public navigations
      existingDefaultLocaleNavigations =
        existingDefaultLocaleNavigations.filter(
          (element) => !element.isPrivate
        );

      for (let i = 0; i < availableStrapiLocales.length; i++) {
        let existingLocalizedNavigations: any = await pbEntityService.findMany(
          NAVIGATION_MODULE_UID,
          {
            fields: ["*"],
            filters: {},
            locale: availableStrapiLocales[i].code,
            sort: {},
            populate: "pb-deep",
          }
        );

        // only work with public navigations
        existingLocalizedNavigations = existingLocalizedNavigations.filter(
          (element) => !element.isPrivate
        );

        // if it is not the default locale check if all other locales are fully localized
        // if not add the default language content to the localized json files
        if (
          availableStrapiLocales[i].code !==
          (await i18nDefaultLocale(
            process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
          ))
        ) {
          if (
            existingDefaultLocaleNavigations &&
            existingLocalizedNavigations &&
            existingDefaultLocaleNavigations.length !==
              existingLocalizedNavigations.length
          ) {
            let missingLocalizedNavigations: any[] = [];
            // if the localized navigations find does not match the length of the
            // default locale something is missing in the localized one
            // prettier-ignore
            for (let j = 0;j < existingDefaultLocaleNavigations.length;j++) {
              let existsLocalized = false;
              for (let k = 0; k < existingLocalizedNavigations.length; k++) {
                if (
                  existingDefaultLocaleNavigations[j].name ===
                  existingLocalizedNavigations[k].name
                ) {
                  existsLocalized = true;
                }
              }
              if (!existsLocalized) {
                missingLocalizedNavigations.push(
                  existingDefaultLocaleNavigations[j]
                );
              }
            }

            // merge all missing navigations into the localized json file
            existingLocalizedNavigations = [
              ...existingLocalizedNavigations,
              ...missingLocalizedNavigations,
            ];
          }
        }

        // removing content object to reduce file size
        existingLocalizedNavigations.forEach((navigation) => {
          navigation.pages = filterPublishedOrExternalPages(navigation.pages);
          sanitizeNavigations(navigation.pages);
        });

        // Note: previously createOrUpdateFile:
        await strapi
          .service("plugin::pabu.pbsystem")
          .createSystemStrapiFile(
            JSON.stringify(existingLocalizedNavigations),
            `${availableStrapiLocales[i].code}_content-navigations`,
            "json",
            "application/json",
            null,
            "uploads",
            null
          );
      }
    }, 1000);
  },
  async checkNavigations(pageId: number, changedPage: any) {
    let checkedNavigations = false;
    const allNavigations: any = await pbEntityService.findMany(
      NAVIGATION_MODULE_UID,
      {
        fields: ["*"],
        filters: {},
        locale:
          changedPage &&
          changedPage.locale &&
          changedPage.locale !==
            (await i18nDefaultLocale(
              process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
            ))
            ? changedPage.locale
            : "all",
        sort: {},
        populate: "pb-deep",
      }
    );

    const changedPageId = "" + pageId;
    if (allNavigations) {
      for (let i = 0; i < allNavigations.length; i++) {
        const navigation = allNavigations[i];
        const pagesToDelete: string[] = [];
        let pageIsAffected = false;
        let pageRelationIsAffected = false;
        for (let j = 0; j < navigation.pages.length; j++) {
          const page = navigation.pages[j];
          // pages on the first level should be updated by strapi.

          if (changedPageId === page.pageId && !changedPage) {
            // This page was deleted!
            pageIsAffected = true;
            pagesToDelete.push(changedPageId);
            // skip level-2 & level-3 - parent will get deleted.
            continue;
          }

          if (parseInt(page.pageId) === parseInt(changedPageId)) {
            pageIsAffected = true;
            pageRelationIsAffected = true;
          }

          if (page.subPages && page.subPages.length > 0) {
            const subPagesToDelete: string[] = [];
            for (let k = 0; k < page.subPages.length; k++) {
              const subPage = page.subPages[k];
              if (subPage.pageId === changedPageId && changedPage) {
                // updating the published state in the subPage
                const page: any = await pbEntityService.findOne(
                  PAGE_MODULE_UID,
                  subPage.pageId,
                  {
                    fields: ["*"],
                    filters: {},
                    sort: {},
                    populate: "pb-deep",
                  }
                );
                subPage.page.published = page.published;

                pageIsAffected = true;
                // subPage.name, subPage.page.id, subPage.page.draftId do not change!
                subPage.page.name = changedPage.name;
                subPage.page.url = changedPage.url;
              }
              if (subPage.pageId === changedPageId && !changedPage) {
                // This page was deleted!
                subPagesToDelete.push(subPage.pageId);
                // Skipping 3rd-Level Checks
                continue;
              }

              if (subPage.subPages && subPage.subPages.length > 0) {
                const pagesOnLevel3ToDelete: string[] = [];
                for (let l = 0; l < subPage.subPages.length; l++) {
                  const pageOnLevel3 = subPage.subPages[l];
                  if (pageOnLevel3.pageId === changedPageId && changedPage) {
                    // updating the published state in the pageOnLevel3
                    const page: any = await pbEntityService.findOne(
                      PAGE_MODULE_UID,
                      pageOnLevel3.pageId,
                      {
                        fields: ["*"],
                        filters: {},
                        sort: {},
                        populate: "pb-deep",
                      }
                    );
                    pageOnLevel3.page.published = page.published;

                    pageIsAffected = true;
                    // pageOnLevel3.name, pageOnLevel3.page.id, pageOnLevel3.page.draftId do not change!
                    pageOnLevel3.page.name = changedPage.name;
                    pageOnLevel3.page.url = changedPage.url;
                  }

                  if (pageOnLevel3.pageId === changedPageId && !changedPage) {
                    // This page was deleted!
                    pagesOnLevel3ToDelete.push(pageOnLevel3.pageId);
                  }
                }
                if (pagesOnLevel3ToDelete.length > 0) {
                  pageIsAffected = true;
                  subPage.subPages = subPage.subPages.filter(
                    (level3Page) => level3Page.pageId !== changedPageId
                  );
                }
              }
            }
            if (subPagesToDelete.length > 0) {
              pageIsAffected = true;
              page.subPages = page.subPages.filter(
                (level2Page) => level2Page.pageId !== changedPageId
              );
            }
          }
        }
        if (pagesToDelete.length > 0) {
          pageIsAffected = true;
          navigation.pages = navigation.pages.filter(
            (navPage) => navPage.pageId !== changedPageId
          );
        }
        if (pageIsAffected) {
          strapi.log.debug("[checknavigations] updateAndReturnPopulated");
          const updateNavigation =
            await pbEntityService.updateAndReturnPopulated(
              NAVIGATION_MODULE_UID,
              navigation.id,
              {
                data: {
                  ...navigation,
                },
              }
            );

          // this is only needed for the first layer of the navigation because the
          // first layer is build via strapi relations
          if (pageRelationIsAffected) {
            // page is affected so recreate the navigation json
            await strapi
              .plugin("pabu")
              .service("pbnavigation")
              .createNavigationJson();
          }

          if (changedPage) {
            strapi.log.debug(
              `Updated navigation ${updateNavigation.name} after change of page ${changedPage.name}.`
            );
          } else {
            strapi.log.debug(
              `Updated navigation ${updateNavigation.name} after deletion of page ${pageId}.`
            );
          }
        }
        if (i === allNavigations.length - 1) {
          checkedNavigations = true;
        }
      }
    }
    if (!checkedNavigations && allNavigations.length === 0) {
      // No navigations exist in this nonDefault-locale.
      checkedNavigations = true;
    }

    return checkedNavigations;
  },
  async cmsFindMainNavigation(locale: string) {
    const strapiLocaleExists = await i18nLocaleExists(locale);
    const strapiDefaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );
    if (!strapiLocaleExists) {
      locale = strapiDefaultLocale;
    }

    if (locale === strapiDefaultLocale) {

      strapi.log.debug(
        `cms searching for main navigation with locale ${locale}`
      );

      const existingNavigations: any = await pbEntityService.findMany(
        NAVIGATION_MODULE_UID,
        {
          fields: ["*"],
          filters: { name: "main" },
          locale: strapiDefaultLocale,
          sort: {},
          populate: "pb-deep",
        }
      );

      if (existingNavigations) {
        existingNavigations.forEach((navigation) => {
          if (navigation && navigation.pages) {
            deleteAdditionalInformations(navigation.pages);
          }
        });
        return existingNavigations;
      }
      strapi.log.warn(
        `no main navigation found existingNavigations=${existingNavigations}`
      );
      return [];
    } else {

      // get the default locale to get the localizations, then get the localized entity
      let existingNavigationDefaultLocale: any = await pbEntityService.findMany(
        NAVIGATION_MODULE_UID,
        {
          fields: ["*"],
          filters: { name: "main" },
          locale: strapiDefaultLocale,
          sort: {},
          populate: "pb-deep",
        }
      );

      if (
        existingNavigationDefaultLocale &&
        existingNavigationDefaultLocale.length > 0
      ) {
        // get the localized object with the id
        const existingLocalizedNavigation: any = await findLocalizedEntity(
          NAVIGATION_MODULE_UID,
          existingNavigationDefaultLocale[0].id,
          locale
        );

        if (existingLocalizedNavigation) {
          if (
            existingLocalizedNavigation &&
            existingLocalizedNavigation.pages
          ) {
            deleteAdditionalInformations(existingLocalizedNavigation.pages);
          }
          strapi.log.warn(
            `returning existing main navigation for locale ${locale}`
          );
          return [existingLocalizedNavigation];
        } else {
          // if localized entity does not exist -> create a temporary one and return it

          if (existingNavigationDefaultLocale.pages) {
            deleteAdditionalInformations(existingNavigationDefaultLocale.pages);
          }

          let newTempNavigation = await createTemporaryLocalizedEntry(
            existingNavigationDefaultLocale,
            locale
          );

          strapi.log.debug(
            `returning new temp main navigation for locale ${locale}`
          );
          return newTempNavigation;
        }
      } else {
        return [];
      }
    }
  },
});
const sanitizeNavigations = (pages: any[]) => {
  pages.forEach((page) => {
    page.subPages = filterPublishedOrExternalPages(page.subPages);
    if (page.page?.content) {
      page.page.content = [];
    }
    if (page.subPages.length > 0) {
      sanitizeNavigations(page.subPages);
    }
  });
};
const filterPublishedOrExternalPages = (pages: any[]) => {
  return (
    pages?.filter(
      (page) => page.page?.published || page.externalUrl.trim().length > 0
    ) ?? []
  );
};
const sanitizePages = async (pages) => {
  const sanitizedPages: any[] = [];
  const allPages: any = await pbEntityService.findMany(PAGE_MODULE_UID, {
    fields: ["*"],
    filters: {},
    locale: "all",
    sort: {},
    populate: "pb-deep",
  });

  allPages.forEach((page) => {
    delete page.content;
    delete page.seoSettings;
  });
  const EXTERNAL_PAGE_ID = "-1";

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    // Following if-clause only triggers when updating (or there's something wrong with) data.
    // If page and pageId exist but do not match, we proceed with pageId.
    // Note: This means that updating in strapi requires changing the pageId!
    // However we can't make sure that page is always 100% correct in the CMS (frontend) so we should
    // only use pageId and let strapi set the corresponding and correct page-object.*
    if (page.pageId && page.page) {
      if (parseInt(page.pageId, 10) !== page.page) {
        page.page = null;
      }
    }

    // Created by Strapi
    if (!page.pageId && page.page) {
      const pageId = page.page.id ? page.page.id : page.page;
      // const existingPage = await strapi.services.page.findOne({id: pageId}, []);
      const existingPage = allPages.find(
        (existingPage) => existingPage.id === pageId
      );
      if (existingPage) {
        page.pageId = "" + pageId;
        if (!page.name) {
          page.name = existingPage.name;
        }
      }
    }

    // Created by CMS (*or updating)
    if (!page.page && page.pageId) {
      const pageId = parseInt(page.pageId, 10);
      if (!page.externalUrl) {
        const existingPage = allPages.find(
          (existingPage) => existingPage.id === pageId
        );
        if (existingPage) {
          page.page = existingPage;
          if (!page.name) {
            page.name = existingPage.name;
          }
        }
      } else {
        // externalUrl-Nav-Element:
        if (
          !page.externalUrl.startsWith("https://") &&
          !page.externalUrl.startsWith("http://")
        ) {
          // Enforcing https.
          // Note: If the linked site is http-only this will result in a not working link.
          // However this can be fixed by providing correct full url (with http)
          page.externalUrl = "https://" + page.externalUrl;
        }
        // Remove page and set pageId to EXTERNAL_PAGE_ID for every externalUrl-Nav-Element.
        page.page = null;
        page.pageId = EXTERNAL_PAGE_ID;
        if (!page.name) {
          // Providing externalUrl as page.name if page.name does not exist.
          page.name = page.externalUrl;
        }
      }
    }

    if (!page.subPages || page.subPages.length === 0) {
      page.subPages = [];
    } else {
      // subPages (Level 2) exist
      const sanitizedSubPages: any[] = [];
      for (let j = 0; j < page.subPages.length; j++) {
        const pagesSubPage = page.subPages[j];
        // prepare incorrect data for being revalidated.
        if (pagesSubPage.pageId && pagesSubPage.page) {
          // TBD:
          // if (parseInt(pagesSubPage.pageId, 10) !== pagesSubPage.page) {
          //   pagesSubPage.page = null;
          // }
          // TBD: We might want to just always clear pagesSubPage.page
          pagesSubPage.page = null;
        }

        if (!pagesSubPage.page && pagesSubPage.pageId) {
          const pageId = parseInt(pagesSubPage.pageId, 10);
          if (!pagesSubPage.externalUrl) {
            const existingPage = allPages.find(
              (existingPage) => existingPage.id === pageId
            );
            if (existingPage) {
              pagesSubPage.page = {
                id: existingPage.id,
                name: existingPage.name,
                url: existingPage.url,
                published: existingPage.published,
                draftId: existingPage.draftId,
              };
              if (!pagesSubPage.name) {
                pagesSubPage.name = existingPage.name;
              }
            }
          } else {
            // externalUrl-Nav-Element:
            if (
              !pagesSubPage.externalUrl.startsWith("https://") &&
              !pagesSubPage.externalUrl.startsWith("http://")
            ) {
              // Enforcing https.
              // Note: If the linked site is http-only this will result in a not working link.
              // However this can be fixed by providing correct full url (with http)
              pagesSubPage.externalUrl = "https://" + pagesSubPage.externalUrl;
            }
            // Remove page and set pageId to EXTERNAL_PAGE_ID for every externalUrl-Nav-Element.
            pagesSubPage.page = null;
            pagesSubPage.pageId = EXTERNAL_PAGE_ID;
            if (!pagesSubPage.name) {
              // Providing externalUrl as page.name if page.name does not exist.
              pagesSubPage.name = pagesSubPage.externalUrl;
            }
          }
        }

        if (!pagesSubPage.subPages || pagesSubPage.subPages.length === 0) {
          pagesSubPage.subPages = [];
        } else {
          // subPages (Level 3) exist
          const sanitizedLevel3Pages: any[] = [];
          for (let k = 0; k < pagesSubPage.subPages.length; k++) {
            const pageOnLevel3 = pagesSubPage.subPages[k]; // subSubPage
            // prepare incorrect data for being revalidated.
            if (pageOnLevel3.pageId && pageOnLevel3.page) {
              // TBD:
              // if (parseInt(pageOnLevel3.pageId, 10) !== pageOnLevel3.page) {
              //   pageOnLevel3.page = null;
              // }
              // TBD: We might want to just always clear pagesSubPage.page
              pageOnLevel3.page = null;
            }

            if (!pageOnLevel3.page && pageOnLevel3.pageId) {
              const pageId = parseInt(pageOnLevel3.pageId, 10);

              if (!pageOnLevel3.externalUrl) {
                const existingPage = allPages.find(
                  (existingPage) => existingPage.id === pageId
                );
                if (existingPage) {
                  pageOnLevel3.page = {
                    id: existingPage.id,
                    name: existingPage.name,
                    url: existingPage.url,
                    published: existingPage.published,
                    draftId: existingPage.draftId,
                  };
                  if (!pageOnLevel3.name) {
                    pageOnLevel3.name = existingPage.name;
                  }
                }
              } else {
                // externalUrl-Nav-Element:
                if (
                  !pageOnLevel3.externalUrl.startsWith("https://") &&
                  !pageOnLevel3.externalUrl.startsWith("http://")
                ) {
                  // Enforcing https.
                  // Note: If the linked site is http-only this will result in a not working link.
                  // However this can be fixed by providing correct full url (with http)
                  pageOnLevel3.externalUrl =
                    "https://" + pageOnLevel3.externalUrl;
                }
                // Remove page and set pageId to EXTERNAL_PAGE_ID for every externalUrl-Nav-Element.
                pageOnLevel3.page = null;
                pageOnLevel3.pageId = EXTERNAL_PAGE_ID;
                if (!pageOnLevel3.name) {
                  // Providing externalUrl as page.name if page.name does not exist.
                  pageOnLevel3.name = pageOnLevel3.externalUrl;
                }
              }
            }

            // Preventing nesting above level 3
            delete pageOnLevel3.subPages;

            if (!pageOnLevel3.pageId || !pageOnLevel3.page) {
              if (
                pageOnLevel3.pageId === EXTERNAL_PAGE_ID &&
                pageOnLevel3.externalUrl
              ) {
                sanitizedLevel3Pages.push(pageOnLevel3);
              } else {
                strapi.log.warn("Malicious request.");
              }
            } else {
              sanitizedLevel3Pages.push(pageOnLevel3);
            }
          }
          pagesSubPage.subPages = sanitizedLevel3Pages;
        }

        if (!pagesSubPage.pageId || !pagesSubPage.page) {
          if (
            pagesSubPage.pageId === EXTERNAL_PAGE_ID &&
            pagesSubPage.externalUrl
          ) {
            sanitizedSubPages.push(pagesSubPage);
          } else {
            strapi.log.warn("Malicious request.");
          }
        } else {
          sanitizedSubPages.push(pagesSubPage);
        }
      }
      page.subPages = sanitizedSubPages;
    }

    // Malicious Request
    if (!page.pageId || !page.page) {
      if (page.pageId === EXTERNAL_PAGE_ID && page.externalUrl) {
        sanitizedPages.push(page);
      } else {
        strapi.log.warn("Malicious request.");
      }
    } else {
      sanitizedPages.push(page);
    }
  }
  return sanitizedPages;
};

const checkIfNavigationNameAlreadyExists = (
  elements: any,
  originalId: number
) => {
  return (
    (elements && elements.length > 1) ||
    (elements && elements.length > 0 && elements[0].id !== originalId)
  );
};

const deleteAdditionalInformations = (pagesArray: Array<any>) => {
  pagesArray.forEach((navItem) => {
    if (navItem.page) {
      delete navItem.page.version;
      delete navItem.page.permission;
      delete navItem.page.locale;
      delete navItem.page.created_at;
      delete navItem.page.updated_at;
      delete navItem.page.seoSettings;
      delete navItem.page.hasNavigation;
      delete navItem.page.hasBreadcrumbs;
      delete navItem.page.isSeoTitlePageTitle;
      delete navItem.page.hasFooter;
      delete navItem.page.isPrivate;
      delete navItem.page.isPrivateDefault;
    }
  });
};
