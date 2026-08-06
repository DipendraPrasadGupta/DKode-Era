import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY || process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

    // Premium offline responses if the API Key is not set yet
    if (!apiKey || apiKey === 'your_api_key_here') {
      const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let reply = "Hello! I am D-Kode AI, your assistant. I am currently running in offline/demo mode, but I can tell you that D-Kode Era is Butwal's premier IT agency. We specialize in custom Web Development, Mobile Apps, Hotel Systems, and Digital Marketing. For inquiries, email us at info@dkodeera.com or call +977-9807544395!";
      
      if (lastUserMsg.includes('price') || lastUserMsg.includes('pricing') || lastUserMsg.includes('cost') || lastUserMsg.includes('rate') || lastUserMsg.includes('money')) {
        reply = "Our pricing is transparent and highly competitive: Web Development starts from Rs. 15,000, Mobile Apps from Rs. 60,000, Hotel Systems (HMS Pro) from Rs. 40,000, and Digital Marketing from Rs. 8,000/month. We offer a 30-day post-launch support period absolutely free. Contact us at info@dkodeera.com for a free detailed quote!";
      } else if (lastUserMsg.includes('service') || lastUserMsg.includes('offer') || lastUserMsg.includes('do you do') || lastUserMsg.includes('what do you build')) {
        reply = "We offer a wide range of premium services:\n\n1. 🌐 Custom Web Development (React, Next.js, Node.js)\n2. 📱 Mobile Application Development (iOS & Android)\n3. 🏨 Hotel Management Systems (HMS Pro)\n4. 📈 Digital Marketing & SEO\n5. 🎨 UI/UX Design\n6. ☁️ Custom SaaS Products\n\nLet us know what you'd like to build!";
      } else if (lastUserMsg.includes('contact') || lastUserMsg.includes('phone') || lastUserMsg.includes('email') || lastUserMsg.includes('location') || lastUserMsg.includes('where')) {
        reply = "We are located at Butwal-10, Rupandehi, Nepal. You can email us at info@dkodeera.com or reach out via WhatsApp/Call at +977-9807544395. We are ready to start your project!";
      } else if (lastUserMsg.includes('hello') || lastUserMsg.includes('hi') || lastUserMsg.includes('namaste')) {
        reply = "Namaste! Welcome to D-Kode Era. I am D-Kode AI. How can I help you today? You can ask about our services, pricing, location, or contact details.";
      }

      return NextResponse.json({
        content: [{ text: reply }]
      });
    }

    const systemPrompt = `You are D-Kode AI, the intelligent assistant for D-Kode Era Pvt. Ltd., a full-stack IT company based in Butwal, Nepal. Answer questions about services, pricing, timelines, and how D-Kode Era can help businesses. Be concise, friendly, and helpful. Key info: Website from Rs.15,000, Mobile app from Rs.60,000, Hotel system from Rs.40,000, Digital marketing Rs.8,000/month. Located in Butwal-10, Rupandehi. Contact: info@dkodeera.com. Turnaround: 7-14 days for websites. Accept eSewa, Khalti, cash. 30 days free post-launch support. Co-founders: Dipendra Prasad Gupta (CEO, full-stack dev) and Kshitiza (COO). Registered Private Limited Company in Nepal.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-latest',
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m: any) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        }))
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error response:', errText);
      throw new Error(`Anthropic API responded with status ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in chat API route:', error);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}
