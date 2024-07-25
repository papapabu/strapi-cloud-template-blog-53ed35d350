export default {
  afterCreate: async (event) => {
    await strapi.service("plugin::pabu.glbl").createCSS();
    await strapi.service("plugin::pabu.cstm").createHeadAndBodyScripts();
  },
  afterUpdate: async (event) => {
    await strapi.service("plugin::pabu.glbl").createCSS();
    await strapi.service("plugin::pabu.cstm").createHeadAndBodyScripts();
  },
};
