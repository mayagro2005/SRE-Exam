# SRE-Exam

# Full-Stack TiDB App with TiCDC & Kafka

A minimal full-stack Node.js app with user authentication, TiDB database, TiCDC changefeed, Kafka message queue, and a real-time consumer that logs database changes. The frontend is a minimal HTML login page.

---

## Overview

This project demonstrates a complete workflow:

- User login with token-based authentication
- TiDB database integration
- Change Data Capture using TiCDC
- Message streaming with Kafka
- Real-time consumption and structured logging with Node.js consumer
- Fully Dockerized for one-command deployment

---

## Tech Stack

- **Frontend:** HTML (minimal)
- **Backend:** Node.js + Express
- **Database:** TiDB
- **Message Queue:** Kafka (with Zookeeper)
- **Change Data Capture:** TiCDC
- **Logging:** log4js
- **Containerization:** Docker & Docker Compose

---

## Prerequisites

- Docker
- Docker Compose

Optional if running outside Docker:

- Node.js & npm

---

## Setup & Run

1. Clone the repository:

```bash
git clone <repo_url>
cd project-root
docker-compose up --build

Note: If you run any shell scripts (e.g., ticdc-entrypoint.sh) directly on Windows, make sure they use LF line endings so they execute correctly in a Linux environment.

