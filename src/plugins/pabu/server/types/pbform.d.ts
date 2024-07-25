export interface CreateFormRequest
  extends Omit<PbForm, "id" | "localizations" | "locale"> {
  id?: number;
  localizations: Array<any>;
  locale?: string;
}
export interface UpdateFormRequest extends Omit<PbForm, "localizations"> {
  localizations?: Array<any>;
}

export interface SubmitFormRequest {
  formId: number;
  data: Array<
    | FormFieldString
    | FormFieldEmail
    | FormFieldBoolean
    | FormFieldText
    | FormFieldFile
    | FormFieldDate
    | FormFieldEnum
  >;
  captchaResponse?: string;
}


export interface PbForm {
  id: number;
  name: string;
  title: string;
  mailRecipients: string;
  mailSubject: string;
  cfgFormSubmitButtonText: string;
  cfgWithCaptcha: boolean;
  cfgMailTemplate: number;
  creator: string;
  locale: string;
  localizations: Array<any>;
  fields: Array<
    | FormFieldString
    | FormFieldEmail
    | FormFieldBoolean
    | FormFieldText
    | FormFieldFile
    | FormFieldDate
    | FormFieldEnum
  >;
}

export interface FormFieldString {
  id?: number;
  fieldLabel: string;
  cfgFieldPlaceholder: string;
  cfgFieldIsMandatory: boolean;
  fieldValue: string | null;
  cfgFieldCharactersMax: number | null;
  cfgFieldCharactersMin: number | null;
  cfgFieldCustomErrorMessage: string;
  cfgFieldCustomRegex: string;
  cfgFieldName: string;
  cfgFieldNoLetters: boolean;
  cfgFieldNoNumbers: boolean;
  cfgFieldNoSpecialCharacters: boolean;
  cfgFieldNoWhitespaceCharacters: boolean;
  __new_id?: string;
  __component: "pb.frmstr";
}

export interface FormFieldEmail {
  id?: number;
  fieldLabel: string;
  cfgFieldPlaceholder: string;
  cfgFieldIsMandatory: boolean;
  fieldValue: string | null;
  cfgFieldCustomErrorMessage: string;
  cfgFieldName: string;
  __new_id?: string;
  __component: "pb.frmml";
}

export interface FormFieldBoolean {
  id?: number;
  fieldLabel: string;
  cfgFieldIsMandatory: boolean;
  fieldValue: boolean;
  cfgFieldCustomErrorMessage: string;
  fieldRichTextDescription: string;
  cfgFieldName: string;
  __new_id: string;
  __component: "pb.frmbl";
}

export interface FormFieldText {
  id?: number;
  fieldLabel: string;
  cfgFieldIsMandatory: boolean;
  fieldValue: string;
  cfgFieldPlaceholder: string;
  cfgFieldCustomErrorMessage: string;
  cfgFieldCharactersMax: number | null;
  cfgFieldCharactersMin: number | null;
  cfgFieldName: string;
  cfgFieldNoSpecialCharacters: boolean;
  cfgFieldNoLetters: boolean;
  cfgFieldNoNumbers: boolean;
  __new_id: string;
  __component: "pb.frmtxt";
}

export interface FormFieldFile {
  id?: number;
  fieldLabel: string;
  cfgFieldPlaceholder: string;
  cfgFieldIsMandatory: boolean;
  cfgFieldName: string;
  cfgFieldCustomErrorMessage: string;
  cfgFieldAllowedFileEndings: string;
  fieldValue: string | null;
  cfgFieldMaxFileSizeInMB: number | null;
  __new_id: string;
  __component: "pb.frmfl";
}

export interface FormFieldDate {
  id?: number;
  fieldLabel: string;
  cfgFieldPlaceholder: string;
  cfgFieldIsMandatory: boolean;
  fieldValue: string | null;
  cfgFieldCustomErrorMessage: string;
  cfgFieldName: string;
  cfgCalendarStart: any | null;
  cfgMaxDaysPast: number | null;
  cfgMaxDaysFuture: number | null;
  cfgNotAllowedDatesStart: any | null;
  cfgNotAllowedDatesEnd: any | null;
  __new_id: string;
  __component: "pb.frmdt";
}

export interface FormFieldEnum {
  id?: number;
  fieldLabel: string;
  cfgFieldPlaceholder: string;
  cfgFieldIsMandatory: boolean;
  fieldDropdownValues: Array<FormFieldEnumOptionValue>;
  cfgFieldCustomErrorMessage: string;
  cfgFieldName: string;
  fieldValue: string | null;
  __new_id: string;
  __component: "pb.frmnm";
}

export interface FormFieldEnumOptionValue {
  __new_id: string;
  name: string;
  value: string;
}
