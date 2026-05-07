import { Command } from "#structures/classes/Command";
import { PermissionFlagsBits } from "discord.js";

class GiveawayPauseCommand extends Command {
  constructor() {
    super({
      name: "gpause",
      description: "Pause an active giveaway",
      usage: "gpause <message_id>",
      aliases: ["giveaway-pause", "giveawaypause", "pausegiveaway"],
      category: "giveaway",
      examples: ["gpause 1234567890123456789"],
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      enabledSlash: true,
      slashData: {
        name: "gpause",
        description: "Pause an active giveaway",
        options: [
          {
            name: "message_id",
            description: "The message ID of the giveaway to pause",
            type: 3,
            required: true
          }
        ]
      }
    });
  }

  _doPause(client, messageId) {
    const giveaway = client.giveaways.get(messageId);

    if (!giveaway) {
      return { success: false, reason: "No active giveaway found with that message ID." };
    }

    if (giveaway.ended) {
      return { success: false, reason: "This giveaway has already ended." };
    }

    if (giveaway.paused) {
      return { success: false, reason: "This giveaway is already paused. Use `gresume` to resume it." };
    }

    giveaway.paused = true;
    return { success: true };
  }

  async execute({ client, message, args }) {
    if (!args[0]) {
      return message.channel.send("Please provide the message ID of the giveaway to pause.");
    }

    const messageId = args[0];
    const result = this._doPause(client, messageId);

    if (!result.success) {
      return message.channel.send(`❌ ${result.reason}`);
    }

    return message.channel.send(`⏸️ Giveaway \`${messageId}\` has been paused. New entries will be rejected until resumed.`);
  }

  async slashExecute({ client, interaction }) {
    const messageId = interaction.options.getString("message_id");
    const result = this._doPause(client, messageId);

    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.reason}`, ephemeral: true });
    }

    return interaction.reply(`⏸️ Giveaway \`${messageId}\` has been paused. New entries will be rejected until resumed.`);
  }
}

export default new GiveawayPauseCommand();
