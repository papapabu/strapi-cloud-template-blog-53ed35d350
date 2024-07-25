import { Flex, Link } from "@strapi/design-system";
import {
  MultiSelect,
  MultiSelectOption,
  SingleSelect,
  SingleSelectOption,
} from "@strapi/design-system/Select";
import { useCMEditViewDataManager } from "@strapi/helper-plugin";
import { Trash } from "@strapi/icons";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import AttributeLabelWithDescription from "../AttributeLabelWithDescription";
import { PABU_STORE_REDUCER_NAME } from "../../../hooks/reducers";

const isJSON = (string) => {
  try {
    JSON.parse(string);
    return true;
  } catch {
    return false;
  }
};

const Index = ({ name, value, attribute, intlLabel }) => {
  const str = useSelector((state) => state[PABU_STORE_REDUCER_NAME].str);
  const cesstr = useSelector((state) => state[PABU_STORE_REDUCER_NAME].cesstr);
  const { onChange } = useCMEditViewDataManager();

  let valueObject = null;
  if (!value || value === "null" || !isJSON(value)) {
    console.log(`Prefill ${intlLabel?.defaultMessage} with defaultValues: []`);
    valueObject = {
      store: attribute.store,
      storeType: attribute.storeType,
      values: [],
    };
    onChange({
      target: {
        name,
        value: JSON.stringify(valueObject),
      },
    });
  } else {
    valueObject = JSON.parse(value);
  }

  const [storeValues, setStoreValues] = useState(valueObject.values ?? []);

  const handleChange = (values) => {
    setStoreValues(values);
    valueObject.values = values.map(Number).sort((a, b) => a - b);
    valueObject.store = attribute.store;
    valueObject.storeType = attribute.storeType;

    onChange({
      target: { name, value: JSON.stringify(valueObject) },
    });
  };

  const availableSettings = (store, storeType) => {
    // optionalDefault (id: 0) is added to array of availableSettings in MultiSelect-Dropdown.
    let optionalDefault = [];
    if (!attribute.isOneToOne) {
      optionalDefault.push({
        // DEFAULT_AS_SELECTABLE_VALUE
        id: -1,
        name: "default (none is allowed)",
        type: storeType,
        // DEFAULT_AS_SELECTABLE_VALUE
        setting: [{ id: -1 }],
      });
    }
    if (store === "str") {
      return [
        ...optionalDefault,
        ...str.filter((setting) => setting.type === storeType),
      ];
    } else if (store === "cesstr") {
      return [
        ...optionalDefault,
        ...cesstr.filter((setting) => setting.type === storeType),
      ];
    }
    console.error(`store ${store} not exist`);
    return [];
  };

  const StyledLink = styled(Link)`
    && {
      margin-left: 0.5rem;
      margin-top: 0.1rem;
      position: absolute !important;
    }

    &:hover {
      cursor: pointer;
    }

    span {
      font-size: 0.75rem !important;
    }

    svg {
      width: 0.85rem !important;
      height: 0.85rem !important;
    }
  `;

  const StyledParagraph = styled.p`
    color: ${({ theme }) => theme.colors.neutral800};
  `;

  const selectOptions = availableSettings(attribute.store, attribute.storeType);

  return (
    <React.Fragment>
      <AttributeLabelWithDescription
        storePrefix={attribute.store ? attribute.store : ""}
        attributeLabel={intlLabel?.defaultMessage}
        fullAttributeName={name}
      />
      {attribute.isOneToOne && (
        <SingleSelect
          placeholder={selectOptions.length === 0 && "No entries"}
          value={storeValues.length > 0 ? storeValues[0] + "" : null}
          onChange={(selectedValue) => {
            handleChange(selectedValue ? [selectedValue] : []);
          }}
        >
          {selectOptions.map((setting) => {
            return (
              <SingleSelectOption
                startIcon={
                  setting.setting[0] &&
                  setting.type === "color" && (
                    <Flex
                      as="span"
                      height={3}
                      borderColor={"darkgray"}
                      background={
                        setting.setting[0].color
                          ? setting.setting[0].color
                          : "transparent"
                      }
                      hasRadius={true}
                      shrink={0}
                      width={3}
                      marginRight="-3px"
                    />
                  )
                }
                value={setting.id}
              >
                {setting.name}
              </SingleSelectOption>
            );
          })}
        </SingleSelect>
      )}
      {!attribute.isOneToOne && (
        <MultiSelect
          onClear={() => {
            handleChange([]);
          }}
          value={storeValues.map(String)}
          onChange={handleChange}
          placeholder={selectOptions.length === 0 && "No entries"}
          withTags
        >
          {selectOptions.map((setting) => {
            return (
              <MultiSelectOption
                startIcon={
                  setting.setting[0] &&
                  setting.type === "color" && (
                    <Flex
                      as="span"
                      height={3}
                      borderColor={"darkgray"}
                      background={
                        setting.setting[0].color
                          ? setting.setting[0].color
                          : "transparent"
                      }
                      hasRadius={true}
                      shrink={0}
                      width={3}
                      marginRight="-3px"
                    />
                  )
                }
                value={setting.id}
              >
                {setting.name}
              </MultiSelectOption>
            );
          })}
        </MultiSelect>
      )}
      {/* Shows element ids that do not exist anymore.*/}
      {selectOptions &&
      valueObject.values.filter(
        (storedValue) =>
          !selectOptions.find((options) => options.id === storedValue)
      ).length > 0 ? (
        <React.Fragment>
          <StyledParagraph>
            <strong
              style={{ color: "red", fontWeight: "600", fontSize: "0.75rem" }}
            >
              {`Includes deleted element(s): ${valueObject.values
                .filter(
                  (storedValue) =>
                    !selectOptions.find((options) => options.id === storedValue)
                )
                .join(", ")}`}
            </strong>
            <StyledLink
              startIcon={<Trash />}
              // Removes deleted elements from valueObject.values
              onClick={() =>
                handleChange(
                  valueObject.values.filter(
                    (item) =>
                      !valueObject.values
                        .filter(
                          (storedValue) =>
                            !selectOptions.find(
                              (options) => options.id === storedValue
                            )
                        )
                        .includes(item)
                  )
                )
              }
            >
              Remove deleted element(s)
            </StyledLink>
          </StyledParagraph>
        </React.Fragment>
      ) : null}
      {/* Shows "One entry is enforced" hint.*/}
      {selectOptions &&
      !attribute.isOneToOne &&
      valueObject.values.length === 1 ? (
        <React.Fragment>
          <StyledParagraph>
            <strong style={{ fontSize: "0.75rem" }}>
              The selected option will be
              <span style={{ fontWeight: 600 }}> enforced </span>
              in all elements.
            </strong>
          </StyledParagraph>
        </React.Fragment>
      ) : null}
      {/* Shows "default is allowed" hint.*/}
      {selectOptions &&
      !attribute.isOneToOne &&
      valueObject.values.length > 1 &&
      // DEFAULT_AS_SELECTABLE_VALUE
      valueObject.values.indexOf(-1) !== -1 ? (
        <React.Fragment>
          <StyledParagraph>
            <strong style={{ fontSize: "0.75rem" }}>
              {`The selected option(s) are optional. None of them ("default") is also allowed.`}
            </strong>
          </StyledParagraph>
        </React.Fragment>
      ) : null}
    </React.Fragment>
  );
};

export default Index;
