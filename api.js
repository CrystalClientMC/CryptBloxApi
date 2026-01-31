const DiscordService = {
    // GitHub Pages API URL (UPDATE WITH YOUR USERNAME)
    getApiUrl: () => {
        return 'https://[YOUR-GITHUB-USERNAME].github.io/CryptBloxApi/api/purchase';
    },

    // Send purchase notification via GitHub Pages
    sendPurchaseNotification: async (cartItems, totalAmount) => {
        try {
            console.log('📤 Sending purchase notification via GitHub API...');
            
            const response = await fetch(this.getApiUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cartItems: cartItems,
                    totalAmount: totalAmount,
                    orderId: `CRYPT-${Date.now().toString().slice(-8)}`,
                    customer: 'CryptBlox Customer',
                    timestamp: new Date().toISOString()
                })
            });

            const result = await response.json();
            
            if (result.success) {
                console.log('✅ Discord notification sent successfully:', result.message);
                return {
                    success: true,
                    orderId: result.orderId
                };
            } else {
                console.warn('⚠️ GitHub API failed, trying direct method...');
                return await this.sendDirectNotification(cartItems, totalAmount);
            }
        } catch (error) {
            console.error('❌ GitHub API request failed:', error);
            // Fallback to direct method
            return await this.sendDirectNotification(cartItems, totalAmount);
        }
    },

    // Fallback direct notification
    sendDirectNotification: async (cartItems, totalAmount) => {
        try {
            console.log('🔄 Using fallback direct notification...');
            
            // Base64 encoded webhook (same as before)
            const parts = [
                "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTQ2NzE5OTU3NjQwNTQ0MjgxNC8=",
                "eFVpdkVmd21oZUp0OXpJY3lSMldkUkZzOXZN",
                "UExMX0c0LTVtRDVvUHgwd1ZuZEpDWDBUOHRIeWh2",
                "cm9XVjROaUpoZVU="
            ];
            const webhookUrl = atob(parts.join(''));
            
            const itemsList = cartItems.map(item => 
                `• ${item.quantity}x **${item.name}** - $${item.price}`
            ).join('\n');
            
            const embed = {
                title: "💰 New Purchase - CRYPTBLOX",
                description: `**Purchase Successful!**\n\n**Items Purchased:**\n${itemsList}\n\n**Total:** $${totalAmount.toFixed(2)}`,
                color: 0xFBBF24,
                timestamp: new Date().toISOString(),
                fields: [
                    { 
                        name: "Order ID", 
                        value: `CRYPT-${Date.now().toString().slice(-8)}`, 
                        inline: true 
                    },
                    { 
                        name: "Items Count", 
                        value: cartItems.reduce((sum, item) => sum + item.quantity, 0).toString(), 
                        inline: true 
                    },
                    { 
                        name: "Delivery Method", 
                        value: "Direct Webhook (Fallback)", 
                        inline: true 
                    }
                ],
                footer: { 
                    text: "CryptBlox v2.0 • Direct Notification" 
                }
            };

            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    embeds: [embed],
                    username: "CryptBlox Store Bot",
                    avatar_url: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
                })
            });

            if (response.ok) {
                console.log('✅ Fallback notification sent successfully');
                return { success: true, method: 'direct' };
            } else {
                console.error('❌ Fallback also failed');
                return { success: false, error: 'All notification methods failed' };
            }
        } catch (error) {
            console.error('❌ Direct notification failed:', error);
            return { success: false, error: error.message };
        }
    },

    // Test function
    testNotification: async () => {
        const testItems = [
            { name: 'Test Item 1', price: 99.99, quantity: 2 },
            { name: 'Test Item 2', price: 49.99, quantity: 1 }
        ];
        const total = testItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const result = await this.sendPurchaseNotification(testItems, total);
        
        if (result.success) {
            alert(`✅ Test notification sent!\nOrder ID: ${result.orderId || 'N/A'}\nMethod: ${result.method || 'github-api'}`);
        } else {
            alert(`❌ Test failed: ${result.error || 'Unknown error'}`);
        }
    }
};
