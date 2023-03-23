import { Config } from './config.js';
import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';
import { handleContributionsInteraction } from './interactions/contributions.js';
import { buildContributionMessages } from './builders/contributions.js';

// Update Commands:
const commands = [
	{
		name: 'contributions',
		description: 'Fetches the latest contributions and posts them to the coordinape channel.',
	},
];

const rest = new REST({ version: '10' }).setToken(Config.env.BOT_TOKEN);

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');

		await rest.put(Routes.applicationCommands(Config.env.BOT_APPLICATION_ID), { body: commands });

		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
})();

// Create client:
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  if(!client.user) throw new Error("Expected client to have a bot user, but null was found.");
	console.log(`Logged in as ${client.user.tag}!`);

	// Start interval to send contributions every 'x' minutes:
	const intervalMin = 30;
	setInterval(async () => {
		try {
			const messages = await buildContributionMessages();
			console.log("auto-updating messages:", JSON.stringify(messages, null, " "));
			if(messages.length > 0) {
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
		} catch(err) {
			console.error(err);
		}
	}, intervalMin * 60 * 1000);
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'contributions') {
		try {
    	await handleContributionsInteraction(interaction);
		} catch(err) {
			console.error(err);
			await interaction.reply("Something went wrong... Please try again later or contact midpoint and tell him to fix the bot.");
		}
	}
});

client.login(Config.env.BOT_TOKEN);
