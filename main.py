"""
Sistema de Classificação Automática de Emails

Este módulo implementa um sistema de classificação de emails utilizando
Inteligência Artificial para categorizar mensagens como Produtivas ou Improdutivas,
gerando sugestões de resposta automática.
"""

import os
import json
import re
import asyncio
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Form, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import pdfplumber
import google.generativeai as genai
import uvicorn
import nltk
from nltk.corpus import stopwords
from nltk.stem import RSLPStemmer

# Carregamento de variáveis de ambiente
load_dotenv()

# Inicialização de recursos NLTK
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/rslp')
except LookupError:
    nltk.download('rslp')

app = FastAPI(
    title="Sistema de Classificação de Emails",
    description="API para classificação automática de emails usando IA",
    version="1.0.0"
)

# Configuração de CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def read_root():
    """Endpoint para servir a página inicial da aplicação."""
    with open("index.html", "r", encoding="utf-8") as f:
        return f.read()

class ClassificationResponse(BaseModel):
    """Modelo de resposta para classificação de emails."""
    categoria: str
    sugestao_resposta: str

# Configuração do modelo Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

generation_config = {
    "response_mime_type": "application/json",
}

model = genai.GenerativeModel(
    model_name='models/gemini-flash-latest',
    generation_config=generation_config
)

async def get_single_classification(text: str) -> str:
    """
    Classifica um texto individual como Produtivo ou Improdutivo usando IA.
    
    Args:
        text (str): Texto a ser classificado
        
    Returns:
        str: Categoria do texto ('Produtivo' ou 'Improdutivo')
        
    Raises:
        HTTPException: Quando a chave da API não está configurada
    """
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Chave da API Gemini não configurada.")
    
    prompt = f"""
Classifique o texto a seguir como 'Produtivo' ou 'Improdutivo'.
- 'Produtivo': exige ação (solicitação, dúvida, problema, pedido)
- 'Improdutivo': não exige ação (agradecimento, felicitação, spam)

Retorne APENAS um JSON com a chave "categoria".

Texto: {text}
"""
    # Validação da categoria retornada
    try:
        response = await asyncio.to_thread(model.generate_content, prompt)
        result = json.loads(response.text)
        
        categoria = result.get("categoria", "Produtivo")
        
        if categoria not in ["Produtivo", "Improdutivo"]:
            categoria = "Produtivo"
            
        return categoria
    except (json.JSONDecodeError, KeyError, Exception):
        # Fallback seguro: em caso de erro, considera como Produtivo
        return "Produtivo"

async def get_generated_response(full_text: str, final_category: str) -> str:
    """
    Gera uma sugestão de resposta automática baseada no conteúdo e categoria do email.
    
    Args:
        full_text (str): Texto completo do email
        final_category (str): Categoria final do email
        
    Returns:
        str: Sugestão de resposta automática
        
    Raises:
        HTTPException: Quando a chave da API não está configurada
    """
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Chave da API Gemini não configurada.")
    
    prompt = f"""
Gere uma resposta automática adequada para este email que foi classificado como '{final_category}'.

Se 'Produtivo': sugira encaminhar ao time responsável ou próximos passos.
Se 'Improdutivo': resposta cordial e breve.

Retorne APENAS um JSON com a chave "sugestao_resposta".

Email completo: {full_text}
Categoria: {final_category}
"""
    # Fallback para respostas vazias / Fallback seguro em caso de erro
    try:
        response = await asyncio.to_thread(model.generate_content, prompt)
        result = json.loads(response.text)
        
        sugestao = result.get("sugestao_resposta", "")
        
        if not sugestao:
            if final_category == "Produtivo":
                sugestao = "Encaminharemos sua solicitação ao time responsável para análise."
            else:
                sugestao = "Agradecemos seu contato!"
                
        return sugestao
    except (json.JSONDecodeError, KeyError, Exception):
        
        if final_category == "Produtivo":
            return "Encaminharemos sua solicitação ao time responsável para análise."
        else:
            return "Agradecemos seu contato!"

def preprocess_text(text: str) -> str:
    """
    Realiza pré-processamento de texto para análise de linguagem natural.
    
    Args:
        text (str): Texto a ser processado
        
    Returns:
        str: Texto processado e normalizado
    """
    # Conversão para minúsculas
    text = text.lower()
    
    # Remoção de caracteres especiais e números
    text = re.sub(r'[^a-záàâãéèêíïóôõöúçñ\s]', '', text)
    
    # Remoção de stop words em português
    stop_words = set(stopwords.words('portuguese'))
    words = [word for word in text.split() if word not in stop_words]
    
    # Aplicação de stemming para reduzir palavras ao radical
    stemmer = RSLPStemmer()
    words = [stemmer.stem(word) for word in words]
    
    return ' '.join(words)

@app.post("/classify/", response_model=ClassificationResponse)
async def classify_email(
    email_text: str = Form(None),
    email_file: UploadFile = File(None)
):
    """
    Endpoint principal para classificação de emails.
    
    Classifica emails como Produtivos ou Improdutivos baseado no conteúdo
    do corpo do email e/ou arquivos anexados, gerando sugestões de resposta.
    
    Args:
        email_text (str, optional): Texto do corpo do email
        email_file (UploadFile, optional): Arquivo anexado (.txt ou .pdf)
        
    Returns:
        ClassificationResponse: Categoria e sugestão de resposta
        
    Raises:
        HTTPException: Para erros de validação ou processamento
    """
    email_body_text = ""
    file_attachment_text = ""
    
    # Processamento do texto do corpo do email
    if email_text:
        email_body_text = email_text.strip()
    
    # Processamento do arquivo anexado
    if email_file:
        if email_file.filename.endswith('.txt'):
            content = await email_file.read()
            file_attachment_text = content.decode('utf-8').strip()
        elif email_file.filename.endswith('.pdf'):
            try:
                with pdfplumber.open(email_file.file) as pdf:
                    file_attachment_text = ''.join(page.extract_text() or "" for page in pdf.pages).strip()
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Erro ao processar PDF: {e}")
        else:
            raise HTTPException(status_code=400, detail="Formato de arquivo não suportado. Use .txt ou .pdf")
    
    # Validação de entrada
    if not email_body_text and not file_attachment_text:
        raise HTTPException(status_code=400, detail="Forneça texto do email ou arquivo.")
    
    # Classificação individual dos componentes
    body_category = None
    attachment_category = None
    
    if email_body_text:
        body_category = await get_single_classification(email_body_text)
    
    if file_attachment_text:
        attachment_category = await get_single_classification(file_attachment_text)
    
    # Aplicação da regra de negócio: só é Improdutivo se TODOS os componentes forem Improdutivos
    final_category = "Produtivo"  # Default seguro
    
    if body_category == "Improdutivo" and attachment_category == "Improdutivo":
        final_category = "Improdutivo"
    elif body_category == "Improdutivo" and attachment_category is None:
        final_category = "Improdutivo"
    elif attachment_category == "Improdutivo" and body_category is None:
        final_category = "Improdutivo"
    
    # Montagem do texto completo para geração de resposta
    full_text = ""
    if email_body_text:
        full_text += f"CORPO: {email_body_text}"
    if file_attachment_text:
        full_text += f"\nANEXO: {file_attachment_text}"
    
    # Geração da sugestão de resposta
    suggested_response = await get_generated_response(full_text, final_category)
    
    return ClassificationResponse(
        categoria=final_category,
        sugestao_resposta=suggested_response
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)