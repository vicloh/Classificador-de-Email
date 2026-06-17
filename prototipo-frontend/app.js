// AutoU Email Classifier Dashboard Logic

// Initial Mock Database
let emailDatabase = [
    {
        id: 1,
        snippet: "Gostaria de solicitar um orçamento para automação de processos fiscais...",
        body: "Olá equipe AutoU,\n\nEstou entrando em contato pois nossa empresa gostaria de solicitar um orçamento para a implantação do sistema de triagem e automação de processos fiscais. Temos um volume mensal de cerca de 50.000 documentos.\n\nFico no aguardo,\nRenato Sousa - Gerente de Operações",
        category: "Produtivo",
        attachment: "Escopo_Projeto_AutoU.pdf",
        date: "2026-06-17 10:14",
        suggestion: "Olá Renato,\n\nAgradecemos o contato e interesse em nossas soluções. Já encaminhei sua solicitação para a nossa equipe comercial, que entrará em contato em até 24 horas úteis com um escopo inicial de orçamento e agendamento de chamada técnica.\n\nAtenciosamente,\nSuporte AutoU"
    },
    {
        id: 2,
        snippet: "Parabéns pelo excelente atendimento e suporte de ontem. Nota 10!",
        body: "Olá pessoal da AutoU,\n\nPassando apenas para agradecer o suporte incrível que recebemos ontem durante a homologação do sistema. O analista foi extremamente prestativo e resolveu nossa fila rapidamente. Nota 10 pelo trabalho!\n\nUm abraço,\nCamila Ribeiro",
        category: "Improdutivo",
        attachment: null,
        date: "2026-06-17 09:30",
        suggestion: "Olá Camila,\n\nFicamos extremamente felizes com o seu feedback positivo! Nosso objetivo é sempre entregar um suporte de excelência. Compartilharemos suas palavras com a equipe técnica.\n\nTenha um ótimo dia!\nEquipe AutoU"
    },
    {
        id: 3,
        snippet: "Urgente: A integração com nossa API parou de responder às 11h...",
        body: "Prezados,\n\nIdentificamos uma falha crítica na integração de nossa plataforma com a API de vocês. Todas as requisições estão retornando status 503 (Service Unavailable) desde às 11:00 de hoje. Precisamos de um posicionamento urgente.\n\nRobson Lima - CTO da FinTechX",
        category: "Produtivo",
        attachment: "logs_erro_api.txt",
        date: "2026-06-16 11:05",
        suggestion: "Olá Robson,\n\nIdentificamos a instabilidade e nosso time de infraestrutura já está atuando para reestabelecer a comunicação. O incidente está sendo tratado com prioridade máxima sob o ticket #TR-99812. Manteremos você informado a cada 15 minutos.\n\nAtenciosamente,\nOperações AutoU"
    },
    {
        id: 4,
        snippet: "Agradeço pelo envio da proposta. Iremos analisar internamente.",
        body: "Recebido. Agradecemos o envio do documento atualizado. Iremos analisar a proposta internamente e entraremos em contato na próxima semana.\n\nAtenciosamente,\nDiretoria LogiTech",
        category: "Improdutivo",
        attachment: null,
        date: "2026-06-15 17:42",
        suggestion: "Agradecemos o retorno e ficamos à disposição para dirimir quaisquer dúvidas que surjam durante a análise da proposta.\n\nAtenciosamente,\nEquipe AutoU"
    },
    {
        id: 5,
        snippet: "Oferecemos serviços de marketing digital e otimização SEO para empresas...",
        body: "Olá parceiro, gostaria de apresentar nossa solução para triplicar suas vendas na web. Trabalhamos com tráfego pago, SEO avançado e campanhas customizadas. Responda este e-mail para agendarmos uma apresentação demonstrativa rápida de 15 minutos.\n\nPromoção válida para este mês.",
        category: "Improdutivo",
        attachment: null,
        date: "2026-06-14 14:10",
        suggestion: "Agradecemos a oferta, mas no momento não temos interesse em contratação de serviços dessa natureza.\n\nAtenciosamente,\nAutoU"
    }
];

