import { Common } from "@strapi/types/dist/types";

export const FILE_MODEL_UID: Common.UID.ContentType = "plugin::pabu.pbfile";
export const PAGE_MODULE_UID: Common.UID.ContentType = "plugin::pabu.pbpage";
export const FORM_MODULE_UID: Common.UID.ContentType = "plugin::pabu.pbform";
export const FORMENTRY_MODULE_UID: Common.UID.ContentType =
  "plugin::pabu.pbformentry";
export const NAVIGATION_MODULE_UID: Common.UID.ContentType =
  "plugin::pabu.pbnavigation";
export const DYNAMICLIST_MODULE_UID: Common.UID.ContentType =
  "plugin::pabu.pbdynamiclist";
export const STORE_MODULE_UID: Common.UID.ContentType = "plugin::pabu.str";
export const CESSTR_MODULE_UID: Common.UID.ContentType = "plugin::pabu.cesstr";
export const GLOBAL_MODULE_UID: Common.UID.ContentType = "plugin::pabu.glbl";
export const LICENSE_MODULE_UID: Common.UID.ContentType =
  "plugin::pabu.pblicense";
export const EMAIL_SETTING_MODULE_UID: Common.UID.ContentType =
  "plugin::pabu.pbemailsetting";
export const CMS_SETTING_MODULE_UID: Common.UID.ContentType =
  "plugin::pabu.pbcmssetting";
  export const SYSTEM_MODULE_UID: Common.UID.ContentType =
    "plugin::pabu.pbsystem";
export const CMS_ROOT_PAGE_URL = "/";
export const CMS_ROOT_PAGE_NAME = "root";
export const CMS_SEARCH_PAGE_URL = "search";
export const CMS_SEARCH_PAGE_NAME = "Search";
export const HARDCODED_MOBILE_SCALING_FACTOR = 0.5;
export const HARDCODED_TABLET_SCALING_FACTOR = 0.7;
export const MEDIA_MANAGER_ROOT_FOLDER = "pb_media_manager";

// CMS PABU Version
export const CMS_PABU_VERSION = "1.1";

/* Defaults */
export const TYPOGRAPHY_P_DEFAULT_SETTING = {
  __component: "pb.stypgrphy",
  strname: "paragraph (default)",
  htmlElement: "p",
  fontSize: { mobile: 14, desktop: 16 },
  lineHeight: "1.5",
  fontWeight: 400,
  additionalCss: "letter-spacing: normal; text-transform: none;",
  marginRichText: 10,
};

export const TYPOGRAPHY_H1_DEFAULT_SETTING = {
  __component: "pb.stypgrphy",
  strname: "h1 (default)",
  htmlElement: "h1",
  fontSize: { mobile: 21, desktop: 42 },
  lineHeight: "1.2",
  fontWeight: 600,
  additionalCss: "letter-spacing: normal; text-transform: none;",
  marginRichText: 10,
};

export const TYPOGRAPHY_H2_DEFAULT_SETTING = {
  __component: "pb.stypgrphy",
  strname: "h2 (default)",
  htmlElement: "h2",
  fontSize: { mobile: 18, desktop: 32 },
  lineHeight: "1.2",
  fontWeight: 600,
  additionalCss: "letter-spacing: normal; text-transform: none;",
  marginRichText: 10,
};

export const TYPOGRAPHY_H3_DEFAULT_SETTING = {
  __component: "pb.stypgrphy",
  strname: "h3 (default)",
  htmlElement: "h3",
  fontSize: { mobile: 16, desktop: 24 },
  lineHeight: "1.5",
  fontWeight: 600,
  additionalCss: "letter-spacing: normal; text-transform: none;",
  marginRichText: 10,
};

export const TYPOGRAPHY_H4_DEFAULT_SETTING = {
  __component: "pb.stypgrphy",
  strname: "h4 (default)",
  htmlElement: "h4",
  fontSize: { mobile: 14, desktop: 20 },
  lineHeight: "1.5",
  fontWeight: 600,
  additionalCss: "letter-spacing: normal; text-transform: none;",
  marginRichText: 10,
};

export const TYPOGRAPHY_H5_DEFAULT_SETTING = {
  __component: "pb.stypgrphy",
  strname: "h5 (default)",
  htmlElement: "h5",
  fontSize: { mobile: 14, desktop: 18 },
  lineHeight: "1.5",
  fontWeight: 600,
  additionalCss: "letter-spacing: normal; text-transform: none;",
  marginRichText: 6,
};

