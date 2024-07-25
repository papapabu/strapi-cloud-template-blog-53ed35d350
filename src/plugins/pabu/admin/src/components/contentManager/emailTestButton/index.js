import { Option, Select, TextInput } from "@strapi/design-system";
import { Button } from "@strapi/design-system/Button";
import { Dialog, DialogBody, DialogFooter } from "@strapi/design-system/Dialog";
import { Stack } from "@strapi/design-system/Stack";
import {
  useCMEditViewDataManager,
  useFetchClient,
} from "@strapi/helper-plugin";
import EmailIcon from "@strapi/icons/Email";
import React, { useEffect, useState } from "react";

const EmailTestButton = () => {
  const { slug } = useCMEditViewDataManager();
  const { get, post } = useFetchClient();
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  useEffect(() => {
    if (showConfirmationDialog) {
      get("/pabu/email/get-all-templates")
        .then(({ data }) => {
          console.log(data);
          setTemplateOptions(data.map((template) => template.templateName));
        })
        .catch((err) => {
          console.error("could not fetch all email templates", err);
        });
    }
  }, [showConfirmationDialog, get]);

  const toggleConfirmationDialog = () => {
    setShowConfirmationDialog((prevState) => !prevState);
    setRecipientEmail("");
    setSelectedEmailTemplate("");
  };

  const handleConfirmTestEmail = async () => {
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!recipientEmail.toLowerCase().trim().match(emailRegex)) {
      window.alert(`${recipientEmail} is not a valid email address!`);
      return;
    }

    post("/pabu/email/trigger-test-email", {
      templateName: selectedEmailTemplate,
      recipientEmail: recipientEmail,
    })
      .then(() => window.alert(`Email was sent to ${recipientEmail}!`))
      .catch((err) => {
        console.error(err);
        window.alert(
          `Could not send email! (the error was logged on the client and server)`
        );
      })
      .finally(() => toggleConfirmationDialog());
  };

  return (
    <>
      {/* this check makes sure that the Emailtestbutton is only displayed in emailsettings tab */}
      {slug === "plugin::pabu.pbemailsetting" ? (
        <>
          <Button
            variant="primary"
            startIcon={<EmailIcon />}
            onClick={() => toggleConfirmationDialog()}
            className="email-test-button"
          >
            {`Send test mail`}
          </Button>
          <Dialog
            onClose={() => toggleConfirmationDialog()}
            title="Send test mail"
            isOpen={showConfirmationDialog}
          >
            <DialogBody>
              <Stack spacing={2}>
                <div className="email-test-modal">
                  <Select
                    error={""}
                    label={"Emailtemplate"}
                    id={"email-templat-select"}
                    name={"email-templat-select"}
                    onChange={(value) => {
                      console.log(value);
                      setSelectedEmailTemplate(value);
                    }}
                    value={selectedEmailTemplate}
                  >
                    {templateOptions.map((templateName, index) => {
                      return (
                        <Option
                          key={templateName + index}
                          value={templateName}
                          disabled={false}
                          hidden={false}
                        >
                          {templateName}
                        </Option>
                      );
                    })}
                  </Select>
                  <br />
                  <TextInput
                    placeholder="your emailaddress"
                    label="Recipient emailaddress"
                    name="recipient-email"
                    hint="Input a valid email address"
                    error={undefined}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    value={recipientEmail}
                    labelAction={null}
                  />
                </div>
              </Stack>
            </DialogBody>
            <DialogFooter
              startAction={
                <Button
                  onClick={() => toggleConfirmationDialog()}
                  variant="tertiary"
                >
                  Cancel
                </Button>
              }
              endAction={
                <Button
                  onClick={async () => await handleConfirmTestEmail()}
                  variant={
                    recipientEmail === "" || selectedEmailTemplate === ""
                      ? "tertiary"
                      : "primary"
                  }
                  startIcon={<EmailIcon />}
                  disabled={
                    recipientEmail === "" || selectedEmailTemplate === ""
                  }
                  className={
                    recipientEmail === "" || selectedEmailTemplate === ""
                      ? ""
                      : "am-style"
                  }
                >
                  Send
                </Button>
              }
            />
          </Dialog>
          <style>
            {`

                .email-test-button {
                  background-color: #F2C500 !important;
                  border: 1px solid black !important;
                }

                .email-test-button svg path, .am-style svg path {
                  fill: black !important;
                }

                .am-style {
                  background-color: #F2C500 !important;
                  border: 1px solid black !important;
                }

                .email-test-button span, .am-style span {
                  color: black !important;
                }
              `}
          </style>
        </>
      ) : null}
      <style>
        {`
          /* Bigger Font-Size for Component-Names */
          div[spacing="6"] > div > div[spacing="6"] > div > div > div > div > div > div > div > label {
            font-size: 1.35rem;
          }

        `}
      </style>
    </>
  );
};

export default EmailTestButton;