// Predefined Email Templates (NEW)
const emailTemplates = [
    {
        id: "temp-orcamento",
        label: "Ped. Orçamento",
        icon: "calculator",
        body: "Prezada equipe de vendas da AutoU,\n\nGostaria de solicitar uma proposta comercial formal para a contratação da plataforma de triagem de e-mails. Atualmente temos 5 caixas de entrada compartilhadas e uma média de 12.000 mensagens por mês. Podem nos enviar os valores e termos de contratação?\n\nObrigado,\nMarcos Santos - Diretor de Operações"
    },
    {
        id: "temp-suporte",
        label: "Chamado Técnico",
        icon: "wrench",
        body: "Prezados,\n\nIdentificamos uma inconsistência nas requisições da API de vocês na última hora. O endpoint de classificação está respondendo com atraso superior a 5 segundos e gerando algumas falhas de conexão de rede intermitentes. Poderiam verificar se há instabilidade no serviço?\n\nFilipe Dias - Analista de Infra"
    },
    {
        id: "temp-feedback",
        label: "Agradecimento",
        icon: "heart",
        body: "Bom dia,\n\nEstou escrevendo para agradecer o excelente atendimento do suporte técnico ontem à tarde. Conseguimos resolver rapidamente a questão dos PDFs anexados e o sistema está rodando perfeitamente. Equipe de parabéns!\n\nAtt,\nMaria Clara"
    },
    {
        id: "temp-spam",
        label: "Oferta Spam",
        icon: "alert-triangle",
        body: "Prezado gestor comercial,\n\nOferecemos leads qualificados B2B com contatos validados de decisores do setor de tecnologia para acelerar o seu funil de vendas. Nossas listas têm 97% de assertividade. Responda SIM a este email para receber uma amostra grátis de 50 contatos.\n\nAbraços,\nLucas - LeadsPro"
    }
];

// System Notifications State (NEW)
let systemNotifications = [
    { id: 1, icon: "cpu", text: "API local FastAPI detectada no sistema.", time: "há 2 min" },
    { id: 2, icon: "database", text: "Banco de dados local sincronizado.", time: "há 10 min" },
    { id: 3, icon: "sparkles", text: "Modelo Gemini Flash configurado com sucesso.", time: "há 1 hora" }
];

// App Configurations
let apiConfig = {
    connectedMode: false,
    apiUrl: "http://localhost:8085/classify/",
    apiKey: "",
    model: "gemini-flash-latest",
    style: "formal",
    fallback: "produtivo"
};

// State Variables
let currentAttachedFile = null;
let currentTheme = localStorage.getItem("preferred_theme") || "dark";
let lastTriageResult = null; // Caches the last classification result
let typewriterTimeoutId = null; // Cache for typewriter animation

// DOM Elements Initialization
document.addEventListener("DOMContentLoaded", () => {
    // Start Icons
    lucide.createIcons();
    
    // Theme setup
    applyTheme(currentTheme);
    initThemeToggle();
    
    // Tab switching
    initTabs();
    
    // API toggle logic
    initApiToggle();
    
    // Notifications system
    initNotifications();
    
    // Triage input helpers, file upload, copy, tone and submission
    initTemplates();
    initFileUpload();
    initTriageSubmit();
    initToneSwitcher();
    initCopyBtn();
    initSettingsHandlers();
});



// 2. LIGHT / DARK THEME TOGGLE
function initThemeToggle() {
    const toggleBtn = document.getElementById("themeToggleBtn");
    
    toggleBtn.addEventListener("click", () => {
        const nextTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        showToast(`Tema ${nextTheme === 'dark' ? 'Escuro' : 'Claro'} ativado.`, "info");
    });
}

function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem("preferred_theme", theme);
    
    const body = document.body;
    const sunIcon = document.getElementById("themeIconSun");
    const moonIcon = document.getElementById("themeIconMoon");
    
    if (theme === "light") {
        body.classList.remove("theme-dark");
        body.classList.add("theme-light");
        
        sunIcon.style.display = "inline-block";
        moonIcon.style.display = "none";
    } else {
        body.classList.remove("theme-light");
        body.classList.add("theme-dark");
        
        sunIcon.style.display = "none";
        moonIcon.style.display = "inline-block";
    }
}

