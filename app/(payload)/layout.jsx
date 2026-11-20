/* Dibuat dari templat Payload (ADR 0026). */
import config from "@payload-config";
import "@payloadcms/next/css";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import { importMap } from "./admin/importMap.js";

async function serverFunction(args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
}

export default function Layout({ children }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      {children}
    </RootLayout>
  );
}
