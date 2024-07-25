export default {
  async afterCreate() {
    await strapi.plugin("pabu").service("pbnavigation").createNavigationJson();
  },
  async afterUpdate() {
    await strapi.plugin("pabu").service("pbnavigation").createNavigationJson();
  },
  async afterDelete() {
    await strapi.plugin("pabu").service("pbnavigation").createNavigationJson();
  },
  async afterDeleteMany() {
    await strapi.plugin("pabu").service("pbnavigation").createNavigationJson();
  },
};
