import { BaseMessageOptions, Client } from "discord.js";
import { Config } from "./config.js";

export const sendToChannel = (...messages: BaseMessageOptions[]) => {
  return {
    with: async (client: Client) => {
      const channel = await client.channels.fetch(Config.env.CHANNEL_ID);
      if(!channel) {
        throw new Error(`Could not fetch channel with ID: ${Config.env.CHANNEL_ID}`);
      } else {
        if(channel.isTextBased()) {
          for(const message of messages) {
            await channel.send(message);
          }
        } else {
          throw new Error(`Channel with ID (${Config.env.CHANNEL_ID}) is not text-based!`);
        }
      }
    }
  }
};