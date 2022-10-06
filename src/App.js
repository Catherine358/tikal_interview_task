import React from 'react';
import MostUnpopularCharacterTable from './components/MostUnpopularCharacterTable';
import PopularityBarChart from './components/PopularityBarChart';
import './App.css';

function App() {
  return (
    <div className="App">
     <MostUnpopularCharacterTable />
     <PopularityBarChart />
    </div>
  );
}

export default App;
