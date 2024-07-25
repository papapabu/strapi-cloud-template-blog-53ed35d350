export interface CmsSettings {
  id: number;
  createdAt: string;
  updatedAt: string;
  googlerecaptchav2: Recaptchav2Keys;
  configmodalsettings: ConfigModalSettings;
}

interface Recaptchav2Keys {
  id: number;
  recaptchav2publickey: string;
  recaptchav2privatekey: null;
}

interface ConfigModalSettings {
  id: number;
  cfgmodalsort: Array<ConfigModalSort>;
}

interface ConfigModalSort {
  contentelementname: string;
  sort: { [tab: string]: Array<string> };
}