export const TYPOGRAPHY_H6_DEFAULT_SETTING = {
  __component: "pb.stypgrphy",
  strname: "h6 (default)",
  htmlElement: "h6",
  fontSize: { mobile: 14, desktop: 16 },
  lineHeight: "1.5",
  fontWeight: 600,
  additionalCss: "letter-spacing: normal; text-transform: none;",
  marginRichText: 10,
};

export const BUTTON_DEFAULT_SETTING = {
  __component: "pb.sbttn",
  strname: "button (default)",
  fontSize: { mobile: 14, desktop: 16 },
  lineHeight: "1.2",
  fontWeight: 800,
  border: "border: 1px solid #000000; border-radius: 25px;",
  buttonWidth: { minWidth: 100, maxWidth: 350 },
  buttonPadding: { horizontal: 40, vertical: 15 },
  additionalCss: "letter-spacing: normal; text-transform: none;",
  additionalCssHover: "letter-spacing: normal; text-transform: none;",
};

export const LINK_DEFAULT_SETTING = {
  __component: "pb.slnk",
  strname: "link (default)",
  fontSize: { mobile: 14, desktop: 16 },
  fontWeight: 600,
  lineHeight: "1.5",
  additionalCss: "letter-spacing: normal; text-transform: none;",
  additionCssHover: "text-decoration: underline;",
};

export const ARROWS_DEFAULT_SETTING = {
  __component: "pb.srrws",
  strname: "arrows (default)",
  arrowSize: {
    mobile: 50,
    tablet: 75,
    desktop: 100,
  },
  hideArrowsOnMobile: false,
  hideArrowsOnTablet: false,
  hideArrowsOnDesktop: false,
  arrowSvgFilterCssAttribute:
    "drop-shadow(0px 3px 2px rgba(134, 134, 134, 0.6))",
  leftArrow: null,
  rightArrow: null,
};
    

export const RICHTEXT_STORE_DEFAULT_SETTING = {
  __component: "pb.srchtxt",
  strname: "richtext editor (default)",
  bold: true,
  italic: true,
  underlined: true,
  crossedout: false,
  link: true,
  subscript: false,
  superscript: false,
  alignleft: true,
  alignright: true,
  aligncenter: true,
  indentationreduce: true,
  indentationincrease: true,
  listbullet: true,
  listnumber: true,
  h1: true,
  h2: true,
  h3: true,
  h4: true,
  h5: true,
  h6: true,
  html: true,
  colors: true,
};

