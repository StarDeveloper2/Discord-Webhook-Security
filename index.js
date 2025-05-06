const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField, Events, AuditLogEvent } = require('discord.js');
const config = require('./config.js');
const lang = require(`./languages/${config.languages}.js`);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel]
});

client.once('ready', async () => {
    console.log(`
        ░██████╗████████╗░█████╗░██████╗░
        ██╔════╝╚══██╔══╝██╔══██╗██╔══██╗
        ╚█████╗░░░░██║░░░███████║██████╔╝
        ░╚═══██╗░░░██║░░░██╔══██║██╔══██╗
        ██████╔╝░░░██║░░░██║░░██║██║░░██║
        ╚═════╝░░░░╚═╝░░░╚═╝░░╚═╝╚═╝░░╚═╝
        You Need Help? Join to my discord : discord.gg/std
        Star Webhook Security Bot Created By : Star Development!
        Logged in as ${client.user.tag}!`);

    await disablePreviousButtons();
    await sendWebhookReport();
});

async function sendWebhookReport(interaction = null) {
    const logsChannelId = config.ChannelReport;
    const logsChannel = await client.channels.fetch(logsChannelId).catch(() => null);
    if (!logsChannel || !logsChannel.isTextBased()) return;

    let reportLines = [];

    const guild = interaction?.guild ?? logsChannel.guild; {
        for (const [channelId, channel] of guild.channels.cache) {
            if (!channel.isTextBased()) continue;
            try {
                const webhooks = await channel.fetchWebhooks();
                for (const [id, webhook] of webhooks) {
                    const owner = webhook.owner;
                    const webhookName = webhook.name || "Unnamed";
                    const createdBy = owner ? `<@${owner.id}> (${owner.username})` : "Unknown";
                    const line = `🔹 \`${webhookName}\`\n  📍 Channel: <#${channel.id}>\n  👤 Created by: ${createdBy}`;
                    reportLines.push(line);
                }
            } catch (err) {
                console.warn(`Failed to fetch webhooks from #${channel.name}:`, err.message);
            }
        }
    }

    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('rescan_webhooks')
            .setLabel(lang.scanning.buttonLabel)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(false)
    );

    const embed = new EmbedBuilder()
        .setTitle(reportLines.length === 0 ? lang.scanning.noWebhooksTitle : lang.scanning.reportTitle)
        .setDescription(reportLines.length === 0 ? lang.scanning.noWebhooksDesc : reportLines.join('\n\n'))
        .setColor(reportLines.length === 0 ? 0xff0000 : 0x00b0f4)
        .setFooter({ text: `${client.user.username}` })
        .setImage(config.EmbedImage)
        .setTimestamp();

    await logsChannel.send({ embeds: [embed], components: [actionRow] });

    if (interaction) {
        await interaction.followUp({
            content: lang.scanning.successScan,
            ephemeral: true
        });
    }
}

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId === 'rescan_webhooks') {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({ content: lang.scanning.noPermission, ephemeral: true });
        }

        await interaction.reply({ content: lang.scanning.rescanNotice, ephemeral: true });
        await interaction.message.edit({
            components: [
                new ActionRowBuilder().addComponents(
                    ButtonBuilder.from(interaction.component).setDisabled(true)
                )
            ]
        });

        await sendWebhookReport(interaction);
    }
});

async function disablePreviousButtons() {
    const logsChannelId = config.ChannelReport;
    const logsChannel = await client.channels.fetch(logsChannelId).catch(() => null);
    if (!logsChannel || !logsChannel.isTextBased()) return;

    const messages = await logsChannel.messages.fetch({ limit: 50 });
    for (const msg of messages.values()) {
        if (!msg.components.length) continue;
        const hasRescanButton = msg.components.some(row =>
            row.components.some(btn => btn.customId === 'rescan_webhooks' && !btn.disabled)
        );

        if (hasRescanButton) {
            const newComponents = msg.components.map(row => {
                const newRow = new ActionRowBuilder();
                row.components.forEach(comp => {
                    if (comp.customId === 'rescan_webhooks') {
                        newRow.addComponents(ButtonBuilder.from(comp).setDisabled(true));
                    } else {
                        newRow.addComponents(comp);
                    }
                });
                return newRow;
            });

            await msg.edit({ components: newComponents }).catch(() => {});
        }
    }
}

const { deleteWebhookMessages, deleteWebhook } = require('./config');
const webhookTracking = new Map();
const maxMessagesPerWebhook = config.maxWebhook;

