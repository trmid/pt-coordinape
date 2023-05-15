import { BaseMessageOptions } from "discord.js";
import { Config } from "../config.js";

export const buildEndingEpochMessage = async (epochNumber: number, epochEndDate: Date): Promise<BaseMessageOptions> => {
  return {
    content: `**Epoch ${epochNumber} is ending <t:${Math.floor(epochEndDate.getTime() / 1000)}:R>!** <@&${Config.env.UPDATES_ROLE_ID}>\nMake sure to update your epoch statements and list your contributions! Happy giving <:poolfrog:1011914791834632202>`
  };
};