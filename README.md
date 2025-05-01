# Video Meeting Application

## Overview

The Video Meeting Application is a web-based platform that allows users to host and join video meetings. Built using ASP.NET Core MVC, this application leverages modern web technologies such as WebRTC for real-time communication and SignalR for chat functionality. The application is designed to be user-friendly and responsive, making it accessible on both desktop and mobile devices.

## Features

- **User Authentication**: Users can sign up, log in, and join meetings as guests.
- **Meeting Management**: Registered users can create and manage meetings, including setting optional passwords for added security.
- **Real-Time Communication**: Participants can engage in video and audio communication with up to 25 users in a meeting.
- **In-Meeting Chat**: Users can send text messages during meetings, with real-time updates.
- **Responsive Design**: The application is designed to work seamlessly across various devices.

## Technology Stack

- **Frontend**: ASP.NET Core MVC with Razor views and Bootstrap for styling.
- **Backend**: ASP.NET Core for REST API and WebSocket handling.
- **Database**: PostgreSQL for data storage, accessed via Entity Framework Core.
- **Real-Time Communication**: WebRTC for video/audio and SignalR for chat.
- **Deployment**: Docker Compose for local development and deployment.

## Getting Started

### Prerequisites

- .NET SDK (version specified in `global.json`)
- Docker and Docker Compose
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd VideoMeetingApp
   ```

2. Build and run the application using Docker Compose:
   ```
   docker-compose up --build
   ```

3. Access the application at `http://localhost:5000`.

### Configuration

- Update the `appsettings.json` file to configure the database connection string and other settings as needed.

## Running Tests

To run the unit tests for the application, navigate to the `src/VideoMeeting.Tests` directory and execute:
```
dotnet test
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by various video conferencing solutions.
- Thanks to the open-source community for their contributions to the technologies used in this project.