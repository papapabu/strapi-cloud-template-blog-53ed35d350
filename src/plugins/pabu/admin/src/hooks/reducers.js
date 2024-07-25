import produce from "immer";
import pluginId from "../pluginId";
import { RESOLVE_PB_SETTINGS } from "./constants";

export const PABU_STORE_REDUCER_NAME = `${pluginId}_settingsStore`;
export const initialState = {
  isLoading: true,
  str: [],
  cesstr: [],
};

const settingsStoreReducer = produce((state = initialState, action = {}) => {
  switch (action.type) {
    case RESOLVE_PB_SETTINGS: {
      state.isLoading = false;
      state.str = action.str;
      state.cesstr = action.cesstr;
      return state;
    }
    default: {
      return state;
    }
  }
});

const reducers = {
  [PABU_STORE_REDUCER_NAME]: settingsStoreReducer,
};

export default reducers;
