export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const SOCKET_EVENTS = {
  NEW_MESSAGE: 'new_message',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room'
};