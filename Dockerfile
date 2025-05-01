FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src
COPY ["src/VideoMeeting.Web/VideoMeeting.Web.csproj", "src/VideoMeeting.Web/"]
RUN dotnet restore "src/VideoMeeting.Web/VideoMeeting.Web.csproj"
COPY . .
WORKDIR "/src/src/VideoMeeting.Web"
RUN dotnet build "VideoMeeting.Web.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "VideoMeeting.Web.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "VideoMeeting.Web.dll"]