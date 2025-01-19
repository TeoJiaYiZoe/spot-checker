# Technical Document for Spot-Checker Backend and Frontend Application

## Overview

This document provides the technical details for the Spot-Checker application, which facilitates spot-checkers to verify eateries via license numbers, view eatery details, record notes, submit offenses, and upload inspection photos. The application includes backend services using FastAPI and a frontend built with React (Vite). Data is stored and managed in JSON files for simplicity.

### Technology Stack:

- **Frontend**: React (Vite), JavaScript
- **Backend**: FastAPI (Python)
- **Database**: JSON files
- **Deployment**: Localhost (development)

## Requirements

### 1. User Authentication and Session Management

- Users log in using their employee ID (eid) and password.
- Token authentication is used to secure API endpoints, with tokens stored in cookies.
- React Router handles the routing between pages, ensuring user session persistence even after page refresh.

### 2. Eatery Verification by License Number

- Users can input the eatery license number to fetch and display details from the JSON files (database).
- The request is sent to a FastAPI endpoint, which retrieves the relevant data from the JSON files (database).

### 3. View Eatery Information

- The eatery details, including the name, owner contact, and previous inspections, are displayed on the frontend after a successful search by license number.

### 4. Note Taking and Record Keeping

- Spot-checkers can write and save notes about their inspection, which are stored in the eatery's record in the JSON files (database).
- Previous check records are also fetched and displayed, showing earlier observations and offenses.

### 5. Offense Submission

- Spot-checkers can submit one or more offenses, with descriptions attached.
- Offenses are sent to the backend and stored in the eatery's record in the JSON files (database).

### 6. Photo Upload for Inspection

- Photos are uploaded during the inspection and stored in locally.

## Architecture Design

### Frontend (React (Vite), JavaScript)

- Login Page: Allows spot-checkers to log in using their employee ID and password. Tokens are generated upon successful login.
- Eatery Search: Users input the license number to search for an eatery.
- Eatery Details Page: Displays eatery information and previous check records.
- Observation Submission & Logout: Allows users to submit notes, offenses, and upload photos. If refresh, the page will remain. Additionally, user can choose to log out from here.

### Backend (FastAPI)

- Authentication: FastAPI handles user authentication using tokens. Each request to protected routes is validated using these tokens.
- FastAPI Endpoints:
  - POST /auth/login: Authenticates the user and returns a token.
  - POST /auth/logout: Log the user out and delete the token.
  - GET /observations/get-check-check-list/{employee_id}: Retrieves eatery personalized list.
  - POST /observations/add-observation/{license_no}: Adds notes, offenses, and uploads photos for an eatery checks.
  - GET /observations/get-observations/{license_no}: Retrieves previous checks records.
  - GET /observations/api/access-token : Verify the access token

### Database (JSON File)

- Stores spot checker details, eatery information, observations, offenses and photo.

## How to run the app

- Generate secret key using python's secrets module and update SECRET_KEY at controller.py
- Backend: Go to /spot_checker folder
  - run `pip install -r requirements.txt` in your virtual env
  - run `uvicorn controller:app --reload`
- Frontend:Go to /react_frontend and run `npm run dev`
