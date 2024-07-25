export default {
  async afterCreate(event: any) {
    await global.strapi
      .service("plugin::pabu.pbpage")
      .lifecycleAfterCreate(event.result.id);
  },
  async afterUpdate(event: any) {
    await strapi.service("plugin::pabu.pbpage").lifecycleAfterUpdate(event);
  },
};
