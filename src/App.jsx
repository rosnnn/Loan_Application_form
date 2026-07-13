import React from 'react';
import { FormDataProvider } from './context/FormDataContext';
import Wizard from './components/Wizard';

export default function App() {
  return (
    <FormDataProvider>
      <Wizard />
    </FormDataProvider>
  );
}
