import * as React from "react";

interface RegistrationLease<TRegistration> {
  update: (registrations: readonly TRegistration[]) => void;
  release: () => void;
}

interface RegistrationRegistry<TRegistration> {
  acquire: (
    registrations: readonly TRegistration[],
  ) => RegistrationLease<TRegistration>;
}

interface ExternalRegistrationStore<TRegistration> {
  getSnapshot: () => readonly TRegistration[];
  getServerSnapshot: () => readonly TRegistration[];
  subscribe: (onStoreChange: () => void) => () => void;
  publish: (registrations: readonly TRegistration[]) => void;
}

interface RegistrationEntry<TRegistration> {
  token: symbol;
  registrations: readonly TRegistration[];
}

export function createRegistrationChannel<TRegistration>(
  store: ExternalRegistrationStore<TRegistration>,
) {
  const entries: RegistrationEntry<TRegistration>[] = [];
  const emptyRegistrations: readonly TRegistration[] = [];
  const registry: RegistrationRegistry<TRegistration> = {
    acquire: (registrations) => {
      const entry = {
        token: Symbol("registration"),
        registrations,
      };
      entries.push(entry);
      store.publish(registrations);
      let released = false;

      return {
        update: (nextRegistrations) => {
          if (released) {
            return;
          }
          entry.registrations = nextRegistrations;
          if (entries.at(-1)?.token === entry.token) {
            store.publish(nextRegistrations);
          }
        },
        release: () => {
          if (released) {
            return;
          }
          released = true;
          const wasActive = entries.at(-1)?.token === entry.token;
          const index = entries.findIndex(
            (candidate) => candidate.token === entry.token,
          );
          if (index >= 0) {
            entries.splice(index, 1);
          }
          if (wasActive) {
            store.publish(entries.at(-1)?.registrations ?? emptyRegistrations);
          }
        },
      };
    },
  };
  const subscribe = (onStoreChange: () => void) =>
    store.subscribe(onStoreChange);
  const getSnapshot = () => store.getSnapshot();
  const getServerSnapshot = () => store.getServerSnapshot();
  const useRegistrations = () =>
    React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return { registry, useRegistrations };
}
