import { useCMEditViewDataManager } from "@strapi/helper-plugin";
import React, { useEffect } from "react";
import useSettingsStore from "../../hooks/useSettingsStore";
import EmailTestButton from "./emailTestButton";

/**
 * ContentManager
 * General injectContentManagerComponent
 */
export let storeEntries = null;

const ContentManager = () => {
  const { slug } = useCMEditViewDataManager();
  useSettingsStore();

  const configType =
    slug === "plugin::pabu.glbl"
      ? "global"
      : slug === "plugin::pabu.setting"
      ? "settings"
      : null;

  useEffect(() => {
    if (configType) {
      // While we use relation storeEntries we apply styling like this.
      const storeRelations = document.querySelectorAll(
        'a[href*="plugin::pabu.str/"]'
      );
      for (let i = 0; i < storeRelations.length; i++) {
        // Smaller selectedRelationButton & preventing potential misclicks.
        // let storeRelationsStyle = `padding: 1px 16px !important; pointer-events: none;`;
        let storeRelationsStyle = `pointer-events: none;`;
        if (
          storeRelations[i].innerText &&
          storeRelations[i].innerText.startsWith("color:")
        ) {
          const color = `#${
            storeRelations[i].innerText.split("#")[
              storeRelations[i].innerText.split("#").length - 1
            ]
          }`;
          // Coloring of color-Relations.
          storeRelationsStyle += `background: linear-gradient(90deg, #fff 75%, ${color} 85%, ${color} 100%);`;
        }
        // Apply style
        storeRelations[
          i
        ].parentNode?.parentNode?.parentNode?.parentNode?.parentNode?.setAttribute(
          "style",
          storeRelationsStyle
        );
      }
    }
  });

  return (
    <React.Fragment>
      <EmailTestButton />
      <style>
        {`
          /* contentManager Styles */
          /* (Re-)enables clickable Remove-Button */
          button[aria-label="Remove"] {
            pointer-events: auto !important;
          }
          /* Different stroke-color for Remove-Button */
          button[aria-label="Remove"] svg {
            stroke: #ee5e52;
            stroke-width: 2px;
          }
        `}
      </style>
    </React.Fragment>
  );
};

export default ContentManager;