// Note: Keep this global default ALWAYS updated.
export const GLOBAL_DEFAULT = {
  responsive: {
    breakpoints: {
      mobile: 768,
      tablet: 1366,
      desktop: 2560,
      wqhd: 3840,
    },
  },
  layout: {
    containerWidth: "100%",
    containerBgColor: {
      store: "str",
      values: [15],
      storeType: "color",
    },
    scalingfactorSpaceX: {
      mobile: 0.1,
      tablet: 0.3,
      desktop: 1,
      wqhd: 1.5,
    },
    scalingfactorSpaceY: {
      mobile: 0.5,
      tablet: 0.75,
      desktop: 1,
      wqhd: 1.5,
    },
    verticalpadding: 15,
    verticalpaddingafterfirstelement: 30,
    verticalpaddingbeforefooter: 30,
    scalingfactorVerticalPadding: {
      wqhd: 1.25,
      mobile: 0.5,
      tablet: 0.75,
      desktop: 1,
    },
  },
  navigation: {
    spaceX: {
      store: "str",
      values: [],
      storeType: "spaceX",
    },
    spaceY: {
      store: "str",
      values: [],
      storeType: "spaceY",
    },
    mobileNavDrawerWidth: "50%",
    mobileDrawerDropDirection: "left",
    linkTopLevel: {
      store: "str",
      storeType: "link",
      values: [],
    },
    linkLevel2: {
      store: "str",
      storeType: "link",
      values: [],
    },
    linkLevel3: {
      store: "str",
      storeType: "link",
      values: [],
    },
    bgColor: {
      store: "str",
      storeType: "color",
      values: [],
    },
    bgColorLinks: {
      store: "str",
      storeType: "color",
      values: [],
    },
    linkActiveColor: {
      store: "str",
      storeType: "color",
      values: [12],
    },
    logoMaxHeight: {
      mobile: 50,
      desktop: 50,
    },
    onlyMobileNavigation: null,
    showAllNavItems: true,
    additionalCss:
      ".navigation {}\n.navigation-desktop {}\n.navigation-desktop > .navigation-desktop-logo {}\n.navigation-desktop > nav {}\n.navigation-desktop > .navigation-desktop-action-group {}\n\n.navigation-mobile {}\n.navigation-mobile > .navigation-mobile-logo {}\n.navigation-mobile > .navigation-mobile-action-group {}\n.navigation-mobile-menu {}\n.navigation-mobile-header {}\n.navigation-mobile-menu > nav {}\n.navigation-mobile-menu > nav > .navigation-item {}\n.navigation-search {}",
  },
  footer: {
    footerType: "default",
    bgColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    richtextFooter: {
      store: "cesstr",
      storeType: "richtext",
      values: [],
    },
    spaceX: {
      store: "str",
      values: [],
      storeType: "spaceX",
    },
    verticalSpace: {
      top: 0,
      bottom: 30,
    },
    copyrightTextJson: {
      cn: "",
      de: "",
      en: "",
    },
    socialMediaWidth: 290,
    socialMediaTitleType: "h3",
    repeatableElementWidth: 290,
    footerElementsAlignmentLeft: false,
    footerCol: {
      spaceX: 0,
      spaceY: 50,
    },
    border: "border: 0px solid #000000;",
    additionalCss: "",
  },
  seo: {
    disableImageOptimization: false,
    openExternalLinksInNewTab: true,
    twitterSiteContent: "",
    twitterCardContent: "summary_large_image",
    fallbackOpenGraphImage: null,
  },
  logo: {
    favicon32x32: null,
    favicon64x64: null,
    favicon128x128: null,
    favicon192x192: null,
    androidicon: null,
    appletouchicon120x120: null,
    appletouchicon152x152: null,
    appletouchicon167x167: null,
    appletouchicon180x180: null,
  },
  forms: {
    richtext: {
      store: "cesstr",
      values: [],
      storeType: "richtext",
    },
  },
  search: {
    searchEnabled: true,
    searchPlaceholder: "",
    navSearchIconColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    searchBarBgColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    searchBarTypography: {
      store: "str",
      values: [],
      storeType: "typography",
    },
    searchBarSearchIconColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    searchBarCloseIconColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    searchBarBgHoverColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    searchBarMaxWidth: 0,
  },
  searchresults: {
    spaceX: {
      store: "str",
      values: [],
      storeType: "spaceX",
    },
    spaceY: {
      store: "str",
      values: [],
      storeType: "spaceY",
    },
    h1Typography: {
      store: "str",
      storeType: "typography",
      values: [],
    },
    h2Typography: {
      store: "str",
      storeType: "typography",
      values: [4],
    },
    ctTypography: {
      store: "str",
      storeType: "typography",
      values: [],
    },
    resultTypography: {
      store: "str",
      storeType: "typography",
      values: [],
    },
    resultLink: {
      store: "str",
      storeType: "link",
      values: [],
    },
    contentTypeDivider: "1px solid #000",
    marginBetweenContentType: 30,
    elementSpace: {
      x: 20,
      y: 10,
    },
    listElementSpaceY: 10,
    searchFilterBgColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    searchFilterBorderColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    searchFilterDropdownBgColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    searchFilterDropdownBgColorHover: {
      store: "str",
      values: [],
      storeType: "color",
    },
    searchFilterDropdownFontColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    searchFilterChipBgColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    searchFilterChipFontColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    searchFilterChipBorder: "border: 1px solid #000",
    searchTermSpace: null,
    searchSummarySpace: null,
    searchFilterSpace: null,
    searchFilterBorderHoverColor: {
      store: "str",
      storeType: "color",
      values: [],
    },
  },
  multilanguage: {
    languageSwitchEnabled: true,
    bgColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    borderColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    fontColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    hoverBgColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    hoverFontColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
  },
  animation: {
    triggerGap: 100,
    animationsMobile: false,
    triggerInitialAnimation: false,
  },
  scrolling: {
    scrollEffect: "auto",
  },
  scrolltotop: {
    enabled: false,
    bgColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    arrowColor: {
      store: "str",
      values: [],
      storeType: "color",
    },
    scrolltotopWidth: {
      wqhd: 70,
      mobile: 40,
      tablet: 50,
      desktop: 60,
    },
    scrolltotopHeight: {
      wqhd: 70,
      mobile: 40,
      tablet: 50,
      desktop: 60,
    },
    borderRadius: {
      wqhd: 35,
      mobile: 20,
      tablet: 25,
      desktop: 30,
    },
    scrollEffect: "auto",
    icon: null,
  },
  captchatype: {
    formCaptchaType: "none",
  },
};

export const BODY_SELECTOR = ".am-pabu";

// replaces old .ql-editor
export const RICHTEXT_CONTENT_SELECTOR = ".pb-richtext";

