import { Strapi } from "@strapi/strapi";
import { Context } from "koa";
import { PAGE_MODULE_UID } from "../constants";
import pbEntityService from "../services/pbEntityService";
import { PbPage } from "../types/pbpage";

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const decapitalizeFirstLetter = (string) => {
  return string.charAt(0).toLowerCase() + string.slice(1);
};

const caseInsensitiveIncludes = (string: any, searchString: string) => {
  return typeof string === "string" &&
    string.toLowerCase().indexOf(searchString) != -1
    ? true
    : false;
};

const containsSearchString = (string, searchString) => {
  return string.toLowerCase().includes(searchString.toLowerCase());
};

const MINIMUM_SEARCH_STRING_LENGTH = 3;

export default ({ strapi }: { strapi: Strapi }) => ({
  /**
   * [GET] /search/suggest/:searchString
   * Suggests words based on searchString for the searchInput.
   **/
  async suggest(ctx: Context) {
    const { searchString } = ctx.params;
    const MAXIMUM_SUGGESTED_WORDS = 8;

    let { locale } = ctx.query;

    if (
      !searchString ||
      typeof searchString !== "string" ||
      searchString.length < MINIMUM_SEARCH_STRING_LENGTH
    ) {
      return [];
    }

    if (
      !locale ||
      Array.isArray(locale)
    ) {
      return [];
    }

    const pages = (await pbEntityService.findMany(PAGE_MODULE_UID, {
      fields: ["*"],
      filters: {
        isDraft: false,
        published: true,
      },
      locale: locale,
      sort: {
        updatedAt: "desc",
      },
      populate: "pb-deep",
    })) as Array<PbPage>;

    if (!pages) {
      return [];
    }

    let results: Set<string> = new Set();
    const lowerCaseSearchString = searchString.toLowerCase();
    for (const page of pages) {
      if (caseInsensitiveIncludes(page.name, searchString)) {
        results.add(page.name);
      }
      for (const pageContent of page.content) {
        // Only search in .title or .primaryHeadline of elements.
        // CEs: headline (primaryHeadline), textwithimage (title), carousel (carouselslide.title), accordion (panel.title)
        const objectAttributeEntries = Object.entries(pageContent);
        for (let k = 0; k < objectAttributeEntries.length; k++) {
          const [objectAttributeKey, objectAttributeValue]: Array<any> =
            objectAttributeEntries[k];
          switch (objectAttributeKey) {
            case "primaryHeadline":
            case "title":
              // Attributes of mainly unnested contentElements.
              // Note: Add attributes that need to be searched (by requirement) above! (might happen occasionally)
              if (
                caseInsensitiveIncludes(
                  objectAttributeValue,
                  lowerCaseSearchString
                )
              ) {
                results.add(objectAttributeValue);
              }
              break;
            case "content":
              // Nested Elements
              // Note: Add nested-attributes that need to be searched (by requirement) as else-if! (not likely to happen)
              for (let l = 0; l < objectAttributeValue.length; l++) {
                const nestedContent = objectAttributeValue[l];
                if (
                  caseInsensitiveIncludes(
                    nestedContent.title,
                    lowerCaseSearchString
                  )
                ) {
                  // Match
                  results.add(nestedContent.title);
                }
              }
              break;
            default:
              break;
          }
        }
      }
    }

    const searchSuggestions: Set<string> = new Set();
    for (const result of results) {
      if (searchSuggestions.size < MAXIMUM_SUGGESTED_WORDS) {
        const resultWords = result ? result.split(" ") : [];
        resultWords.forEach((word) => {
          if (
            searchSuggestions.size < MAXIMUM_SUGGESTED_WORDS &&
            containsSearchString(word, searchString)
          ) {
            searchSuggestions.add(capitalizeFirstLetter(word));
          }
        });
      }
    }

    strapi.log.debug(
      `Suggest "${searchString}": ${Array.from(searchSuggestions).join(", ")}`
    );
    return Array.from(searchSuggestions);
  },

  /**
   * [GET] /search/:searchString
   * Search
   * @param {*} ctx
   * @returns
   */
  async search(ctx) {
    const { searchString } = ctx.params;

    let { locale } = ctx.query;
    if (!locale) {
      locale = process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE;
    }

    const result: {
      page: Array<any>;
      content: {
        contentResults: Array<any>;
        contentHits: number;
      };
    } = {
      page: [],
      content: {
        contentResults: [],
        contentHits: 0,
      },
    };

    if (
      typeof searchString !== "string" ||
      searchString.length < MINIMUM_SEARCH_STRING_LENGTH
    ) {
      return result;
    }

    const lowerCaseSearchString = searchString.toLowerCase();

    // Query all published pages.
    const pages = (await pbEntityService.findMany(PAGE_MODULE_UID, {
      fields: ["*"],
      filters: {
        isDraft: false,
        published: true,
      },
      /*@ts-ignore*/
      locale: locale,
      sort: {
        updatedAt: "desc",
      },
      populate: "pb-deep",
    })) as Array<PbPage>;

    // We currently search without fuse.js (Umlaut-Problem).
    // Note: Searching with fuse.js allows searching with indexing, scoring-theory and fuzzy search.
    const contentResults: Array<{
      url: string;
      key: string;
      value: string | any;
      updated_at: string;
    }> = [];
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      if (caseInsensitiveIncludes(page.name, lowerCaseSearchString)) {
        result.page.push({
          name: page.name,
          url: page.url,
          updated_at: page.updatedAt,
        });
      }
      for (let j = 0; j < page.content.length; j++) {
        const pageContent = page.content[j];

        // Transform pageContentAttribute to Key/Value-Pairs.
        const objectAttributeEntries = Object.entries(pageContent);
        for (let k = 0; k < objectAttributeEntries.length; k++) {
          const [objectAttributeKey, objectAttributeValue]: Array<any> =
            objectAttributeEntries[k];
          let skipOtherAttributes = false;

          switch (objectAttributeKey) {
            case "primaryHeadline":
            case "secondaryHeadline":
            case "title":
            case "richTextContent":
            case "imgCaption":
              // Attributes of mainly unnested contentElements.
              // Note: Add attributes that need to be searched (by requirement) above! (might happen occasionally)
              if (
                caseInsensitiveIncludes(
                  objectAttributeValue,
                  lowerCaseSearchString
                )
              ) {
                // Match
                contentResults.push({
                  // URL to ContentElement
                  url: `${page.url}#${pageContent.__component.replace("pb.", "")}-${pageContent.id}`,
                  key: objectAttributeKey,
                  value: objectAttributeValue,
                  updated_at: page.updatedAt,
                });
                skipOtherAttributes = true;
              }
              break;
            case "content":
              // Nested Elements
              // Note: Add nested-attributes that need to be searched (by requirement) as else-if! (not likely to happen)
              for (let l = 0; l < objectAttributeValue.length; l++) {
                const nestedContent = objectAttributeValue[l];
                let keyWithMatch;
                let matchValue;
                if (
                  caseInsensitiveIncludes(
                    nestedContent.name,
                    lowerCaseSearchString
                  )
                ) {
                  keyWithMatch = "name";
                  matchValue = nestedContent.name;
                } else if (
                  caseInsensitiveIncludes(
                    nestedContent.title,
                    lowerCaseSearchString
                  )
                ) {
                  keyWithMatch = "title";
                  matchValue = nestedContent.title;
                } else if (
                  caseInsensitiveIncludes(
                    nestedContent.richTextContent,
                    lowerCaseSearchString
                  )
                ) {
                  keyWithMatch = "richTextContent";
                  matchValue = nestedContent.richTextContent;
                }
                if (keyWithMatch && matchValue) {
                  // Match
                  contentResults.push({
                    // URL to ContentElement
                    url: `${page.url}#${pageContent.__component.replace(
                      "pb.",
                      ""
                    )}-${pageContent.id}`,
                    key: keyWithMatch,
                    value: matchValue,
                    updated_at: page.updatedAt,
                  });
                  skipOtherAttributes = true;
                  break;
                }
              }
              break;
            default:
              break;
          }
          if (skipOtherAttributes) {
            break;
          }
        }
      }
    }

    // Note: In case we switch back to fuse.js (after they fix umlaut-problem) we will need separated contentHits from contentResults.
    result.content = {
      contentResults: contentResults || [],
      contentHits: contentResults.length,
    };

    // Summary of searchResults:
    strapi.log.debug(
      `searchResults: "${searchString}"  [P: ${result.page.length} C: ${result.content.contentHits}].`
    );
    return result;
  },
});

