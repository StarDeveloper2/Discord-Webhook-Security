# Star Development - Discord Webhook Security Bot

<div align="center">
  <img src="https://up6.cc/2025/05/174645261516071.png" alt="star dev Logo" width="200"/>
  <br>
  <h3>📂 Advanced Discord Webhook Security</h3>
<p>A powerful and efficient Discord bot designed to protect your server from webhook spam and related attacks. It actively monitors webhook activity and sends instant alerts whenever a webhook is created or deleted, along with periodic logs for server administrators to review. With multi-language support and seamless integration, this bot adds an essential layer of security to your community.</p>
  
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Discord.js](https://img.shields.io/badge/discord.js-v14.11.0-7289da)
![Node.js](https://img.shields.io/badge/node.js-v16.x-43853d)
</div>

---

## 📋 Features

- **🚫 Webhook Spam Protection**: Automatically detects and blocks suspicious or spammy webhook activity.
- **📥 Webhook Creation & Deletion Logs**: Sends detailed logs to a specific channel whenever a webhook is created or deleted.
- **📑 Periodic Activity Reports**: Provides regular summaries of webhook-related activity for server admins.
- **🛑 Instant Alert System**: Notifies admins immediately if abnormal webhook behavior is detected.
- **📊 Embed-Based Logs**: All logs and alerts are sent in organized, easy-to-read Embed messages.
- **🌍 Multi-language Support**: Fully supports multiple languages via a flexible language config system.
- **🔧 Server-Specific Configuration**: Customize log channels, alert thresholds, language, and more in `config.js`.
- **🔒 Guild-restricted Commands**: Commands only function in authorized servers for enhanced control and security.

## ⚙️ Configuration

The bot is configured through the `config.js` file:

```javascript
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
```


## 🏗️ Project Structure

```
.
├── index.js                     # Main entry point
├── config.js                    # Bot configuration
├── package.json                 # Project dependencies
├── start.bat                    # Batch file to start the bot
├── install.bat                  # Batch file for installing dependencies
└── languages/
    ├── en.js                    # English translations
    └── ar.js                    # Arabic translations
```


## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🔗 Links

- [Discord Server](https://discord.gg/std)
- [GitHub Repository](https://github.com/StarDeveloper2/Discord-Webhook-Security)

## ⭐ Credits

Developed with 💙 by [Star Development](https://discord.gg/std) 
