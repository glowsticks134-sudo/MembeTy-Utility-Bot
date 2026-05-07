import { Command } from "#structures/classes/Command";
import { PermissionFlagsBits } from "discord.js";
import { logger } from "#utils/logger";

class GiveawayEndCommand extends Command {
  constructor() {
    super({
      name: "gend",
      description: "End a giveaway immediately",
      usage: "gend <message_id>",
      aliases: ["giveaway-end", "giveawayend", "endgiveaway"],
      category: "giveaway",
      examples: ["gend 1234567890123456789"],
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      enabledSlash: true,
      slashData: {
        name: "gend",
        description: "End a giveaway immediately",
        options: [
          {
            name: "message_id",
            description: "The message ID of the giveaway to end",
            type: 3,
            required: true
          }
        ]
      }
    });
  }

  async _doEnd(client, messageId) {
    const giveaway = client.giveaways.get(messageId);

    if (!giveaway) {
      return { success: false, reason: "No active giveaway found with that message ID." };
    }

    if (giveaway.ended) {
      return { success: false, reason: "This giveaway has already ended." };
    }

    try {
      // Stop the collector — this triggers the "end" event in gstart.js which
      // handles winner selection, message editing, and announcement.
      // Do NOT set giveaway.ended = true here; the "end" event handler does that.
      giveaway.collector.stop("manual");

      return { success: true };
    } catch (error) {
      logger.error("GiveawayEndCommand", "End error:", error);
      return { success: false, reason: "An unexpected error occurred while ending the giveaway." };
    }
  }

  async execute({ client, message, args }) {
    if (!args[0]) {
      return message.channel.send("Please provide the message ID of the giveaway to end.");
    }

    const messageId = args[0];
    const result = await this._doEnd(client, messageId);

    if (!result.success) {
      return message.channel.send(`❌ ${result.reason}`);
    }

    return message.channel.send(`✅ Giveaway \`${messageId}\` has been ended successfully.`);
  }

  async slashExecute({ client, interaction }) {
    const messageId = interaction.options.getString("message_id");
    const result = await this._doEnd(client, messageId);

    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.reason}`, ephemeral: true });
    }

    return interaction.reply(`✅ Giveaway \`${messageId}\` has been ended successfully.`);
  }
}

export default new GiveawayEndCommand();
