export interface Message {
    name: string;
    text: string;
    time: string;
  }
  
  export interface User {
    id: string;
    name: string;
    room: string;
  }
  
  export interface ServerToClientEvents {
    message: (data: Message) => void;
    userList: (data: { users: User[] }) => void;
    roomList: (data: { rooms: string[] }) => void;
    activity: (name: string) => void;
  }
  
  export interface ClientToServerEvents {
    message: (data: { name: string; text: string }) => void;
    enterRoom: (data: { name: string; room: string }) => void;
    activity: (name: string) => void;
  }