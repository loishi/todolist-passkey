import { AuthenticatorDevice } from '@simplewebauthn/typescript-types';

export interface LoggedInUser {
  id: string;
  username: string;
  devices: AuthenticatorDevice[];
}

declare module 'express-session' {
  interface SessionData {
    currentChallenge?: string;
    userId?: string;
  }
}