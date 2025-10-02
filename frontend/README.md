# 🚛 FleetLink - Logistics Vehicle Booking System

FleetLink is a full-stack logistics vehicle booking platform designed for B2B clients. It enables fleet management, vehicle availability checking based on capacity and routes, and bookings, all delivered via a robust Node.js backend, React frontend, and MongoDB database.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Running with Docker](#running-with-docker)
- [Running Locally Without Docker](#running-locally-without-docker)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Features

- Add new vehicles to the fleet
- Search available vehicles by capacity, route (pincodes), and start time
- Book vehicles with availability re-validation to prevent conflicts
- Comprehensive backend unit tests ensuring reliable core logic
- Simple and responsive React frontend interface for easy interaction

---

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React.js, Axios
- **Database**: MongoDB
- **Testing**: Jest, Supertest
- **Containerization**: Docker, Docker Compose

---

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) installed and running on your Windows 11 machine.
- (Optional) [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/try/download/community) if you plan to run locally without Docker.

---

## Running with Docker

Docker Compose is configured to run the entire FleetLink stack (backend, frontend, and MongoDB) with one command.

### Steps:

1. **Clone the repository**

git clone https://github.com/yourusername/fleetlink.git
cd fleetlink


2. **Ensure the `docker-compose.yml` file is in the root of the project folder.**

3. **Run Docker Compose**

Open PowerShell or Command Prompt in the project root directory and run:

docker-compose up --build


- This command builds the Docker images for backend and frontend.
- Starts MongoDB, backend (port 5000), and frontend (port 3000) containers.
- Logs from all containers will appear in your terminal.

4. **Access the application**

- Frontend UI: http://localhost:3000
- Backend API (Health Check): http://localhost:5000/api/health

5. **Stop the containers**

Press `Ctrl + C` in the terminal to stop, then:

docker-compose down


---

## Running Locally Without Docker

### Backend

1. Open a terminal and navigate to the backend folder:

cd backend


2. Install dependencies:

npm install


3. Create a `.env` file with MongoDB connection string:

MONGODB_URI=mongodb://localhost:27017/fleetlink
PORT=5000


4. Start MongoDB server (`mongod`) if not running as a service.

5. Start backend server:

npm run dev


### Frontend

1. Open a new terminal and navigate to the frontend folder:

cd frontend

2. Install dependencies:

npm install


3. Start the React development server:

npm start


---

## Testing

Run backend unit tests with Jest:

cd backend
npm test


Tests cover:
- Adding vehicles with validation
- Vehicle availability logic including booking overlaps
- Booking creation and conflict handling

---

## Project Structure

fleetlink/
├── backend/
│ ├── Dockerfile
│ ├── server.js
│ ├── package.json
│ ├── .env
│ ├── tests/
│ │ └── api.test.js
│ └── ...
├── frontend/
│ ├── Dockerfile
│ ├── src/
│ │ ├── components/
│ │ │ ├── AddVehicle.js
│ │ │ └── SearchAndBook.js
│ │ ├── App.js
│ │ └── App.css
│ ├── package.json
│ └── ...
├── docker-compose.yml
└── README.md


---

## Future Improvements

- More realistic ride duration calculation using external APIs
- Booking cancellation and management UI
- Improved frontend UX with routing and advanced date pickers
- Authentication and user roles
- Deployment scripts and CI/CD integration

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

*Built with ❤️ using Node.js, React, MongoDB, and Docker*

---

Feel free to raise issues or contribute via pull requests!

