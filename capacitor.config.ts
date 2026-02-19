import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tt.game",
  appName: "TT Game",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
