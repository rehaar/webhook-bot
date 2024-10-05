const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// Erlaube JSON-Parsing für eingehende Webhook-Daten
app.use(bodyParser.json());

// Endpunkt für den WhatsApp-Webhook
app.post('/webhook', (req, res) => {
    const message = req.body.message;

    // Beispielantwort auf die Nachricht "Hallo"
    if (message.text.toLowerCase() === 'hallo') {
        res.json({
            reply: 'Hallo! Wie kann ich Ihnen helfen?'
        });
    } 

    // Logik für Haartransplantationsanfragen
    else if (message.text.toLowerCase().includes('haartransplantation')) {
        res.json({
            reply: 'Wir freuen uns, dass Sie an einer Haartransplantation interessiert sind. Bitte senden Sie uns aktuelle Bilder von Ihrem Kopf, damit wir Ihren Fall besser beurteilen können.'
        });
    }

    // Weitere Logik für verschiedene Nachrichten
    else {
        res.json({
            reply: 'Vielen Dank für Ihre Nachricht. Wie können wir Ihnen weiterhelfen?'
        });
    }
});

// Starten des Servers auf Port 10000 oder standardmäßig auf einem anderen Port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
