import type { ReactElement } from "react";
import { ID } from "../constants";
import { Image } from "@owlbear-rodeo/sdk";

export type Role = "GM" | "PLAYER" | undefined;

export type CauseTrigger = "collision" | "appears" | "disappears";
export type EffectAction = "lock" | "unlock" | "appear" | "disappear"
export type CausalityStatus = "pending" | "complete";

export type TokenData = {
  tokenID: string;
  name: string;
  label: string;
  imageUrl: string;
}

export type CauseTokenData = TokenData & {
  trigger?: CauseTrigger;
  status: CausalityStatus;
}

export type EffectTokenData = TokenData & {
  action?: EffectAction;
  effectId: string;
}

export type CausalityData = {
  id: string;
  cause?: CauseTokenData;
  effects?: EffectTokenData[];
}

export type CausalityTokenMetaData = {
  [ID]: {
    isCausalityToken: boolean;
    causalities?: CausalityData[];
  }
}

export type CausalityToken = Image & {
  metadata: Image["metadata"] & CausalityTokenMetaData
}

export type AppContextProps = {
  tokens: CausalityToken[];
}

export type AppProviderProps = {
  children: ReactElement | ReactElement[];
};

export type CausalityManagerProps = {
  tokens: CausalityToken[];
}

export type TokenPoolProps = {
  tokens: CausalityToken[];
}

export type TokenProps = {
  token: CausalityToken;
  isOverlay?: boolean;
}

export type DraggableProps = { 
  children: ReactElement | ReactElement[];
  id: string;
  token: CausalityToken;
}

export type DroppableProps = { 
  children: ReactElement | ReactElement[];
  id: string;
}
