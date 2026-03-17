# 🐳 Docker Versions & Commands Guide

## 🔍 Check Docker Version on Server

### **Check Docker Engine:**
```bash
docker --version
# Example: Docker version 24.0.6, build edbe43f7
```

### **Check Docker Compose:**
```bash
docker-compose --version
# Example: docker-compose version 2.20.2
# OR
docker compose version
# Example: Docker Compose version v2.20.2
```

---

## 📋 Docker Evolution

### **Docker Engine (Core):**
- **Docker v1.0+** (2013+) - Basic containers
- **Docker v1.6+** (2014+) - Better networking
- **Docker v17.03+** (2017+) - Swarm mode
- **Docker v20.10+** (2021+) - Compose V2
- **Docker v23.0+** (2022+) - BuildKit, security
- **Docker v24.0+** (2023+) - Latest stable

### **Docker Compose:**
- **Docker Compose v1** (2013-2020) - `docker-compose`
- **Docker Compose v2** (2020+) - `docker compose`
- **Docker Compose v2.20+** (2023+) - Latest features

---

## 🚀 Commands That Work on Your Server

### **If Docker Compose v2 (Modern):**
```bash
# Check version first
docker compose version

# Use new syntax
docker compose up -d --build
docker compose down
docker compose ps
docker compose logs
```

### **If Docker Compose v1 (Legacy):**
```bash
# Check version first
docker-compose --version

# Use legacy syntax
docker-compose up -d --build
docker-compose down
docker-compose ps
docker-compose logs
```

### **If Only Docker Engine (No Compose):**
```bash
# Manual container management
docker build -t hospital-api ./hospital-api
docker build -t hospital-frontend ./hospital-intranet
docker run -d --name hospital-api -p 3001:3001 hospital-api
docker run -d --name hospital-frontend -p 80:80 hospital-frontend
```

---

## 🎯 Recommended Commands for Hospital Server

### **Step 1: Check Version**
```bash
docker --version
docker-compose --version
```

### **Step 2: Choose Method**

**If docker-compose version shows v2.x.x:**
```bash
git clone https://github.com/ThalesMilho/Landing-page.git
cd Landing-page
docker compose up -d --build
```

**If docker-compose version shows v1.x.x:**
```bash
git clone https://github.com/ThalesMilho/Landing-page.git
cd Landing-page
docker-compose up -d --build
```

**If no docker-compose:**
```bash
git clone https://github.com/ThalesMilho/Landing-page.git
cd Landing-page
docker build -t hospital-api ./hospital-api
docker build -t hospital-frontend ./hospital-intranet
docker run -d --name hospital-api -p 3001:3001 hospital-api
docker run -d --name hospital-frontend -p 80:80 hospital-frontend
```

---

## 🔧 Quick Test Commands

### **Check what's running:**
```bash
docker ps
```

### **View logs:**
```bash
docker logs hospital-api
docker logs hospital-frontend
```

### **Stop services:**
```bash
docker stop hospital-api hospital-frontend
```

### **Remove everything:**
```bash
docker system prune -a
```

---

## 📱 Access After Deployment

- **Frontend**: http://[SERVER_IP]:80
- **Backend API**: http://[SERVER_IP]:3001
- **Health Check**: http://[SERVER_IP]:3001/health

---

## 🎯 Success Indicators

✅ **Both containers running** (`docker ps` shows 2)  
✅ **Frontend accessible** on port 80  
✅ **API responding** on port 3001  
✅ **Health check passes**  
✅ **Logs show no major errors**  

---

## 🛠️ Troubleshooting

### **Port conflicts:**
```bash
# Change ports in docker-compose.yml
ports:
  - "8080:80"  # Use 8080 instead of 80
```

### **Build failures:**
```bash
# Clean rebuild
docker-compose down
docker-compose up -d --build --force-recreate
```

### **Permission issues:**
```bash
# Run with sudo (Linux)
sudo docker-compose up -d --build
```

---

## 📋 Server Checklist

- [ ] Docker Engine installed
- [ ] Docker Compose available
- [ ] Git installed
- [ ] Ports 80 and 3001 available
- [ ] Firewall configured
- [ ] Repository cloned
- [ ] Services started successfully

**Run these commands on your hospital server to check versions!** 🔍
