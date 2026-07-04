### **README.md**

# **Ticketmaster Application**

A web-based application built using Angular (frontend) and Node.js with MongoDB and Elasticsearch (backend). I used Docker our best friend to containerized the application for easy deployment. Swagger documentation is integrated to provide detailed API documentation.

---

## **Features**

- **Frontend**: Angular 19 (standalone components)
- **Backend**: Node.js (Express.js)
- **Database**: MongoDB
- **Search Engine**: Elasticsearch
- **API Documentation**: Swagger
- **Containerization**: Docker and Docker Compose

---

## **Quick Directory Structure**

```
.
├── api                  # Node.js backend application
│   ├── src              # Backend source files
│   └── Dockerfile       # Dockerfile for the backend
├── web                  # Angular frontend application
│   └── Dockerfile       # Dockerfile for the frontend
├── docker-compose.yml   # Docker Compose configuration
└── README.md            # Project documentation
```

---

## **Prerequisites**

Ensure the following are installed on your system:

- [Node.js (v18)](https://nodejs.org)
- [Angular CLI](https://angular.io/cli) (for local development)
- [Docker](https://www.docker.com)
- [Docker Compose](https://docs.docker.com/compose/)

---

## **Setup Instructions**

### **Clone the Repository**

```bash
git clone https://github.com/assadshahbaz/ticketmaster.git
cd ticketmaster
```

### **Build and Run with Docker**

1. **Build and Run Backend**:

   ```bash
   docker-compose up --build
   ```

   - The backend will be available at `http://localhost:3000`.
   - The backend Swagger documentation will be available at `http://localhost:3000/api-docs`.

2. **Build and Run Frontend**:

   Navigate to the `ticketmaster` folder and build the frontend:

   ```bash
     npm run build --omit=dev
     npm run serve:ssr:ticketmaster
   ```

   - The frontend will be accessible at `http://localhost:4000`.

---

## **Swagger API Documentation**

The Swagger API documentation is integrated with the backend and provides a comprehensive overview of the available APIs.

- **Swagger URL**: `http://localhost:3000/api-docs`

---

## **Environment Configuration**

The backend uses environment variables defined in a `.env` file. Below is an example configuration:

```plaintext
PORT=3000
MONGO_URI=mongodb://mongo:27017/ticketdb

ELASTICSEARCH_URL=http://elasticsearch:9200
ELASTIC_USERNAME=elastic
ELASTIC_PASSWORD=elastic
ELASTIC_CA_PATH=/usr/config/certs/http_ca.crt
```

Place this file in the `backend` directory.

---

## **Docker Compose Services**

### **Services Included**

1. **Backend** (`api`)
   - URL: `http://localhost:3000`
   - Swagger: `http://localhost:3000/api-docs`

2. **MongoDB** (`mongo`)
   - Port: `27017`

3. **Elasticsearch** (`elasticsearch`)
   - URL: `http://localhost:9200`

4. **Frontend** (`web`)
   - URL: `http://localhost:4000`

---

## **Manual Development**

### **Frontend**

To run the Angular application locally:

```bash
cd ticketmaster
npm install
npm start
```

Access the app at `http://localhost:4200`.

### **Backend**

To run the Node.js backend locally:

```bash
cd api
npm install
npm start
```

Access the backend API at `http://localhost:3000`.
