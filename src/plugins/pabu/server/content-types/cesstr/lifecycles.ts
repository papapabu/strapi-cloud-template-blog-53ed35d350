import { sleep } from "../../utils/functions";
const { ValidationError } = require("@strapi/utils").errors;

export default {
  beforeCreate: async (event) => {
    event.params.data.struuid = strapi
      .service("plugin::pabu.str")
      .generateStoreEntryUUID(event.params.data.struuid);
    event.params.data.type = strapi
      .service("plugin::pabu.str")
      .generateStoreEntryType(event.params.data);
    await sleep(250);
    event.params.data.name = await strapi
      .service("plugin::pabu.str")
      .generateStoreEntryName(event.params.data);
    strapi.log.info(`cesstr: Create ${event.params.data.name}.`);
  },

  afterCreate: async (event) => {
    // Regenerate contentelement-settings.json
    // Regeneration of glbl is not necessary. (yet)
    if (!event.params.data.skipLifecycle) {
      await strapi
        .service("plugin::pabu.settings")
        .regenerateSettingsJSONs(["cesstr"]);
    }
  },

  beforeUpdate: async (event) => {
    event.params.data.struuid = strapi
      .service("plugin::pabu.str")
      .generateStoreEntryUUID(event.params.data.struuid);
    event.params.data.type = strapi
      .service("plugin::pabu.str")
      .generateStoreEntryType(event.params.data);
    event.params.data.name = await strapi
      .service("plugin::pabu.str")
      .generateStoreEntryName(event.params.data);
    strapi.log.info(`cesstr: Update ${event.params.data.name}.`);
  },

  afterUpdate: async (event) => {
    // Regenerate contentelement-settings.json
    await strapi
      .service("plugin::pabu.settings")
      .regenerateSettingsJSONs(["glbl", "cesstr"]);
  },

  beforeDelete: async (event) => {
    await strapi
      .service("plugin::pabu.cesstr")
      .preventDeleteDefault(event.params.where.id);
  },
  beforeDeleteMany: async (event) => {
    await strapi
      .service("plugin::pabu.cesstr")
      .preventDeleteDefaults(event.params.where["$and"][0].id["$in"]);
  },

  afterDelete: async (event) => {
    strapi.log.info(
      `cesstr: Delete ${event.result.name} [id: ${event.result.id}].`
    );

    // Regenerate contentelement-settings.json
    await strapi
      .service("plugin::pabu.settings")
      .regenerateSettingsJSONs(["glbl", "cesstr"]);
  },
  afterDeleteMany: async (event) => {
    strapi.log.info(
      `cesstr: Bulk-Delete [ids: ${event.params.where["$and"][0].id["$in"].join(
        ", "
      )}].`
    );
    // Regenerate contentelement-settings.json
    await strapi
      .service("plugin::pabu.settings")
      .regenerateSettingsJSONs(["glbl", "cesstr"]);
  },
};
