export default {
  beforeCreate: async (event) => {
    event.params.data.struuid = strapi
      .service("plugin::pabu.str")
      .generateStoreEntryUUID(event.params.data.struuid);
    event.params.data.type = strapi
      .service("plugin::pabu.str")
      .generateStoreEntryType(event.params.data);
    event.params.data.name = await strapi
      .service("plugin::pabu.str")
      .generateStoreEntryName(event.params.data);
    strapi.log.info(`str: Create ${event.params.data.name}.`);
  },

  afterCreate: async (event) => {
    await strapi
      .service("plugin::pabu.str")
      .updateStoreFonts(event.params.data);
    if (!event.params.data.skipLifecycle) {
      await strapi
        .service("plugin::pabu.settings")
        .regenerateSettingsJSONs(["glbl", "cesstr"]);
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
    strapi.log.info(`str: Update ${event.params.data.name}.`);
  },

  afterUpdate: async (event) => {
    await strapi
      .service("plugin::pabu.str")
      .updateStoreFonts(event.params.data);
    await strapi
      .service("plugin::pabu.settings")
      .regenerateSettingsJSONs(["glbl", "cesstr"]);
  },
  afterDelete: async (event) => {
    strapi.log.info(
      `str: Delete ${event.result.name} [id: ${event.result.id}].`
    );
    await strapi.service("plugin::pabu.fonts").cleanFonts();

    await strapi
      .service("plugin::pabu.settings")
      .regenerateSettingsJSONs(["glbl", "cesstr"]);
  },
  afterDeleteMany: async (event) => {
    strapi.log.info(
      `str: Bulk-Delete [ids: ${event.params.where["$and"][0].id["$in"].join(
        ", "
      )}].`
    );

    await strapi.service("plugin::pabu.fonts").cleanFonts();

    await strapi
      .service("plugin::pabu.settings")
      .regenerateSettingsJSONs(["glbl", "cesstr"]);
  },
};