// 3. TABS MANAGEMENT
function initTabs() {
    const menuItems = document.querySelectorAll(".menu-item");
    const tabs = document.querySelectorAll(".tab-content");
    const activeTabTitle = document.getElementById("activeTabTitle");
    const activeTabDesc = document.getElementById("activeTabDesc");
    
    const tabDetails = {
        triagem: { title: "Triagem Inteligente", desc: "Envie e-mails para classificação automática e sugestões de respostas por IA." },
        configuracoes: { title: "Configurações", desc: "Gerencie credenciais, endpoints e regras de negócio da inteligência artificial." }
    };
    
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            const tabName = item.getAttribute("data-tab");
            
            menuItems.forEach(mi => mi.classList.remove("active"));
            item.classList.add("active");
            
            tabs.forEach(tab => {
                tab.classList.remove("active");
                if (tab.id === `tab-${tabName}`) {
                    tab.classList.add("active");
                }
            });
            
            if (tabDetails[tabName]) {
                activeTabTitle.textContent = tabDetails[tabName].title;
                activeTabDesc.textContent = tabDetails[tabName].desc;
            }
        });
    });
}

// 4. SYSTEM NOTIFICATIONS DROP-DOWN (NEW)
function initNotifications() {
    const btn = document.getElementById("notificationBtn");
    const dropdown = document.getElementById("notificationDropdown");
    const badge = document.getElementById("notificationBadge");
    const clearBtn = document.getElementById("clearNotificationsBtn");
    
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("show");
    });
    
    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && e.target !== btn) {
            dropdown.classList.remove("show");
        }
    });
    
    clearBtn.addEventListener("click", () => {
        systemNotifications = [];
        renderNotificationsList();
        showToast("Histórico de notificações limpo.", "info");
    });
    
    renderNotificationsList();
}

function renderNotificationsList() {
    const list = document.getElementById("notificationList");
    const badge = document.getElementById("notificationBadge");
    
    list.innerHTML = "";
    
    if (systemNotifications.length === 0) {
        list.innerHTML = `
            <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.75rem;">
                <i data-lucide="bell-off" style="width: 28px; height: 28px; margin-bottom: 8px; color: var(--border-color);"></i>
                <p>Nenhuma notificação nova</p>
            </div>
        `;
        badge.style.display = "none";
        lucide.createIcons();
        return;
    }
    
    badge.style.display = "block";
    
    systemNotifications.forEach(notif => {
        const item = document.createElement("div");
        item.className = "notification-item";
        item.innerHTML = `
            <div class="notification-item-icon">
                <i data-lucide="${notif.icon}" style="width: 16px; height: 16px;"></i>
            </div>
            <div class="notification-item-content">
                <span class="notification-item-text">${notif.text}</span>
                <span class="notification-item-time">${notif.time}</span>
            </div>
        `;
        list.appendChild(item);
    });
    
    lucide.createIcons();
}

function addNewNotification(icon, text) {
    const newNotif = {
        id: systemNotifications.length + 1,
        icon: icon,
        text: text,
        time: "agora mesmo"
    };
    systemNotifications.unshift(newNotif);
    renderNotificationsList();
}

