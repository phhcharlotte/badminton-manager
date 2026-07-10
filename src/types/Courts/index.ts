export type CourtType = "fixed" | "casual";

export interface Court {
  _id: string;
  name: string;
  description: string;
  type: CourtType;
  pricePerHour: number;
  image: string;
  isActive: boolean;
  createdAt: string;
}
