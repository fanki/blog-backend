
# ✨ KI-Integration im Blog-Backend mit LangChain4J

Dieses Projekt erweitert die bestehende Blog-Architektur durch eine **KI-gestützte Moderation**, **automatische Zusammenfassung** sowie **Schlagwort- und Kategorie-Zuordnung**.  
Die KI prüft Inhalte auf unangemessene Sprache und verhindert das Speichern von problematischen Inhalten.

---

## 🎯 Aufgabenstellung & Ziele

- **Thema**: KI-Integration mit LangChain4J
- **Ziel**:
  - KI-gestützte **Moderation** von Blog-Posts (SAFE/UNSAFE)
  - Automatische **Zusammenfassung** neuer Blog-Einträge
  - **Vorschläge** für Schlagwörter und Kategorien beim Schreiben eines Blogs
  - Die Freigabe erfolgt nur für als **SAFE** bewertete Posts
- **Umfang**:  
  Entwicklung eines vollständigen End-to-End-Prozesses:
  - Backend mit Quarkus & LangChain4J
  - Kafka-Kommunikation via Redpanda
  - Frontend mit Angular (optional)


---


Die wichtigsten Funktionen im Überblick:

✅ **Erstellen, Bearbeiten, Löschen und Abrufen von Blogposts**  
✅ **KI-gestützte Moderation** – automatische Prüfung auf unangemessene Inhalte  
✅ **Automatische Zusammenfassung** neuer Blog-Einträge  
✅ **Schlagwort- und Kategorie-Vorschläge** für bessere Organisation  
✅ **Kafka-basierte Validierung mit Redpanda**  
✅ **Frontend (Angular)** für intuitive Bedienung und Filterung nach Titel, Tags, Kategorien  
✅ **Docker-Container** für eine einfache lokale Ausführung

# 📁 Projektstruktur

Das Projekt folgt einer modularen Struktur mit drei Hauptkomponenten:  
**blog-backend**, **text-validator**, **blog-frontend**.

```
BLOG-BACKEND/
├── blog-backend/                 # Quarkus Backend API mit KI-Services
│   └── src/main/java/com/example
│       ├── boundry               # REST-Ressourcen (API)
│       │   └── BlogResource.java
│       ├── control               # KI-Services via LangChain4J
│       │   ├── CategorySuggestionService.java
│       │   ├── ModerationService.java
│       │   ├── SummaryService.java
│       │   └── TagSuggestionService.java
│       ├── entity                # Datenbank-Entität
│       │   └── BlogEntry.java
│       └── messaging             # Kafka-Datenklassen
│           ├── ValidationRequest.java
│           └── ValidationResponse.java
│
├── blog-frontend/                # Angular Frontend
│   └── src/app
│       ├── blog-form             # Komponente zum Erstellen/Bearbeiten von Blogposts
│       │   ├── blog-form.component.html
│       │   ├── blog-form.component.scss
│       │   └── blog-form.component.ts
│       ├── blog-list             # Liste und Filterung der Blogposts
│       │   ├── blog-list.component.html
│       │   ├── blog-list.component.scss
│       │   └── blog-list.component.ts
│       ├── app.component.ts
│       └── weitere Angular-Dateien
│
├── text-validator/               # Separater Kafka Consumer Service
│   └── src/main/java/main/java
│       ├── ValidationProcessor.java
│       ├── ValidationRequest.java
│       └── ValidationResponse.java
│
├── docker-compose.yml            # Startet das gesamte System
├── README.md                     # Dokumentation & Setup
└── secrets.env                   # Umgebungsvariablen
```

---

# 🗂️ Beschreibung der Verzeichnisse & Komponenten

### `boundry`  
Beinhaltet die **REST-Ressourcen** (`BlogResource.java`) für das CRUD-Management von Blogposts. Hier werden alle API-Endpunkte definiert.

### `control`  
Beinhaltet die **Service-Klassen**, die mit **LangChain4J** verbunden sind. Diese sorgen für:
- **KI-Moderation** (ModerationService)
- **Kategorie-Vorschläge** (CategorySuggestionService)
- **Tag-Vorschläge** (TagSuggestionService)
- **Automatische Zusammenfassungen** (SummaryService)

