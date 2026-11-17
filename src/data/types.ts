export type UnitType = 'district' | 'extended' | 'cell' | 'assembly' | 'mandal' | 'morcha' | 'shakti' | 'booth';

export interface Unit {
  id: string;
  type: UnitType;
  name: string;
  parentId: string | null;
}

export interface Member {
  id: string;
  unitId: string;
  name: string;
  post: string;
  rank: number; // 1 = top. Only changes display order, not power.
  email: string; // login ID
  phone: string;
  gender: 'Male' | 'Female';
  age: number;
  bloodGroup: string;
  address: string;
  joined: string;
  addedBy: string; // member id, "admin" or "seed"
  passwordHash: string | null; // null = not set yet (must use the email link)
  resetToken: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  place: string;
  description: string;
  unitId: string; // event starts from this unit and flows down
  levels: UnitType[]; // which lower levels also get it
  createdBy: string;
  createdAt: string;
}

export interface Message {
  id: string;
  from: string; // member id or "admin"
  to: string;
  text: string;
  at: string;
  read: boolean;
}

export interface Email {
  id: string;
  to: string;
  subject: string;
  body: string;
  token?: string; // password link
  at: string;
}

export interface AdminAccount {
  email: string;
  passwordHash: string;
  resetToken: string | null;
}

export interface DB {
  admin: AdminAccount;
  emails: Email[];
  units: Unit[];
  members: Member[];
  events: EventItem[];
  messages: Message[];
}

export type User = { kind: 'admin'; id: 'admin'; email: string } | { kind: 'member'; id: string };
