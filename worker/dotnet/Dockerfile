FROM mcr.microsoft.com/dotnet/core/sdk:3.1 as builder

WORKDIR /Worker
COPY ./Worker.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /out Worker.csproj

# app image
FROM mcr.microsoft.com/dotnet/core/runtime:3.1

WORKDIR /app
ENTRYPOINT ["dotnet", "Worker.dll"]

COPY --from=builder /out .
