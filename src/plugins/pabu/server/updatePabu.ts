const fs = require("fs-extra");
const path = require("path");

/**
 * Loops over all files in ./updateSteps in asc order and starts
 * update and custom update steps
 */
export const performUpdate = async () => {
  strapi.log.info("Update Pabu: Starting update steps...");
  try {
    const updateStepsPath = path.join(
      process.cwd(),
      "src",
      "plugins",
      "pabu",
      "updateSteps"
    );
    const updateStepFileNames: Array<string> = fs
      .readdirSync(updateStepsPath)
      .sort();
    for (const fileName of updateStepFileNames) {
      await performUpdateStep(fileName, false);
      await performUpdateStep(fileName, true);
    }
    strapi.log.info("Update Pabu: Finished update steps.");
  } catch (error) {
    strapi.log.error(error);
  }
};

const performUpdateStep = async (fileName: string, isCustomStep: boolean) => {
  const filePath = path.join(
    process.cwd(),
    "src",
    "plugins",
    "pabu",
    `${isCustomStep ? "customUpdateSteps" : "updateSteps"}`,
    fileName
  );

  if (isCustomStep && !fs.existsSync(filePath)) {
    return;
  }

  const updateStep = require(filePath);

  // necessary check
  let isNecessary = true;
  try {
    isNecessary = await updateStep.isNecessary();
  } catch (error) {
    strapi.log.error(
      `Update Pabu: Error while doing isNecessary check for ${
        isCustomStep ? "custom" : ""
      } ${fileName}. Updating database canceled.`
    );
    throw error;
  }

  if (!isNecessary) {
    strapi.log.info(
      `Update Pabu: Skipping${
        isCustomStep ? " custom" : ""
      } update step ${fileName}.`
    );
    return;
  }

  // update
  try {
    await updateStep.update();
    strapi.log.info(
      `Update Pabu: ${
        isCustomStep ? "Custom update" : "Update"
      } step ${fileName} successful.`
    );
  } catch (error) {
    strapi.log.error(
      `Update Pabu: Error while doing ${
        isCustomStep ? "custom" : ""
      } update step ${fileName}. Updating database canceled.`
    );
    throw error;
  }
};
