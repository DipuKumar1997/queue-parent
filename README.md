
# Chat Microservices Application

This project is a real-time chat platform built with a Microservices architecture using **Spring Boot**, **Spring Cloud**, **React**, and **WebSockets (STOMP)**.

---

##  Service Architecture & Port Mapping

| Service | Port | Description |
| :--- | :--- | :--- |
| **Discovery Server** | `8761` | Eureka Server for service registration. |
| **API Gateway** | `8084` | Main entry point for all REST calls. |
| **Chat Service** | `8082` | Handles WebSocket connections and messaging logic. |
| **Auth Service** | `8081` | Handles OTP generation and JWT validation. |
| **React Frontend** | `3000` | The user interface. |

---

## 🛠 Prerequisites

1.  **PostgreSQL**: Ensure you have a PostgreSQL instance running.
2.  **Databases**: You must manually create the following databases before starting the services (as defined in your `application.yaml` files):
    * `auth_db`
    * `chatdb`(mongo db )
3.  **Docker**: Installed and running for infrastructure components.

---

##  Step 1: Infrastructure (Docker Compose)

Before running the Java services, start the required infrastructure (PostgreSQL, Kafka, Zookeeper) using the Docker Compose file located in the Chat Application directory.

```bash
# Navigate to your chat service directory
cd chat-service

# Start infrastructure
docker-compose up -d
```

---

##  Step 2: Running the Backend Services

**Important:** Run the services in the following specific order to ensure proper registration and routing.

### 1. Discovery Server (Eureka)
* **Port:** `8761`
* Wait until the dashboard is accessible at `http://localhost:8761`.

### 2. API Gateway
* **Port:** `8084`
* All frontend requests (REST) should point here. It routes traffic to the appropriate service.

### 3. Auth, User, and Chat Services
* **Auth Service:** `8081`
* **Chat Service:** `8082` (Handles the `/ws` endpoint)

---

## 💻 Step 3: Running the Frontend

Once all backend services are "UP" in the Eureka dashboard:

1.  Navigate to the frontend directory:
    ```bash
    cd chat-frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the application:
    ```bash
    npm start
    ```
4.  Access the app at `http://localhost:3000`.

---
## Demo video (click on the image it will redirect you to video on gDrive)

[![Demo Video](docs/demo.png)](https://drive.google.com/file/d/1GrhMoxBJlxVK7mteAksNpTOxIUWBcHky/view?usp=drive_link)

##  Configuration Notes

### Database Creation
If the services fail to start, verify your `application.yaml` settings. Ensure the `spring.datasource.url` points to the correct database name you created in Step 1.
Example: `jdbc:postgresql://localhost:5432/chat_db`

### WebSocket Connection
The React frontend connects directly to the **Chat Service** for WebSockets:
* **URL:** `ws://localhost:8082/ws`
* **Auth:** Requires a `Bearer` token in the `connectHeaders`.

### REST API Calls
The React frontend communicates through the **Gateway**:
* **Base URL:** `http://localhost:8084`
```

---

### Troubleshooting Tip:
If the **Discovery Server** shows the services as "UP" but the **Gateway** gives a `503 Service Unavailable`, wait 30 seconds. The Gateway needs a moment to refresh its internal routing table from Eureka.
