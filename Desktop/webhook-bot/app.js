const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 10000;
const VERIFY_TOKEN = 'meinSichererToken123';

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
app.post('/webhook', (req, res) => {
    let body = req.body;

    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            if (webhook_event.message) {
                handleMessages(webhook_event.sender.id, webhook_event.message);
            }
        });
        res.status(200).send('Ereignis erhalten');
    } else {
        res.sendStatus(404);
    }
});

function handleMessages(senderId, message) {
    let response;

    if (message.text) {
        if (message.text.toLowerCase().includes('hallo')) {
            response = { text: "Hallo! Wie kann ich Ihnen helfen?" };
        } else if (message.text.toLowerCase().includes('haartransplantation')) {
            response = { text: "Wir freuen uns, dass Sie an einer Haartransplantation interessiert sind. Bitte senden Sie uns aktuelle Bilder von Ihrem Kopf, damit wir Ihren Fall besser beurteilen können." };
        } else {
            response = { text: "Vielen Dank für Ihre Nachricht. Wie können wir Ihnen weiterhelfen?" };
        }
    }

    sendMessage(senderId, response);
}

function sendMessage(recipientId, message) {
    console.log(`Sending message to ${recipientId}: ${message.text}`);
}

// Server starten
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
