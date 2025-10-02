import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const AddVehicle = () => {
    const [formData, setFormData] = useState({
        name: '',
        capacityKg: '',
        tyres: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const dataToSend = {
                name: formData.name.trim(),
                capacityKg: parseFloat(formData.capacityKg),
                tyres: parseInt(formData.tyres)
            };

            const response = await axios.post(`${API_BASE_URL}/vehicles`, dataToSend);
            
            setMessage({
                type: 'success',
                text: `Vehicle "${response.data.name}" added successfully!`
            });
            
            // Reset form
            setFormData({
                name: '',
                capacityKg: '',
                tyres: ''
            });
        } catch (error) {
            console.error('Error adding vehicle:', error);
            const errorMessage = error.response?.data?.error || 'Failed to add vehicle. Please try again.';
            setMessage({
                type: 'error',
                text: errorMessage
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Add New Vehicle to Fleet</h2>
            
            {message.text && (
                <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Vehicle Name *</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g., Truck A, Van 123"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="capacityKg">Capacity (KG) *</label>
                    <input
                        type="number"
                        id="capacityKg"
                        name="capacityKg"
                        value={formData.capacityKg}
                        onChange={handleInputChange}
                        placeholder="e.g., 1000"
                        min="1"
                        step="0.01"
                        required
                        disabled={loading}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="tyres">Number of Tyres *</label>
                    <input
                        type="number"
                        id="tyres"
                        name="tyres"
                        value={formData.tyres}
                        onChange={handleInputChange}
                        placeholder="e.g., 4"
                        min="2"
                        required
                        disabled={loading}
                    />
                </div>

                <button 
                    type="submit" 
                    className="btn btn-success"
                    disabled={loading}
                >
                    {loading ? 'Adding Vehicle...' : 'Add Vehicle'}
                </button>
            </form>
        </div>
    );
};

export default AddVehicle;
