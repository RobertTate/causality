import { Image } from "@owlbear-rodeo/sdk";
import type { ReactElement } from "react";

import { ID } from "../constants";

export type Role = "GM" | "PLAYER" | undefined;

export type CauseTrigger = "collision" | "appears" | "disappears" | "";
export type EffectAction =
  | "lock"
  | "unlock"
  | "appear"
  | "disappear"
  | "broadcast"
  | "";
export type CausalityStatus = "Pending" | "Complete";

export type Destination = "REMOTE" | "LOCAL" | "ALL";

export type Broadcast = {
  channel: string;
  data: unknown;
  destination: Destination;
};

export type TokenData = {
  tokenId: string;
  causalityId: string;
  name: string;
  label: string;
  imageUrl: string;
};

export type Cause = TokenData & {
  trigger: CauseTrigger;
  status: CausalityStatus;
  delay: string;
  isCollided: boolean;
};

export type Effect = TokenData & {
  action: EffectAction;
  broadcast?: Broadcast;
  effectId: string;
};

export type Causality = {
  id: string;
  timestamp: string;
  cause?: Cause;
  effects?: Effect[];
};

export type CausalityTokenMetaData = {
  [ID]: {
    isCausalityToken: boolean;
    causalities?: Causality[];
  };
};

export type CausalityToken = Image & {
  metadata: Image["metadata"] & CausalityTokenMetaData;
};

export type EffectDialogConfig = {
  open: boolean;
  cData?: Causality;
  effect?: Effect;
  activeEffectId?: string;
};

export type AppContextProps = {
  tokens: CausalityToken[];
  collisionTokensRef: React.RefObject<CausalityToken[]>;
  effectDialog: EffectDialogConfig;
  updateEffectDialog: (effectDialog: EffectDialogConfig) => void;
};

export type AppProviderProps = {
  children: ReactElement | ReactElement[];
};

export type CausalityManagerProps = {
  tokens: CausalityToken[];
};

export type TokenPoolProps = {
  tokens: CausalityToken[];
};

export type TokenProps = {
  token: CausalityToken;
  isOverlay?: boolean;
};

export type DraggableProps = {
  children: ReactElement | ReactElement[];
  id: string;
  token: CausalityToken;
};

export type DroppableProps = {
  children: ReactElement | ReactElement[];
  id: string;
};

export type SortableProps = {
  children: ReactElement | ReactElement[];
  id: string;
};

export type EffectProps = {
  cData: Causality;
  effect: Effect;
};

export type BroadcastInputProps = {
  cData: Causality;
  effect: Effect;
};
