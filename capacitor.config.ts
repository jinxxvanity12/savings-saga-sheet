
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.50812f27b0604fd99a30c72fd6b2356e',
  appName: 'savings-saga-sheet',
  webDir: 'dist',
  server: {
    url: 'https://50812f27-b060-4fd9-9a30-c72fd6b2356e.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'always'
  },
  android: {
    captureInput: true
  }
};

export default config;