// 12. SYSTEM NOTIFICATIONS (TOASTS)
function showToast(message, type = "success") {
    const toast = document.getElementById("toastBox");
    const toastMessage = document.getElementById("toastMessage");
    const toastIcon = document.getElementById("toastIcon");
    
    toastMessage.textContent = message;
    
    if (type === "success") {
        toastIcon.setAttribute("data-lucide", "check-circle");
        toast.style.borderColor = "var(--produtivo)";
        toastIcon.style.color = "var(--produtivo)";
    } else if (type === "error") {
        toastIcon.setAttribute("data-lucide", "alert-circle");
        toast.style.borderColor = "var(--improdutivo)";
        toastIcon.style.color = "var(--improdutivo)";
    } else {
        toastIcon.setAttribute("data-lucide", "info");
        toast.style.borderColor = "var(--accent)";
        toastIcon.style.color = "var(--accent)";
    }
    
    lucide.createIcons();
    
    toast.classList.add("show");
    
    // Clear existing transition delay
    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

// Helpers
function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 16. TRIAGEM & SETTINGS LOGIC AND EVENT BINDINGS
function initApiToggle() {
    const toggle = document.getElementById("apiModeToggle");
    const statusDot = document.getElementById("apiStatusDot");
    const statusText = document.getElementById("apiStatusText");
    
    if (!toggle) return;
    
    // Sync state on load
    toggle.checked = apiConfig.connectedMode;
    if (apiConfig.connectedMode) {
        if (statusDot) statusDot.classList.add("online");
        if (statusText) statusText.textContent = "Modo Online (Conectado)";
    } else {
        if (statusDot) statusDot.classList.remove("online");
        if (statusText) statusText.textContent = "Modo Offline (Simulado)";
    }
    
    toggle.addEventListener("change", () => {
        apiConfig.connectedMode = toggle.checked;
        if (toggle.checked) {
            statusDot.classList.add("online");
            statusText.textContent = "Modo Online (Conectado)";
            showToast("Conectado à API local.", "success");
        } else {
            statusDot.classList.remove("online");
            statusText.textContent = "Modo Offline (Simulado)";
            showToast("Desconectado da API. Usando simulação.", "info");
        }
        localStorage.setItem("api_config", JSON.stringify(apiConfig));
    });
}

function initTemplates() {
    const container = document.getElementById("templatesPills");
    if (!container) return;
    
    container.innerHTML = "";
    
    emailTemplates.forEach(temp => {
        const pill = document.createElement("button");
        pill.className = "template-pill";
        pill.innerHTML = `<i data-lucide="${temp.icon}" style="width: 12px; height: 12px;"></i> ${temp.label}`;
        pill.addEventListener("click", () => {
            const textarea = document.getElementById("emailInput");
            if (textarea) {
                textarea.value = temp.body;
                showToast(`Modelo "${temp.label}" carregado.`, "info");
            }
        });
        container.appendChild(pill);
    });
    lucide.createIcons();
}

function initFileUpload() {
    const zone = document.getElementById("uploadZone");
    const input = document.getElementById("fileInput");
    const badge = document.getElementById("fileBadge");
    const nameSpan = document.getElementById("fileName");
    const removeBtn = document.getElementById("btnRemoveFile");
    
    if (!zone || !input) return;
    
    zone.addEventListener("click", () => input.click());
    
    zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("dragover");
    });
    
    zone.addEventListener("dragleave", () => {
        zone.classList.remove("dragover");
    });
    
    zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("dragover");
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            input.files = e.dataTransfer.files;
            handleFileSelect(input.files[0]);
        }
    });
    
    input.addEventListener("change", () => {
        if (input.files && input.files.length > 0) {
            handleFileSelect(input.files[0]);
        }
    });
    
    removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        input.value = "";
        currentAttachedFile = null;
        badge.style.display = "none";
        zone.style.display = "flex";
        showToast("Arquivo anexo removido.", "info");
    });
    
    function handleFileSelect(file) {
        if (file.size > 5 * 1024 * 1024) {
            showToast("O arquivo excede o limite de 5MB.", "error");
            input.value = "";
            return;
        }
        currentAttachedFile = file;
        nameSpan.textContent = file.name;
        zone.style.display = "none";
        badge.style.display = "flex";
        showToast(`Arquivo "${file.name}" anexado.`, "success");
    }
}

