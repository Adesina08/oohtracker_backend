import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.inicio.7ce6c920304f4ec8857aec9a6e58b3dc',
  appName: 'snack-track-insight-app',
  webDir: 'dist',
  server: {
    url: "https://7ce6c920-304f-4ec8-857a-ec9a6e58b3dc.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: ["camera", "photos"]
    },
    Geolocation: {
      permissions: ["location"]
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;