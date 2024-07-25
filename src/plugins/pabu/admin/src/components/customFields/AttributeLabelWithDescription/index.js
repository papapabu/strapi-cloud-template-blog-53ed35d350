import { FieldLabel } from "@strapi/design-system/Field";
import React from "react";
import styled from 'styled-components';
import fieldDescriptions from "../../../translations/fieldDescriptions-en.json";
import fieldLabels from "../../../translations/fieldLabels-en.json";

const StyledParagraph = styled.p`
  font-size: 0.75rem;
  line-height: 1.33;
  color: ${({ theme }) => theme.colors.neutral800};
  margin-bottom: 0.2rem;
`;

const GapFiller = styled.div`
  margin-top: 0.33rem;
`;

const getFieldInfo = (type, attributeLabel, storePrefix) => {
  let label = "";
  const translationFile =
    type === "description" ? fieldDescriptions : fieldLabels;
  // Note: store-values with store: cesstr can have their own fieldLabels / fieldDescriptions.
  // If no cesstr...-fieldLabel / Description exists, the attributeLabel is used as key.
  label =
    translationFile[
      storePrefix && storePrefix === "cesstr"
        ? storePrefix + attributeLabel
        : attributeLabel
    ];
  if (type === "label" && !label) {
    label = attributeLabel;
  }
  return label;
};

const Index = ({ attributeLabel, fullAttributeName, storePrefix = "" }) => {
  return (
    <React.Fragment>
      <FieldLabel
        className={attributeLabel}
        data-attribute-name={fullAttributeName}
      >
        {getFieldInfo("label", attributeLabel, storePrefix)}
      </FieldLabel>
      {getFieldInfo("description", attributeLabel, storePrefix) ? (
        <StyledParagraph className="attribute-description">
          {getFieldInfo("description", attributeLabel, storePrefix)}
        </StyledParagraph>
      ) : (
        <GapFiller />
      )}
    </React.Fragment>
  );
};

export default Index;
