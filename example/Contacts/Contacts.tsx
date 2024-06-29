import React, { useContext } from 'react';
import { SContext, StoreContext } from '../index';

export default function () {
  const { state }: StoreContext = useContext(SContext);
  return <p>{state.contacts.length}</p>;
}
