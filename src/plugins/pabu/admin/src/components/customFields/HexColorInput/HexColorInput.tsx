import {
  BaseButton,
  Box,
  Field,
  FieldError,
  FieldHint,
  FieldInput,
  FieldLabel,
  Flex,
  FocusTrap,
  Popover,
  Typography,
  // @ts-ignore
} from "@strapi/design-system";
import { CarretDown } from "@strapi/icons";
import React, { useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import { MessageDescriptor, useIntl } from "react-intl";

import { useComposedRefs } from "../../../hooks/useComposeRefs";
// @ts-ignore
import styled from "styled-components";

const ColorPreview: any = styled.div`
  border-radius: 50%;
  width: 20px;
  height: 20px;
  margin-right: 10px;
  background-color: ${(props: any) => props.color};
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const ColorPicker: any = styled(HexColorPicker)`
  && {
    width: 100%;
    aspect-ratio: 1.5;
  }

  .react-colorful__pointer {
    width: ${({ theme }: any) => theme.spaces[3]};
    height: ${({ theme }: any) => theme.spaces[3]};
  }

  .react-colorful__saturation {
    border-radius: ${({ theme }: any) => theme.spaces[1]};
    border-bottom: none;
  }

  .react-colorful__hue {
    border-radius: 10px;
    height: ${({ theme }: any) => theme.spaces[3]};
    margin-top: ${({ theme }: any) => theme.spaces[2]};
  }
`;

const ColorPickerToggle: any = styled(BaseButton)`
  display: flex;
  justify-content: space-between;
  align-items: center;

  svg {
    width: ${({ theme }: any) => theme.spaces[2]};
    height: ${({ theme }: any) => theme.spaces[2]};
  }

  svg > path {
    fill: ${({ theme }: any) => theme.colors.neutral500};
    justify-self: flex-end;
  }
`;

const ColorPickerPopover: any = styled(Popover)`
  padding: ${({ theme }: any) => theme.spaces[2]};
  min-height: 270px;
`;
/**
 * TODO: A lot of these props should extend `FieldProps`
 */
interface HexColorInputProps {
  intlLabel: MessageDescriptor;
  /**
   * TODO: this should be extended from `FieldInputProps['onChange']
   * but that conflicts with it's secondary usage in `HexColorPicker`
   */
  onChange: (event: {
    target: { name: string; value: string; type: string };
  }) => void;
  attribute: { type: string; ["default"]: string; [key: string]: unknown };
  name: string;
  description?: MessageDescriptor;
  disabled?: boolean;
  error?: string;
  labelAction?: React.ReactNode;
  required?: boolean;
  value?: string;
}

export const HexColorInput = React.forwardRef<
  HTMLButtonElement,
  HexColorInputProps
>(
  (
    {
      attribute,
      description,
      disabled = false,
      error,
      intlLabel,
      labelAction,
      name,
      onChange,
      required = false,
      value = "",
    },
    forwardedRef
  ) => {
    const [showColorPicker, setShowColorPicker] = React.useState(false);
    const hexColorButtonRef = React.useRef<HTMLButtonElement>(null!);
    const { formatMessage } = useIntl();
    const color = value || "#000000";

    const handleBlur: React.FocusEventHandler<HTMLDivElement> = (e) => {
      e.preventDefault();

      if (!e.currentTarget.contains(e.relatedTarget)) {
        setShowColorPicker(false);
      }
    };

    useEffect(() => {
      if (!value && attribute && attribute.default) {
        onChange({
          target: { name, value: attribute.default, type: attribute.type },
        });
      }
    }, [value]);

    const composedRefs = useComposedRefs(forwardedRef, hexColorButtonRef);

    return (
      <Field
        name={name}
        id={name}
        // GenericInput calls formatMessage and returns a string for the error
        error={error}
        hint={description && formatMessage(description)}
        required={required}
      >
        <Flex direction="column" alignItems="stretch" gap={1}>
          <FieldLabel action={labelAction}>
            {formatMessage(intlLabel)}
          </FieldLabel>
          <ColorPickerToggle
            ref={composedRefs}
            aria-label={formatMessage({
              id: "pabu.hex-color.toggle.aria-label",
              defaultMessage: "Color picker toggle",
            })}
            aria-controls="color-picker-value"
            aria-haspopup="dialog"
            aria-expanded={showColorPicker}
            aria-disabled={disabled}
            disabled={disabled}
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            <Flex>
              <ColorPreview color={color} />
              <Typography
                style={{ textTransform: "uppercase" }}
                textColor={value ? undefined : "neutral600"}
                variant="omega"
              >
                {color}
              </Typography>
            </Flex>
            <CarretDown aria-hidden />
          </ColorPickerToggle>
          {showColorPicker && (
            <ColorPickerPopover
              onBlur={handleBlur}
              role="dialog"
              source={hexColorButtonRef}
              spacing={4}
            >
              <FocusTrap onEscape={() => setShowColorPicker(false)}>
                <ColorPicker
                  color={color}
                  onChange={(hexValue: any) =>
                    onChange({
                      target: { name, value: hexValue, type: attribute.type },
                    })
                  }
                />
                <Flex paddingTop={3} paddingLeft={4} justifyContent="flex-end">
                  <Box paddingRight={2}>
                    <Typography
                      variant="omega"
                      as="label"
                      textColor="neutral600"
                    >
                      {formatMessage({
                        id: "pabu.hex-color.input.format",
                        defaultMessage: "HEX",
                      })}
                    </Typography>
                  </Box>
                  <FieldInput
                    id="color-picker-value"
                    aria-label={formatMessage({
                      id: "pabu.hex-color.input.aria-label",
                      defaultMessage: "Color picker input",
                    })}
                    style={{ textTransform: "uppercase" }}
                    value={value}
                    placeholder="#000000"
                    onChange={onChange}
                  />
                </Flex>
              </FocusTrap>
            </ColorPickerPopover>
          )}
          <FieldHint />
          <FieldError />
        </Flex>
      </Field>
    );
  }
);
