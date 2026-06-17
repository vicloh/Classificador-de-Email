# 🎨 Protótipo Frontend de Alta Fidelidade - Triagem Inteligente AutoU

Este diretório contém uma interface frontend avançada e interativa, construída especificamente para demonstração de produto do **Sistema de Triagem Automática de E-mails**.

O painel foi desenhado com foco em uma experiência de usuário (UX) fluida, utilizando técnicas modernas de design como **Glassmorphism**, paleta de cores escuras de alta tecnologia, animações suaves e componentes interativos.

---

## 🚀 Como Executar o Protótipo

A grande vantagem deste protótipo é a simplicidade de inicialização, ideal para apresentações rápidas a investidores, gerentes ou clientes:

1. **Abra o arquivo direto**: Navegue até esta pasta e dê dois cliques no arquivo [index.html](file:///c:/Users/Ultra/Documents/Classificador-de-Email/prototipo-frontend/index.html) para abri-lo diretamente em qualquer navegador moderno.
2. **Utilize uma extensão de Servidor Local (Opcional)**: Se estiver usando o VS Code, você pode clicar com o botão direito sobre o `index.html` e selecionar "Open with Live Server" para carregar no endereço local.

---

## ⚙️ Modos de Funcionamento

O painel oferece um **seletor inteligente de modo** no canto superior direito:

### 1. 📴 Modo Offline (Simulado) - *Padrão*
- **Ideal para**: Apresentações em locais com internet instável ou quando o backend não está rodando.
- **Funcionamento**: Utiliza um motor simulado inteligente em JavaScript para classificar os e-mails inseridos com base em padrões semânticos e gerar respostas automáticas de IA instantaneamente.
- A base de dados inicia-se populada com exemplos reais corporativos no Dashboard e no Histórico, permitindo mostrar as capacidades imediatamente sem preencher nada.

### 2. 🔌 Modo Conectado (API Real)
- **Ideal para**: Demonstrar a integração fim a fim (Frontend + Backend + IA Gemini Real).
- **Funcionamento**: Ao ativar a chave, o frontend tenta se comunicar com a API local FastAPI em `http://localhost:8000/classify/`.
- **Pré-requisitos**: O backend Python FastAPI precisa estar ativo na porta 8000.
  - Certifique-se de configurar sua chave `GEMINI_API_KEY` no arquivo `.env` na raiz do projeto.
  - Execute no seu terminal:
    ```bash
    uvicorn main:app --reload
    ```

---

## 🌟 Funcionalidades em Destaque no Protótipo

- **Dashboard de Métricas**: Painel analítico com cards informativos e gráficos de volume diário e distribuição de categorias gerados dinamicamente com base nos dados.
- **Simulador de Processamento NLTK (PLN)**: Ao processar um e-mail, o sistema mostra visualmente os "tokens" obtidos após passar por limpeza de stopwords e stemming (redução de palavras ao seu radical em português).
- **Área de Drag & Drop para Anexos**: Interface de upload interativa com animação de arrastar e soltar arquivos (.txt e .pdf).
- **Gerenciador de Caixa de Entrada (Inbox/Histórico)**: Tabela de e-mails processados com pesquisa em tempo real, filtros por categoria ("Todos", "Produtivos", "Improdutivos"), visualizador de detalhes em pop-up modal e opção de exclusão.
- **Ações Rápidas de IA**: Botões integrados na caixa de resposta para copiar a sugestão ou simular o envio direto ao destinatário com feedback por notificações toast.