### `entity`  
Die zentrale Entität `BlogEntry.java`, welche die Datenbank-Repräsentation eines Blogposts beschreibt.

### `messaging`  
Kafka-Nachrichtenklassen, die zwischen Backend und Text-Validator ausgetauscht werden:
- `ValidationRequest`  
- `ValidationResponse`  

### `blog-frontend`  
Das Angular-Frontend, mit zwei Hauptkomponenten:
- `blog-form`: Zum Erstellen und Bearbeiten von Blogposts inkl. KI-gestützter Vorschläge  
- `blog-list`: Zum Anzeigen und Filtern der vorhandenen Blogposts

### `text-validator`  
Ein **Kafka Consumer Service**, der eingehende `validation-request`-Nachrichten verarbeitet und die Freigabe (`SAFE` / `UNSAFE`) via `validation-response` zurückmeldet.

### `application.properties`  
Die Konfigurationsdateien für Quarkus und Kafka (Broker, Topics, DB-Zugriff usw.).

### `docker-compose.yml`  
Startet das komplette System:
- MySQL-Datenbank
- Redpanda (Kafka)
- Backend und Text-Validator Container
- (Frontend optional separat)

---

## 📝 Entitätsklassen

### `BlogEntry`  
Repräsentiert einen Blogpost in der Anwendung:  
- `title`: Titel des Blogposts  
- `content`: Inhalt  
- `summary`: Automatische Zusammenfassung (KI)  
- `tags`: KI-generierte Schlagwörter  
- `category`: KI-generierte Kategorie  
- `approved`: Moderations-Status (SAFE/UNSAFE)

---

## 🚀 Setup & Installation

### Voraussetzungen
- **Docker** & **Docker Compose**
- **cURL** oder **Postman** (für API-Tests)
- GitHub Container Registry Zugriff (falls Images privat)

---

#  **Starten mit Dockercompose**
docker-compose up  

#  **Container löschen**
docker-compose down 

## 🛠️ Lokales Setup mit Docker

### 1. Netzwerk erstellen

```bash
docker network create blog-nw
```

### 2. MySQL starten

```bash
docker run -d --name mysql-db --network blog-nw   -e MYSQL_ROOT_PASSWORD=rootpassword   -e MYSQL_DATABASE=blogdb   -e MYSQL_USER=bloguser   -e MYSQL_PASSWORD=blogpassword   -p 3306:3306 mysql:latest
```

### 3. Kafka (Redpanda) starten

```bash
docker run -d --name redpanda-1 --network blog-nw   -p 9092:9092 docker.redpanda.com/redpandadata/redpanda:v23.3.5   start --advertise-kafka-addr redpanda-1:9092
```

### 4. Kafka Topics anlegen

```bash
docker exec -it redpanda-1 rpk topic create validation-request --brokers=localhost:9092
docker exec -it redpanda-1 rpk topic create validation-response --brokers=localhost:9092
```

---

## 🏗️ Dienste starten

### Blog-Backend

```bash
docker run -d --name=blog-backend --network blog-nw -p 8080:8080   ghcr.io/fanki/blog-backend:1.0.0-SNAPSHOT
```

### Text-Validator

```bash
docker run -d --name=text-validator --network blog-nw   ghcr.io/fanki/text-validator:1.0.0-SNAPSHOT
```

---

# ✅ API-Endpunkte (Anwendungsfälle)

## 🧪 API-Endpunkte & Testen

Verfügbare Endpunkte (alle im BlogResource.java implementiert):
- `POST /blogs` → Blogpost erstellen (inkl. KI-Moderation & Vorschläge)  
- `GET /blogs` → Alle Blogs abrufen  
- `PUT /blogs/{id}` → Blog aktualisieren  
- `DELETE /blogs/{id}` → Blog löschen  
- `PUT /blogs/approve/{id}` → Manuelle Freigabe eines Blogs  
- `GET /blogs/pending` → Alle abgelehnten / noch nicht freigegebenen Blogs abrufen  
- `POST /blogs/suggest-tags-categories` → Vorschläge für Tags/Kategorie (Frontend-Nutzung)

