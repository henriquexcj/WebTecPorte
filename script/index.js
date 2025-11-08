const { GoogleGenAI } = require('@google/genai');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: 'config.env', debug: true });

const app = express();
app.use(cors({
  origin: 'http://127.0.0.1:5500' //alterar para o domínio real do site
}));
app.use(express.json());


const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

if (!GEMINI_API_KEY) {
  console.error("ERRO: A variável de ambiente 'GEMINI_API_KEY' não está definida.");
  console.error("Por favor, defina a chave de API do seu temrinal antes de inicar o servidor.");
  
  process.exit(1);
}

const genAI = new GoogleGenAI({apiKey: GEMINI_API_KEY}); 

async function ConsultarIA(pergunta) {
  try{
    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: pergunta,
    });

  return response.text;
  } catch (error) {
    console.error("Erro ao consultar a IA: ", error.message);
    throw new Error(`Falha na comunicação co ma IA: ${error.message}`);
  }
}



app.get('/', (req, res) => {
  res.send('API funcionando!');
});

app.post('/resposta-ia', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string'){
    return res.status(400).json({ error: "O campo 'prompt' (string) é obrigatório no corpo da requisição."});
  }

  console.log('Pergunta recebida para a IA: ', prompt);
  
  try {
    const respostaIA = await ConsultarIA(`${prompt} Responda de forma resumida a como eu posso lidar com essa situação`);

    res.json({ pergunta: prompt, resposta: respostaIA});
  } catch (error) {
    console.error("Erro na rota /resposta-ia: ". error.message);
    res.status(500).json({ error: error.message});
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});




//AIzaSyDdfOnLHzlgaj3NIetUwNKbttrv5oG-MEw