'use client';
//source: https://github.com/nextauthjs/next-auth/discussions/7573
import { signOut, useSession } from 'next-auth/react';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';

export interface AutoLogoutProviderProps {
  timeoutMs?: number;
  timeoutCheckMs?: number;
  debug?: boolean;
  requireSession?: boolean;
}

type WindowActivityEvent = keyof WindowEventMap;

export function AutoLogoutProvider({
  timeoutMs = +(process.env.NEXT_PUBLIC_TIME_OUT_MS || 6 * 1000), // Inactivity time
  timeoutCheckMs = +(process.env.NEXT_PUBLIC_TIME_OUT_CHECK_MS || 3 * 1000), // Time out to check
  debug = false,
  requireSession = false,
  children,
}: PropsWithChildren<AutoLogoutProviderProps>) {
  const [lastActivity, setLastActivity] = useState(new Date().getTime());
  const { data: session, status } = useSession({ required: requireSession });

  const _storageKey = '_lastActivity';

  function storage() {
    return global.window !== undefined ? window.localStorage : null;
  }

  const parseLastActivityString = useCallback((activityStr?: string | null) => {
    if (!activityStr) return null;

    const lastActivity = +activityStr;

    const now = activity();

    if (lastActivity == null || lastActivity > now || lastActivity <= 0 || isNaN(lastActivity)) {
      // note: some of these conditions could actually mean
      // someone is trying to tamper with your activity timer
      // use with caution
      return null;
    }

    return lastActivity;
  }, []);

  const initLastActivity = useCallback(() => {
    const now = activity();

    const lastActivityStr = storage()?.getItem(_storageKey);

    const lastActivity = parseLastActivityString(lastActivityStr);

    return lastActivity == null ? now : lastActivity;
  }, [parseLastActivityString]);

  useEffect(() => {
    if (!lastActivity) setLastActivity(initLastActivity());
  }, [initLastActivity, lastActivity]);

  function activity() {
    return new Date().getTime();
  }

  const onUserActivity = useCallback(() => {
    const now = activity();

    if (debug) console.log('activity - resetting last activity to ', now);
    storage()?.setItem(_storageKey, now.toString());
    setLastActivity(now);
  }, [debug]);

  const onStorage = useCallback(
    ({ key, storageArea, newValue }: StorageEvent) => {
      if (key === _storageKey && storageArea === storage()) {
        // some debugging lines
        if (debug) console.log('remote tab activity - resetting last activity to ', newValue);
        const lastActivity = parseLastActivityString(newValue);

        if (lastActivity !== null) {
          setLastActivity(lastActivity);
        }
      }
    },
    [debug, parseLastActivityString],
  );

  const isUserInactive = useCallback(() => {
    const now = activity();

    // maybe verify that they are authenticated?
    if (status === 'authenticated') {
      const expiry = new Date(session?.expires).getTime();

      if (now > expiry) {
        if (debug) {
          console.error('User has expired======', expiry, now);
        }

        signOut().then();
        return true;
      }
    }

    if (lastActivity + timeoutMs < now) {
      if (debug) console.log('User inactive======', lastActivity, now);
      signOut().then();
      return true;
    }

    return false;
  }, [debug, lastActivity, session?.expires, status, timeoutMs]);

  const onTimerElapsed = useCallback(() => {
    // just fire the isUserInactive check
    isUserInactive();
  }, [isUserInactive]);

  useEffect(() => {
    // session is still loading
    if (status === 'loading') {
      return;
    }

    if (status === 'unauthenticated') {
      // maybe you want to do something more here...
      return;
    }

    // no timer has been initialized
    if (timeoutMs === null) {
      return;
    }

    // if user is already inactive, do not init
    if (isUserInactive()) {
      return;
    }

    // on mount, we will listen to several possible "interactive"
    // events
    const windowEvents: WindowActivityEvent[] = ['focus', 'scroll', 'click', 'mousemove'];

    windowEvents.forEach((eventName) => {
      window.addEventListener(eventName, onUserActivity, false);
    });

    // we will use localStorage to determine activity
    window.addEventListener('storage', onStorage, false);

    // initialize an interval to check activity
    const intervalId = window.setInterval(onTimerElapsed, timeoutCheckMs);

    return () => {
      // detach and destroy listeners on deconstructor
      windowEvents.forEach((eventName) => {
        window.removeEventListener(eventName, onUserActivity, false);
      });

      window.removeEventListener('storage', onStorage, false);

      // clear the interval
      window.clearInterval(intervalId);
    };
  }, [
    isUserInactive,
    lastActivity,
    onStorage,
    onTimerElapsed,
    onUserActivity,
    status,
    timeoutCheckMs,
    timeoutMs,
  ]);

  return <>{children}</>;
}
