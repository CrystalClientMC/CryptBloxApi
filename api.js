// api/purchase.js - GitHub Pages Function
export async function onRequest(context) {
  try {
    const { request } = context;
    
    // Set CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    };
    
    // Handle OPTIONS (preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }
    
    // Only allow POST
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ 
        error: 'Method not allowed. Use POST.' 
      }), {
        status: 405,
        headers: corsHeaders
      });
    }
    
    // Parse request data
    let data;
    try {
      data = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON format' 
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    
    // Validate required fields
    if (!data.cartItems || !Array.isArray(data.cartItems)) {
      return new Response(JSON.stringify({ 
        error: 'Missing or invalid cartItems array' 
      }), {
        status: 400,
        headers: corsHeaders
      });
    }
    
    // Calculate total
    const totalAmount = data.cartItems.reduce((sum, item) => 
      sum + (item.price * (item.quantity || 1)), 0
    );
    
    // Format items list for Discord
    const itemsList = data.cartItems.map(item => 
      `• ${item.quantity || 1}x **${item.name}** - $${item.price}`
    ).join('\n');
    
    // Your Discord webhook URL
    const DISCORD_WEBHOOK = "https://discord.com/api/webhooks/1467199576405442814/xUivEfwmheJt9zIcyR2WdRFs9vMPLL_G4-5mD5oPx0wVndJCX0T8tHyhvroWV4NiJheU";
    
    // Create Discord embed
    const embed = {
      title: "💰 New Purchase - CRYPTBLOX",
      description: `**Purchase Successful!**\n\n**Items Purchased:**\n${itemsList}\n\n**Total:** $${totalAmount.toFixed(2)}`,
      color: 0xFBBF24, // Yellow theme color
      timestamp: new Date().toISOString(),
      fields: [
        {
          name: "Order ID",
          value: data.orderId || `CRYPT-${Date.now().toString().slice(-8)}`,
          inline: true
        },
        {
          name: "Items Count",
          value: data.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0).toString(),
          inline: true
        },
        {
          name: "Customer",
          value: data.customer || 'Guest',
          inline: true
        }
      ],
      footer: {
        text: "CryptBlox v2.0 • GitHub Pages Proxy"
      },
      thumbnail: {
        url: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
      }
    };
    
    // Send to Discord
    const discordResponse = await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
        username: "CryptBlox Store Bot",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png",
        content: data.cartItems.length > 2 ? "@here Large purchase completed! 🎉" : ""
      })
    });
    
    if (discordResponse.ok) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Purchase notification sent to Discord',
        orderId: data.orderId || `CRYPT-${Date.now().toString().slice(-8)}`,
        total: totalAmount
      }), {
        status: 200,
        headers: corsHeaders
      });
    } else {
      const errorText = await discordResponse.text();
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Discord webhook failed',
        details: errorText
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Server error',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
