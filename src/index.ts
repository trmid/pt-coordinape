import { Config } from './config.js';
import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';
import { handleContributionsInteraction } from './interactions/contributions.js';
import { buildContributionMessages } from './builders/contributions.js';
import { sendToChannel } from './message.js';
import { epochsEndingWithin, getLastAlertedEpochNumber, setLastAlertedEpochNumber } from './queries/epochs.js';
import { buildEndingEpochMessage } from './builders/epochs.js';

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
	const contributionIntervalMin = 30;
	setInterval(async () => {
		try {
			const messages = await buildContributionMessages();
			console.log("auto-updating messages:", JSON.stringify(messages, null, " "));
			if(messages.length > 0) {
				await sendToChannel(...messages).with(client);
			}
		} catch(err) {
			console.error(err);
		}
	}, contributionIntervalMin * 60 * 1000);

	// Start interval to send epoch reminders every 'x' minutes:
	const epochIntervalMin = 60;
	setInterval(async () => {
		try {
			// Get ending epoch:
			const lastEpochNum = await getLastAlertedEpochNumber();
			const endingEpoch = (await epochsEndingWithin((1000 * 60 * 60 * 24))).filter(x => x.number > lastEpochNum)[0]; // within 24 hr
			if(endingEpoch) {
				console.log(`Found ending epoch: ${endingEpoch}`);
				const message = await buildEndingEpochMessage(endingEpoch.number, new Date(endingEpoch.end_date));
				await sendToChannel(message).with(client);
				await setLastAlertedEpochNumber(endingEpoch.number);
			}
		} catch(err) {
			console.error(err);
		}
	}, epochIntervalMin * 60 * 1000);
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
