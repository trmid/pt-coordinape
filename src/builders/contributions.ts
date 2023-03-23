import { EmbedBuilder, BaseMessageOptions } from "discord.js";
import { Config } from "../config.js";
import { contributions as queryContributions } from "../queries/contributions.js";

export const buildContributionMessages = async () => {

  const messages: BaseMessageOptions[] = [];

  // Get contributions:
  const contributions = await queryContributions();
  if(contributions.length == 0) {
    return messages;
  }

  // Build Embed Helper Function:
  const buildEmbed = (contribution: typeof contributions[0]) => {
    const title = `${contribution.created_at !== contribution.updated_at ? "(*updated*) " : ""}Contribution from ${contribution.user.profile.name}`;
    const timestamp = new Date(contribution.updated_at).getTime();
    let description = contribution.description;
    let numChars =
      description.length +
      contribution.user.profile.name.length +
      title.length;
    if(numChars > 5000) {
      if(numChars - description.length < 5000) {
        const trimLength = numChars - 5000;
        description = description.slice(0, trimLength - 1).trim() + "…"; // -1 is for ellipses
        numChars -= trimLength;
      } else {
        throw new Error("Too much content for embed...");
      }
    }
    return {
      embed: new EmbedBuilder()
        .setTitle(title)
        .setColor(0x9171B0)
        .setDescription(description)
        .setTimestamp(timestamp)
        .setAuthor({
          name: contribution.user.profile.name,
          iconURL: contribution.user.profile.avatar ? `https://coordinape-prod.s3.amazonaws.com/${contribution.user.profile.avatar}` : undefined
        }),
      numChars
    };
  };

  // Iterate through embeds and pack them in multiple messages if needed:
  let currentEmbedChars = 0;
  let embeds: EmbedBuilder[] = [];
  const packMessage = () => {
    console.log(embeds.length, JSON.stringify(embeds, null, " "));
    messages.push({
      content: messages.length == 0 ? `**New Coordinape Contributions!**\n*Give here: ${`https://app.coordinape.com/circles/${Config.env.COORDINAPE_CIRCLE_ID}/give`}*` : undefined,
      embeds
    });
    currentEmbedChars = 0;
    embeds = [];
  };
  while(contributions.length > 0) {
    const contribution = contributions.pop();
    if(!contribution) break;
    const { embed, numChars } = buildEmbed(contribution);
    if(currentEmbedChars + numChars > 5000 || embeds.length > 9) {
      packMessage();
    }
    currentEmbedChars += numChars;
    embeds.push(embed);
  }
  if(embeds.length > 0) {
    packMessage();
  }
  console.log(JSON.stringify(messages, null, " "));
  return messages;
};