function initTriageSubmit() {
    const btn = document.getElementById("btnRunTriage");
    const textInput = document.getElementById("emailInput");
    const spinner = document.getElementById("triageSpinner");
    const icon = document.getElementById("triageIcon");
    const emptyState = document.getElementById("emptyResultsState");
    const resultContent = document.getElementById("resultCardContent");
    
    if (!btn) return;
    
    btn.addEventListener("click", async () => {
        const text = textInput.value.trim();
        const file = currentAttachedFile;
        
        if (!text && !file) {
            showToast("Por favor, insira o texto do e-mail ou anexe um arquivo.", "error");
            return;
        }
        
        // Show loading state
        btn.disabled = true;
        spinner.style.display = "inline-block";
        icon.style.display = "none";
        emptyState.style.display = "flex";
        resultContent.style.display = "none";
        
        try {
            let category = "Produtivo";
            let suggestion = "";
            let stems = [];
            let removedWords = [];
            let suggestionsByTone = null;
            
            if (apiConfig.connectedMode) {
                // Connected Mode - Call API
                const formData = new FormData();
                if (text) formData.append("email_text", text);
                if (file) formData.append("email_file", file);
                
                const response = await fetch(apiConfig.apiUrl, {
                    method: "POST",
                    body: formData
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || "Erro na API.");
                }
                
                const data = await response.json();
                category = data.categoria;
                suggestion = data.sugestao_resposta;
                suggestionsByTone = data.sugestoes_por_tom;
                
                // Extract keywords and filter
                const nlp = computeNLPClientSide(text || file.name);
                stems = nlp.stems;
                removedWords = nlp.removed;
            } else {
                // Simulated Mode
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                let bodyCat = null;
                if (text) {
                    const cleanText = text.toLowerCase();
                    bodyCat = (cleanText.includes("solicitar") || cleanText.includes("orçamento") || cleanText.includes("urgente") || cleanText.includes("api") || cleanText.includes("falha")) ? "Produtivo" : "Improdutivo";
                }
                
                let fileCat = null;
                if (file) {
                    const cleanFileName = file.name.toLowerCase();
                    fileCat = (cleanFileName.includes("comprovante") || cleanFileName.includes("erro") || cleanFileName.includes("log") || cleanFileName.includes("orcamento") || cleanFileName.includes("projeto") || cleanFileName.includes("print") || cleanFileName.includes("foto") || cleanFileName.includes("imagem")) ? "Produtivo" : "Improdutivo";
                }
                
                if (bodyCat === "Produtivo" || fileCat === "Produtivo") {
                    category = "Produtivo";
                    suggestion = "Prezada equipe de Operações,\n\nAgradecemos o contato e informamos que sua solicitação já foi encaminhada ao setor competente. Um de nossos especialistas entrará em contato em breve para dar andamento aos próximos passos.\n\nAtenciosamente,\nAutoU AI";
                    suggestionsByTone = {
                        formal: "Prezada equipe de Operações,\n\nAgradecemos o contato e informamos que sua solicitação já foi encaminhada ao setor competente. Um de nossos especialistas entrará em contato em breve para dar andamento aos próximos passos.\n\nAtenciosamente,\nAutoU AI",
                        informal: "Oi! Tudo bem?\n\nObrigado por mandar mensagem. Já repassei sua solicitação pro pessoal responsável e a gente vai te responder o mais rápido possível, beleza?\n\nQualquer dúvida, dá um grito!\nAbraços,\nTime AutoU"
                    };
                } else {
                    category = "Improdutivo";
                    suggestion = "Prezado(a),\n\nAgradecemos o envio do e-mail. Esta mensagem foi classificada como informativa/improdutiva e foi arquivada automaticamente.\n\nAtenciosamente,\nAutoU AI";
                    suggestionsByTone = null;
                }
                
                const nlp = computeNLPClientSide(text || file.name);
                stems = nlp.stems;
                removedWords = nlp.removed;
            }
            
            lastTriageResult = { category, suggestion, stems, removed: removedWords, suggestionsByTone };
            displayTriageResult();
            
            // Add to database
            const newId = emailDatabase.length + 1;
            emailDatabase.unshift({
                id: newId,
                snippet: text ? text.substring(0, 80) + "..." : `Arquivo: ${file.name}`,
                body: text || `Conteúdo do arquivo ${file.name}`,
                category: category,
                attachment: file ? file.name : null,
                date: new Date().toISOString().replace("T", " ").substring(0, 16),
                suggestion: suggestion
            });
            
            showToast("Triagem concluída com sucesso!", "success");
            addNewNotification("sparkles", `E-mail classificado como ${category}.`);
            
        } catch (err) {
            showToast(err.message, "error");
            addNewNotification("alert-circle", `Falha na triagem: ${err.message}`);
        } finally {
            btn.disabled = false;
            spinner.style.display = "none";
            icon.style.display = "inline-block";
        }
    });
}

