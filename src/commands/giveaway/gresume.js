import { Command } from "#structures/classes/Command";
import { PermissionFlagsBits } from "discord.js";

class GiveawayResumeCommand extends Command {
  constructor() {
    super({
      name: "gresume",
      description: "Resume a paused giveaway",
      usage: "gresume <message_id>",
      aliases: ["giveaway-resume", "giveawayresume", "resumegiveaway", "gunpause"],
      category: "giveaway",
      examples: ["gresume 1234567890123456789"],
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      enabledSlash: true,
      slashData: {
        name: "gresume",
        description: "Resume a paused giveaway",
        options: [
          {
            name: "message_id",
            description: "The message ID of the giveaway to resume",
            type: 3,
            required: true
          }
        ]
      }
    });
  }

  _doResume(client, messageId) {
    const giveaway = client.giveaways.get(messageId);

    if (!giveaway) {
      return { success: false, reason: "No active giveaway found with that message ID." };
    }

    if (giveaway.ended) {
      return { success: false, reason: "This giveaway has already ended." };
    }

    if (!giveaway.paused) {
      return { success: false, reason: "This giveaway is not paused." };
    }

    giveaway.paused = false;
    return { success: true };
  }

  async execute({ client, message, args }) {
    if (!args[0]) {
      return message.channel.send("Please provide the message ID of the giveaway to resume.");
    }

    const messageId = args[0];
    const result = this._doResume(client, messageId);

    if (!result.success) {
      return message.channel.send(`❌ ${result.reason}`);
    }

    return message.channel.send(`▶️ Giveaway \`${messageId}\` has been resumed. Entries are now open again.`);
  }

  async slashExecute({ client, interaction }) {
    const messageId = interaction.options.getString("message_id");
    const result = this._doResume(client, messageId);

    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.reason}`, ephemeral: true });
    }

    return interaction.reply(`▶️ Giveaway \`${messageId}\` has been resumed. Entries are now open again.`);
  }
}

export default new GiveawayResumeCommand();
