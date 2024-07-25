import { Strapi } from "@strapi/strapi";
import {
  CMS_ROOT_PAGE_NAME,
  CMS_ROOT_PAGE_URL,
  PAGE_MODULE_UID,
} from "../constants";
import {
  CreatePageRequest,
  SetDefaultPageRequest,
  UpdatePageRequest,
  UpdatePageSettingsRequest,
} from "../types/pbpage";
import {
  availableContentElements,
  isUrlUnique,
  isValueUnique,
  randomString,
  removeSpecialCharacters,
  slugifyWithSlashes,
} from "../utils/functions";
import {
  clonePageContentForLocale,
  findLocalizedEntity,
  i18nDefaultLocale,
  i18nLocaleExists,
  synchronizeLocalizations,
} from "../utils/localization";
import pbEntityService from "./pbEntityService";

export default ({ strapi }: { strapi: Strapi }) => ({
  async findPages(locale: string) {
    if (!(await i18nLocaleExists(locale))) {
      locale = await i18nDefaultLocale(
        process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
      );
    }
    return await pbEntityService.findMany(PAGE_MODULE_UID, {
      fields: ["*"],
      filters: {
        isDraft: false,
      },
      locale: locale,
      sort: {},
      populate: "pb-deep",
    });
  },
  async findPageByUrl(url: string, locale: string) {
    const urlWithSlashes = replaceCommasWithSlashesInUrl(url);
    const pages = await pbEntityService.findMany(PAGE_MODULE_UID, {
      fields: ["*"],
      filters: {
        url: urlWithSlashes,
        isDraft: false,
        published: true,
      },
      locale: locale,
      populate: "pb-deep",
    });
    return pages && pages[0] ? pages[0] : undefined;
  },
  async findCmsPageByUrl(url: string, locale: string) {
    const incomingLocale = locale;
    const strapiLocaleExists = await i18nLocaleExists(locale);
    const strapiDefaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );
    if (!strapiLocaleExists) {
      locale = strapiDefaultLocale;
    }
    const urlWithSlashes = replaceCommasWithSlashesInUrl(url);
    let pages = await pbEntityService.findMany(PAGE_MODULE_UID, {
      fields: ["*"],
      filters: {
        url: urlWithSlashes,
        isDraft: false,
      },
      locale: locale,
      populate: "pb-deep",
    });

    if (pages && !pages[0]) {
      locale = strapiDefaultLocale;
      pages = await pbEntityService.findMany(PAGE_MODULE_UID, {
        fields: ["*"],
        filters: {
          url: urlWithSlashes,
          isDraft: false,
        },
        locale: strapiDefaultLocale,
        populate: "pb-deep",
      });
    }

    if (pages && pages[0] && incomingLocale !== locale) {
      pages[0].isFallback = true;
      pages[0].strapiLocaleExists = strapiLocaleExists;
    }

    return pages && pages[0] ? pages[0] : undefined;
  },
  async createPage(createPageRequest: CreatePageRequest, userId: number) {
    await validateCreatePage(createPageRequest).catch((err) =>
      Promise.reject(err)
    );

    let slug = slugifyWithSlashes(
      removeSpecialCharacters(createPageRequest.name.toLowerCase())
    );

    if (!(await isUrlUnique(slug))) {
      slug = slug + "-" + randomString();
    }

    const createdPage = await strapi
      .entityService!.create(PAGE_MODULE_UID, {
        data: {
          ...createPageRequest,
          url: slug,
          isDraft: false,
          created_by_id: userId,
        },
      })
      .catch(() => Promise.reject(new Error("page cannot be created.")));

    const createdDraftPage = await this.createDraftPage(
      parseInt(createdPage.id.toString()),
      userId
    );
    return Promise.resolve({
      page: createdPage,
      draftPage: createdDraftPage,
    });
  },
  async createDraftPage(pageId: number, userId: number | null) {
    const page = await pbEntityService.findOne(PAGE_MODULE_UID, pageId, {
      fields: ["*"],
      populate: "pb-deep",
    });

    if (!page) {
      return Promise.reject(new Error("could not find page with id " + pageId));
    }

    const draftCopy = JSON.parse(JSON.stringify(page));
    const pageCopy = JSON.parse(JSON.stringify(page));

    delete draftCopy.refId;
    delete draftCopy.id;
    draftCopy.pageId = page.id;
    draftCopy.published = false;
    draftCopy.isDraft = true;

    draftCopy.content.map((_, index) => {
      delete draftCopy.content[index].id;
    });

    delete pageCopy.pageId;

    const draftPage = await strapi
      .entityService!.create(PAGE_MODULE_UID, {
        data: {
          ...draftCopy,
          refId: page.id,
          created_by_id: userId,
        },
      })
      .catch(() => Promise.reject(new Error("draft page cannot be created")));
    pageCopy.refId = draftPage.id;
    await strapi
      .entityService!.update(PAGE_MODULE_UID, page.id, {
        data: {
          ...pageCopy,
        },
      })
      .catch(() => Promise.reject(new Error("refId could not be updated")));

    return Promise.resolve(draftPage);
  },
  async cmsDraftPageById(draftPageId: number, locale: string) {
    const draftPage: any = await pbEntityService.findOne(
      PAGE_MODULE_UID,
      draftPageId,
      {
        fields: ["*"],
        populate: "pb-deep",
      }
    );

    if (draftPage.locale !== locale) {
      strapi.log.debug("draftPage.locale !== locale", draftPage.locale);
      const localizedDraftPage = draftPage.localizations.find(
        (page) => page.locale === locale
      );
      if (localizedDraftPage) {
        strapi.log.debug(
          "found localized page! return cmsDraftPageById with new id",
          localizedDraftPage.id
        );
        return this.cmsDraftPageById(localizedDraftPage.id, locale);
      }
      strapi.log.debug(
        "no localization found ... create a temp page and return"
      );
      draftPage.content = await clonePageContentForLocale(
        draftPage,
        locale,
        true
      );
    }

    const contentElements = availableContentElements();

    if (draftPage.content.length > 0) {
      draftPage.content = draftPage.content.map((contentElement: any) => ({
        ...contentElement,
        ...contentElements.find(
          (element) => element.uid === contentElement.__component
        ),
      }));
    }

    return {
      draftPage: draftPage,
      availableElements: contentElements,
    };
  },
  async togglePublishState(id: number, userId: number) {
    const page: any = await pbEntityService.findOne(PAGE_MODULE_UID, id, {
      populate: "pb-deep",
    });

    if (!page.isDraft) {
      return await pbEntityService.update(PAGE_MODULE_UID, page.id, {
        data: {
          ...page,
          published: !page.published,
          updated_by_id: userId,
        },
      });
    }

    let publishedPage: any = await pbEntityService.findOne(
      PAGE_MODULE_UID,
      page.refId.toString(),
      {
        populate: "pb-deep",
      }
    );

    if (publishedPage.locale !== page.locale) {
      const localizedPage = publishedPage.localizations.find(
        (localizedPublishedPage) =>
          localizedPublishedPage.locale === page.locale
      );

      if (!localizedPage) {
        return Promise.reject(new Error("localized page not found"));
      }
      publishedPage = await pbEntityService.findOne(
        PAGE_MODULE_UID,
        localizedPage.id,
        {
          populate: "pb-deep",
        }
      );
    }

    removeIdsFromContentElements(page);

    return await pbEntityService.update(PAGE_MODULE_UID, publishedPage.id, {
      data: {
        ...publishedPage,
        content: page.content,
        published: true,
        updated_by_id: userId,
      },
    });
  },
  async updatePageDetails(updatePageRequest: UpdatePageSettingsRequest) {
    const page: any = await pbEntityService.findOne(
      PAGE_MODULE_UID,
      updatePageRequest.refId,
      {}
    );
    let draftPage: any = await pbEntityService.findOne(
      PAGE_MODULE_UID,
      page.refId,
      {}
    );
    if (!page || !draftPage) {
      return undefined;
    }

    if (page.url !== updatePageRequest.url) {
      let slug = slugifyWithSlashes(
        removeSpecialCharacters(updatePageRequest.url.toLowerCase())
      );
      if (!(await isUrlUnique(slug))) {
        slug = slug + "-" + randomString();
      }
      updatePageRequest.url = slug;
    }

    delete updatePageRequest["content"];
    /* @ts-ignore */
    delete updatePageRequest["id"];
    /* @ts-ignore */
    delete updatePageRequest["refId"];
    /* @ts-ignore */
    delete updatePageRequest["isDraft"];
    /* @ts-ignore */
    delete updatePageRequest["published"];

    const updatedPage = await pbEntityService.updateAndReturnPopulated(
      PAGE_MODULE_UID,
      page.id,
      {
        data: {
          ...updatePageRequest,
          published: page.published,
          id: page.id,
        },
      }
    );

    await pbEntityService.updateAndReturnPopulated(
      PAGE_MODULE_UID,
      draftPage.id,
      {
        data: {
          ...updatePageRequest,
          published: false,
          id: draftPage.id,
        },
      }
    );

    return updatedPage;
  },
  async deletePage(id: number) {
    if (!id) {
      return Promise.reject(new Error("parameter missing"));
    }
    const page: any = await pbEntityService.findOne(PAGE_MODULE_UID, id, {
      populate: "pb-deep",
    });
    if (!page) {
      return Promise.reject(new Error("page not found"));
    }

    const strapiDefaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );

    if (page.locale === strapiDefaultLocale) {
      for (const localePage of page.localizations) {
        await pbEntityService.delete(PAGE_MODULE_UID, localePage.id);
      }
    }

    return await pbEntityService.delete(PAGE_MODULE_UID, page.id);
  },
  async cmsSaveDraftPage(
    id: number,
    updateDraftPage: UpdatePageRequest,
    locale: string,
    userId: number
  ) {
    const strapiDefaultLocale = await i18nDefaultLocale(
      process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
    );

    const originDefaultLocaleDraftPage: any = await findLocalizedEntity(
      PAGE_MODULE_UID,
      id,
      strapiDefaultLocale
    );

    if (!originDefaultLocaleDraftPage) {
      return Promise.reject(new Error("draft page not found"));
    }

    if (originDefaultLocaleDraftPage.locale === locale) {
      removeIdsFromContentElements(updateDraftPage);
      originDefaultLocaleDraftPage.content = updateDraftPage.content;
      return await pbEntityService.update(
        PAGE_MODULE_UID,
        originDefaultLocaleDraftPage.id,
        {
          data: {
            ...updateDraftPage,
            updated_by_id: userId,
          },
        }
      );
    }

    const existingLocalizedDraftPage = await findLocalizedEntity(
      PAGE_MODULE_UID,
      id,
      locale
    );

    if (existingLocalizedDraftPage) {
      removeIdsFromContentElements(updateDraftPage);
      existingLocalizedDraftPage.content = updateDraftPage.content;

      updateDraftPage.id = existingLocalizedDraftPage.id as number;
      return await pbEntityService.update(
        PAGE_MODULE_UID,
        existingLocalizedDraftPage.id,
        {
          data: {
            ...updateDraftPage,
            updated_by_id: userId,
          },
        }
      );
    }

    // if the localized entity does not exist
    // create the localized entity and synchronize all localization arrays from all existing localized entities
    strapi.log.debug(
      `No localization (${locale}) exists. Create new page/draftpage`
    );

    delete originDefaultLocaleDraftPage.content;

    const newLocalizedPageData = {
      ...originDefaultLocaleDraftPage,
      ...updateDraftPage,
      published: false,
      refId: null,
      isDraft: false,
      locale: locale,
    };
    delete newLocalizedPageData.id;
    delete newLocalizedPageData.localizations;
    delete newLocalizedPageData.content;
    const doesPageNameExistInLocale = !(await isValueUnique(
      PAGE_MODULE_UID,
      "name",
      newLocalizedPageData.name,
      null,
      locale
    ));
    if (doesPageNameExistInLocale) {
      newLocalizedPageData.name = `${
        newLocalizedPageData.name
      }-${randomString()}`;
    }

    const newLocalizedPage = await createLocalizedPage(
      originDefaultLocaleDraftPage.refId, // default locale page id
      { ...newLocalizedPageData, created_by_id: userId }
    );
    const newLocalizedDraftPage = await createLocalizedPage(
      originDefaultLocaleDraftPage.id, // default locale draftpage id
      {
        ...newLocalizedPageData,
        refId: originDefaultLocaleDraftPage.refId,
        isDraft: true,
        created_by_id: userId,
      }
    );

    await updateRefIdRelation(newLocalizedPage.id, newLocalizedDraftPage.id);

    removeIdsFromContentElements(updateDraftPage);
    newLocalizedDraftPage.content = updateDraftPage.content;
    updateDraftPage.id = newLocalizedDraftPage.id as number;

    return await pbEntityService.update(
      PAGE_MODULE_UID,
      newLocalizedDraftPage.id,
      {
        data: {
          ...updateDraftPage,
          updated_by_id: userId,
        },
      }
    );
  },
  async setDefaultPage(setDefaultPageRequest: SetDefaultPageRequest) {
    const page: any = await pbEntityService.findOne(
      PAGE_MODULE_UID,
      setDefaultPageRequest.id,
      {}
    );
    const oldDefaultPage: any = await strapi
      .db!.query(PAGE_MODULE_UID)
      .findOne({
        where: {
          url: CMS_ROOT_PAGE_URL,
        },
      });
    if (!page || !oldDefaultPage) {
      return Promise.reject("default page not found");
    }

    const draftPage: any = await pbEntityService.findOne(
      PAGE_MODULE_UID,
      page.refId,
      {}
    );
    const oldDefaultDraftPage: any = await pbEntityService.findOne(
      PAGE_MODULE_UID,
      oldDefaultPage.refId,
      {}
    );

    const randomUrl = randomString();

    const oldDefaultPageUpdate = await pbEntityService.updateAndReturnPopulated(
      PAGE_MODULE_UID,
      oldDefaultPage.id,
      {
        data: {
          url: randomUrl,
        },
      }
    );
    const oldDefaultDraftPageUpdate =
      await pbEntityService.updateAndReturnPopulated(
        PAGE_MODULE_UID,
        oldDefaultPage.refId,
        {
          data: {
            url: randomUrl,
          },
        }
      );
    const pageUpdate = await pbEntityService.updateAndReturnPopulated(
      PAGE_MODULE_UID,
      page.id,
      {
        data: {
          url: CMS_ROOT_PAGE_URL,
        },
      }
    );
    const draftPageUpdate = await pbEntityService.updateAndReturnPopulated(
      PAGE_MODULE_UID,
      draftPage.id,
      {
        data: {
          url: CMS_ROOT_PAGE_URL,
        },
      }
    );

    if (
      !oldDefaultPageUpdate ||
      !oldDefaultDraftPageUpdate ||
      !pageUpdate ||
      !draftPageUpdate
    ) {
      return Promise.reject("could not set new default page");
    }
    return Promise.resolve();
  },
  async init() {
    const rootPage: any = await pbEntityService.findMany(PAGE_MODULE_UID, {
      filters: {
        url: CMS_ROOT_PAGE_URL,
      },
      populate: "pb-deep",
    });
    if (!rootPage || rootPage.length === 0) {
      strapi.log.debug("[PB] create missing root page");
      const createdPage = await pbEntityService.create(PAGE_MODULE_UID, {
        data: {
          name: CMS_ROOT_PAGE_NAME,
          url: CMS_ROOT_PAGE_URL,
          isDraft: false,
          published: true,
          locale: await i18nDefaultLocale(
            process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
          ),
        },
      });
      await this.createDraftPage(parseInt(createdPage.id.toString()), null);
    }
  },
  async lifecycleAfterCreate(pageId: number) {},
  async lifecycleAfterUpdate(lifecycleEvent: any) {
    const { result } = lifecycleEvent;
    const pageId = result.id;

    const checkedNavigations = await strapi
      .plugin("pabu")
      .service("pbnavigation")
      .checkNavigations(pageId, result);

    if (checkedNavigations) {
      strapi.log.debug(
        `Checked all navigations because of change to page {id: ${pageId}}.`
      );
    } else {
      strapi.log.error(
        `Error! Could not check all navigations (possible bug?). There might be an impact from change to page {id: ${pageId}}!`
      );
    }
  },
});

