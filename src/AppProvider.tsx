import { useCallback, useRef, useState } from "react";
import { AppContext } from "./AppContext";
import type {
  AppContextProps,
  AppProviderProps,
  Causality,
  CausalityToken,
  TriggeringTokenForCollisionDialogConfig,
  EffectDialogConfig,
  CausalityOnCompleteDialogConfig,
} from "./types";

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [tokens, setTokens] = useState<CausalityToken[]>([]);
  const updateTokens = useCallback((tokens: CausalityToken[]) => {
    setTokens(tokens);
  }, []);

  const [causalities, setCausalities] = useState<Causality[]>([]);
  const updateCausalities = useCallback((causalities: Causality[]) => {
    setCausalities(causalities);
  }, []);

  const collisionTokensRef = useRef<CausalityToken[]>([]);
  const [effectDialog, setEffectDialog] = useState<EffectDialogConfig>({
    open: false,
  });

  const updateEffectDialog = useCallback((effectDialog: EffectDialogConfig) => {
    setEffectDialog((prev) => {
      return {
        ...prev,
        ...effectDialog,
      };
    });
  }, []);

  const [triggeringTokenForCollisionDialog, setTriggeringTokenForCollisionDialog] =
    useState<TriggeringTokenForCollisionDialogConfig>({
      open: false,
    });

  const updateTriggeringTokenForCollisionDialog = useCallback(
    (triggeringTokenForCollisionDialog: TriggeringTokenForCollisionDialogConfig) => {
      setTriggeringTokenForCollisionDialog((prev) => {
        return {
          ...prev,
          ...triggeringTokenForCollisionDialog,
        };
      });
    },
    [],
  );

  const [causalityOnCompleteDialog, setCausalityOnCompleteDialog] = useState<CausalityOnCompleteDialogConfig>({
    open: false,
  });

  const updateCausalityOnCompleteDialog = useCallback(
    (causalityOnCompleteDialog: CausalityOnCompleteDialogConfig) => {
      setCausalityOnCompleteDialog((prev) => {
        return {
          ...prev,
          ...causalityOnCompleteDialog
        }
      })
    }, [],
  )

  const store: AppContextProps = {
    tokens,
    updateTokens,
    causalities,
    updateCausalities,
    collisionTokensRef,
    effectDialog,
    updateEffectDialog,
    triggeringTokenForCollisionDialog,
    updateTriggeringTokenForCollisionDialog,
    causalityOnCompleteDialog,
    updateCausalityOnCompleteDialog,
  };

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
};
