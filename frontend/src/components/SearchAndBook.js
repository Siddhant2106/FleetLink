import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const SearchAndBook = () => {
    const [searchData, setSearchData] = useState({
        capacityRequired: '',
        fromPincode: '',
        toPincode: '',
        startTime: ''
    });
    const [availableVehicles, setAvailableVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });
        setAvailableVehicles([]);

        try {
            const params = {
                capacityRequired: parseFloat(searchData.capacityRequired),
                fromPincode: searchData.fromPincode.trim(),
                toPincode: searchData.toPincode.trim(),
                startTime: new Date(searchData.startTime).toISOString()
            };

            const response = await axios.get(`${API_BASE_URL}/vehicles/available`, { params });
            
            if (response.data.length === 0) {
                setMessage({
                    type: 'error',
                    text: 'No vehicles available for the specified criteria. Please try different parameters.'
                });
            } else {
                setAvailableVehicles(response.data);
                setMessage({
                    type: 'success',
                    text: `Found ${response.data.length} available vehicle(s)`
                });
            }
        } catch (error) {
            console.error('Error searching vehicles:', error);
            const errorMessage = error.response?.data?.error || 'Failed to search vehicles. Please try again.';
            setMessage({
                type: 'error',
                text: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBookVehicle = async (vehicle) => {
        setBookingLoading(vehicle._id);
        setMessage({ type: '', text: '' });

        try {
            const bookingData = {
                vehicleId: vehicle._id,
                fromPincode: searchData.fromPincode.trim(),
                toPincode: searchData.toPincode.trim(),
                startTime: new Date(searchData.startTime).toISOString(),
                customerId: 'customer_' + Date.now() // Simplified customer ID for demo
            };

            const response = await axios.post(`${API_BASE_URL}/bookings`, bookingData);
            
            setMessage({
                type: 'success',
                text: `Successfully booked "${vehicle.name}"! Booking ID: ${response.data._id}`
            });
            
            // Remove booked vehicle from available list
            setAvailableVehicles(prev => prev.filter(v => v._id !== vehicle._id));
            
        } catch (error) {
            console.error('Error booking vehicle:', error);
            const errorMessage = error.response?.data?.error || 'Failed to book vehicle. Please try again.';
            setMessage({
                type: 'error',
                text: errorMessage
            });
        } finally {
            setBookingLoading(null);
        }
    };

    // Generate datetime-local format for input
    const getCurrentDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    };

    return (
        <div>
            <div className="form-container">
                <h2>Search Available Vehicles</h2>
                
                {message.text && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <label htmlFor="capacityRequired">Required Capacity (KG) *</label>
                        <input
                            type="number"
                            id="capacityRequired"
                            name="capacityRequired"
                            value={searchData.capacityRequired}
                            onChange={handleInputChange}
                            placeholder="e.g., 500"
                            min="1"
                            step="0.01"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="fromPincode">From Pincode *</label>
                        <input
                            type="text"
                            id="fromPincode"
                            name="fromPincode"
                            value={searchData.fromPincode}
                            onChange={handleInputChange}
                            placeholder="e.g., 400001"
                            pattern="[0-9]{6}"
                            title="Please enter a 6-digit pincode"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="toPincode">To Pincode *</label>
                        <input
                            type="text"
                            id="toPincode"
                            name="toPincode"
                            value={searchData.toPincode}
                            onChange={handleInputChange}
                            placeholder="e.g., 400002"
                            pattern="[0-9]{6}"
                            title="Please enter a 6-digit pincode"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="startTime">Desired Start Time *</label>
                        <input
                            type="datetime-local"
                            id="startTime"
                            name="startTime"
                            value={searchData.startTime}
                            onChange={handleInputChange}
                            min={getCurrentDateTime()}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <button 
                            type="submit" 
                            className="btn"
                            disabled={loading}
                        >
                            {loading ? 'Searching...' : 'Search Available Vehicles'}
                        </button>
                    </div>
                </form>
            </div>

            {availableVehicles.length > 0 && (
                <div className="results-container">
                    <h3>Available Vehicles ({availableVehicles.length})</h3>
                    <div className="vehicle-grid">
                        {availableVehicles.map((vehicle) => (
                            <div key={vehicle._id} className="vehicle-card">
                                <h4>🚛 {vehicle.name}</h4>
                                <div className="vehicle-info">
                                    <p><strong>Capacity:</strong> {vehicle.capacityKg} KG</p>
                                    <p><strong>Tyres:</strong> {vehicle.tyres}</p>
                                    <p><strong>Estimated Ride Duration:</strong> {vehicle.estimatedRideDurationHours} hours</p>
                                    <p><strong>Route:</strong> {searchData.fromPincode} → {searchData.toPincode}</p>
                                </div>
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleBookVehicle(vehicle)}
                                    disabled={bookingLoading === vehicle._id}
                                >
                                    {bookingLoading === vehicle._id ? 'Booking...' : 'Book Now'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchAndBook;
