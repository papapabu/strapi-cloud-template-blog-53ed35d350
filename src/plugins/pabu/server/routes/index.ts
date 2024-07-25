import { pbAuthenticationAdminRoutes } from "./pbauthentication";
import { pbCmsSettingAdminRoutes } from "./pbcmssettings";
import { pbDynamicListAdminRoutes } from "./pbdynamiclist";
import { pbEmailAdminRoutes } from "./pbemail";
import { pbFileAdminRoutes, pbFilePublicRoutes } from "./pbfile";
import { pbFormAdminRoutes, pbFormPublicRoutes } from "./pbform";
import { pbLocalizationAdminRoutes } from "./pblocalization";
import { pbNavigationAdminRoutes } from "./pbnavigation";
import { pbPageAdminRoutes, pbPagePublicRoutes } from "./pbpage";
import { pbSearchPublicRoutes } from "./pbsearch";
import { pbStoreAdminRoutes } from "./pbstore";
import { pbUploadAdminRoutes } from "./pbupload";

export default {
  pbUploadAdminRoutes,
  pbFileAdminRoutes,
  pbFilePublicRoutes,
  pbPagePublicRoutes,
  pbPageAdminRoutes,
  pbFormAdminRoutes,
  pbFormPublicRoutes,
  pbLocalizationAdminRoutes,
  pbAuthenticationAdminRoutes,
  pbStoreAdminRoutes,
  pbNavigationAdminRoutes,
  pbDynamicListAdminRoutes,
  pbEmailAdminRoutes,
  pbCmsSettingAdminRoutes,
  pbSearchPublicRoutes,
};