client.on('messageCreate', async (message) => {
    if (!message.webhookId) return;
    const webhookId = message.webhookId;
    const count = webhookTracking.get(webhookId) || 0;
    webhookTracking.set(webhookId, count + 1);

    try {
        const webhooks = await message.channel.fetchWebhooks();
        const webhook = webhooks.get(webhookId);

        if (webhook && webhookTracking.get(webhookId) > maxMessagesPerWebhook) {
            if (deleteWebhookMessages) {
                const messages = await message.channel.messages.fetch({ limit: 100 });
                const spamMessages = messages.filter(m => m.webhookId === webhookId);
                for (const msg of spamMessages.values()) {
                    await msg.delete().catch(() => null);
                }
            }

            if (deleteWebhook) {
                await webhook.delete('Exceeded allowed message limit').catch(() => null);
            }

            const logsChannel = await client.channels.fetch(config.SecurityLogs);
            if (logsChannel && logsChannel.isTextBased()) {
                const embed = new EmbedBuilder()
                    .setTitle(lang.security.detectedTitle)
                    .setDescription(`${deleteWebhook ? "webhook" : ""}${(deleteWebhook && deleteWebhookMessages) ? " and " : ""}${deleteWebhookMessages ? "its spam messages" : ""} ${lang.security.deleted}`)
                    .addFields(
                        { name: lang.security.creator, value: webhook.owner ? `<@${webhook.owner.id}> (${webhook.owner.username})` : 'Unknown', inline: true },
                        { name: lang.security.webhookId, value: webhookId, inline: true },
                        { name: lang.security.channel, value: `<#${message.channel.id}>`, inline: true },
                        { name: lang.security.count, value: `${webhookTracking.get(webhookId)}`, inline: true },
                        { name: lang.security.reason, value: message.content || 'No Reason', inline: false }
                    )
                    .setColor(0xFF0000)
                    .setFooter({ text: `${client.user.username}` })
                    .setImage(config.EmbedImage)
                    .setTimestamp();

                await logsChannel.send({ embeds: [embed] });
            }

            webhookTracking.delete(webhookId);
        }
    } catch (err) {
        console.error('Error while handling webhook message:', err);
    }
});

client.on('webhookUpdate', async (channel) => {
    try {
        const guild = channel.guild;
        const now = Date.now();
        const [createLogs, deleteLogs] = await Promise.all([
            guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.WebhookCreate }),
            guild.fetchAuditLogs({ limit: 1, type: AuditLogEvent.WebhookDelete })
        ]);
        const latestCreate = createLogs.entries.first();
        const latestDelete = deleteLogs.entries.first();

        if (latestCreate && now - latestCreate.createdTimestamp < 5000) {
            const { executor, target } = latestCreate;
            const embed = new EmbedBuilder()
                .setTitle(lang.audit.createdTitle)
                .setColor(0x00FF00)
                .addFields(
                    { name: lang.audit.name, value: target.name || 'Unknown', inline: true },
                    { name: lang.audit.webhookId, value: target.id || 'Unknown', inline: true },
                    { name: lang.audit.channel, value: `<#${channel.id}>`, inline: true },
                    { name: lang.audit.createdBy, value: `<@${executor.id}> (${executor.tag})`, inline: true }
                )
                .setFooter({ text: `${client.user.username}` })
                .setImage(config.EmbedImage)
                .setTimestamp();

            const logChannel = await client.channels.fetch(config.createWebhookLogs);
            return logChannel.send({ embeds: [embed] });
        }

        if (latestDelete && now - latestDelete.createdTimestamp < 5000) {
            const { executor, target } = latestDelete;
            const embed = new EmbedBuilder()
                .setTitle(lang.audit.deletedTitle)
                .setColor(0xFF0000)
                .addFields(
                    { name: lang.audit.name, value: target.name || 'Unknown', inline: true },
                    { name: lang.audit.webhookId, value: target.id || 'Unknown', inline: true },
                    { name: lang.audit.channel, value: `<#${channel.id}>`, inline: true },
                    { name: lang.audit.deletedBy, value: `<@${executor.id}> (${executor.tag})`, inline: true }
                )
                .setFooter({ text: `${client.user.username}` })
                .setImage(config.EmbedImage)
                .setTimestamp();

            const logChannel = await client.channels.fetch(config.deleteWebhookLogs);
            return logChannel.send({ embeds: [embed] });
        }

    } catch (error) {
        console.error('Error while logging webhook activity:', error);
    }
});

client.login(config.token);
