import { JSONInput } from "@strapi/design-system";
import { useCMEditViewDataManager } from "@strapi/helper-plugin";
import React, { useState } from "react";
import { useIntl } from "react-intl";
import AttributeLabelWithDescription from "../AttributeLabelWithDescription";

const isJSON = (string) => {
  try {
    JSON.parse(string);
    return true;
  } catch {
    return false;
  }
};

const Index = ({ name, value, attribute, intlLabel }) => {
  const getInitialValue = () => {
    let json = null;
    if (!isJSON(value)) {
      if (isJSON(attribute.default)) {
        json = attribute.default;
      }
    } else {
      json = JSON.parse(value);
    }
    return json;
  };
  const [jsonValue, setJsonValue] = useState(getInitialValue);

  const { onChange } = useCMEditViewDataManager();
  const { formatMessage } = useIntl();

  return (
    <React.Fragment>
      {!attribute.technicalField ? (
        <React.Fragment>
          <AttributeLabelWithDescription
            attributeLabel={intlLabel?.defaultMessage}
            fullAttributeName={name}
          />
          <JSONInput
            value={jsonValue}
            onChange={(json) => {
              setJsonValue(json);
              onChange({ target: { name, value: JSON.stringify(json) } });
            }}
            minHeight={"16rem"}
            maxHeight={"32rem"}
            hint={"Currently only used by pagebuilder-frontend!"}
          />
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
};

export default Index;
