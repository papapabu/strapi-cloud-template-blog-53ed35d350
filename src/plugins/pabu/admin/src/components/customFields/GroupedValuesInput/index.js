import { FieldInput, FieldLabel } from "@strapi/design-system/Field";
import { Stack } from "@strapi/design-system/Stack";
import { useCMEditViewDataManager } from "@strapi/helper-plugin";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import styled from "styled-components";
import AttributeLabelWithDescription from "../AttributeLabelWithDescription";

const parseJSONSafely = (string) => {
  let obj = {};
  obj = JSON.parse(string);
  if (typeof obj === "string") {
    obj = JSON.parse(obj);
  }
  return obj;
};

const isJSON = (string) => {
  try {
    JSON.parse(string);
    return true;
  } catch {
    return false;
  }
};

const Index = ({ name, value, attribute, intlLabel }) => {
  // default without fields: 1, 2, 3, 4 + with given fieldLabels.
  // default without fieldLabels: field1, field2 field3, field4 + same as fieldLabels.
  // default without fields & without fieldLabels: mobile, tablet, desktop, wqhd. ("responsive values")
  const fieldLabels =
    attribute.fieldLabels && Array.isArray(attribute.fieldLabels)
      ? attribute.fieldLabels.slice(0, 4)
      : attribute.fields && attribute.fields.length > 0
      ? attribute.fields.slice(
          0,
          attribute.fields.length < 4 ? attribute.fields.length : 4
        )
      : ["mobile", "tablet", "desktop", "wqhd"];
  const fields =
    attribute.fields && Array.isArray(attribute.fields)
      ? attribute.fields.slice(0, 4)
      : attribute.fieldLabels
      ? ["1", "2", "3", "4"].slice(0, attribute.fieldLabels.length)
      : ["mobile", "tablet", "desktop", "wqhd"];

  const castToDataType = (inputValue) => {
    let parsedValue = inputValue;
    if (attribute.dataType) {
      if (typeof inputValue === "string" && inputValue !== "") {
        switch (attribute.dataType) {
          case "integer":
            parsedValue = parseInt(inputValue, 10);
            break;
          case "float":
            if (!inputValue.endsWith(".")) {
              parsedValue = parseFloat(inputValue);
            }
            break;
          default:
            break;
        }
        if (parsedValue === "NaN") {
          parsedValue = null;
        }
      }
    }
    return parsedValue;
  };

  const getInitialValues = () => {
    let existingValues = {};

    try {
      if (
        (value === null || value === "null") &&
        attribute &&
        attribute.default
      ) {
        // defaultValues:
        existingValues = JSON.parse(attribute.default);
      } else {
        // defaultValues // previouslySavedValues:
        existingValues = JSON.parse(value);
      }
      if (typeof existingValues === "string") {
        // JSON.parse() twice
        existingValues = JSON.parse(existingValues);
      }
    } catch (error) {
      console.log("getInitialValue: JSON-Parse-Error.");
      console.log("Initializing with field.default values...");
      existingValues =
        typeof attribute.default === "string"
          ? parseJSONSafely(attribute.default)
          : attribute.default;
    }
    // Note: Instead of spreading we try mapping by name, then by index.
    let initialValues = {};
    let existingValuesEntries = Object.entries(existingValues);
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (existingValues[field]) {
        // keys match
        initialValues[field] = castToDataType(existingValues[field]);
      } else {
        if (existingValuesEntries[i]) {
          // position match
          initialValues[field] = castToDataType(existingValuesEntries[i][1]);
        } else {
          // fallback
          initialValues[field] = null;
        }
      }
    }
    return initialValues;
  };

  const [groupedValues, setGroupedValues] = useState(getInitialValues);

  const { onChange } = useCMEditViewDataManager();
  const { formatMessage } = useIntl();

  useEffect(() => {
    if (!value || value === "null" || !isJSON(value)) {
      const stringifiedGroupedValues = JSON.stringify(groupedValues);
      console.log(
        `Prefill ${intlLabel?.defaultMessage} with defaultValues: ${stringifiedGroupedValues}`
      );
      onChange({
        target: {
          name,
          value: stringifiedGroupedValues,
        },
      });
    }
  }, [groupedValues, value]);

  const updateGroupedValue = (field, inputValue) => {
    let parsedInputValue = castToDataType(inputValue);

    // TODO: Do we want to sanitize grouped-values when a default value exists?
    // If so, we should store the initialValues (actually: correctly parsed attribute.default) and use these values as fallback.
    onChange({
      target: {
        name,
        value: JSON.stringify({
          ...groupedValues,
          [field]: parsedInputValue,
        }),
      },
    });

    setGroupedValues((prevState) => {
      return { ...prevState, [field]: parsedInputValue };
    });
  };

  return (
    <React.Fragment>
      <AttributeLabelWithDescription
        attributeLabel={intlLabel?.defaultMessage}
        fullAttributeName={name}
      />
      {groupedValues ? (
        <GroupedValuesStack spacing={1} className="grouped-values">
          {fields.map((field, i) => {
            return (
              <GroupedValueWrapper
                key={field + i}
                className={`grouped-value ${field}`}
              >
                <FieldLabel>{fieldLabels[i]}</FieldLabel>
                <FieldInput
                  label={fieldLabels[i]}
                  name={field}
                  aria-label={formatMessage({
                    id: "pabu.grouped-values.input.aria-label",
                    defaultMessage: `${field} of ${intlLabel?.defaultMessage} input`,
                  })}
                  type={
                    attribute.inputType === "integer" ||
                    attribute.inputType === "number"
                      ? "number"
                      : "string"
                  }
                  value={groupedValues[field]}
                  onChange={(e) => updateGroupedValue(field, e.target.value)}
                />
              </GroupedValueWrapper>
            );
          })}
        </GroupedValuesStack>
      ) : null}
    </React.Fragment>
  );
};

export default Index;

export const GroupedValuesStack = styled(Stack)`
  display: flex;
  flex-wrap: wrap;
  flex-direction: row !important;
`;

export const GroupedValueWrapper = styled("div")`
  flex: 25%;
  padding-left: 5px;
  padding-right: 5px;
  margin-top: 3px !important;
  margin-bottom: 0px;
`;
