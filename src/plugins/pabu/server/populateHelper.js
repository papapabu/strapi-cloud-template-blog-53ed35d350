const { isEmpty, merge } = require("lodash/fp");

// modified version of https://github.com/Barelydead/strapi-plugin-populate-deep

const getModelPopulationAttributes = (model) => {
  if (model && model.uid === "plugin::upload.file") {
    const { related, ...attributes } = model.attributes;
    return attributes;
  }
  return model.attributes;
};

const getFullPopulateObject = (modelUid, maxDepth = 20) => {
  if (maxDepth <= 1) {
    return true;
  }
  if (modelUid === "admin::user") {
    return undefined;
  }

  const populate = {};
  const model = strapi.getModel(modelUid);
  for (const [key, value] of Object.entries(
    getModelPopulationAttributes(model)
  )) {
    if (value) {
      if (value.type === "component") {
        populate[key] = getFullPopulateObject(value.component, maxDepth - 1);
      } else if (value.type === "dynamiczone") {
        const dynamicPopulate = value.components.reduce((prev, cur) => {
          const curPopulate = getFullPopulateObject(cur, maxDepth - 1);
          if (curPopulate.populate && curPopulate.populate.content === true) {
            delete curPopulate.populate.content;
          }
          // Original 'deep'-Populate
          return curPopulate === true ? prev : merge(prev, curPopulate);
        }, {});
        populate[key] = isEmpty(dynamicPopulate) ? true : dynamicPopulate;
      } else if (value.type === "relation") {
        // custom change:
        // check if the key is "localizations" if its not
        // populate until maxDepth (this was the default
        // before the custom change)
        // if it is "localizations" then just populate one time for
        // the localizations attribute
        if (key !== "localizations") {
          const relationPopulate = getFullPopulateObject(
            value.target,
            maxDepth - 1
          );
          if (relationPopulate) {
            populate[key] = relationPopulate;
          }
        } else {
          // if the key is "localizations" just populate the top level
          // of  the attribute "localizations"
          const relationPopulate = getFullPopulateObject(value.target, 0);
          if (relationPopulate) {
            populate[key] = relationPopulate;
          }
        }
      } else if (value.type === "media") {
        populate[key] = true;
      }
    }
  }
  return isEmpty(populate) ? true : { populate };
};

module.exports = {
  getFullPopulateObject,
};
