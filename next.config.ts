import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Unity's loader calls createUnityInstance(), which is NOT idempotent.
  // React StrictMode's dev-only double-mount would create two instances on the
  // same canvas and corrupt the WebGL context. Disabling it keeps the single
  // mount/unmount lifecycle the Unity runtime expects. (No effect in production,
  // where effects already run once.)
  reactStrictMode: false,
};

export default nextConfig;
