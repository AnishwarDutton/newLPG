FROM maven:3.9.6-eclipse-temurin-17

WORKDIR /app
COPY . .

RUN mvn clean package -DskipTests

EXPOSE 10000

CMD ["java", "-jar", "target/lpg-management-1.0.0.jar"]