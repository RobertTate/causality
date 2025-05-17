import debounce from "lodash/debounce";
import { useMemo, useState } from "react";

import { updateEffectTokenData } from "../functions";
import type { BroadCast, BroadcastInputProps, Destination } from "../types";
import styles from "./BroadcastInput.module.css";

export const BroadcastInput = ({ cData, effect }: BroadcastInputProps) => {
  const [channel, setChannel] = useState("");
  const [dataValue, setDataValue] = useState("");
  const [dataError, setDataError] = useState<string | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);

  const debouncedUpdateChannel = useMemo(
    () =>
      debounce((newValue: string) => {
        console.log("update");
        updateEffectTokenData(
          cData.id,
          effect.tokenId,
          effect.effectId,
          "broadcast",
          {
            channel: newValue,
          } as BroadCast,
        );
      }, 500),
    [cData.id, effect.tokenId, effect.effectId],
  );

  const handleChannelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setChannel(newValue);
    debouncedUpdateChannel(newValue);
  };

  const debouncedUpdateData = useMemo(
    () =>
      debounce((newValue: string) => {
        console.log("update json");
        updateEffectTokenData(
          cData.id,
          effect.tokenId,
          effect.effectId,
          "broadcast",
          {
            data: newValue,
          } as BroadCast,
        );
      }, 500),
    [cData.id, effect.tokenId, effect.effectId],
  );

  const handleDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setDataValue(newValue);
    try {
      JSON.parse(newValue);
      setDataError(null);
      debouncedUpdateData(newValue);
    } catch (err: any) {
      setDataError(err.message);
    }
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value as Destination;
    setDestination(newValue);
    console.log("update");
    updateEffectTokenData(
      cData.id,
      effect.tokenId,
      effect.effectId,
      "broadcast",
      {
        destination: newValue,
      } as BroadCast,
    );
  };

  return (
    <>
      <p className={styles["broadcast-disclaimer"]}>
        See the{" "}
        <a
          target="_blank"
          href="https://docs.owlbear.rodeo/extensions/apis/broadcast/"
        >
          Broadcast API DOCS
        </a>{" "}
        for more info.
      </p>
      <div className={styles["broadcast-input-channel-display"]}>
        <p>Channel:</p>
        <input
          type="text"
          name="broadcast-channel-input"
          placeholder="rodeo.owlbear.example"
          value={channel || effect?.broadcast?.channel}
          onChange={handleChannelChange}
        />
      </div>
      <div className={styles["broadcast-input-json-container"]}>
        <p>Data:</p>
        <textarea
          value={dataValue || (effect?.broadcast?.data as string)}
          placeholder={'{\n  "key": "value"\n}'}
          onChange={handleDataChange}
          rows={6}
          style={{
            width: "100%",
            border: dataError ? "2px solid red" : "1px solid #ccc",
            fontFamily: "monospace",
            fontSize: "12px",
          }}
        />
        {dataError ? (
          <p style={{ color: "red", fontSize: "12px" }}>
            Invalid JSON: {dataError}
          </p>
        ) : (
          <p style={{ color: "green", fontSize: "12px" }}>✔</p>
        )}
      </div>
      <div className={styles["broadcast-input-destination-display"]}>
        <p>Destination:</p>
        <select
          name="broadcast destination options"
          value={destination || effect?.broadcast?.destination}
          onChange={handleDestinationChange}
        >
          <option value="REMOTE">Remote &#40;Default&#x29;</option>
          <option value="LOCAL">Local</option>
          <option value="ALL">All</option>
        </select>
      </div>
    </>
  );
};
