import { useFetchClient } from "@strapi/helper-plugin";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RESOLVE_PB_SETTINGS } from "./constants";
import { PABU_STORE_REDUCER_NAME } from "./reducers";

const useSettingsStore = () => {
  const dispatch = useDispatch();
  const str = useSelector((state) => state[PABU_STORE_REDUCER_NAME].str);
  const cesstr = useSelector((state) => state[PABU_STORE_REDUCER_NAME].cesstr);
  const isLoading = useSelector(
    (state) => state[PABU_STORE_REDUCER_NAME].isLoading
  );
  const { get } = useFetchClient();

  useEffect(() => {
    get("/pabu/store/all")
      .then(({ data }) => {
        dispatch({
          type: RESOLVE_PB_SETTINGS,
          str: data.str ?? [],
          cesstr: data.cesstr ?? [],
        });
      })
      .catch((err) => {
        console.error("can't fetch settings from store", err);
      });
  }, [dispatch, get]);

  return { str, cesstr, isLoading };
};
export default useSettingsStore;
