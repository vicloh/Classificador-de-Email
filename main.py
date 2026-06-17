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
    sugestoes_por_tom: dict = None

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

async def get_image_classification(mime_type: str, data: bytes) -> str:
    """
    Classifica uma imagem como 'Produtivo' ou 'Improdutivo' usando a API Gemini.
    
    Args:
        mime_type (str): Tipo MIME da imagem
        data (bytes): Dados binários da imagem
        
    Returns:
        str: Categoria da imagem ('Produtivo' ou 'Improdutivo')
    """
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Chave da API Gemini não configurada.")
    
    image_part = {
        "mime_type": mime_type,
        "data": data
    }
    
    prompt = """
Classifique a imagem a seguir como 'Produtivo' ou 'Improdutivo'.
- 'Produtivo': exige ação (documento fiscal, comprovante de pagamento, print de erro no sistema, logs visíveis, informações de suporte, print de tela do sistema)
- 'Improdutivo': não exige ação (spam, meme, imagem em branco, assinatura de e-mail, foto decorativa, propaganda, paisagem)

Retorne APENAS um JSON com a chave "categoria".
"""
    try:
        response = await asyncio.to_thread(model.generate_content, [prompt, image_part])
        result = json.loads(response.text)
        
        categoria = result.get("categoria", "Produtivo")
        if categoria not in ["Produtivo", "Improdutivo"]:
            categoria = "Produtivo"
        return categoria
    except Exception:
        # Fallback seguro
        return "Produtivo"

async def get_generated_response(full_text: str, final_category: str, image_part: dict = None) -> dict:
    """
    Gera uma sugestão de resposta automática baseada no conteúdo, categoria e imagem opcional do email.
    Se a categoria for 'Produtivo', gera variações em diferentes tons (Formal e Informal).
    
    Args:
        full_text (str): Texto completo do email
        final_category (str): Categoria final do email
        image_part (dict, optional): Dicionário contendo dados de imagem para a API Gemini
        
    Returns:
        dict: Dicionário contendo a sugestão principal e sugestões por tom
        
    Raises:
        HTTPException: Quando a chave da API não está configurada
    """
    if not os.getenv("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="Chave da API Gemini não configurada.")
    
    if final_category == "Produtivo":
        prompt = f"""
Gere sugestões de resposta adequadas em dois tons diferentes (Formal e Informal) para este email classificado como 'Produtivo'.
A versão formal deve ser profissional, polida e corporativa.
A versão informal deve ser amigável, próxima e prestativa.

Retorne APENAS um JSON com o seguinte formato:
{{
  "sugestao_resposta": "versão formal aqui",
  "sugestoes_por_tom": {{
    "formal": "versão formal aqui",
    "informal": "versão informal aqui"
  }}
}}

Email completo: {full_text}
"""
    else:
        prompt = f"""
Gere uma resposta automática de agradecimento cordial e breve para este email classificado como 'Improdutivo'.
Retorne APENAS um JSON com o seguinte formato:
{{
  "sugestao_resposta": "resposta automática aqui"
}}

Email completo: {full_text}
"""

    try:
        contents = [prompt]
        if image_part:
            contents.append(image_part)
            
        response = await asyncio.to_thread(model.generate_content, contents)
        result = json.loads(response.text)
        
        sugestao = result.get("sugestao_resposta", "")
        sugestoes_por_tom = result.get("sugestoes_por_tom", None)
        
        if not sugestao:
            if final_category == "Produtivo":
                sugestao = "Encaminharemos sua solicitação ao time responsável para análise."
                sugestoes_por_tom = {
                    "formal": "Encaminharemos sua solicitação ao time responsável para análise.",
                    "informal": "Oi! Já passei sua mensagem pro time e logo a gente te responde."
                }
            else:
                sugestao = "Agradecemos seu contato!"
                sugestoes_por_tom = None
                
        return {"sugestao_resposta": sugestao, "sugestoes_por_tom": sugestoes_por_tom}
    except (json.JSONDecodeError, KeyError, Exception):
        if final_category == "Produtivo":
            return {
                "sugestao_resposta": "Encaminharemos sua solicitação ao time responsável para análise.",
                "sugestoes_por_tom": {
                    "formal": "Encaminharemos sua solicitação ao time responsável para análise.",
                    "informal": "Oi! Já passei sua mensagem pro time e logo a gente te responde."
                }
            }
        else:
            return {
                "sugestao_resposta": "Agradecemos seu contato!",
                "sugestoes_por_tom": None
            }

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
    image_data = None
    image_mime_type = None
    if email_file:
        filename = email_file.filename.lower()
        content_type = email_file.content_type or ""
        
        if filename.endswith('.txt'):
            content = await email_file.read()
            file_attachment_text = content.decode('utf-8').strip()
        elif filename.endswith('.pdf'):
            try:
                with pdfplumber.open(email_file.file) as pdf:
                    file_attachment_text = ''.join(page.extract_text() or "" for page in pdf.pages).strip()
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Erro ao processar PDF: {e}")
        elif filename.endswith(('.png', '.jpg', '.jpeg', '.webp')) or content_type.startswith('image/'):
            try:
                image_data = await email_file.read()
                image_mime_type = content_type or "image/png"
                file_attachment_text = "IMAGE_ATTACHMENT"
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Erro ao processar imagem: {e}")
        else:
            raise HTTPException(status_code=400, detail="Formato de arquivo não suportado. Use .txt, .pdf, ou imagens (.png, .jpg, .jpeg, .webp)")
    
    # Validação de entrada
    if not email_body_text and not file_attachment_text:
        raise HTTPException(status_code=400, detail="Forneça texto do email ou arquivo.")
    
    # Classificação individual dos componentes
    body_category = None
    attachment_category = None
    
    if email_body_text:
        body_category = await get_single_classification(email_body_text)
    
    if file_attachment_text:
        if file_attachment_text == "IMAGE_ATTACHMENT":
            attachment_category = await get_image_classification(image_mime_type, image_data)
        else:
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
        if file_attachment_text == "IMAGE_ATTACHMENT":
            full_text += f"\nANEXO: [Imagem anexada: {email_file.filename}]"
        else:
            full_text += f"\nANEXO: {file_attachment_text}"
    
    # Geração da sugestão de resposta
    image_part = None
    if image_data:
        image_part = {
            "mime_type": image_mime_type,
            "data": image_data
        }
    gen_response = await get_generated_response(full_text, final_category, image_part)
    
    return ClassificationResponse(
        categoria=final_category,
        sugestao_resposta=gen_response["sugestao_resposta"],
        sugestoes_por_tom=gen_response["sugestoes_por_tom"]
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)