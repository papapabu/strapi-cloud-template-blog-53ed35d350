const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");

export default (config, { strapi }) => {
  return async (context, next) => {
    removeHtmlFromObject(context.request.body);
    await next();
  };
};

const removeHtmlFromObject = (inputObject: any) => {
  const window = new JSDOM("").window;
  const DOMPurify = createDOMPurify(window);

  removeHtmlFromAttributes(inputObject, DOMPurify);
};

const removeHtmlFromAttributes = (inputObject: any, DOMPurify: any) => {
  if (!inputObject) {
    return;
  }

  for (let key in inputObject) {
    if (typeof inputObject[key] === "object") {
      if (Array.isArray(inputObject[key])) {
        for (let i = 0; i < inputObject[key].length; i++) {
          removeHtmlFromAttributes(inputObject[key][i], DOMPurify);
        }
      } else {
        removeHtmlFromAttributes(inputObject[key], DOMPurify);
      }
    } else {
      if (typeof inputObject[key] === "string") {
        inputObject[key] = DOMPurify.sanitize(inputObject[key], {
          ALLOWED_TAGS: [],
        });
      }
    }
  }
};
