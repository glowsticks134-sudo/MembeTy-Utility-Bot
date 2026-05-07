import { Command } from "#structures/classes/Command";
import { PermissionFlagsBits } from "discord.js";
import ms from "ms";

class GiveawayEditCommand extends Command {
  constructor() {
    super({
      name: "gedit",
      description: "Edit an existing giveaway",
      usage: "gedit <message_id> <option> <value>",
      aliases: ["giveaway-edit", "giveawayedit", "editgiveaway"],
      category: "giveaway",
      examples: [
        "gedit 1234567890123456789 time 2h",
        "gedit 1234567890123456789 winners 3",
        "gedit 1234567890123456789 prize Steam Gift Card"
      ],
      cooldown: 5,
      userPermissions: [PermissionFlagsBits.ManageGuild],
      enabledSlash: true,
      slashData: {
        name: "gedit",
        description: "Edit an existing giveaway",
        options: [
          {
            name: "message_id",
            description: "The message ID of the giveaway to edit",
            type: 3,
            required: true
          },
          {
            name: "option",
            description: "What to edit (time, winners, prize)",
            type: 3,
            required: true,
            choices: [
              { name: "Add Time", value: "time" },
              { name: "Winners", value: "winners" },
              { name: "Prize", value: "prize" }
            ]
          },
          {
            name: "value",
            description: "The new value",
            type: 3,
            required: true
          }
        ]
      }
    });
  }

  _doEdit(client, messageId, option, value) {
    const giveaway = client.giveaways.get(messageId);

    if (!giveaway) {
      return { success: false, reason: "No active giveaway found with that message ID." };
    }

    if (giveaway.ended) {
      return { success: false, reason: "This giveaway has already ended and cannot be edited." };
    }

    switch (option) {
      case "time": {
        const addTime = ms(value);
        if (!addTime) {
          return { success: false, reason: "Invalid time format. Use formats like 1h, 30m, 1d." };
        }
        giveaway.endTime += addTime;
        return { success: true, detail: `Added ${value} to the giveaway duration.` };
      }
      case "winners": {
        const winnerCount = parseInt(value);
        if (isNaN(winnerCount) || winnerCount < 1 || winnerCount > 20) {
          return { success: false, reason: "Winner count must be a number between 1 and 20." };
        }
        giveaway.winnersCount = winnerCount;
        return { success: true, detail: `Winner count updated to ${winnerCount}.` };
      }
      case "prize": {
        if (!value || value.length < 1 || value.length > 256) {
          return { success: false, reason: "Prize must be between 1 and 256 characters." };
        }
        giveaway.prize = value;
        return { success: true, detail: `Prize updated to: ${value}` };
      }
      default:
        return { success: false, reason: "Invalid option. Use: time, winners, or prize." };
    }
  }

  async execute({ client, message, args }) {
    if (!args[0]) {
      return message.channel.send("Please provide the message ID of the giveaway to edit.");
    }

    if (!args[1]) {
      return message.channel.send("Please specify what to edit: time, winners, or prize.");
    }

    if (!args[2]) {
      return message.channel.send("Please provide the new value.");
    }

    const messageId = args[0];
    const option = args[1].toLowerCase();
    const value = args.slice(2).join(" ");

    const result = this._doEdit(client, messageId, option, value);

    if (!result.success) {
      return message.channel.send(`❌ ${result.reason}`);
    }

    return message.channel.send(`✅ Giveaway \`${messageId}\` updated. ${result.detail}`);
  }

  async slashExecute({ client, interaction }) {
    const messageId = interaction.options.getString("message_id");
    const option = interaction.options.getString("option");
    const value = interaction.options.getString("value");

    const result = this._doEdit(client, messageId, option, value);

    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.reason}`, ephemeral: true });
    }

    return interaction.reply(`✅ Giveaway \`${messageId}\` updated. ${result.detail}`);
  }
}

export default new GiveawayEditCommand();
