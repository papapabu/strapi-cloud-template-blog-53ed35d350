import { FieldInput } from "@strapi/design-system/Field";
import { useCMEditViewDataManager } from "@strapi/helper-plugin";
import React, { useEffect } from "react";
import { useIntl } from "react-intl";
import AttributeLabelWithDescription from "../AttributeLabelWithDescription";
import { EqualHeightCustomFieldWrapper, FieldInputWrapper } from "../styles";

const Index = ({ name, value, attribute, intlLabel }) => {
  const { onChange } = useCMEditViewDataManager();
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (
      (value === null || typeof value === "undefined") &&
      attribute &&
      attribute.default
    ) {
      onChange({ target: { name, value: attribute.default } });
    }
  }, [value]);

  const updateValue = (inputValue) => {
    let parsedValue = inputValue;
    if (inputValue !== null && typeof inputValue !== "string") {
      parsedValue = `${inputValue}`;
    }
    onChange({ target: { name, value: parsedValue } });
  };

  return (
    <React.Fragment>
      {!attribute.technicalField ? (
        <React.Fragment>
          <EqualHeightCustomFieldWrapper>
            <AttributeLabelWithDescription
              attributeLabel={intlLabel?.defaultMessage}
              fullAttributeName={name}
            />
            <FieldInputWrapper>
              <FieldInput
                label={intlLabel?.defaultMessage}
                name={name}
                aria-label={formatMessage({
                  id: "pabu.string-value.input.aria-label",
                  defaultMessage: `${intlLabel?.defaultMessage} input`,
                })}
                type={
                  attribute.inputType === "integer" ||
                  attribute.inputType === "number"
                    ? "number"
                    : "string"
                }
                value={value}
                onChange={(e) => updateValue(e.target.value)}
              />
            </FieldInputWrapper>
          </EqualHeightCustomFieldWrapper>
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
};

export default Index;

