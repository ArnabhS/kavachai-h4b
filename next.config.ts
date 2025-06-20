import { createCivicAuthPlugin } from "@civic/auth/nextjs"
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withCivicAuth = createCivicAuthPlugin({
  clientId: "c62aca10-58c6-4704-9c03-88831cf87d25"
});

export default withCivicAuth(nextConfig)
