import { Config } from './config.js';
import { REST, Routes, Client, GatewayIntentBits } from 'discord.js';

// Update Commands:
const commands = [
	{
		name: 'ping',
		description: 'Replies with Pong!',
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
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	if (interaction.commandName === 'ping') {
		await interaction.reply('Pong!');
    await interaction.channel?.send("test message");
	}
});

client.login(Config.env.BOT_TOKEN);