const updateRefIdRelation = async (
  pageId: number,
  draftPageId: number
): Promise<void> => {
  await pbEntityService.update(PAGE_MODULE_UID, pageId, {
    data: {
      id: pageId,
      refId: draftPageId,
    },
  });
  await pbEntityService.update(PAGE_MODULE_UID, draftPageId, {
    data: {
      id: draftPageId,
      refId: pageId,
    },
  });
};

const createLocalizedPage = async (
  defaultLocalePageId: number,
  data: any
): Promise<any | null> => {
  const createdLocalizedPage = await pbEntityService.create(PAGE_MODULE_UID, {
    data,
  });

  if (!createdLocalizedPage) {
    strapi.log.error("could not create localized page...");
    return null;
  }

  const defaultLocalePage: any = await pbEntityService.findOne(
    PAGE_MODULE_UID,
    defaultLocalePageId,
    {
      populate: "pb-deep",
    }
  );

  if (!defaultLocalePage) {
    strapi.log.error(
      `could not find default locale page with id ${defaultLocalePageId}`
    );
    return null;
  }

  const syncResult = await synchronizeLocalizations(
    defaultLocalePage,
    {
      locale: data.locale,
      id: createdLocalizedPage.id as number,
    },
    PAGE_MODULE_UID
  );

  if (!syncResult) {
    strapi.log.error(
      `the page localizations array could not be synced` +
        `default locale entry=${defaultLocalePage.id}` +
        `tried to sync={locale: ${data.locale}, id:${createdLocalizedPage.id}}`
    );
  }

  const newSyncedCreatedPage: any = await pbEntityService.findOne(
    PAGE_MODULE_UID,
    createdLocalizedPage.id,
    {
      populate: "pb-deep",
    }
  );

  if (!newSyncedCreatedPage) {
    strapi.log.error(
      `could not find page after synchronizing locales (page.id=${createdLocalizedPage.id})`
    );
    return null;
  }

  return newSyncedCreatedPage;
};

