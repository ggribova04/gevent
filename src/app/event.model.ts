export interface Guest {
  fullName: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  guests?: Guest[];
}