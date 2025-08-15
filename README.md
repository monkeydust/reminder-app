# Reminder App 📋

A full-screen, touch-friendly reminder application designed for daily task management with weather integration. Perfect for wall displays, tablets, or Raspberry Pi setups.

## ✨ Features

### 🎯 **Core Functionality**
- **Daily Reminders**: Create and manage daily tasks with custom times
- **Recurring Tasks**: Set weekly recurring reminders (specific days)
- **Smart Completion**: Mark tasks as done with visual feedback
- **Viewer Mode**: Clean, full-screen display for wall mounting

### 🌤️ **Weather Integration**  
- **Real-time Weather**: Current London weather with Open-Meteo API (no API key required)
- **5-Day Forecast**: Click weather display to see expandable 5-day forecast
- **Accurate Data**: Uses official meteorological data from national weather services

### 💭 **Daily Inspiration**
- **Famous Quotes**: 119+ inspirational quotes from verified famous authors
- **Daily Rotation**: New quote each day from Einstein, Churchill, Maya Angelou, Gandhi, and more
- **Smart Display**: Quotes sized perfectly for screen readability

### 📱 **User Experience**
- **Touch Optimized**: Large buttons and touch-friendly interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes for continuous display
- **No Scrollbars**: Designed for fullscreen without scrolling

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser
- Internet connection (for weather data)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/monkeydust/reminder-app.git
   cd reminder-app
   ```

2. **Start the server**
   ```bash
   node server.js
   ```

3. **Access the app**
   - Local: `http://localhost:3002`
   - Network: `http://YOUR_IP:3002`

## 🎮 Usage

### Adding Reminders
1. Click **"+"** button to add new reminder
2. Set **time**, **title**, and **frequency**
3. Choose **specific days** for weekly recurring tasks
4. Click **Save** to create

### Managing Tasks
- ✅ **Mark Complete**: Click checkmark when task is done
- ✏️ **Edit**: Click edit icon to modify existing reminders  
- 🗑️ **Delete**: Remove unwanted reminders
- 👁️ **View Mode**: Full-screen display for wall mounting

### Weather Features
- **Current Weather**: Always visible in viewer mode
- **5-Day Forecast**: Click weather card to expand forecast
- **Auto-Hide**: Forecast automatically hides after 10 seconds
- **Manual Toggle**: Click again to hide immediately

### Viewer Mode
- **Clean Interface**: Minimal UI perfect for displays
- **Test Mode**: 🧪 button to test reminder progression
- **Exit**: ✕ button to return to editing mode
- **Touch Friendly**: Large buttons optimized for touch screens

## 🔧 Configuration

### Server Settings
- **Port**: Default 3002 (configurable in `server.js`)
- **Data Storage**: JSON file-based storage (`reminders.json`)
- **CORS**: Enabled for network access

### Weather Settings
- **Location**: London, UK (51.5074, -0.1278)
- **API**: Open-Meteo (free, no key required)
- **Update Frequency**: Every 15 minutes
- **Timezone**: Europe/London

### Display Settings
- **Resolution**: Optimized for 1024x600 (Raspberry Pi displays)
- **Scaling**: 1.3x scale factor for Raspberry Pi
- **Theme**: Always dark mode
- **Fullscreen**: No scrollbars, designed for kiosk mode

## 🍓 Raspberry Pi Deployment

### Quick Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Clone and run
git clone https://github.com/monkeydust/reminder-app.git
cd reminder-app
node server.js
```

### Auto-Start Service
Create systemd service for automatic startup:

```bash
sudo nano /etc/systemd/system/reminder-app.service
```

```ini
[Unit]
Description=Reminder App
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/reminder-app
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable reminder-app.service
sudo systemctl start reminder-app.service
```

### Kiosk Mode Setup
Auto-start Chromium in fullscreen:

```bash
mkdir -p ~/.config/lxsession/LXDE-pi
nano ~/.config/lxsession/LXDE-pi/autostart
```

Add:
```bash
@chromium-browser --start-fullscreen --kiosk --incognito --noerrdialogs --disable-translate --no-first-run --fast --fast-start --disable-infobars --disable-features=TranslateUI --disk-cache-dir=/dev/null --password-store=basic http://localhost:3002
```

## 📁 Project Structure

```
reminder-app/
├── index.html          # Main application HTML
├── script-fixed.js     # Core application logic
├── style.css           # Styling and responsive design
├── server.js           # Node.js web server
├── quotes.txt          # Famous inspirational quotes (119)
├── reminders.json      # Reminder data storage
└── README.md           # This file
```

## 🎨 Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js HTTP server
- **Storage**: File-based JSON storage
- **Weather**: Open-Meteo REST API
- **Responsive**: CSS Grid/Flexbox with viewport units

### Key Features
- **No Dependencies**: Runs with just Node.js
- **Network Ready**: CORS enabled for multi-device access
- **Offline Capable**: Works without internet (except weather)
- **Touch Optimized**: Large touch targets and gestures
- **Memory Efficient**: Lightweight vanilla JavaScript

### Browser Compatibility
- ✅ Chrome/Chromium 80+
- ✅ Firefox 75+  
- ✅ Safari 13+
- ✅ Edge 80+

## 🔄 API Endpoints

### Reminders API
- `GET /api/reminders` - Fetch all reminders
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/:id` - Update existing reminder
- `DELETE /api/reminders/:id` - Delete reminder

### Weather API (External)
- Open-Meteo API: `https://api.open-meteo.com/v1/forecast`
- No API key required
- 5-day forecast with hourly data
- European weather service data

## 🛠️ Development

### Local Development
```bash
# Clone repository
git clone https://github.com/monkeydust/reminder-app.git
cd reminder-app

# Start development server
node server.js

# App will be available at http://localhost:3002
```

### Making Changes
1. Edit files directly
2. Refresh browser to see changes
3. No build process required

### Adding Quotes
Edit `quotes.txt` with format: `Author|Quote|Year`

## 📱 Screenshots

**Main Interface**: Clean task management with weather display
**Viewer Mode**: Full-screen display perfect for wall mounting  
**5-Day Forecast**: Expandable weather forecast with detailed information
**Mobile Friendly**: Responsive design works on all screen sizes

## 🔧 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Change port in server.js or kill existing process
sudo lsof -ti:3002 | xargs kill -9
```

**Weather not loading**
- Check internet connection
- Verify Open-Meteo API is accessible
- Check browser console for errors

**Reminders not saving**
- Verify write permissions in app directory
- Check server.js logs for errors
- Ensure sufficient disk space

### Raspberry Pi Specific

**Chromium won't start fullscreen**
- Verify autostart file permissions
- Check X11 forwarding if using SSH
- Ensure sufficient memory allocation

**Screen blanking issues**
```bash
# Disable screen blanking
sudo nano /boot/config.txt
# Add: hdmi_blanking=1
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Weather Data**: Open-Meteo (open-source weather API)
- **Inspirational Quotes**: Collection from 15 famous historical figures
- **Icons**: Native emoji and Unicode symbols
- **Raspberry Pi Foundation**: For the amazing single-board computer platform

## 📞 Support

For issues, feature requests, or questions:
- 🐛 **Bug Reports**: Use GitHub Issues
- 💡 **Feature Requests**: Use GitHub Issues  
- 📧 **General Support**: Create GitHub Discussion

---

**Made with ❤️ for productivity and daily inspiration**

*Perfect for home dashboards, office displays, and personal productivity setups*