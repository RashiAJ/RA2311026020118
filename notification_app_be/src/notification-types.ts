export type NotificationTypeName = "Placement" | "Result" | "Event";

export interface RawNotification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

export interface NormalizedNotification {
  id: string;
  type: NotificationTypeName;
  message: string;
  timestampMs: number;
  timestampIso: string;
}