function computeNLPClientSide(text) {
    if (!text) return { stems: [], removed: [] };
    const stopWords = ["a", "o", "de", "que", "em", "para", "um", "uma", "os", "as", "com", "ao", "aos", "do", "da", "dos", "das"];
    const cleanText = text.toLowerCase().replace(/[^a-záàâãéèêíïóôõöúçñ\s]/g, "");
    const words = cleanText.split(/\s+/).filter(w => w.length > 1);
    
    const removed = words.filter(w => stopWords.includes(w));
    const stems = words.filter(w => !stopWords.includes(w)).map(w => w.substring(0, Math.min(w.length, 5)) + "r");
    
    return {
        stems: [...new Set(stems)].slice(0, 8),
        removed: [...new Set(removed)].slice(0, 8)
    };
}

function displayTriageResult() {
    if (!lastTriageResult) return;
    
    const emptyState = document.getElementById("emptyResultsState");
    const resultContent = document.getElementById("resultCardContent");
    const badge = document.getElementById("resultBadge");
    const tagContainer = document.getElementById("keywordTagContainer");
    const removedContent = document.getElementById("nlpRemovedContent");
    const keptContent = document.getElementById("nlpKeptContent");
    const suggestionTextarea = document.getElementById("suggestionTextarea");
    
    emptyState.style.display = "none";
    resultContent.style.display = "flex";
    
    const toneSelector = document.querySelector(".tone-selector");
    const autoSentNotice = document.getElementById("autoSentNotice");
    const suggestionLabel = document.querySelector(".suggestion-label");
    
    if (lastTriageResult.category === "Produtivo") {
        badge.textContent = "Produtivo";
        badge.className = "status-badge status-productive";
        if (toneSelector) toneSelector.style.display = "flex";
        if (autoSentNotice) autoSentNotice.style.display = "none";
        if (suggestionLabel) suggestionLabel.textContent = "Sugestão de Resposta IA";
    } else {
        badge.textContent = "Improdutivo - Resposta Encaminhada";
        badge.className = "status-badge status-unproductive";
        if (toneSelector) toneSelector.style.display = "none";
        if (autoSentNotice) autoSentNotice.style.display = "flex";
        if (suggestionLabel) suggestionLabel.textContent = "Resposta Automática Encaminhada";
    }
    
    // Keywords tags
    tagContainer.innerHTML = "";
    lastTriageResult.stems.forEach(stem => {
        const tag = document.createElement("span");
        tag.className = "keyword-tag";
        tag.textContent = stem;
        tagContainer.appendChild(tag);
    });
    
    // Removed content display
    removedContent.innerHTML = lastTriageResult.removed.map(w => `<span class="nlp-removed-word">${w}</span>`).join(" ");
    if (lastTriageResult.removed.length === 0) removedContent.textContent = "Nenhuma palavra removida.";
    
    // Kept content display
    keptContent.innerHTML = lastTriageResult.stems.map(w => `<span class="nlp-kept-word">${w}</span>`).join(" ");
    if (lastTriageResult.stems.length === 0) keptContent.textContent = "Nenhum radical analisado.";
    
    // Reset active tone pill based on config style
    const defaultTone = (lastTriageResult.category === "Produtivo") ? (apiConfig.style || "formal") : "formal";
    const pills = document.querySelectorAll(".tone-option");
    pills.forEach(p => {
        if (p.getAttribute("data-tone") === defaultTone) p.classList.add("active");
        else p.classList.remove("active");
    });
    
    let suggestionText = "";
    if (lastTriageResult.category === "Produtivo") {
        if (lastTriageResult.suggestionsByTone && lastTriageResult.suggestionsByTone[defaultTone]) {
            suggestionText = lastTriageResult.suggestionsByTone[defaultTone];
        } else {
            if (defaultTone === "informal") {
                suggestionText = "Oi! Tudo bem?\n\nObrigado por mandar mensagem. Já repassei sua solicitação pro pessoal responsável e a gente vai te responder o mais rápido possível, beleza?\n\nQualquer dúvida, dá um grito!\nAbraços,\nTime AutoU";
            } else {
                suggestionText = lastTriageResult.suggestion;
            }
        }
    } else {
        suggestionText = lastTriageResult.suggestion;
    }
    
    suggestionTextarea.value = suggestionText || "";
}

