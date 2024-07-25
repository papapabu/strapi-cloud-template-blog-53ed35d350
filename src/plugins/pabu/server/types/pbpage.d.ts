import { Attributes } from "@strapi/types/dist/types/core/schemas";

/**
 * Represents a page in the Page Builder.
 */
export interface PbPage {
  /** The unique identifier for the page. */
  id: number;

  /** The name of the page. */
  name: string;

  /** The URL of the page. */
  url: string;

  /** The reference ID associated with the page. */
  refId: number;

  /** Indicates whether the page is in draft mode. */
  isDraft: boolean;

  /** Indicates whether the page has been published. */
  published: boolean;

  /** Optional SEO settings for the page. */
  seoSettings?: string;

  /** Indicates whether the page has navigation. */
  hasNavigation: boolean;

  /** Indicates whether the page has breadcrumbs. */
  hasBreadcrumbs: boolean;

  /** Indicates whether the page has a footer. */
  hasFooter: boolean;

  /** Indicates whether the SEO title is the same as the page title. */
  isSeoTitlePageTitle?: boolean;

  /** The canonical link URL for the page. */
  canonicalLinkUrl?: string;

  /** The content elements of the page. */
  content: Array<any>;

  /** The locale of the page. */
  locale?: string;

  /** Localized versions of the page for different locales. */
  localizations?: Array<PbPage>;

  /** update iso date */
  updatedAt: string;

  /** create iso date */
  createdAt: string;
}

/**
 * Represents a request to update page settings.
 */
export interface UpdatePageSettingsRequest {
  /** The unique identifier for the page. */
  id: number;

  /** The new name of the page. */
  name: string;

  /** The new URL of the page. */
  url: string;

  /** The new reference ID associated with the page. */
  refId: number;

  /** Indicates whether the page is in draft mode. */
  isDraft: boolean;

  /** Indicates whether the page should be published. */
  published: boolean;

  /** Optional new SEO settings for the page. */
  seoSettings?: string;

  /** Indicates whether the page should have navigation. */
  hasNavigation: boolean;

  /** Indicates whether the page should have breadcrumbs. */
  hasBreadcrumbs: boolean;

  /** Indicates whether the page should have a footer. */
  hasFooter: boolean;

  /** Indicates whether the SEO title should be the same as the page title. */
  isSeoTitlePageTitle?: boolean;

  /** The new canonical link URL for the page. */
  canonicalLinkUrl?: string;
}

/**
 * Represent a request to set the new default page.
 */
export interface SetDefaultPageRequest {
  /** The unique identifier for the page. */
  id: number;
}

/**
 * Represents a request to update the content of a page.
 */
export interface UpdatePageRequest {
  /** The unique identifier for the page. */
  id: number;

  /** The new content elements for the page. */
  content: Array<any>;
}

/**
 * Represents a request to create a new page.
 */
export interface CreatePageRequest {
  /** The name of the new page. */
  name: string;

  /** The URL of the new page. */
  url: string;
}

/**
 * Represents a nested element within a content element.
 */
export interface NestedElement {
  /** The name of the nested element. */
  uid: string;

  /** The attributes of the nested element. */
  attributes: Attributes;
}

/**
 * Represents a content element within a page.
 */
export interface ContentElement {
  /** The name of the content element. */
  uid: string;

  /** The attributes of the content element. */
  attributes: Attributes;

  /** Optional nested element within the content element. */
  nestedElement?: NestedElement;
}
