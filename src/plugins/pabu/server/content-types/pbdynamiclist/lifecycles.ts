export default {
  async afterCreate() {
    await strapi
      .plugin("pabu")
      .service("pbdynamiclist")
      .createDynamicListJson();
  },
  async afterUpdate() {
    await strapi
      .plugin("pabu")
      .service("pbdynamiclist")
      .createDynamicListJson();
  },
  async afterDelete() {
    await strapi
      .plugin("pabu")
      .service("pbdynamiclist")
      .createDynamicListJson();
  },
  async afterDeleteMany() {
    await strapi
      .plugin("pabu")
      .service("pbdynamiclist")
      .createDynamicListJson();
  },
};
