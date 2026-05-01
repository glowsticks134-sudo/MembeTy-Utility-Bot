import { db } from "#database/DatabaseManager";
import { ChannelType } from "discord.js";
import { logger } from "#utils/logger";

export default {
  name: "messageCreate",
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const guildId = message.guild.id;

    // ─── Auto-Publish (Announcement Channels) ─────────────────────────────────
    try {
      if (message.channel.type === ChannelType.GuildAnnouncement) {
        if (db.isAutopublish(guildId, message.channel.id)) {
          await message.crosspost().catch(e => {
            if (e.code !== 40033) logger.warn("AutoPublish", e.message);
          });
        }
      }
    } catch (e) {
      logger.error("AutoPublish", e.message);
    }

    // ─── Auto-Ping ─────────────────────────────────────────────────────────────
    try {
      const autoping = db.getAutoping(guildId, message.channel.id);
      if (autoping) {
        const role = message.guild.roles.cache.get(autoping.role_id);
        if (role) {
          const pingMsg = await message.channel.send({ content: role.toString(), allowedMentions: { roles: [role.id] } });
          setTimeout(() => pingMsg.delete().catch(() => {}), 3000);
        }
      }
    } catch (e) {
      logger.error("AutoPing", e.message);
    }
  },
};
