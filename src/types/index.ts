import { Image } from "@owlbear-rodeo/sdk";
import type { ReactElement } from "react";
import React from "react";

import { ID } from "../constants";

export type Role = "GM" | "PLAYER" | undefined;

export type CauseTrigger =
  | "collision"
  | "covers"
  | "appears"
  | "disappears"
  | "";
export type EffectAction =
  | "lock"
  | "unlock"
  | "appear"
  | "disappear"
  | "broadcast"
  | "";
export type CausalityStatus = "Pending" | "Complete";

export type Destination = "REMOTE" | "LOCAL" | "ALL";
export type CauseOperator = "AND" | "OR";

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

export type Effect = TokenData & {
  action: EffectAction;
  broadcast?: Broadcast;
  effectId: string;
};

export type InstigatorEffect = Effect & {
  isInstigator?: boolean;
  originalCauseTokenId?: string;
};

export type TokenToTriggerCollision = {
  name: string;
  label: string;
  id: string;
  imageUrl: string;
};

export type Cause = TokenData & {
  trigger: CauseTrigger;
  status: CausalityStatus;
  /**
   * @deprecated - `delay` has moved to the `Causality` type. Need it here for a while so that it's not a breaking change, however.
   */
  delay?: string;
  timestamp: string;
  causeId: string;
  isCollided: boolean;
  tokenToTriggerCollision?: TokenToTriggerCollision;
  layerToTriggerCollision?: "same" | "any";
  instigatorEffects?: InstigatorEffect[];
  operator?: CauseOperator;
};

export type Causality = {
  id: string;
  name: string;
  tokenId: string;
  timestamp: string;
  delay: string;
  loopsArePaused?: boolean;
  compact?: boolean;
  causes?: Cause[];
  effects?: Effect[];
  isEditNameModeOn?: boolean;
  causalityIdsToReset: string[];
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
  causality?: Causality;
  effect?: Effect;
  activeEffectId?: string;
};

export type TriggeringTokenForCollisionDialogConfig = {
  open: boolean;
  cause?: Cause;
};

export type CausalityOnCompleteDialogConfig = {
  open: boolean;
  causalityId?: string;
};

export type AppContextProps = {
  tokens: CausalityToken[];
  updateTokens: (tokens: CausalityToken[]) => void;
  causalities: Causality[];
  updateCausalities: (causalities: Causality[]) => void;
  collisionTokensRef: React.RefObject<CausalityToken[]>;
  effectDialog: EffectDialogConfig;
  updateEffectDialog: (effectDialog: EffectDialogConfig) => void;
  triggeringTokenForCollisionDialog: TriggeringTokenForCollisionDialogConfig;
  updateTriggeringTokenForCollisionDialog: (
    triggeringTokenForCollisionDialog: TriggeringTokenForCollisionDialogConfig,
  ) => void;
  causalityOnCompleteDialog: CausalityOnCompleteDialogConfig;
  updateCausalityOnCompleteDialog: (
    causalityOnCompleteDialog: CausalityOnCompleteDialogConfig,
  ) => void;
};

export type AppProviderProps = {
  children: ReactElement | ReactElement[];
};

export type CausalityManagerProps = {
  tokens: CausalityToken[];
};

export type CausalitiesProps = {
  causalities: Causality[];
  height: number;
};

export type TokenPoolProps = {
  height: number;
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

export type CauseProps = {
  index: number;
  causality: Causality;
  cause: Cause;
};

export type EffectProps = {
  causality: Causality;
  effect: Effect | InstigatorEffect;
  instigatorEffects: InstigatorEffect[];
};

export type BroadcastInputProps = {
  causality: Causality;
  effect: Effect;
};

export type CausalityLog = {
  causes: Partial<Cause>[];
  effects: Partial<Effect>[];
  logID: string;
};

export type OperatorSwitchProps = {
  cause: Cause;
};

export type BoundingBoxObject = {
  grid: {
    dpi: number;
    offset: {
      x: number;
      y: number;
    };
  };
  scale: {
    x: number;
    y: number;
  };
  rotation: number;
  image: {
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
  };
};
