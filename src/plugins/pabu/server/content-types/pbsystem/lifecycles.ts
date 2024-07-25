import { CMS_PABU_VERSION } from "../../constants";

export default {
  beforeCreate: async (event) => {
    if (!event.params.data.version) {
      event.params.data.version = CMS_PABU_VERSION;
    }
  },
  beforeUpdate: async (event) => {
    if (!event.params.data.version) {
      event.params.data.version = CMS_PABU_VERSION;
    }
    if (event.params.data.version !== CMS_PABU_VERSION) {
      strapi.log.info(
        `[Pabu:] Updated pbsystem.version from ${event.params.data.version} to ${CMS_PABU_VERSION}.`
      );
      event.params.data.version = CMS_PABU_VERSION;
    }
  },
  afterCreate: async (event) => {
    // Placeholder.
  },
  afterUpdate: async (event) => {
    // Placeholder.
  },
};
