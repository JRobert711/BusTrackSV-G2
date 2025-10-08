import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [backendData, setBackendData] = useState([{}]);

  useEffect(() => {
    fetch("/api")
      .then(response => response.json())
      .then(data => {
        setBackendData(data);
      })
      .catch(error => {
        console.log('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>BusTrack SV</h1>
        <p>Welcome to BusTrack SV Application</p>
        <div>
          <h2>Backend Data:</h2>
          <pre>{JSON.stringify(backendData, null, 2)}</pre>
        </div>
      </header>
    </div>
  );
}

export default App;
