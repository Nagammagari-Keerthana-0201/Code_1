# 🏥 Health Care Assistant - Complete Setup Guide

## 📋 Requirements

### System Requirements
- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Git**: (optional, for version control)
- **RAM**: Minimum 4GB
- **Internet**: Required for npm packages

### Supported Platforms
- ✅ Web (Browser)
- ✅ Android (Android 5.0+)
- ✅ iOS (iOS 13.0+, Mac required)

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Extract the ZIP
```bash
tar -xzf Health_Care_Assistant.tar.gz
cd Health_Care_Assistant
```

### Step 2: Install Node.js (if needed)
Download from: https://nodejs.org/en/download/
- Choose **LTS version**
- Install with default settings

### Step 3: Install Global Tools
```bash
npm install -g expo-cli
npm install -g eas-cli
```

### Step 4: Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file and set your backend API URL
# API_BASE_URL=http://YOUR_BACKEND_SERVER:5000
```

### Step 5: Install Dependencies
```bash
npm install
```

### Step 6: Start Development Server
```bash
npm start
```

---

## 🖥️ Running on Different Platforms

### Web (Easiest - No Emulator Needed)
```bash
npm start
# Press 'w' in terminal
# Opens http://localhost:19006
```

### Android
```bash
# Option 1: Android Emulator (if installed)
npm start
# Press 'a' in terminal

# Option 2: Physical Device
npm start
# Scan QR code with Expo app or Camera app
```

### iOS (Mac Only)
```bash
npm start
# Press 'i' in terminal

# OR using iOS Simulator
npm run ios
```

---

## ⚙️ Configuration

### Backend API Setup
Edit `.env` file:
```env
API_BASE_URL=http://192.168.1.100:5000
```

**Note**: Replace `192.168.1.100` with your actual backend server IP

### Expo Tunnel Authentication
If getting tunnel errors:
1. Create Expo account: https://expo.dev/signup
2. Login: `expo login`
3. Get token: `expo whoami`
4. Add to `.env`: `EXPO_TUNNEL_AUTHTOKEN=your_token`

---

## 📱 Features Included (100% Complete)

✅ **Patient Portal**
- Chat with AI healthcare assistant
- Voice-based queries
- Real-time responses

✅ **Doctor Portal**
- Doctor authentication
- View patient appointments
- Add remarks to appointments
- Profile management

✅ **Advanced Features**
- Voice recording & processing
- Audio feedback
- Real-time notifications
- Secure authentication

---

## 🐛 Troubleshooting

### Issue: `npm install` fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Port 19006 already in use
```bash
# Kill the process using the port
lsof -ti:19006 | xargs kill -9

# Or use different port
expo start --tunnel
```

### Issue: API connection fails
- Check backend server is running
- Verify API_BASE_URL in .env is correct
- Check network connectivity
- Ensure backend and frontend are on same network

### Issue: Cannot access from physical device
```bash
# Get your machine IP address
ipconfig getifaddr en0  # Mac
hostname -I            # Linux
ipconfig               # Windows

# Update API_BASE_URL with correct IP
API_BASE_URL=http://YOUR_MACHINE_IP:5000
```

### Issue: Expo tunnel authentication error
```bash
# Logout and login again
expo logout
expo login

# Get token
expo whoami -c
```

---

## 📚 Dependencies Overview

### Core Framework
- `expo` - React Native framework
- `expo-router` - File-based routing
- `react-native` - Mobile framework
- `react` - UI library

### Audio & Media
- `expo-av` - Audio/video playback & recording
- `expo-file-system` - File system access

### Navigation & UI
- `@react-navigation/*` - Navigation components
- `expo-linear-gradient` - Gradient effects
- `react-native-svg` - SVG support
- `react-native-reanimated` - Animations

### Storage
- `@react-native-async-storage/async-storage` - Local storage

---

## 🔐 Security Notes

⚠️ **Important:**
1. **Never commit `.env` file** to git
2. **Never share API keys** publicly
3. **Use HTTPS in production**
4. **Validate all user inputs** on backend
5. **Keep dependencies updated**: `npm update`

---

## 📦 Building for Production

### Web Build
```bash
npm run build:web
```

### Android Build (APK)
```bash
eas build --platform android
```

### iOS Build
```bash
eas build --platform ios
```

---

## 📞 Support & Resources

- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **GitHub Issues**: Create an issue for bugs
- **Expo Community**: https://chat.expo.dev/

---

## ✅ Verification Checklist

- [ ] Node.js v16+ installed
- [ ] npm v7+ installed
- [ ] expo-cli installed globally
- [ ] Dependencies installed (npm install)
- [ ] .env file configured
- [ ] Backend server running (if needed)
- [ ] App runs without errors
- [ ] Can navigate between screens
- [ ] Chat functionality works
- [ ] Doctor portal accessible (if 100% version)

---

**Happy coding! 🚀**
