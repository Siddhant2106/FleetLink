import React, { useState } from 'react';
import './App.css';
import AddVehicle from './components/AddVehicle';
import SearchAndBook from './components/SearchAndBook';

function App() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚛 FleetLink - Logistics Vehicle Booking</h1>
        <nav className="nav-tabs">
          <button 
            className={activeTab === 'search' ? 'active' : ''} 
            onClick={() => setActiveTab('search')}
          >
            Search & Book Vehicles
          </button>
          <button 
            className={activeTab === 'add' ? 'active' : ''} 
            onClick={() => setActiveTab('add')}
          >
            Add Vehicle
          </button>
        </nav>
      </header>

      <main className="App-main">
        {activeTab === 'search' && <SearchAndBook />}
        {activeTab === 'add' && <AddVehicle />}
      </main>

      <footer className="App-footer">
        <p>&copy; 2025 FleetLink - Logistics Vehicle Booking System</p>
      </footer>
    </div>
  );
}

export default App;

