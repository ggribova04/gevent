export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  performers?: Performer[];
  tasks?: Task[];
  guests?: Guest[];
}

export interface Performer {
  id: number;
  fullName: string;
  login: string;
  serviceName: string;
  specialization?: string;
  status: string;
  statusId: number;
  dateString?: number;
}

export interface UpdatePerformerStatusDto {
  performerId: number;
  newStatusId: number;
}

export interface PerformerStatusUpdateResultDto {
  performerId: number;
  newStatusId: number;
  statusName: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  date: string;
  employeeFullName: string;
  login: string;
  status: string;
  statusId: number;
}

export interface Guest {
  id: number;
  guestInfo: string;
}

export interface EventStep1Data {
  title: string;
  date: string;
  time: string;
}

export interface EventBasicInfo {
  id: number;
  title: string;
  date: string;
  time: string;
}