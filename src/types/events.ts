export interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime?: string;
  neighborhood: string;
  venue?: string;
  address?: string;
  lat: number;
  lng: number;
  topics: string[];
  type: string;
  host: string;
  description: string;
  registrationUrl?: string;
  isFree?: boolean;
  isInviteOnly?: boolean;
}
