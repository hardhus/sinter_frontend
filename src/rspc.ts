import { createReactQueryHooks } from "@rspc/react";
import { createClient, FetchTransport } from "@rspc/client";
import type { Procedures } from "./bindings"; 

export const rspc = createReactQueryHooks<Procedures>();

export const client = createClient<Procedures>({
  transport: new FetchTransport("http://localhost:3000/rspc", {
    headers: () => {
      const token = localStorage.getItem("sinter_token");
      return token ? { Authorization: `Bearer ${token}` } : {};
    },
  }),
});
