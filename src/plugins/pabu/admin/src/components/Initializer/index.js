/**
 *
 * Initializer
 *
 */

import PropTypes from "prop-types";
import { useEffect, useRef } from "react";
import useSettingsStore from "../../hooks/useSettingsStore";
import pluginId from "../../pluginId";

const Initializer = ({ setPlugin }) => {
  const { isLoading } = useSettingsStore();
  const ref = useRef();
  ref.current = setPlugin;

  useEffect(() => {
    if (!isLoading) {
      ref.current(pluginId);
    }
  }, [isLoading]);

  return null;
};

Initializer.propTypes = {
  setPlugin: PropTypes.func.isRequired,
};

export default Initializer;
