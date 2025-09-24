# WebMeet

A simple web-based video conferencing application built with ASP.NET Core MVC and WebRTC.

## Features

- **User Authentication**: Sign up, log in, and manage user accounts
- **Meeting Creation**: Create meetings with optional passwords
- **Video Conferencing**: Real-time video and audio communication using WebRTC
- **Live Chat**: In-meeting chat functionality powered by SignalR
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **Framework**: ASP.NET Core 9.0 MVC
- **Database**: SQLite with Entity Framework Core
- **Real-Time Communication**: WebRTC for video/audio, SignalR for chat
- **Frontend**: Razor views, Bootstrap 5, jQuery
- **Authentication**: ASP.NET Core Identity

## Prerequisites

- .NET 9.0 SDK
- SQLite

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd WebMeet
   ```

2. Navigate to the web project:
   ```bash
   cd src/WebMeet.Web
   ```

3. Restore dependencies:
   ```bash
   dotnet restore
   ```

4. Apply database migrations:
   ```bash
   dotnet ef database update
   ```

5. Run the application:
   ```bash
   dotnet run
   ```

6. Access the application at `https://localhost:5001` or `http://localhost:5000`

## Configuration

The application uses SQLite by default. Configuration can be modified in `appsettings.json`:

- `ConnectionStrings:DefaultConnection`: Database connection string
- `Jwt`: JWT configuration for token authentication (if needed)

## Project Structure

```
WebMeet/
├── src/
│   └── WebMeet.Web/         # Main web application
│       ├── Controllers/     # MVC controllers
│       ├── Models/          # Data models and view models
│       ├── Views/           # Razor views
│       ├── Data/            # Database context and repositories
│       ├── Services/        # Business logic services
│       ├── Hubs/            # SignalR hubs
│       └── wwwroot/         # Static files (CSS, JS, images)
├── docker-compose.yml       # Docker configuration (optional)
└── Dockerfile              # Docker image configuration

```

## License

This project is licensed under the MIT License.