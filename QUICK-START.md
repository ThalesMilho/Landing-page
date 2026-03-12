# 🏥 Hospital Intranet - Quick Start Guide

## 🚀 5-Minute Setup on Hospital Server

### Step 1: Clone Repository
```bash
git clone https://github.com/ThalesMilho/Landing-page.git
cd Landing-page
```

### Step 2: Install Dependencies
```bash
# Backend
cd hospital-api
npm install

# Frontend  
cd ../hospital-intranet
npm install
```

### Step 3: Start Services
```bash
# Terminal 1 - Backend
cd hospital-api
npm run dev

# Terminal 2 - Frontend
cd ../hospital-intranet  
npm run dev
```

### Step 4: Access Application
- **Local**: http://localhost:5173
- **Network**: http://[SERVER_IP]:5173

---

## 📱 Hospital Staff Access

1. **Connect to hospital WiFi**
2. **Open browser**
3. **Go to**: `http://[SERVER_IP]:5173`
4. **Bookmark** the page

---

## ✅ What Works

- ✅ **Hospital Dashboard** with navigation
- ✅ **Document Management** interface  
- ✅ **File Upload** functionality
- ✅ **Mobile Responsive** design
- ✅ **Local Authentication** (no Azure AD needed)

---

## 🔧 Find Server IP
```bash
# Windows Command Prompt
ipconfig

# Look for "IPv4 Address"
# Example: 192.168.1.100
```

---

## 📞 Quick Support

**If it doesn't work:**
1. Check both terminals are running
2. Verify no port conflicts
3. Check Windows Firewall
4. Use correct IP address

**Ready for hospital beta testing!** 🏥✨
