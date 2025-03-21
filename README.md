
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

## ✅ Funktionsumfang

### 🚀 Backend-Funktionen

| Funktion                          | Beschreibung |
|-----------------------------------|--------------|
| **Blog-Post erstellen**          | Erstellung eines Blog-Posts mit Moderation durch die KI. |
| **Moderation**                   | Jeder Blog-Post wird von einer KI auf problematische Inhalte überprüft. |
| **Freigabe-Status (approved)**   | Posts werden nur bei erfolgreicher Moderation automatisch freigegeben. |
| **Kafka-Validierung**            | Sendet den Post-Inhalt zur asynchronen Validierung an einen separaten Text-Validator-Service. |
| **Zusammenfassung generieren**   | Eine KI erstellt automatisch eine Zusammenfassung des Blog-Posts. |
| **Schlagwörter vorschlagen**     | Bis zu 5 Tags werden per KI generiert und dem Blog-Eintrag hinzugefügt. |
| **Kategorie zuweisen**           | Die KI wählt eine passende Kategorie basierend auf dem Inhalt. |
| **Bearbeiten eines Blog-Posts**  | Ein Blog-Post kann bearbeitet werden. Dabei werden alle KI-Dienste neu aufgerufen. |
| **Löschen eines Blog-Posts**     | Entfernt einen bestehenden Post aus der Datenbank. |
| **Manuelles Freigeben (approve)**| Ein Blog-Post, der als `UNSAFE` moderiert wurde, kann manuell freigeschaltet werden. |
| **Abfrage aller Blog-Posts**     | Liefert alle Blog-Einträge zurück. |
| **Filterung im Frontend**        | Suche nach Blogs anhand von Titel, Tags oder Kategorie (Frontend-Funktion). |

### 🧠 Text-Validator-Funktionen (Kafka Consumer)

| Funktion                | Beschreibung |
|-------------------------|--------------|
| **Kafka Consumer**      | Empfängt `validation-request` Nachrichten. |
| **Moderation erneut prüfen** | Prüft, ob ein Text `SAFE` oder `UNSAFE` ist und sendet das Ergebnis zurück über `validation-response`. |

### 💾 Datenbank

| Komponente  | Beschreibung |
|-------------|--------------|
| **MySQL**   | Persistiert Blog-Daten inkl. Feldern `approved`, `summary`, `tags` und `category`. |

---

## 🚀 Setup & Installation

### Voraussetzungen
- **Docker** & **Docker Compose**
- **cURL** oder **Postman** (für API-Tests)
- GitHub Container Registry Zugriff (falls Images privat)
- 
#  **Starten mit Dockercompose**
docker-compose up  

#  **Container löschen**
docker-compose down 

---

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

## ✅ API-Endpunkte (Beispiele)

### 1. Blog erstellen (moderiert)

```bash
curl -X POST http://localhost:8080/blogs   -H "Content-Type: application/json"   -d '{"title": "Mein Blog", "content": "Das ist ein Blog-Eintrag."}'
```

### 2. Blog-Eintrag mit unangemessener Sprache

```bash
curl -X POST http://localhost:8080/blogs   -H "Content-Type: application/json"   -d '{"title": "Test Blog", "content": "hftm sucks."}'
```

### 3. Alle Blog-Einträge abrufen

```bash
curl -X GET http://localhost:8080/blogs
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
