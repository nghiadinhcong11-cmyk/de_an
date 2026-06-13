FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy source into the image. This Dockerfile can be built from either
# the repository root or the backend directory as the build context.
COPY . .

RUN if [ -f ./backend/RestaurantPOS.csproj ]; then \
      dotnet restore ./backend/RestaurantPOS.csproj; \
    elif [ -f ./RestaurantPOS.csproj ]; then \
      dotnet restore ./RestaurantPOS.csproj; \
    else \
      echo "RestaurantPOS.csproj not found"; exit 1; \
    fi

RUN if [ -f ./backend/RestaurantPOS.csproj ]; then \
      dotnet publish ./backend/RestaurantPOS.csproj -c Release -o /app/out --no-restore; \
    elif [ -f ./RestaurantPOS.csproj ]; then \
      dotnet publish ./RestaurantPOS.csproj -c Release -o /app/out --no-restore; \
    else \
      echo "RestaurantPOS.csproj not found"; exit 1; \
    fi

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .
ENTRYPOINT ["dotnet", "RestaurantPOS.dll"]
