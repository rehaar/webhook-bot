require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 10000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// OpenAI API-Konfiguration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.use(bodyParser.json());

// Verifizierungsendpunkt für Meta
app.get('/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verifiziert');
        res.status(200).send(challenge);
    } else {
        console.log('Verifizierung fehlgeschlagen');
        res.sendStatus(403);
    }
});

// Empfängt Nachrichten von Meta und antwortet
app.post('/webhook', async (req, res) => {
    let body = req.body;

    if (body.object === 'whatsapp_business_account') {
        body.entry.forEach(async function(entry) {
            let changes = entry.changes;
            changes.forEach(async function(change) {
                let value = change.value;
                if (value.messages) {
                    let message = value.messages[0];
                    console.log('Nachricht erhalten:', message);
                    await handleMessages(message.from, message);
                }
            });
        });
        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

// Nachricht behandeln
async function handleMessages(senderId, message) {
    let response;

    if (message.text) {
        if (message.text.body.toLowerCase().includes('hallo')) {
            response = { text: "Hallo! Wie kann ich Ihnen helfen?" };
        } else if (message.text.body.toLowerCase().includes('haartransplantation')) {
            response = { text: "Wir freuen uns, dass Sie an einer Haartransplantation interessiert sind. Bitte senden Sie uns aktuelle Bilder von Ihrem Kopf, damit wir Ihren Fall besser beurteilen können." };
        } else {
            // Anfrage an die OpenAI API zur Verarbeitung der Nachricht
            try {
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [{ role: "user", content: message.text.body }],
                    max_tokens: 150
                });
                response = { text: completion.choices[0].message.content };
            } catch (error) {
                console.error("Fehler bei der Anfrage an die OpenAI API:", error);
                response = { text: "Es gab ein Problem beim Verarbeiten Ihrer Anfrage. Bitte versuchen Sie es später erneut." };
            }
        }
    }

    sendMessage(senderId, response);
}

// Nachricht senden
function sendMessage(recipientId, message) {
    console.log(`Sending message to ${recipientId}: ${message.text}`);
    // Hier können wir später den Code hinzufügen, um die Nachricht über die WhatsApp API zu senden.
}

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
