import React, { useState, useEffect } from 'react';
import RandomImages from './RandomImages';

interface Props {}

function App({}: Props) {
  return (
    <div className="App">
      <RandomImages></RandomImages>
    </div>
  );
}

export default App;
