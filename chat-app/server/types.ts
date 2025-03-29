export interface User {
  id: string;
  name: string;
  room: string;
}

export interface Message {
  name: string;
  text: string;
  time: string;
}

export interface EnterRoomData {
  name: string;
  room: string;
}

export interface MessageData {
  name: string;
  text: string;
}

export interface ClientToServerEvents {
  enterRoom: (data: EnterRoomData) => void;
  message: (data: MessageData) => void;
  activity: (name: string) => void;
}

export interface ServerToClientEvents {
  message: (message: Message) => void;
  userList: (data: { users: User[] }) => void;
  roomList: (data: { rooms: string[] }) => void;
  activity: (name: string) => void;
}

export interface UsersState {
  users: User[];
  setUsers: (newUsers: User[]) => void;
} 