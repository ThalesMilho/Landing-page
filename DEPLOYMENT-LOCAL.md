# Hospital Intranet - Local Beta Deployment

## 🏥 Quick Local Setup for Hospital Server

### Prerequisites
- Node.js 18+ installed
- Git access
- Terminal/Command Prompt access

---

## 🚀 Simple Deployment Steps

### 1. Clone Repository
```bash
# Navigate to your deployment directory
cd C:\inetpub\wwwroot  # or your preferred location

# Clone the repository
git clone https://github.com/ThalesMilho/Landing-page.git hospital-intranet
cd hospital-intranet
```

### 2. Install Backend Dependencies
```bash
cd hospital-api
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../hospital-intranet
npm install
```

### 4. Start Backend Service
```bash
cd hospital-api
npm run dev
```
Backend will run on: `http://localhost:3001`

### 5. Start Frontend Service (NEW TERMINAL)
```bash
cd hospital-intranet
npm run dev
```
Frontend will run on: `http://localhost:5173`

---

## 🌐 Access the Application

### For Hospital Staff:
- **Main URL**: `http://localhost:5173`
- **API Health Check**: `http://localhost:3001/health`

### For Testing from Other Computers:
- Use the server's IP address: `http://SERVER_IP:5173`
- Example: `http://192.168.1.100:5173`

---

## 🔧 Configuration (Optional)

### Change Frontend Port
Edit `hospital-intranet/vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,  // Change to desired port
    host: true    // Allow external access
  }
})
```

### Change Backend Port
Edit `hospital-api/.env`:
```env
PORT=8081
```

---

## 📱 Mobile Access

### From Hospital WiFi:
1. Connect to hospital network
2. Open browser
3. Go to: `http://SERVER_IP:5173`
4. Save bookmark to home screen

### Find Server IP:
```bash
# Windows
ipconfig

# Look for "IPv4 Address" under your network adapter
```

---

## 🔍 Testing Checklist

### Basic Functionality:
- [ ] Dashboard loads correctly
- [ ] Navigation works (RH, Qualidade, Suporte)
- [ ] Document upload interface shows
- [ ] Responsive design on mobile
- [ ] API health check passes

### File Upload Testing:
- [ ] Can upload PDF documents
- [ ] File size limits work
- [ ] Upload progress indicators work

### Performance:
- [ ] Pages load quickly
- [ ] No console errors
- [ ] Mobile performance acceptable

---

## 🛠️ Troubleshooting

### Port Already in Use:
```bash
# Find what's using the port
netstat -ano | findstr :5173

# Kill the process
taskkill /PID [PROCESS_ID] /F
```

### Access Denied:
- Check Windows Firewall settings
- Add Node.js to allowed applications
- Open ports 3001 and 5173 in firewall

### Database Issues:
```bash
cd hospital-api
npx prisma migrate dev
npx prisma generate
```

### Permission Issues:
```bash
# Run as administrator
# Or give folder permissions to your user
```

---

## 📋 Production Considerations

### For Full Production:
1. **Use PM2** for process management
2. **Set up reverse proxy** (IIS/nginx)
3. **Configure SSL certificates**
4. **Set up proper backups**
5. **Monitor application health**

### PM2 Setup (Optional):
```bash
# Install PM2
npm install -g pm2

# Start backend with PM2
cd hospital-api
pm2 start npm --name "hospital-api" -- run dev

# Start frontend with PM2
cd ../hospital-intranet
pm2 start npm --name "hospital-frontend" -- run dev

# View processes
pm2 list

# View logs
pm2 logs
```

---

## 🔄 Daily Operations

### Start Services:
```bash
# Terminal 1 - Backend
cd C:\inetpub\wwwroot\hospital-intranet\hospital-api
npm run dev

# Terminal 2 - Frontend  
cd C:\inetpub\wwwroot\hospital-intranet\hospital-intranet
npm run dev
```

### Stop Services:
- Press `Ctrl+C` in each terminal
- Or use PM2: `pm2 stop all`

---

## 📞 Support

### Common Issues:
1. **"Cannot access from other computers"**
   - Check firewall settings
   - Ensure `host: true` in vite.config.js
   - Use correct IP address

2. **"Database connection failed"**
   - Run `npx prisma migrate dev`
   - Check .env DATABASE_URL

3. **"Port already in use"**
   - Change port numbers
   - Kill existing processes

### Quick Commands:
```bash
# Check if services are running
curl http://localhost:3001/health
curl http://localhost:5173

# Restart everything
taskkill /F /IM node.exe
# Then start both services again
```

---

## 🎯 Success Criteria

✅ **Application accessible** from hospital network  
✅ **All modules loading** correctly  
✅ **File uploads working**  
✅ **Mobile responsive** design  
✅ **Performance acceptable** for beta testing  

---

## 📝 Notes for IT Team

- **No Azure AD required** for beta testing
- **Local authentication** simulated in code
- **SQLite database** for simplicity
- **Node.js services** run as separate processes
- **Access via IP address** from network computers
- **Backup database file** regularly: `hospital-api/prisma/dev.db`

**Ready for hospital beta testing!** 🏥
