import { useEffect, useMemo } from "react";
import {
  useAddonState,
  useParameter,
  useStorybookApi,
} from "@storybook/manager-api";
import {
  ADDON_ID_FOR_PARAMETERS,
  DEFAULT_ADDON_PARAMETERS,
  DEFAULT_ADDON_STATE,
  PANEL_ID,
  SNIPPET_SHARE_QUERY_ID,
} from "@/consts";
import { Code, PlaygroundParameters, PlaygroundState } from "@/types";
import { decodeAndDecompress, loadCodeFromStorage } from "@/utils";

const useInitialCode = () => {
  const { getQueryParam } = useStorybookApi();
  const [state, setState] = useAddonState<PlaygroundState>(
    PANEL_ID,
    DEFAULT_ADDON_STATE
  );
  const { hasInitialCodeLoaded } = state;
  const { introCode, share: enableShare } = useParameter<PlaygroundParameters>(
    ADDON_ID_FOR_PARAMETERS,
    DEFAULT_ADDON_PARAMETERS
  );

  const sharedCode = useMemo(() => {
    const shared = getQueryParam(SNIPPET_SHARE_QUERY_ID);
    if (!shared) {
      return null;
    }
    return decodeAndDecompress(shared);
  }, [getQueryParam]);

  const persistedCode = useMemo(() => {
    return loadCodeFromStorage();
  }, []);

  const initialCodeToSet = useMemo(() => {
    if (enableShare && hasValidCode(sharedCode)) {
      return sharedCode;
    }
    if (hasValidCode(persistedCode)) {
      return persistedCode;
    }
    if (hasValidCode(introCode)) {
      return introCode;
    }
    return DEFAULT_ADDON_STATE.code;
  }, [enableShare, sharedCode, persistedCode, introCode]);

  useEffect(() => {
    if (hasInitialCodeLoaded || introCode === null) {
      return;
    }

    setState((state) => ({
      ...state,
      code: initialCodeToSet,
      hasInitialCodeLoaded: true,
    }));
  }, [hasInitialCodeLoaded, introCode, setState, initialCodeToSet]);
};

function hasValidCode(code: Code) {
  return code && Object.values(code).some(Boolean);
}

export default useInitialCode;
