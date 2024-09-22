/* eslint-disable @typescript-eslint/no-empty-object-type */

declare interface Navigator extends NavigatorNetworkInformation {}
declare interface WorkerNavigator extends NavigatorNetworkInformation {}

declare interface NavigatorNetworkInformation {
  readonly connection?: NetworkInformation;
}

type ConnectionType =
  | "bluetooth"
  | "cellular"
  | "ethernet"
  | "mixed"
  | "none"
  | "wifi"
  | "wimax"
  | "other"
  | "unknown";

type EffectiveConnectionType = "2g" | "3g" | "4g" | "slow-2g";

interface NetworkInformation extends EventTarget {
  readonly type?: ConnectionType;
  readonly effectiveType?: EffectiveConnectionType;
  readonly downlink?: number;
  readonly downlinkMax?: number;
  readonly rtt?: number;
  readonly saveData?: boolean;
}