/**
 * Validates a request to create a page.
 * @param createPageRequest - The request object containing information to create a page.
 * @returns A promise that resolves if the validation is successful, or rejects with an error.
 */
const validateCreatePage = async (createPageRequest: CreatePageRequest) => {
  if (!createPageRequest.name) {
    return Promise.reject(new Error("PAGE_NAME_EMPTY"));
  }
  const nameExists = await strapi.db.query(PAGE_MODULE_UID).findOne({
    where: {
      name: createPageRequest.name,
    },
  });
  if (nameExists) {
    return Promise.reject(new Error("PAGE_NAME_ALREADY_EXISTS"));
  }
  return Promise.resolve();
};

/**
 * Replaces commas with slashes in the provided URL.
 * @param url - The URL to process.
 * @returns URL with commas replaced by slashes if applicable, or the original URL if no commas are present.
 */
const replaceCommasWithSlashesInUrl = (url: string) => {
  return url.includes(",") ? url.replace(/,/g, "/") : url;
};

/**
 * Removes 'id' properties from content elements in a page and its nested content.
 * @param {object} page - The page object containing content elements.
 */
const removeIdsFromContentElements = (page: any) => {
  for (let i = 0; i < page.content.length; i++) {
    delete page.content[i].id;
    if (page.content[i].content) {
      for (let j = 0; j < page.content[i].content.length; j++) {
        delete page.content[i].content[j].id;
      }
    }
  }
};
