export default {
  beforeCreate: async (event) => {
  },
  beforeUpdate: async (event) => {
  },
  afterCreate: async (event) => {
    await strapi
      .service("plugin::pabu.settings")
      .regenerateSettingsJSONs(["glbl"]);
  },
  afterUpdate: async (event) => {
    await strapi
      .service("plugin::pabu.settings")
      .regenerateSettingsJSONs(["glbl"]);
  },
};