### 1. Blog erstellen (SAFE/UNSAFE wird geprüft)

```bash
curl -X POST http://localhost:8080/blogs   -H "Content-Type: application/json"   -d '{
    "title": "Mein erster Blog",
    "content": "Das ist ein sicherer Blog-Beitrag."
}'
```

### 2. Blog erstellen mit unangemessenem Inhalt

```bash
curl -X POST http://localhost:8080/blogs   -H "Content-Type: application/json"   -d '{
    "title": "Toxischer Blog",
    "content": "hftm sucks."
}'
```

### 3. Alle Blog-Einträge abrufen

```bash
curl -X GET http://localhost:8080/blogs
```

### 4. Blog-Post manuell freischalten

```bash
curl -X PUT http://localhost:8080/blogs/approve/1
```

### 5. Blog-Post aktualisieren

```bash
curl -X PUT http://localhost:8080/blogs/1   -H "Content-Type: application/json"   -d '{
    "title": "Mein aktualisierter Blog",
    "content": "Dies ist die überarbeitete Version.",
    "category": "Technologie",
    "tags": ["Update", "Tech"]
}'
```

### 6. Blog-Post löschen

```bash
curl -X DELETE http://localhost:8080/blogs/1
```

### 7. Tags vorschlagen lassen

```bash
curl -X POST http://localhost:8080/blogs/suggest-tags   -H "Content-Type: application/json"   -d '{
    "title": "Künstliche Intelligenz",
    "content": "Einführung in KI und maschinelles Lernen."
}'
```

### 8. Tags & Kategorien vorschlagen

```bash
curl -X POST http://localhost:8080/blogs/suggest-tags-categories   -H "Content-Type: application/json"   -d '{
    "title": "Reisetipps für 2025",
    "content": "Hier findest du die Top-Reiseziele für das Jahr 2025."
}'
```

### 9. Moderation eines Textes testen

```bash
curl -X POST http://localhost:8080/blogs/moderate   -H "Content-Type: application/json"   -d '{
    "title": "Moderationstest",
    "content": "Beleidigungen sind nicht erlaubt."
}'
```

### 10. Ungeprüfte (pending) Blogs anzeigen

```bash
curl -X GET http://localhost:8080/blogs/pending
```

---

## 🔍 Validierung prüfen (Kafka)

```bash
docker exec -it redpanda-1 rpk topic consume validation-request --brokers=localhost:9092
docker exec -it redpanda-1 rpk topic consume validation-response --brokers=localhost:9092
```

---

## 🗄️ MySQL-Daten prüfen

```bash
docker exec -it mysql-db mysql -u bloguser -pblogpassword   -e "USE blogdb; SELECT * FROM BlogEntry;"
```

---

## 🔐 GHCR Zugriff (optional)

```bash
echo "GITHUB_PERSONAL_ACCESS_TOKEN" | docker login ghcr.io -u simeonlin --password-stdin

docker pull ghcr.io/fanki/blog-backend:1.0.0-SNAPSHOT
docker pull ghcr.io/fanki/text-validator:1.0.0-SNAPSHOT
```

---

## 🐳 Docker Compose (Optional)

```bash
docker-compose up
docker-compose down
```

---

## 🎓 Erkenntnisse & Fazit

| Bereich            | Erkenntnis |
|--------------------|------------|
| **LangChain4J**    | Einfache Integration von LLM-Features in Quarkus-Dienste. |
| **Kafka/Redpanda** | Performantes Messaging-System für lose gekoppelte Validierung und Moderation. |
| **Automatisierung**| Automatische Generierung von Zusammenfassungen, Kategorien und Tags steigert Effizienz und Einheitlichkeit. |
| **Moderation**     | Effektiver Schutz vor unangemessenen Inhalten im Blog-System. |

---

## 📚 Quellen & Hilfsmittel

- [LangChain4J Doku](https://github.com/langchain4j/langchain4j)
- [Quarkus Dokumentation](https://quarkus.io)
- [Redpanda Kafka](https://redpanda.com)
- [Docker Compose](https://docs.docker.com/compose/)
- ChatGPT (Ideen & Code-Hilfen)

