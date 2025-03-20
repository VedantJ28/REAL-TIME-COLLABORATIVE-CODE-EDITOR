# CodeCollab

CodeCollab is a real-time collaborative code editor that allows multiple users to edit code simultaneously. It also includes features like chat, room management, and user authentication to enhance teamwork and productivity.

## Core Functionalities

- **Real-Time Code Editing**: Users can collaborate on code using a Monaco-based editor that synchronizes changes via Socket.IO.
- **Chat Functionality**: Real-time chat is supported, with messages stored in Redis for persistence.
- **User Collaboration**: Tracks and displays real-time cursor positions for all collaborators.
- **Room Management**: Users can create or join rooms. The first user in a room becomes the admin and has additional controls (e.g., approving join requests, setting the code language).
- **Join Requests**: Users send join requests to enter a room, which the admin can accept or reject.
- **User Authentication**: Firebase Authentication manages user logins (email/password and Google sign-in). Protected routes ensure only authenticated users access the editor and room pages.
- **Notifications**: Displays notifications when users join or leave.

## Features & User Interface

- **Responsive UI**: Built with React and styled using Tailwind CSS, the UI is responsive and optimized for both desktop and mobile.
- **Alerts & Confirmations**: Custom alert components prompt users for actions like leaving or closing a room.
- **Dynamic Room Info**: The navbar displays the current room ID, active users, and allows copying the room ID to the clipboard.
- **Language Selector**: Admin users can change the programming language, which is reflected in the code editor.

## Technologies Used

### Client-Side

- **React & Vite**: For a fast, modern development workflow.
- **Tailwind CSS**: For utility-first styling.
- **Monaco Editor**: Provides a powerful in-browser code editing experience.
- **Socket.IO Client**: For real-time communication between users.
- **Firebase (Auth & Firestore)**: Handles user authentication and optionally data storage.

### Server-Side

- **Express**: Serves as the REST API gateway and basic HTTP server.
- **Socket.IO**: Manages WebSocket connections for real-time collaboration.
- **Redis**: Stores and retrieves chat messages for persistence across sessions.
- **Firebase Admin SDK**: Used for server-side initialization and integration with Firebase services.
- **dotenv**: For environment configuration.
- **cors**: For handling cross-origin requests.

## Installation and Setup

Follow these steps to set up the project on your local system:

### Prerequisites

- Node.js and npm installed on your system.
- Redis installed and running locally or on a cloud service.
- Firebase project set up with Authentication enabled.
- Git installed on your system.

### Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/VedantJ28/REAL-TIME-COLLABORATIVE-CODE-EDITOR
cd CodeCollab
```

#### 2. Set Up the Server
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory with the following content:
   ```env
   PORT=5000
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password
   TYPE=service_account
   PROJECT_ID=your_firebase_project_id
   PRIVATE_KEY_ID=your_private_key_id
   PRIVATE_KEY="your_private_key"
   CLIENT_EMAIL=your_client_email
   CLIENT_ID=your_client_id
   AUTH_URI=https://accounts.google.com/o/oauth2/auth
   TOKEN_URI=https://oauth2.googleapis.com/token
   AUTH_PROVIDER_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   CLIENT_CERT_URL=your_client_cert_url
   UNIVERSE_DOMAIN=googleapis.com
   ```
4. Start the server:
   ```bash
   npm start
   ```

#### 3. Set Up the Client
1. Navigate to the `client` directory:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory with the following content:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   ```
4. Start the client:
   ```bash
   npm run dev
   ```

#### 4. Access the Application
- Open your browser and navigate to `http://localhost:5173`.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and push them to your fork.
4. Submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact

For any questions or feedback, feel free to reach out:

- **Email**: vedantjadhav324@example.com
- **GitHub**: [VedantJ28](https://github.com/VedantJ28)
