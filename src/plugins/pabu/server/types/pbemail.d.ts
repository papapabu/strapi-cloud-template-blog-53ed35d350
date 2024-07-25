export type EmailTemplateCategory = "system" | "form";

/**
 * Represents the settings for an email template.
 */
export interface EmailTemplateSetting {
  /**
   * The unique identifier for the email template.
   */
  id: number;

  /**
   * The category of the email template.
   */
  category: EmailTemplateCategory;

  /**
   * The name of the email template.
   */
  templateName: string;

  /**
   * The subject of the email template.
   */
  emailSubject: string;

  /**
   * The string content of the email template.
   */
  emailTemplateString: string;

  /**
   * Additional optional recipients for the email template.
   */
  optionalRecipients: any;
}

/**
 * Represents an email template configuration.
 */
export interface EmailTemplate {
  /**
   * The settings for the email template.
   */
  template: EmailTemplateSetting;

  /**
   * The sender's email address.
   */
  fromAddress: string;

  /**
   * The reply-to email address.
   */
  replyAddress: string;
}
/**
 * Represents a request to send an email.
 */
export interface EmailSendRequest {
  /**
   * The name of the email template to be used.
   */
  templateName: string;

  /**
   * The subject of the email.
   */
  subject: string;

  /**
   * An array of values to be used in the email template.
   */
  emailTemplateValues: Array<any>;

  /**
   * The recipient's email address.
   */
  mailTo: string;

  /**
   * An array of fields related to files that are part of the email.
   */
  fileRelatedFields: Array<any>;

  /**
   * Indicates whether to use overrides from the saved email template.
   */
  useOverridesFromSavedTemplate: boolean;
}
/**
 * Represents a request to test an email.
 */
export interface EmailTestRequest {
  /**
   * The name of the email template to be tested.
   */
  templateName: string;

  /**
   * The email address of the recipient for testing.
   */
  recipientEmail: string;
}
