import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

export const provider = new SuiClient({
  url: getFullnodeUrl("devnet"), 
});