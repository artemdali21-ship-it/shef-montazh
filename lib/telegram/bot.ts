const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN

interface MessageOptions {
  parse_mode?: 'Markdown' | 'HTML'
  reply_markup?: any
}

/**
 * Send a message via Telegram Bot API
 */
export async function sendMessage(
  chatId: number,
  text: string,
  options?: MessageOptions
) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set')
    return { ok: false, error: 'Bot token not configured' }
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parse_mode || 'Markdown',
        reply_markup: options?.reply_markup
      })
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error sending Telegram message:', error)
    return { ok: false, error }
  }
}

/**
 * Send a message with a Web App button
 */
export async function sendMessageWithWebApp(
  chatId: number,
  text: string,
  buttonText: string,
  webAppUrl: string
) {
  return sendMessage(chatId, text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[
        {
          text: buttonText,
          web_app: { url: webAppUrl }
        }
      ]]
    }
  })
}

/**
 * Set webhook URL for the bot
 */
export async function setWebhook(webhookUrl: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set')
    return { ok: false, error: 'Bot token not configured' }
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl })
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error setting webhook:', error)
    return { ok: false, error }
  }
}

/**
 * Get webhook info
 */
export async function getWebhookInfo() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN is not set')
    return { ok: false, error: 'Bot token not configured' }
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`

  try {
    const response = await fetch(url)
    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error getting webhook info:', error)
    return { ok: false, error }
  }
}
