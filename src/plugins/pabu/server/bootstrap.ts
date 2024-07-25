import { Strapi } from "@strapi/strapi";
import { DYNAMICLIST_MODULE_UID, PAGE_MODULE_UID } from "./constants";
import { getFullPopulateObject } from "./populateHelper";
import { performUpdate } from "./updatePabu";

export default async ({ strapi }: { strapi: Strapi }) => {
  await strapi.service("plugin::pabu.pblicense").init();
  // Performs Pabu Version updates. Can be expanded with custom update steps.
  await performUpdate();
  strapi.db!.lifecycles.subscribe({
    models: ["plugin::upload.file"],

    async afterCreate(event: any) {
      strapi.log.info(
        `[plugin::pabu.pbfile] create i18n entry for media ${event.result.name}`
      );

      await strapi
        .service("plugin::pabu.pbfile")
        .mediaLibraryCreateEvent(event.result);
    },

    async afterUpdate(event: any) {
      strapi.log.info(
        `[plugin::pabu.pbfile] update i18n entry for media ${event.result.name}`
      );

      await strapi
        .service("plugin::pabu.pbfile")
        .mediaLibraryUpdateEvent(event.result);
    },

    async beforeDelete(event) {
      strapi.log.info(
        `[plugin::pabu.pbfile] delete i18n ${event.params.where.id}`
      );
      await strapi
        .service("plugin::pabu.pbfile")
        .mediaLibraryDeleteEvent(event.params.where.id);
    },

    async beforeDeleteMany(event) {
      strapi.log.info(
        `[plugin::pabu.pbfile] delete i18n ${event.params.where.id}`
      );
      await strapi
        .service("plugin::pabu.pbfile")
        .mediaLibraryDeleteEvent(event.params.where.id);
    },
  });

  // modified version of https://github.com/Barelydead/strapi-plugin-populate-deep
  strapi.db!.lifecycles.subscribe((event) => {
    if (event.action === "beforeFindMany" || event.action === "beforeFindOne") {
      const populate = event.params?.populate;

      if (populate && populate[0] === "pb-deep") {
        const depth = populate[1] ?? 5;
        const modelObject: any = getFullPopulateObject(event.model.uid, depth);
        event.params.populate = modelObject.populate;
      }
    }
  });

  strapi.db!.lifecycles.subscribe(async (event) => {
    if (event.action === "afterFindMany" || event.action === "afterFindOne") {
      // add more APIs/UIDs here if needed
      if (
        event.model.uid === PAGE_MODULE_UID ||
        event.model.uid === DYNAMICLIST_MODULE_UID
      ) {
        if (event["result"]) {
          await strapi
            .service("plugin::pabu.pbfile")
            .addLocalizationsToMediaObjects(event["result"]);
        }
      }
    }
  });

  await strapi.service("plugin::pabu.settings").createNecessaryFolders();

  // Generate default entries for store, contentElementSettings and global.
  await strapi.service("plugin::pabu.defaults").generateDefaultEntries();

  await strapi.service("plugin::pabu.pbpage").init();

  await strapi.service("plugin::pabu.pbsearch").init();

  await strapi.service("plugin::pabu.pbemail").init();

  await strapi.service("plugin::pabu.pbfile").initMediaManagerRootFolder();

  // Enabling Strapi Cloud Support or working with upload-media-providers
  await strapi.service("plugin::pabu.pbsystem").generateTemporarySystemFiles();
};
