import { Command } from "#structures/classes/Command";
import { PermissionFlagsBits } from "discord.js";
import { logger } from "#utils/logger";

class GiveawayRerollCommand extends Command {
  constructor() {
    super({
      name: "gereroll",
      description: "Reroll a giveaway winner",
      usage: "gereroll <message_id>",
      aliases: ["greroll", "giveaway-reroll", "giveawayreroll"],
      category: "giveaway",
      examples: ["gereroll 1234567890123456789"],
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      enabledSlash: true,
      slashData: {
        name: "gereroll",
        description: "Reroll a giveaway winner",
        options: [
          {
            name: "message_id",
            description: "The message ID of the giveaway to reroll",
            type: 3,
            required: true
          }
        ]
      }
    });
  }

  async _doReroll(client, messageId) {
    const giveaway = client.giveaways.get(messageId);

    if (!giveaway) {
      return { success: false, reason: "No giveaway found with that message ID. Make sure the giveaway was started with this bot and the ID is correct." };
    }

    if (!giveaway.ended) {
      return { success: false, reason: "This giveaway has not ended yet. End it first with `gend`." };
    }

    const participants = giveaway.finalParticipants || Array.from(giveaway.participants);

    if (participants.length === 0) {
      return { success: false, reason: "No participants entered this giveaway, so a reroll is not possible." };
    }

    try {
      // Pick new winners
      const shuffled = [...participants].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, Math.min(giveaway.winnersCount, participants.length));
      const newWinners = [];

      for (const winnerId of selected) {
        try {
          const user = await client.users.fetch(winnerId);
          newWinners.push(user.toString());
        } catch {
          newWinners.push(`<@${winnerId}>`);
        }
      }

      // Update stored last winners
      giveaway.lastWinners = newWinners;

      // Announce new winners in the giveaway channel
      const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
      if (channel) {
        await channel.send({
          content: `🎉 **Giveaway Reroll!** New winner${newWinners.length !== 1 ? "s" : ""} for **${giveaway.prize}**: ${newWinners.join(", ")}! Congratulations!`
        });
      }

      return { success: true, winners: newWinners, prize: giveaway.prize };
    } catch (error) {
      logger.error("GiveawayRerollCommand", "Reroll error:", error);
      return { success: false, reason: "An unexpected error occurred while rerolling." };
    }
  }

  async execute({ client, message, args }) {
    if (!args[0]) {
      return message.channel.send("Please provide the message ID of the giveaway to reroll.");
    }

    const messageId = args[0];
    const result = await this._doReroll(client, messageId);

    if (!result.success) {
      return message.channel.send(`❌ ${result.reason}`);
    }

    return message.channel.send(`✅ Rerolled! New winner${result.winners.length !== 1 ? "s" : ""} for **${result.prize}**: ${result.winners.join(", ")}!`);
  }

  async slashExecute({ client, interaction }) {
    const messageId = interaction.options.getString("message_id");
    const result = await this._doReroll(client, messageId);

    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.reason}`, ephemeral: true });
    }

    return interaction.reply(`✅ Rerolled! New winner${result.winners.length !== 1 ? "s" : ""} for **${result.prize}**: ${result.winners.join(", ")}!`);
  }
}

export default new GiveawayRerollCommand();
