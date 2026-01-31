// api/webhook.js
export async function onRequest(context) {
  try {
    const { request } = context;
    
    // Only allow POST requests
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Parse the request body
    const data = await request.json();
    
    // Your Discord webhook URL (keep this secret in GitHub Secrets)
    const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1467199576405442814/xUivEfwmheJt9zIcyR2WdRFs9vMPLL_G4-5mD5oPx0wVndJCX0T8tHyhvroWV4NiJheU";
    
    // Create Discord embed
    const embed = {
      title: "💰 New Purchase - CRYPTBLOX",
      description: `**Purchase Successful!**\n\n**Items Purchased:**\n${data.items || 'No items'}\n\n**Total:** ${data.total || '$0.00'}`,
      color: 0xFBBF24,
      timestamp: new Date().toISOString(),
      fields: [
        { name: "Order ID", value: data.orderId || `CRYPT-${Date.now().toString().slice(-8)}`, inline: true },
        { name: "Items Count", value: String(data.itemCount || 0), inline: true },
        { name: "Customer", value: data.customer || 'Guest', inline: true }
      ],
      footer: { text: "CryptBlox v2.0 • GitHub Proxy" }
    };
    
    // Send to Discord
    const discordResponse = await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [embed],
        username: "CryptBlox Store Bot",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
      })
    });
    
    if (discordResponse.ok) {
      return new Response(JSON.stringify({ success: true, message: 'Notification sent to Discord' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ success: false, error: 'Discord webhook failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
