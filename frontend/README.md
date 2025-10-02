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

