export default (policyContext, config, { strapi }) => {
  const { actions = [], hasAtLeastOne = false, model = "" } = config;
  const {
    state: { userAbility },
  } = policyContext;

  return hasAtLeastOne
    ? actions.some((action) => userAbility.can(action, model))
    : actions.every((action) => userAbility.can(action, model));
};
