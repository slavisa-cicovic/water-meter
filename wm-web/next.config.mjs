import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Next checks dev origins by hostname (not protocol/port).
// Add extra hosts via `NEXT_ALLOWED_DEV_ORIGINS="192.168.0.10,10.0.2.2"`.
const extraAllowedDevOrigins = (process.env.NEXT_ALLOWED_DEV_ORIGINS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

const allowedDevOrigins = Array.from(new Set(['127.0.0.1', ...extraAllowedDevOrigins]));

export default withNextIntl({
  reactStrictMode: true,
  allowedDevOrigins,
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb"
    }
  }
});
