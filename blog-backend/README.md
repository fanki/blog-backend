# blog-backend

This project uses Quarkus, the Supersonic Subatomic Java Framework.

If you want to learn more about Quarkus, please visit its website: <https://quarkus.io/>.

## Running the application in dev mode

You can run your application in dev mode that enables live coding using:

```shell script
./mvnw quarkus:dev
```

> **_NOTE:_**  Quarkus now ships with a Dev UI, which is available in dev mode only at <http://localhost:8080/q/dev/>.

## Packaging and running the application

The application can be packaged using:

```shell script
./mvnw package
```

It produces the `quarkus-run.jar` file in the `target/quarkus-app/` directory.
Be aware that it’s not an _über-jar_ as the dependencies are copied into the `target/quarkus-app/lib/` directory.

The application is now runnable using `java -jar target/quarkus-app/quarkus-run.jar`.

If you want to build an _über-jar_, execute the following command:

```shell script
./mvnw package -Dquarkus.package.jar.type=uber-jar
```

The application, packaged as an _über-jar_, is now runnable using `java -jar target/*-runner.jar`.

## Creating a native executable

You can create a native executable using:

```shell script
./mvnw package -Dnative
```

Or, if you don't have GraalVM installed, you can run the native executable build in a container using:

```shell script
./mvnw package -Dnative -Dquarkus.native.container-build=true
```

You can then execute your native executable with: `./target/blog-backend-1.0.0-SNAPSHOT-runner`

If you want to learn more about building native executables, please consult <https://quarkus.io/guides/maven-tooling>.

## Related Guides

- Hibernate ORM with Panache ([guide](https://quarkus.io/guides/hibernate-orm-panache)): Simplify your persistence code for Hibernate ORM via the active record or the repository pattern
- JDBC Driver - PostgreSQL ([guide](https://quarkus.io/guides/datasource)): Connect to the PostgreSQL database via JDBC


# Blog-Backend mit Text-Validierung über Kafka

Dieses Projekt besteht aus zwei Quarkus-Diensten: 
- **blog-backend** (REST-API mit Datenbankanbindung)
- **text-validator** (Kafka-basierter Validierungsservice)

##  Setup & Installation

### **1️ Voraussetzungen**
- Installiere **Docker** & **Docker Compose** (optional)
- Installiere **cURL** oder **Postman** für API-Tests

### **2️ Netzwerk & Datenbank starten**
Zuerst das Docker-Netzwerk erstellen:

docker network create blog-nw

# 🛠 Setup & Testing für Blog-Backend & Text-Validator

## 1️ **MySQL-Datenbank starten**

docker run -d --name=mysql-db --network blog-nw \
    -e MYSQL_ROOT_PASSWORD=rootpassword \
    -e MYSQL_DATABASE=blogdb \
    -e MYSQL_USER=bloguser \
    -e MYSQL_PASSWORD=blogpassword \
    -p 3306:3306 mysql:latest

## 2 **Kafka (Redpanda) Container starten**

docker run -d --name=redpanda-1 -p 9092:9092 --network blog-nw \
    docker.redpanda.com/redpandadata/redpanda:v23.3.5 \
    redpanda start --advertise-kafka-addr redpanda-1:9092

## 3 **Kafka-Topics erstellen**

docker exec -it redpanda-1 rpk topic create validation-request --brokers=localhost:9092
docker exec -it redpanda-1 rpk topic create validation-response --brokers=localhost:9092

##  **Dienste starten**
### **Blog-Backend starten**

docker run -d --name=blog-backend --network blog-nw -p 8080:8080 fanki/blog-backend:1.0.0-SNAPSHOT

##  **Text-Validator starten**

docker run -d --name=text-validator --network blog-nw fanki/text-validator:1.0.0-SNAPSHOT

#  API-Endpunkte & Tests für Blog-Backend & Text-Validator


##  **API-Endpunkte**
### **1 Blog-Eintrag erstellen**

curl -X POST http://localhost:8080/blogs -H "Content-Type: application/json" \
     -d '{"title": "Mein Blog", "content": "Das ist ein Blog-Eintrag."}'

##  **Antwort eines erstellten Blog-Eintrags**

{"id":1,"title":"Mein Blog","content":"Das ist ein Blog-Eintrag.","approved":false}

# 📄 Blog-Einträge abrufen & Tests


## ** Alle Blog-Einträge abrufen**
Abrufen aller gespeicherten Blog-Einträge, inkl. `approved`-Status:

curl -X GET http://localhost:8080/blogs

#  Beispiel-Antwort & Tests


## **Beispiel-Antwort:**
Nach dem Abrufen der Blog-Einträge sollte eine JSON-Antwort wie diese erscheinen:


[
  {"id":1,"title":"Mein Blog","content":"Das ist ein Blog-Eintrag.","approved":true},
  {"id":2,"title":"Test Blog","content":"Dies ist ein Test-Blog","approved":false}
]

# 🛠 **Tests**

## ** Kafka-Validierung prüfen**
**Kafka-Request prüfen**  
Überprüfe, ob die **Validierungsanfrage** an Kafka gesendet wurde:

docker exec -it redpanda-1 rpk topic consume validation-request --brokers=localhost:9092

## ** Kafka-Response prüfen**
**Überprüfe, ob die Validierungsantwort von Kafka empfangen wurde:**

docker exec -it redpanda-1 rpk topic consume validation-response --brokers=localhost:9092

## ** MySQL-Datenbank prüfen**
**Datenbank-Abfrage, um den Status der Blog-Einträge zu sehen**  
Prüfe, ob der `approved`-Status in MySQL korrekt gespeichert wurde:


docker exec -it mysql-db mysql -u bloguser -pblogpassword -e "USE blogdb; SELECT * FROM BlogEntry;"

#  **Starten mit Dockercompose**
docker-compose up --build 

#  **Container löschen**
docker-compose down -v