function typeWriter(element, text, speed = 8) {
    if (typewriterTimeoutId) {
        clearTimeout(typewriterTimeoutId);
    }
    
    element.value = "";
    let i = 0;
    
    function type() {
        if (i < text.length) {
            element.value += text.charAt(i);
            i++;
            element.scrollTop = element.scrollHeight;
            typewriterTimeoutId = setTimeout(type, speed);
        }
    }
    
    type();
}

function initToneSwitcher() {
    const pills = document.querySelectorAll(".tone-option");
    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            if (!lastTriageResult || lastTriageResult.category !== "Produtivo") return;
            
            pills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            const tone = pill.getAttribute("data-tone");
            
            if (typewriterTimeoutId) {
                clearTimeout(typewriterTimeoutId);
                typewriterTimeoutId = null;
            }
            
            if (lastTriageResult.suggestionsByTone && lastTriageResult.suggestionsByTone[tone]) {
                document.getElementById("suggestionTextarea").value = lastTriageResult.suggestionsByTone[tone];
            } else {
                if (tone === "informal") {
                    document.getElementById("suggestionTextarea").value = "Oi! Tudo bem?\n\nObrigado por mandar mensagem. Já repassei sua solicitação pro pessoal responsável e a gente vai te responder o mais rápido possível, beleza?\n\nQualquer dúvida, dá um grito!\nAbraços,\nTime AutoU";
                } else {
                    document.getElementById("suggestionTextarea").value = lastTriageResult.suggestion;
                }
            }
        });
    });
}

function initCopyBtn() {
    const copyBtn = document.getElementById("btnCopySuggestion");
    const textarea = document.getElementById("suggestionTextarea");
    if (!copyBtn || !textarea) return;
    
    copyBtn.addEventListener("click", () => {
        if (!textarea.value) return;
        navigator.clipboard.writeText(textarea.value);
        showToast("Resposta copiada para a área de transferência!", "success");
    });
}

function initSettingsHandlers() {
    const settingsApiUrl = document.getElementById("settingsApiUrl");
    const settingsApiKey = document.getElementById("settingsApiKey");
    const settingsModel = document.getElementById("settingsModel");
    const settingsStyle = document.getElementById("settingsStyle");
    const settingsFallback = document.getElementById("settingsFallback");
    const btnSave = document.getElementById("btnSaveSettings");
    
    if (!btnSave) return;
    
    // Load current config
    settingsApiUrl.value = apiConfig.apiUrl;
    settingsApiKey.value = apiConfig.apiKey;
    settingsModel.value = apiConfig.model;
    settingsStyle.value = apiConfig.style;
    settingsFallback.value = apiConfig.fallback;
    
    btnSave.addEventListener("click", () => {
        apiConfig.apiUrl = settingsApiUrl.value.trim();
        apiConfig.apiKey = settingsApiKey.value.trim();
        apiConfig.model = settingsModel.value.trim();
        apiConfig.style = settingsStyle.value;
        apiConfig.fallback = settingsFallback.value;
        
        localStorage.setItem("api_config", JSON.stringify(apiConfig));
        
        showToast("Configurações salvas com sucesso!", "success");
        addNewNotification("save", "Configurações da API de IA atualizadas.");
    });
}
