import { Switch } from '@strapi/design-system';
import { useCMEditViewDataManager } from "@strapi/helper-plugin";
import React, { useEffect } from "react";
import { useIntl } from 'react-intl';
import AttributeLabelWithDescription from "../AttributeLabelWithDescription";
import { EqualHeightCustomFieldWrapper, FieldInputWrapper } from '../styles';

const Index = ({ name, value, attribute, intlLabel }) => {
  const { onChange } = useCMEditViewDataManager();
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (( value === null || typeof value === "undefined" ) && attribute && attribute.default) {
      onChange({ target: { name, value: attribute.default } })
    }
  }, [value]);

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
              <Switch
                label={intlLabel?.defaultMessage}
                aria-label={formatMessage({
                  id: "pabu.boolean-value.input.aria-label",
                  defaultMessage: `${intlLabel?.defaultMessage} input`,
                })}
                selected={value}
                onChange={() => onChange({ target: { name, value: !value } })}
                visibleLabels
              />
            </FieldInputWrapper>
          </EqualHeightCustomFieldWrapper>
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
};

export default Index;
