import { ChatInputCommandInteraction } from "discord.js";
import { buildContributionMessages } from "../builders/contributions.js";
import { Config } from "../config.js";

export const handleContributionsInteraction = async (interaction: ChatInputCommandInteraction) => {
  // Check channel:
  if(interaction.channelId !== Config.env.CHANNEL_ID || interaction.guildId !== Config.env.GUILD_ID) {
    return await interaction.reply({
      ephemeral: true,
      content: `This command can only be used in the <#${Config.env.CHANNEL_ID}> channel.`
    });
  }

  // Build messages:
  const messages = await buildContributionMessages();

  // Check if no new contributions:
  if(messages.length == 0) {
    return await interaction.reply({
      ephemeral: true,
      content: "There are no new contributions."
    });
  } else {
    for(let i = 0; i < messages.length; i++) {
      const message = messages[i];
      try {
        if(i > 0) {
          await interaction.channel?.send(message);
        } else {
          await interaction.reply(message);
        }
      } catch(err) {
        console.error(err);
      }
    }
  }
};