// Note: These default contentElementSettings-Entries are undeletable.
export const CES_STORE_DEFAULTS_STRUUIDS = {
  cshdln: "7c382c89-f0fb-4d5a-aa7c-667d887aca1c",
  csrchtxt: "883e99af-aef1-48e1-a692-5565cf04af98",
  csbttn: "348e6c97-40f1-4f4d-978f-50e35e11bba8",
  csfrm: "2c65c8f1-6895-4076-8a84-6e84a44f1d36",
  cssprtr: "e72e8419-be3f-42d2-8d72-176755c672e1",
  csspcr: "fb3648c0-c2b1-43e6-8333-ab6f710d57d9",
  csgllry: "2ad50d10-a3b7-471d-9cb7-8cd5e352d7dc",
  csmg: "2ab0f444-96f4-4ea0-9157-0be0e61f7cde",
  csmltmd: "d00e5bb1-bbf2-412f-a773-d9b6fe59d6be",
  cscrsl: "c3aa15b4-5d8b-404c-a003-7e94a43de660",
  csmgtckr: "9947cfab-4e8f-470b-8c8a-a3d5a1d57ba0",
  cstwi: "0275ab3d-8787-40f7-b022-e15beba27c1a",
  cscrds: "44e1338a-6da1-4229-88a6-fb472617a289",
  csccrdn: "9776937b-9593-42a8-be2e-6e13e828edcb",
  cshtml: "7d8e3e78-ff5d-4b25-a39a-4ca0f1e43582",
  csmgwthmrkrs: "38364140-68f5-44c7-a6fa-20bfae544034",
};

// Note: These default store-Entries can be deleted.
export const STR_STORE_DEFAULTS_STRUUIDS = {
  colorBlack: "b9af65ed-cb9a-4c62-953e-0e5ffdc85f4a",
  colorWhite: "476c462a-3e41-47d2-8b2b-cfd0ae778dfb",
  colorTransparent: "37f74d3f-deb8-4eae-8846-536ec7194cba",
  colorPrimaryDark: "332ac61e-3692-4e6c-8a1f-602e73010be3",
  colorPrimaryLight: "6bb97dfb-c9ad-4927-a4ab-4f5600d84cb7",
  colorSecondaryDark: "bbc228f6-2edf-4789-a622-bef619e42971",
  colorSecondaryLight: "723126c1-eb1f-44ee-9e46-edad02e955cf",
  colorBackgroundDark: "177f3863-bf12-403d-80d5-cce0de1016a9",
  colorBackgroundLight: "efd32a6f-926f-4e60-9a81-de74e59ef1f4",
  colorAccent: "d523112a-e3dd-4eaa-ab0c-f05af6e81390",
  defaultFont: "8eb790b7-18a1-45b0-a409-a62fe03fd850",
  defaultP: "a3a47bda-0bde-446c-bbda-780d3b8832bf",
  defaultH1: "f9ae3b9f-ee64-43be-ae67-b3d4c8f122af",
  defaultH2: "fe2ab5b4-de76-48ec-83e8-e6b170ba27a7",
  defaultH3: "e50ce259-6ea8-4067-89ad-f0cc8cf65bcc",
  defaultH4: "4ba43ed4-4ff0-420d-b1da-7a1f6113a9c6",
  defaultH5: "cc1f1e04-7f7e-4e95-958c-ddc4e77dddfa",
  defaultH6: "9c0c1da1-b9eb-4557-94d1-40593c234aa7",
  spaceX0: "ad6cf07a-62cc-45a5-9b99-2c4333fa4d47",
  spaceX400: "95db7fe3-9d08-42e5-8fdf-d943180b30d8",
  spaceY0: "762e5975-357d-4c5d-8bc1-5191bfe8cde6",
  spaceY30: "abc3d097-d8fd-4cb0-a97d-d48ad68ee393",
  richTextEditorDefault: "c87c922e-e0bc-4fb1-a8e6-b42be6cc5da7",
  buttonDefault: "7f72878a-7b22-404c-8466-2f8cf114e06e",
  linkDefault: "f76da562-401a-45f0-815a-bc7bcded3d89",
  navLinkLevel1: "def0ca88-b64d-4dbb-8034-86ef41d7b026",
  navLinkLevel2: "6e99972c-84f3-46bd-94ba-777be7ba5eec",
  navLinkLevel3: "253a6eab-1001-4ce6-a863-e52983aed6a1",
  defaultArrows: "25ffda61-bbc3-4858-9c15-b9c62dc4de9f",
};

export const DEFAULT_AS_SELECTABLE_VALUE = -1;
