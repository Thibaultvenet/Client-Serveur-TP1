const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

require('dotenv').config();

const chatGPTApiKey = process.env.CHATGPT_API_KEY;
if (!chatGPTApiKey) {
    console.error('La clé d\'API ChatGPT n\'est pas configurée.');
    process.exit(1);
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/submit', async (req, res) => {
    try {
        const { nom, prenom, email, recherche } = req.body;

        // Validation du champ de recherche
        if (!recherche) {
            return res.status(400).json({ error: 'Le champ de recherche ne peut pas être vide.' });
        }

        const userData = { nom, prenom, email, recherche };

        const chatGPTUrl = 'https://api.openai.com/v1/chat/completions';

        const userMessage = {
            role: 'user',
            content: recherche,
        };

        const chatGPTResponse = await axios.post(
            chatGPTUrl,
            {
                messages: [userMessage],
                model: 'gpt-3.5-turbo',
            },
            {
                headers: {
                    'Authorization': `Bearer ${chatGPTApiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Modification ici pour extraire la réponse correctement
        const chatGPTData = { response: chatGPTResponse.data.choices[0].message.content };
        
        console.log('Réponse de ChatGPT :', chatGPTData.response);

        res.status(200).json(chatGPTData);
    } catch (error) {
        console.error(error);

        if (error.response && error.response.data) {
            console.error('ChatGPT API Error:', error.response.data);
            return res.status(500).json({ error: 'Erreur lors de la communication avec l\'API de ChatGPT.' });
        } else {
            return res.status(500).json({ error: 'Erreur lors du traitement des données.' });
        }
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
