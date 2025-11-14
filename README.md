# 🤖 Classificador Automático de Emails - Desafio AutoU

## Links Essenciais

- **Aplicação no Ar**: https://classificador-emails-9c0b.onrender.com/
- **Vídeo Demonstração**: https://youtu.be/t_cz22Towfc

> ⚠️ **Aviso**: A aplicação está hospedada no plano gratuito do Render. Se estiver inativa, pode levar **30-60 segundos** para inicializar no primeiro acesso. Aguarde o carregamento completo.

## Demonstração

![Demo da Aplicação](https://github.com/user-attachments/assets/749133ba-ba75-416f-ab4a-c60add24ac3e)
![Image](https://github.com/user-attachments/assets/4d238771-721b-44b2-999f-13d81c7cfad9)

## Sobre o Projeto

Sistema inteligente de **triagem automática de emails** que classifica mensagens como **Produtivas** ou **Improdutivas** usando Inteligência Artificial, gerando sugestões de resposta automática para otimizar o atendimento ao cliente.

### Objetivo
- **Produtivo**: Emails que exigem ação (solicitações, dúvidas, problemas)
- **Improdutivo**: Emails que não exigem ação (agradecimentos, spam, felicitações)

## Stack Tecnológica

- **Backend**: Python + FastAPI
- **IA**: Google Gemini AI (gemini-flash-latest)
- **Frontend**: HTML5 + CSS3 + JavaScript Vanilla
- **Processamento**: PDFPlumber + NLTK
- **Deploy**: Render
- **Ambiente**: python-dotenv

## Decisões de Arquitetura

### **Estratégia de IA Híbrida**
**Por que NLTK está no código mas não é usado na classificação?**

- **NLTK presente**: Para futuras melhorias de pré-processamento de texto
- **IA pura escolhida**: Gemini AI oferece melhor precisão contextual que regras baseadas em palavras-chave
- **Flexibilidade**: Permite evolução para modelos híbridos sem refatoração

### **Lógica de Negócio Confiável**
**Por que separar Corpo vs. Anexo no Python?**

```python
# Regra implementada em Python (100% confiável)
if body_category == "Improdutivo" and attachment_category == "Improdutivo":
    final_category = "Improdutivo"
else:
    final_category = "Produtivo"  # Default seguro
```

- **Confiabilidade**: Lógica crítica não depende de interpretação da IA
- **Transparência**: Regra de negócio clara e auditável
- **Fallback seguro**: Na dúvida, sempre classifica como Produtivo

### **UX Focada no Usuário**
**Melhorias de experiência implementadas:**

- **Erros persistentes**: Mensagens de erro não desaparecem automaticamente
- **Feedback visual**: Loading states e animações suaves
- **Validação inteligente**: Aceita texto OU arquivo OU ambos
- **Design responsivo**: Funciona em desktop e mobile

## Como Rodar Localmente

### 1. **Clone o Repositório**
```bash
git clone https://github.com/vicloh/Processo-seletivo-AutoU.git
cd Processo-seletivo-AutoU
```

### 2. **Crie o Ambiente Virtual**
```bash
python -m venv venv
venv\Scripts\activate  # Windows
# ou
source venv/bin/activate  # Linux/Mac
```

### 3. **Instale as Dependências**
```bash
pip install -r requirements.txt
```

### 4. **Configure as Variáveis de Ambiente**
Crie um arquivo `.env` na raiz do projeto:
```env
GEMINI_API_KEY=sua_chave_do_gemini_aqui
```

> 💡 **Como obter a chave**: Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)

### 5. **Execute a Aplicação**
```bash
uvicorn main:app --reload
```

### 6. **Acesse no Navegador**
```
http://localhost:8000
```

## Estrutura do Projeto

```
processo-seletivo-autou/
├── main.py              # API FastAPI
├── index.html           # Frontend da aplicação
├── requirements.txt     # Dependências Python
├── .env                 # Variáveis de ambiente (criar)
└── README.md           # Este arquivo
```

## Como Testar

1. **Teste com texto**: Cole um email no campo de texto
2. **Teste com arquivo**: Faça upload de um arquivo .txt ou .pdf
3. **Teste combinado**: Use texto + arquivo simultaneamente
4. **Teste de erro**: Tente enviar arquivo .docx para ver tratamento de erro

## Observações de Deploy

### Render (Plano Gratuito)
- **Tempo de inicialização**: 30-60 segundos no primeiro acesso após inatividade
- **Suspensão automática**: Aplicação hiberna após 15 minutos sem uso
- **Recomendação**: Aguarde o carregamento completo antes de usar

---

**Desenvolvido para o Processo Seletivo AutoU**
