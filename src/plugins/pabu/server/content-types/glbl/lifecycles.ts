export default {
  beforeCreate: async (event) => {
    // Placeholder.
  },
  beforeUpdate: async (event) => {
    // Placeholder.
  },
  afterCreate: async (event) => {
    await strapi.service("plugin::pabu.settings").regenerateSettingsJSONs(["glbl", "cesstr"]);
  },
  afterUpdate: async (event) => {
    await strapi
      .service("plugin::pabu.settings")
      .regenerateSettingsJSONs(["glbl", "cesstr"]);
  },
};
