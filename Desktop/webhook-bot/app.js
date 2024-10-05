const express = require('express');
const bodyParser = require('body-parser');
const request = require('request'); // Stelle sicher, dass 'request' installiert ist

const app = express();
const PORT = process.env.PORT || 10000;
const VERIFY_TOKEN = 'meinGeheimesToken123';
const accessToken = 'DeinZugriffstokenHierEinfügen';
const whatsappAPIURL = 'https://graph.facebook.com/v15.0/me/messages';

// Erlaube JSON-Parsing für eingehende Webhook-Daten
app.use(bodyParser.json());

// Verifizierung der Webhook-GET-Anfrage von Meta
app.get('/webhook', (req, res) => {
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token === VERIFY_TOKEN) {
        if (mode === 'subscribe') {
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
        res.sendStatus(403);
    }
});

// Verarbeitung der Webhook-POST-Anfrage von Meta
app.post('/webhook', (req, res) => {
    const message = req.body.entry[0].messaging[0].message.text;
    if (message.toLowerCase() === 'hallo') {
        sendMessageToWhatsApp({
            text: 'Hallo! Wie kann ich Ihnen helfen?',
            to: req.body.entry[0].messaging[0].sender.id
        });
    } else if (message.toLowerCase().includes('haartransplantation')) {
        sendMessageToWhatsApp({
            text: 'Bitte senden Sie uns aktuelle Bilder von Ihrem Kopf, damit wir Ihren Fall besser beurteilen können.',
            to: req.body.entry[0].messaging[0].sender.id
        });
    } else {
        sendMessageToWhatsApp({
            text: 'Vielen Dank für Ihre Nachricht. Wie können wir Ihnen weiterhelfen?',
            to: req.body.entry[0].messaging[0].sender.id
        });
    }
    res.sendStatus(200);
});

// Funktion zum Senden einer Nachricht an WhatsApp
function sendMessageToWhatsApp(messageData) {
    request({
        url: whatsappAPIURL,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: messageData.to,
            type: 'text',
            text: { body: messageData.text }
        })
    }, (error, response, body) => {
        if (error) {
            console.log('Fehler beim Senden der Nachricht:', error);
        } else if (response.body.error) {
            console.log('API Fehler:', response.body.error);
        }
    });
}

// Starten des Servers
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
