export interface RawNotification {
  ID: string;
  Type: string;
  Message: string;
  Timestamp: string;
}

export type NotificationTypeName = "Placement" | "Result" | "Event";

export type NotificationTypeFilter = "All" | NotificationTypeName;

export interface NormalizedNotification {
  id: string;
  type: NotificationTypeName;
  message: string;
  timestampMs: number;
  timestampIso: string;
}

export interface NotificationsApiResponse {
  notifications: RawNotification[];
  total?: number;
  page?: number;
  total_pages?: number;
}
