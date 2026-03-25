📄 1. Documento de Requisitos do Sistema
Requisitos Funcionais (RF)

RF001 - Recebimento de Texto: O sistema deve permitir que o usuário insira o texto do corpo de um email.

RF002 - Upload de Arquivos: O sistema deve permitir o envio de arquivos anexos nos formatos .txt e .pdf.

RF003 - Validação de Formato: O sistema deve rejeitar arquivos que não sejam .txt ou .pdf, retornando um erro adequado ao usuário (HTTP 400).

RF004 - Classificação via IA: O sistema deve classificar independentemente o texto do email e/ou o texto do anexo como "Produtivo" (exige ação) ou "Improdutivo" (não exige ação).

RF005 - Regra de Negócio de Categoria Final: O sistema deve classificar o conjunto (email + anexo) como "Improdutivo" SOMENTE SE ambos (ou o único fornecido) forem improdutivos. Caso contrário, ou em caso de erro na IA, deve assumir o fallback seguro como "Produtivo".

RF006 - Geração de Resposta: O sistema deve gerar uma sugestão de resposta automática baseada no texto completo e na categoria final definida, através da API do Gemini.

RF007 - Tratamento de Erro (Fallback): Caso a API de Inteligência Artificial falhe ao gerar a resposta, o sistema deve fornecer respostas padrão seguras ("Encaminharemos sua solicitação..." para Produtivos e "Agradecemos seu contato!" para Improdutivos).

RF008 - Validação de Entrada Vazia: O sistema deve retornar um erro (HTTP 400) caso o usuário tente classificar sem enviar nem texto, nem arquivo.

Requisitos Não-Funcionais (RNF)
Estas são as restrições, tecnologias e qualidades estruturais do sistema:

RNF001 - Backend: A API deve ser construída em Python utilizando o framework FastAPI.

RNF002 - Inteligência Artificial: O sistema deve integrar-se obrigatoriamente à API do Google Gemini (gemini-flash-latest) para o processamento de linguagem natural.

RNF003 - Processamento de PDF: A extração de texto de arquivos .pdf deve ser feita utilizando a biblioteca pdfplumber.

RNF004 - Frontend: A interface do usuário deve ser construída com HTML5, CSS3 e JavaScript Vanilla, sendo servida na rota raiz (/).

RNF005 - Implantação e Disponibilidade: A aplicação deve estar preparada para rodar em ambientes de nuvem (como Render), suportando cold starts (30-60 segundos).
