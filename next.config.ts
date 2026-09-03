import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mongoose", "mongodb-memory-server"],
  async redirects() {
    // Original Vue app URLs kept working.
    return [
      { source: "/see-neighborhoods", destination: "/neighborhoods", permanent: false },
      { source: "/create/type", destination: "/signup", permanent: false },
      { source: "/create/:role/:step", destination: "/signup?role=:role", permanent: false },
    ];
  },
};

export default nextConfig;
