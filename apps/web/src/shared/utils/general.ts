import { hasAccessToken } from '@/models/interfaces';
import { Session } from 'next-auth';

export function check<T>(value?: unknown, varName = 'not Defined'): T {
  const retValue = value as T;
  if (retValue === undefined || retValue === null || retValue === '') {
    throw new Error(`Required Value is missing. VarName:${varName}`);
  }
  return retValue;
}

export function getAccessToken(session?: Session | null): string {
  if (!session) throw new Error('Session is not defined');

  return (session as unknown as hasAccessToken).accessToken;
}
