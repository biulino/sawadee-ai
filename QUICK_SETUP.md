# Quick Setup Guide for Enhanced Components

## Prerequisites Installation

### 1. Install Node.js and npm
```powershell
# Download and install Node.js 18+ from nodejs.org
# Verify installation:
node --version  # Should show v18.x.x or higher
npm --version   # Should show 8.x.x or higher
```

### 2. Install Frontend Dependencies
```powershell
cd "c:\Users\admin\GIT Projects\sawadee\web-frontend"
npm install
```

## Component Integration Steps

### 1. Fix TypeScript Configuration (if needed)
```powershell
# The tsconfig.json is already created with proper settings
# If you see JSX type errors, run:
npm install @types/react @types/react-dom --save-dev
```

### 2. Test Component Compilation
```powershell
# In web-frontend directory:
npm start
# This will start the development server and show any compilation errors
```

### 3. Replace ChatWidget Usage
The `LandingPage.tsx` has already been updated to use `SimplifiedEnhancedChatWidget`. Once Node.js is installed and dependencies are available, you can switch to the full-featured version:

```typescript
// In LandingPage.tsx, change:
import EnhancedChatWidget from './SimplifiedEnhancedChatWidget';
// To:
import EnhancedChatWidget from './EnhancedChatWidget';
```

### 4. Verify Features Work
Test the following enhanced features:
- [ ] Weather widget displays current data
- [ ] Hotel statistics show properly
- [ ] Chat widget opens and functions
- [ ] Voice recording works (browser permissions required)
- [ ] Image upload works
- [ ] Quick suggestions respond
- [ ] Message rating buttons work

## Backend Integration (Optional)

### 1. Add Voice Transcription Endpoint
```java
@PostMapping("/api/chat/voice-transcription")
public ResponseEntity<String> transcribeVoice(@RequestParam("audio") MultipartFile audioFile) {
    // Implement using OpenAI Whisper or similar service
    String transcription = voiceService.transcribe(audioFile);
    return ResponseEntity.ok(transcription);
}
```

### 2. Add Image Upload Endpoint
```java
@PostMapping("/api/chat/image-upload")
public ResponseEntity<String> uploadImage(@RequestParam("image") MultipartFile imageFile) {
    // Process and store image, return URL
    String imageUrl = imageService.processAndStore(imageFile);
    return ResponseEntity.ok(imageUrl);
}
```

### 3. Add Chat Suggestions Endpoint
```java
@GetMapping("/api/chat/suggestions")
public ResponseEntity<List<String>> getChatSuggestions(@RequestParam("context") String context) {
    // Return contextual suggestions based on user context
    List<String> suggestions = chatService.generateSuggestions(context);
    return ResponseEntity.ok(suggestions);
}
```

## Production Deployment

### 1. Build for Production
```powershell
cd "c:\Users\admin\GIT Projects\sawadee\web-frontend"
npm run build
```

### 2. Deploy with Docker
```powershell
cd "c:\Users\admin\GIT Projects\sawadee"
docker-compose up -d
```

### 3. Configure External Services
- Set up OpenAI API key for voice transcription
- Configure weather API (OpenWeatherMap)
- Set up image storage (AWS S3 or similar)
- Configure monitoring (Grafana/Prometheus)

## Troubleshooting

### Common Issues

1. **JSX Type Errors**
   ```powershell
   npm install @types/react @types/react-dom @types/node --save-dev
   ```

2. **Framer Motion Not Found**
   ```powershell
   npm install framer-motion
   ```

3. **Lucide React Icons Not Found**
   ```powershell
   npm install lucide-react
   ```

4. **Compilation Errors**
   ```powershell
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Verification Commands
```powershell
# Check all dependencies are installed
npm ls

# Run type checking
npx tsc --noEmit

# Start development server
npm start

# Build for production
npm run build
```

## File Locations Summary

```
web-frontend/src/components/
├── LandingPage.tsx                    ✅ Enhanced with weather, stats, attractions
├── CheckinFlow.tsx                    ✅ Enhanced with quality assessment
├── EnhancedChatWidget.tsx             ✅ Full-featured version (needs deps)
├── SimplifiedEnhancedChatWidget.tsx   ✅ Fallback version (basic React)
└── ChatWidget.tsx                     ⚠️  Deprecated (replace usage)
```

The system is ready for immediate testing and deployment once Node.js dependencies are installed!
