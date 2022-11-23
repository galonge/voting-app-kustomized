FROM maven:3.8-jdk-11 AS build

WORKDIR /code

COPY ./pom.xml /code/pom.xml
RUN ["mvn", "dependency:resolve"]
RUN ["mvn", "verify"]

# Adding source, compile and package into a fat jar
COPY ["./src/main", "/code/src/main"]
RUN ["mvn", "package"]

FROM openjdk:11-jre-slim

COPY --from=build /code/target/worker-jar-with-dependencies.jar /

CMD ["java", "-jar", "/worker-jar-with-dependencies.jar"]