# 🐳 Docker Testing Guide

## 🎯 Test Hospital Intranet with Docker on Your Machine

### Prerequisites
1. **Install Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
   - Download: https://www.docker.com/products/docker-desktop
   - Install with default settings
   - Restart computer after installation

2. **Verify Docker is working**
   ```bash
   docker --version
   docker-compose --version
   ```

---

## 🚀 Quick Docker Test

### Step 1: Clone Repository
```bash
git clone https://github.com/ThalesMilho/Landing-page.git
cd Landing-page
```

### Step 2: Run Docker (One Command!)
```bash
docker-compose up -d --build
```

### Step 3: Wait for Build to Complete
- First time takes 5-10 minutes (downloads Node.js, builds containers)
- Watch the progress in terminal
- You'll see "Successfully built" and "Successfully tagged" messages

### Step 4: Check Status
```bash
docker-compose ps
```

You should see:
```
NAME                    COMMAND                  SERVICE               STATUS              PORTS
hospital-api            "npm start"              hospital-api          running             3001/tcp
hospital-frontend       "nginx -g 'daemon off'"  hospital-frontend     running             0.0.0.0:80->80/tcp
```

### Step 5: Access the Application
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost/api
- **Health Check**: http://localhost/api/health

---

## 📱 What to Test

### 1. **Frontend Functionality**
- [ ] Dashboard loads correctly
- [ ] Navigation works (RH, Qualidade, Suporte)
- [ ] Responsive design on mobile (use browser dev tools)
- [ ] No console errors

### 2. **Backend API**
- [ ] Health check returns success
- [ ] Document upload interface shows
- [ ] API endpoints respond correctly

### 3. **Docker Features**
- [ ] Containers start automatically
- [ ] Logs are accessible
- [ ] Can stop/start services easily

---

## 🔍 Docker Commands to Know

### Check Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f
docker-compose logs hospital-api
docker-compose logs hospital-frontend
```

### Stop Services
```bash
docker-compose down
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild (if you make changes)
```bash
docker-compose up -d --build
```

### Clean Up (remove everything)
```bash
docker-compose down -v --rmi all
```

---

## 🛠️ Troubleshooting

### Port 80 Already in Use
```bash
# Change port in docker-compose.yml
ports:
  - "8080:80"  # Use 8080 instead of 80
```

### Build Fails
```bash
# Clean and rebuild
docker-compose down
docker system prune -f
docker-compose up -d --build
```

### Permission Issues (Linux/Mac)
```bash
sudo docker-compose up -d --build
```

### Out of Disk Space
```bash
docker system prune -a
```

---

## 🎯 Success Indicators

✅ **Both containers running** (docker-compose ps shows 2 services)  
✅ **Frontend accessible** at http://localhost:80  
✅ **API responding** at http://localhost/api/health  
✅ **No major errors** in logs  
✅ **Application works** like in local development  

---

## 📊 Performance Testing

### Check Resource Usage
```bash
docker stats
```

### Test from Different Devices
1. **Your computer**: http://localhost:80
2. **Phone on same WiFi**: http://[YOUR_IP]:80
3. **Tablet**: http://[YOUR_IP]:80

Find your IP:
```bash
# Windows
ipconfig
# Look for "IPv4 Address"

# Mac/Linux  
ifconfig
# Look for "inet"
```

---

## 🔄 Update Testing

### Simulate Production Updates
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose up -d --build
```

### Test Rollback
```bash
# Go back to previous version
git checkout [previous-commit-hash]
docker-compose up -d --build
```

---

## 🎓 Learning Outcomes

By testing Docker locally, you'll learn:
- ✅ **Container deployment** workflow
- ✅ **Docker Compose** usage
- ✅ **Service orchestration**  
- ✅ **Production-like environment**
- ✅ **Troubleshooting skills**

---

## 📋 College/Computer Lab Setup

If testing at college:
1. **Install Docker Desktop** on lab machine
2. **Clone repository** from GitHub
3. **Run docker-compose up -d --build**
4. **Share localhost:80** with classmates for testing
5. **Document any issues** for hospital deployment

---

## 🚀 Ready for Hospital Server

Once Docker works on your machine:
1. **Document the exact steps** that worked
2. **Note any troubleshooting** needed  
3. **Test on different computers** if possible
4. **Prepare for hospital server deployment**

**This testing will make hospital deployment smooth!** 🏥✨
