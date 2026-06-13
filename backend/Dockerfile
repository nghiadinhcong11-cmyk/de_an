FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project file and restore from repo root context
COPY backend/RestaurantPOS.csproj backend/
RUN dotnet restore backend/RestaurantPOS.csproj

# Copy the rest of the backend source and publish
COPY backend/. backend/
WORKDIR /src/backend
RUN dotnet publish RestaurantPOS.csproj -c Release -o /app/out --no-restore

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "RestaurantPOS.dll"]
