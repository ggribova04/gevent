export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  guests?: Guest[];
}

export interface Guest {
  fullName: string;
}