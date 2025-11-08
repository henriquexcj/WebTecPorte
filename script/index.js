//import GoogleGenAI from "@google/genai";
const { GoogleGenAI } = require('@google/genai');
const express = require('express');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API funcionando!');
});

app.get('/usuarios', (req, res) => {
  res.json([
    { id: 1, nome: 'Henrique' },
    { id: 2, nome: 'Maria' }
  ]);
});

app.post('/usuarios', (req, res) => {
  const novoUsuario = req.body;
  res.status(201).json({
    mensagem: 'Usuário criado com sucesso!',
    usuario: novoUsuario
  });
});

app.post('/resposta-ia', (req, res) => {
  const dados = req.body;
  console.log('Recebido: ', dados);
  
  const resposta = {
    sucesso: true,
    mensagem: 'Olá! Sua mensagem foi recebida com sucesso.',
    dadosRecebidos: dados
  };

  res.json(resposta);
});

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});

const GEMINI_API_KEY = "AIzaSyDdfOnLHzlgaj3NIetUwNKbttrv5oG-MEw";
// 1. CORREÇÃO AQUI: Chame a função GoogleGenAI SEM o 'new'.
const genAI = new GoogleGenAI({apiKey: GEMINI_API_KEY}); 

// Função principal assíncrona
//export 
async function ConsultarIA(pergunta, displayReposta) {

  
  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: pergunta,
  });
  console.log("Resposta da IA:", response.text);

  //displayReposta.textContent = response.text;
}

ConsultarIA('Qual é a capital do Brasil?', null);
//AIzaSyDdfOnLHzlgaj3NIetUwNKbttrv5oG-MEw