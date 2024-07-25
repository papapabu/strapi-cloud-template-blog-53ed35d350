import styled from 'styled-components';

// Note: For the moment we don't want "empty" fields in the admin view. 
// Therefore we render null instead of a "hidden" field.
export const EqualHeightCustomFieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

export const FieldInputWrapper = styled.div`
  margin-top: 0.1rem; /* auto */
`;