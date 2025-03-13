FROM eclipse-temurin:21-jre AS runtime
WORKDIR /work/
COPY target/quarkus-app/lib/ /work/lib/
COPY target/quarkus-app/*.jar /work/app.jar
COPY target/quarkus-app/app/ /work/app/
COPY target/quarkus-app/quarkus/ /work/quarkus/
CMD ["java", "-jar", "/work/app.jar"]
