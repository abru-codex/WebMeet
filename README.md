# WebMeet

A simple web-based video conferencing application built with .NET and WebRTC.

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

## Configuration

The application uses SQLite by default. Configuration can be modified in `appsettings.json`:

- `ConnectionStrings:DefaultConnection`: Database connection string
