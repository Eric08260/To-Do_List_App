import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? "/To-Do_List_App" : "",
  assetPrefix: isProd ? "/To-Do_List_App/" : "",
};

export default nextConfig;
