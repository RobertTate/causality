import type { ReactElement } from "react";
import { ID } from "../constants";
import { Image } from "@owlbear-rodeo/sdk";

export type Role = "GM" | "PLAYER" | undefined;

export type CauseTrigger = "collision" | "appears" | "disappears" | "";
export type EffectAction = "lock" | "unlock" | "appear" | "disappear" | "broadcast" | ""
export type CausalityStatus = "Pending" | "Complete";

export type TokenData = {
  tokenId: string;
  causalityId: string;
  name: string;
  label: string;
  imageUrl: string;
}

export type CauseData = TokenData & {
  trigger: CauseTrigger;
  status: CausalityStatus;
  delay: string;
  isCollided: boolean;
}

export type Destination = "REMOTE" | "LOCAL" | "ALL";

export type BroadCast = {
  channel: string;
  data: unknown;
  destination: Destination;
}

export type EffectData = TokenData & {
  action: EffectAction;
  broadcast?: BroadCast;
  effectId: string;
}

export type CausalityData = {
  id: string;
  cause?: CauseData;
  effects?: EffectData[];
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

export type EffectDialogConfig = {
  open: boolean;
  cData?: CausalityData;
  effect?: EffectData;
  activeEffectId?: string;
}

export type AppContextProps = {
  tokens: CausalityToken[];
  collisionTokensRef: React.RefObject<CausalityToken[]>;
  effectDialog: EffectDialogConfig;
  updateEffectDialog: (effectDialog: EffectDialogConfig) => void;
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

export type SortableProps = {
  children: ReactElement | ReactElement[];
  id: string;
}

export type EffectProps = {
  cData: CausalityData;
  effect: EffectData;
}

export type BroadcastInputProps = {
  cData: CausalityData;
  effect: EffectData;
}
