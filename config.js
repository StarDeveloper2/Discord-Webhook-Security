module.exports = {
    // Bot settings
    token: "YOUR_BOT_TOKEN",            // Your bot token (discord.com/developers/applications)
    languages: "en",                    // Language: "en", "ar", or custom (matches file in /languages)
    EmbedImage: "https://up6.cc/2025/05/174643733266111.jpg", // Image URL to be displayed in embeds
    
    // Log channels
    ChannelReport: "YOUR_CHANNEL_ID",       // Webhook scan report channel
    SecurityLogs: "YOUR_CHANNEL_ID",        // Webhook security logs
    createWebhookLogs: "YOUR_CHANNEL_ID",   // log channel id for created webhooks
    deleteWebhookLogs: "YOUR_CHANNEL_ID",   // log channel id for deleted webhooks

    // Webhook security
    maxWebhook: "3",                    // Max messages allowed per webhook

    // Boolean settings: true = enable, false = disable
    deleteWebhookMessages: true,       // Delete spam messages from webhooks
    deleteWebhook: true                // Delete the webhook itself
};
