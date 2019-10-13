import React, { useContext, createContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import useStatus from '../useStatus';
import useData from '../useData';

function toSnakeCase(displayName) {
  const split = displayName.split(' ');

  return split
    .map(s => s.replace(/\W/g, ''))
    .map(s => s.substring(0, 1).toUpperCase() + s.substring(1))
    .join('');
}

export default function createContextFetch(fetch) {
  const Context = createContext(null);

  Context.displayName = `FetchProvider${toSnakeCase(fetch.meta.displayName)}`;

  function ContextFetchProvider({ children }) {
    const value = useData(fetch);
    const status = useStatus(fetch);

    const contextValue = useMemo(() => [value, status], [value, status]);

    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
  }

  ContextFetchProvider.propTypes = {
    children: PropTypes.node,
  };

  function useContextFetch() {
    const contextValue = useContext(Context);

    if (!contextValue) {
      throw new Error(
        '[createContextFetch] could not find global fetch context. Did you forget to wrap this tree with the provider?',
      );
    }

    return contextValue;
  }

  function ContextFetchConsumer({ children }) {
    return <Context.Consumer>{children}</Context.Consumer>;
  }

  ContextFetchConsumer.propTypes = {
    children: PropTypes.func.isRequired,
  };

  return { ContextFetchProvider, useContextFetch, ContextFetchConsumer };
}
