import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Unity's loader calls createUnityInstance(), which is NOT idempotent.
  // React StrictMode's dev-only double-mount would create two instances on the
  // same canvas and corrupt the WebGL context. Disabling it keeps the single
  // mount/unmount lifecycle the Unity runtime expects. (No effect in production,
  // where effects already run once.)
  reactStrictMode: false,

  // Unity builds with multithreading enabled need SharedArrayBuffer, which
  // browsers only expose to cross-origin isolated documents. That requires both
  // headers below on every response — hence the catch-all source.
  //
  // "credentialless" rather than "require-corp" because the build is hosted on
  // object storage: require-corp would additionally demand a
  // Cross-Origin-Resource-Policy header on every one of those files, which R2
  // cannot set without a custom domain and a Transform Rule. credentialless
  // instead fetches cross-origin subresources without credentials, which is
  // exactly right for public game assets. (Chrome/Edge/Firefox, Safari 17+.)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
    ];
  },
};

export default nextConfig;
