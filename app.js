// Configuration
const API_BASE_URL = 'https://edubuddy-stripe-backend.vercel.app';

// Application State
let currentExamType = 'BAC';
let currentSubject = 'Română';
let isPremiumUnlocked = localStorage.getItem('isPremiumUnlocked') === 'true';
let messageCounter = parseInt(localStorage.getItem('messageCounter') || '0', 10);

// Subjects configuration (Matching the 13 BAC subjects and 2 EN subjects of the Android app)
const subjectsConfig = {
    'BAC': [
        { name: 'Română', emoji: '📖', desc: 'Pregătire socratică pentru Subiectul I, II și III (eseu, caracterizări).' },
        { name: 'Matematică', emoji: '📐', desc: 'Demonstrații, ecuații, trigonometrie și analiză matematică (LaTeX).' },
        { name: 'Istorie', emoji: '🏛️', desc: 'Evoluția statului român, constituții și analiza surselor istorice.' },
        { name: 'Geografie', emoji: '🌍', desc: 'Relieful, clima și hidrografia României și a Europei.' },
        { name: 'Biologie', emoji: '🧬', desc: 'Genetică, anatomie, fiziologie și ecologie umană.' },
        { name: 'Fizică', emoji: '⚡', desc: 'Mecanică, electricitate, termodinamică și optică.' },
        { name: 'Chimie', emoji: '⚗️', desc: 'Chimie organică și anorganică, reacții și stoechiometrie.' },
        { name: 'Informatică', emoji: '💻', desc: 'Algoritmi, grafuri, arbori și structuri de date în C++/Pascal.' },
        { name: 'Logică', emoji: '🧠', desc: 'Validitatea silogismelor, propoziții categorice și diagrame Venn.' },
        { name: 'Psihologie', emoji: '👤', desc: 'Procese cognitive, personalitate, temperament și caracter.' },
        { name: 'Economie', emoji: '📈', desc: 'Piața, cerere/ofertă, profit, costuri și macroeconomie.' },
        { name: 'Sociologie', emoji: '👥', desc: 'Grupuri sociale, socializare, roluri, statusuri și devianță.' },
        { name: 'Filosofie', emoji: '⏳', desc: 'Teorii etice, cunoaștere, libertate și fericire la marii filosofi.' }
    ],
    'EN': [
        { name: 'Română', emoji: '📖', desc: 'Gramatică, vocabular, morfologie, sintaxă și compuneri descriptive.' },
        { name: 'Matematică', emoji: '📐', desc: 'Geometrie în spațiu (piramidă regulată), ecuații, funcții și procente.' }
    ]
};

// Preset tasks/questions (Matching the presets from the Android app)
const presetTasks = {
    'Română': [
        { title: '📝 Subiectul III: Moromeții', desc: 'Caracterizarea lui Ilie Moromete.', prompt: 'Aș dori o simulare pentru Subiectul al III-lea de la examenul de Bacalaureat, constând în caracterizarea personajului Ilie Moromete din romanul \'Moromeții\' de Marin Preda. Te rog să îmi prezinți cerința și să mă inviți să schițez planul sau introducerea caracterizării!' },
        { title: '🌸 Tema și Viziunea: Plumb', desc: 'Analiza lirică a operei bacoviene.', prompt: 'Vreau să repetăm tema și viziunea despre lume într-o poezie de George Bacovia (\'Plumb\'). Propune-mi un test rapid cu 3 întrebări-cheie despre simbolismul operei!' },
        { title: '🔍 Subiectul II: Relația Idee-Mijloace', desc: 'Interpretarea unui text poetic la prima vedere.', prompt: 'Ajută-mă să exersez Subiectul al II-lea (Relația dintre ideea poetică și mijloacele artistice). Oferă-mi un scurt text poetic de exemplu și ghidează-mă socratic să îi fac analiza în comentariu.' }
    ],
    'Matematică': [
        { title: '📐 Analiză: Continuitate', desc: 'Studiul continuității unei funcții.', prompt: 'Doresc un exercițiu de Analiză Matematică de nivel Bacalaureat despre studiul continuității unei funcții definite pe ramuri, cu parametri reali. Oferă-mi problema și ghidează-mă pas cu pas (LaTeX) spre rezolvare!' },
        { title: '🧠 Algebră: Legi de compoziție', desc: 'Proprietăți și elemente simetrice.', prompt: 'Propune-mi o problemă de Algebră de Subiectul II (legi de compoziție pe mulțimea numerelor reale, determinarea elementului neutru și a elementelor simetrizabile). Hai să o rezolvăm interactiv!' },
        { title: '⏱️ Subiectul I: Rapid', desc: '6 întrebări fulger de recapitulare.', prompt: 'Generează-mi o mini-simulare pentru Subiectul I de la Matematică (6 exerciții rapide: progresii, trigonometrie, geometrie analitică, ecuații). Pune-mi-le pe rând și ajută-mă socratic să le rezolv corect.' }
    ],
    'Istorie': [
        { title: '🏛️ Eseu: Statul Modern', desc: 'Evoluția statului român în sec. XVIII-XX.', prompt: 'Propune-mi o simulare pentru Subiectul al III-lea de la Istorie: Eseu privind evoluția statului român modern în secolele XVIII-XX. Dă-mi structura cerută în barem și ghidează-mă să formulez argumentele.' },
        { title: '📜 Subiectul I: Analiză Text', desc: 'Lucrul pe surse istorice.', prompt: 'Oferă-mi un scurt fragment dintr-o sursă istorică referitoare la dominația otomană sau regimurile politice românești și pune-mi 2 întrebări tipice de Subiectul I pentru a-mi testa atenția și argumentarea.' }
    ],
    'Geografie': [
        { title: '🌍 Clima Europei', desc: 'Diferențe climatice regionale.', prompt: 'Ajută-mă să recapitulez deosebirile climatice dintre Europa de Sud și Europa de Est pentru Subiectul al III-lea de la Geografie. Explică-mi printr-o schemă ușor de reținut și testează-mă apoi.' },
        { title: '⛰️ Relieful României', desc: 'Grupele Carpatice și subunități.', prompt: 'Propune-mi o recapitulare interactivă a reliefului României (Grupa Nordică a Carpaților Orientali comparativ cu Carpații Meridionali). Pune-mi întrebări despre altitudini, orientare și mod de formare!' }
    ],
    'Biologie': [
        { title: '🧬 Genetică: ADN și ARN', desc: 'Structură, sinteză și transcriere.', prompt: 'Ajută-mă să recapitulez structura acizilor nucleici (ADN/ARN) și etapele sintezei proteice. Oferă-mi o problemă clasică cu număr de nucleotide și procente pentru a o rezolva împreună!' },
        { title: '🧠 Anatomie: Sistemul Nervos', desc: 'Arcul reflex și funcțiile emisferelor.', prompt: 'Vreau să repetăm funcțiile măduvei spinării și ale creierului mare pentru examenul de Biologie. Propune-mi un test rapid de tip grilă și corectează-mă!' }
    ],
    'Fizică': [
        { title: '⚡ Electricitate: Legile Kirchhoff', desc: 'Rețele electrice și curent continuu.', prompt: 'Propune-mi o problemă de Subiectul II de Fizică (termodinamică sau electricitate) axată pe aplicarea legilor lui Kirchhoff pentru determinarea intensităților într-o rețea de circuite.' },
        { title: '⚙️ Mecanică: Principii', desc: 'Forțe, impuls și conservarea energiei.', prompt: 'Oferă-mi o problemă cu un corp pe un plan înclinat (cu frecare) și ajută-mă să scriu ecuațiile de mișcare și să calculez lucrul mecanic sau energia cinetică.' }
    ],
    'Chimie': [
        { title: '🧪 Chimie Organică: Hidrocarburi', desc: 'Reacții de adiție, substituție și polimerizare.', prompt: 'Ajută-mă să repet ecuațiile reacțiilor chimice pentru alcani, alchene și arene. Oferă-mi o problemă de calcul stoechiometric cu randament!' },
        { title: '⚗️ Chimie Anorganică: Echilibre', desc: 'Redox și concentrații soluții.', prompt: 'Doresc o problemă de chimie anorganică: egalarea unei reacții de oxido-reducere prin metoda bilanțului electronic și calculul concentrației procentuale sau molare a unei soluții.' }
    ],
    'Informatică': [
        { title: '💻 Subiectul III: Eficiență', desc: 'Algoritmi cu vectori de frecvență sau fișiere.', prompt: 'Propune-mi o problemă tipică de Subiectul al III-lea, problema 3 (cu citire din fișier și algoritm eficient ca timp și spațiu). Ghidează-mă socratic să îi găsesc ideea optimă.' },
        { title: '📊 Grafuri și Arbori', desc: 'Matrice de adiacență, BFS, DFS și liste.', prompt: 'Vreau să recapitulăm noțiunile de grafuri neorientate, orientate sau arbori pentru Subiectul al II-lea de la Informatică. Dă-mi o problemă cu grade, noduri sau conexitate.' }
    ],
    'Logică': [
        { title: '🧠 Silogisme și Validitate', desc: 'Diagrame Venn sau reguli silogistice.', prompt: 'Doresc să determinăm validitatea unui silogism prin metoda diagramelor Venn. Propune-mi un silogism de tipul \'aeo-2\' și ghidează-mă pas cu pas în rezolvarea lui.' },
        { title: '🔍 Propoziții Categorice', desc: 'Raporturi de opoziție și pătratul logic.', prompt: 'Ajută-mă să exersez conversiunea și obversiunea propozițiilor categorice (de tip SaP, SeP, SiP, SoP). Pune-mi întrebări rapide de examen!' }
    ],
    'Psihologie': [
        { title: '👤 Personalitatea', desc: 'Temperament, caracter și aptitudini.', prompt: 'Propune-mi o sinteză pentru subiectul personalității în psihologie. Dă-mi o mică descriere de comportament și ajută-mă să identific tipurile de temperament implicate.' }
    ],
    'Economie': [
        { title: '📈 Piața și Indicatorii', desc: 'Utilitate, cerere, ofertă, profit și costuri.', prompt: 'Ajută-mă să recapitulez relația dintre costul total, costul marginal și determinarea profitului maxim pentru o firmă. Oferă-mi o problemă matematică cu formule!' }
    ],
    'Sociologie': [
        { title: '👥 Grupuri Sociale', desc: 'Socializarea, familia și devianța.', prompt: 'Vreau să recapitulez conceptele de bază din sociologie: status, rol și socializare primară vs. secundară. Pune-mi 3 întrebări de reflecție.' }
    ],
    'Filosofie': [
        { title: '⏳ Morala și Cunoașterea', desc: 'Teorii etice, libertate și fericire.', prompt: 'Propune-mi o dezbatere ghidată socratic despre libertate și responsabilitate la marii filosofi (ex: Jean-Paul Sartre sau Immanuel Kant) conform programei de Bacalaureat.' }
    ]
};

// DOM Elements
const sidebarList = document.getElementById('subjects-list');
const chatContainer = document.getElementById('chat-dialog-container');
const onboardingView = document.getElementById('onboarding-view');
const presetsGrid = document.getElementById('presets-grid');
const typingIndicator = document.getElementById('typing-indicator-container');
const chatInput = document.getElementById('chat-input-field');
const sendBtn = document.getElementById('send-btn');
const inputLockOverlay = document.getElementById('input-lock-overlay');
const inputRow = document.getElementById('input-row');
const premiumModal = document.getElementById('premium-modal');
const premiumStatusBadge = document.getElementById('premium-status-badge');
const headerSubjectEmoji = document.getElementById('header-subject-emoji');
const headerSubjectName = document.getElementById('header-subject-name');
const headerSubjectDesc = document.getElementById('header-subject-desc');
const usedMessagesCount = document.getElementById('used-messages-count');

// Initialize App
window.addEventListener('DOMContentLoaded', () => {
    checkStripeSessionStatus();
    updatePremiumUI();
    renderSubjects();
    renderPresets();
    loadChatHistory();

    // Input auto-grow and button enable/disable
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
        sendBtn.disabled = chatInput.value.trim() === '';
    });
});

// Switch between BAC and EN
function switchExam(type) {
    currentExamType = type;
    document.getElementById('btn-bac').classList.toggle('active', type === 'BAC');
    document.getElementById('btn-en').classList.toggle('active', type === 'EN');

    // Switch to first subject in the new category
    currentSubject = subjectsConfig[type][0].name;

    renderSubjects();
    updateHeader();
    renderPresets();
    loadChatHistory();
    toggleSidebar(false); // Close on mobile
}

// Render the subjects list in the sidebar
function renderSubjects() {
    sidebarList.innerHTML = '';
    subjectsConfig[currentExamType].forEach(subj => {
        const li = document.createElement('li');
        li.className = `subject-item ${subj.name === currentSubject ? 'active' : ''}`;
        li.onclick = () => selectSubject(subj.name);

        li.innerHTML = `
            <span class="subject-item-emoji">${subj.emoji}</span>
            <span>${subj.name}</span>
        `;
        sidebarList.appendChild(li);
    });
}

// Select a subject
function selectSubject(name) {
    currentSubject = name;
    
    // Update active class in sidebar
    const items = sidebarList.querySelectorAll('.subject-item');
    items.forEach((item, index) => {
        const subjName = subjectsConfig[currentExamType][index].name;
        item.classList.toggle('active', subjName === name);
    });

    updateHeader();
    renderPresets();
    loadChatHistory();
    toggleSidebar(false); // Close on mobile
}

// Update the header details
function updateHeader() {
    const config = subjectsConfig[currentExamType].find(s => s.name === currentSubject);
    if (config) {
        headerSubjectEmoji.textContent = config.emoji;
        headerSubjectName.textContent = config.name;
        headerSubjectDesc.textContent = config.desc;
    }
}

// Render the preset cards in onboarding
function renderPresets() {
    presetsGrid.innerHTML = '';
    const presets = presetTasks[currentSubject] || [];
    
    if (presets.length === 0) {
        presetsGrid.innerHTML = `
            <div class="preset-card" style="grid-column: 1/-1; text-align: center;">
                <h4>Exersează socratic</h4>
                <p>Scrie o întrebare sau cere un test grilă pentru a începe recapitularea.</p>
            </div>
        `;
        return;
    }

    presets.forEach(p => {
        const card = document.createElement('div');
        card.className = 'preset-card';
        card.onclick = () => selectPreset(p.prompt);
        card.innerHTML = `
            <h4>${p.title}</h4>
            <p>${p.desc}</p>
        `;
        presetsGrid.appendChild(card);
    });
}

// Click on preset
function selectPreset(promptText) {
    if (isLimitHit()) {
        openPremiumModal();
    } else {
        chatInput.value = promptText;
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
        sendBtn.disabled = false;
        sendUserMessage();
    }
}

// Check if user hit the free limit
function isLimitHit() {
    return messageCounter >= 10 && !isPremiumUnlocked;
}

// Toggle mobile sidebar drawer
function toggleSidebar(show) {
    const sidebar = document.getElementById('sidebar');
    if (show !== undefined) {
        sidebar.classList.toggle('open', show);
    } else {
        sidebar.classList.toggle('open');
    }
}

// Open/Close Premium modal
function openPremiumModal() {
    premiumModal.style.display = 'flex';
}

function closePremiumModal() {
    premiumModal.style.display = 'none';
}

// Simulate Voice Input
function simulateVoiceInput() {
    if (isLimitHit()) {
        openPremiumModal();
        return;
    }
    const voicePrompts = {
        'Română': 'Poți te rog să îmi faci o schemă rapidă pentru comentariul poeziei \'Plumb\' de George Bacovia?',
        'Matematică': 'Cum rezolv o ecuație de gradul al doilea dacă discriminantul delta este negativ? Explică-mi te rog socratic.',
        'Istorie': 'Care sunt principalele trăsături ale constituției din 1923 din România?',
        'Geografie': 'Explică-mi pe scurt care sunt deosebirile climatice dintre climatul temperat-oceanic și cel temperat-continental.',
        'Biologie': 'Care sunt etapele sintezei proteice în celulă?',
        'Fizică': 'Cum se aplică teoremele de variație ale energiei cinetice pentru un corp pe plan înclinat?',
        'Chimie': 'Cum deosebesc o alchenă de o alchină prin reacții chimice rapide?',
        'Informatică': 'Poți să îmi propui o problemă scurtă cu grafuri neorientate pentru Subiectul II la Informatică?'
    };

    const promptText = voicePrompts[currentSubject] || `Aș dori să începem o simulare de recapitulare socratică la materia ${currentSubject}.`;
    
    // Typewriter effect in input field
    chatInput.value = '';
    let i = 0;
    sendBtn.disabled = true;
    const interval = setInterval(() => {
        if (i < promptText.length) {
            chatInput.value += promptText[i];
            chatInput.style.height = 'auto';
            chatInput.style.height = (chatInput.scrollHeight) + 'px';
            i++;
        } else {
            clearInterval(interval);
            sendBtn.disabled = false;
        }
    }, 15);
}

// Send User Message
async function sendUserMessage() {
    const text = chatInput.value.trim();
    if (!text || isLimitHit()) return;

    // Reset Input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    sendBtn.disabled = true;

    // Hide onboarding if first message
    onboardingView.style.display = 'none';

    // 1. Add User message bubble to DOM
    addMessageBubble('USER', text);
    saveMessageToHistory('USER', text);

    // Increment message count and check limit
    messageCounter++;
    localStorage.setItem('messageCounter', messageCounter.toString());
    updatePremiumUI();

    // 2. Show Typing dots
    typingIndicator.style.display = 'flex';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // 3. Ask Gemini via Vercel proxy backend
    const examFullName = currentExamType === 'BAC' ? 'Examenul de Bacalaureat' : 'Examenul de Evaluare Națională';
    const systemPrompt = `
        Ești "EduBuddy" (rebranding de la BacBuddy), cel mai performant și prietenos tutore AI specializat pe examenele din România: Bacalaureat și Evaluare Națională (clasa a VIII-a).
        În acest moment, asiști un elev care se pregătește pentru:
        - Examenul: ${examFullName} (abreviat ${currentExamType})
        - Materia: ${currentSubject}
        
        Orice răspuns al tău trebuie să respecte cu rigurozitate programa oficială din România pentru materia ${currentSubject} la examenul ${currentExamType}, inclusiv standardele Ministerului Educației.

        Sarcini și Reguli de Comportament:
        1. GESTIONAREA CONTEXTULUI:
           - Răspunde exclusiv în contextul materiei '${currentSubject}' pentru '${currentExamType}'. 
           - Dacă elevul îți pune o întrebare din altă materie sau ambiguă, cere-i politicos clarificări sau oferă-i ghidaj (ex: "Suntem la ${currentSubject}, dar dacă vrei pot trece la altă materie din meniul de sus!").

        2. STIL PEDAGOGIC (METODA SOCRATICĂ):
           - Nu oferi direct rezolvarea de-a gata a unui subiect complex sau eseu fără ca elevul să încerce mai întâi. Ghidat, ajută-l să găsească singur soluțiile punând întrebări ajutătoare inteligente.
           - Când elevul greșește, explică clar și empatic DE CE a greșit. Oferă-i un exemplu similar mai simplu pentru exersare.
           - Aplică "Stilul de Învățare Adaptiv": dacă elevul pare confuz, simplifică limbajul și folosește o analogie din viața de zi cu zi. Dacă elevul dorește performanță, oferă detalii avansate, perspective academice și precizări importante din baremul de corectare.

        3. REGULI DE FORMATARE:
           - Pentru Matematică, Fizică sau alte materii exacte: Folosește neapărat notație LaTeX pentru formule și ecuații, de exemplu: x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}. Structurează demonstrațiile pas cu pas cu argumentări logice clare.
           - Pentru Română, Istorie sau materii umaniste: Folosește neapărat structuri tip SCHEMĂ (puncte de tip bullet, idei principale, tabele sau secțiuni marcate) pentru memorare și sinteză vizuală ușoară.
           - Când corectezi o rezolvare, eseu, comentariu sau exercițiu propus, folosește OBLIGATORIU următorul format curat de feedback:
             **[Status]**: (Ex: Corect / Incomplet / Greșit)
             **[Analiză]**: Explicația academică, metodică și argumentată detaliat pe text/soluție.
             **[Îmbunătățire]**: "Cum poți obține punctajul maxim" (explică ce elemente din barem ar mai trebui adăugate sau corectate).

        4. SIGURANȚĂ ȘI INTEGRITATE:
           - Nu facilita frauda academică. Nu rezolva direct subiectele în desfășurare ale unor examene reale.
           - Rolul tău este educativ, concentrat pe formarea competențelor și pe înțelegerea profundă a materiei.

        Răspunde întotdeauna în format Markdown îngrijit, prietenos, cu un stil încurajator, în limba română.
    `;

    try {
        const history = getHistoryArray();
        
        const response = await fetch(`${API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                examType: currentExamType,
                subject: currentSubject,
                history: history,
                prompt: text,
                systemInstruction: systemPrompt
            })
        });

        const data = await response.json();
        
        // Hide typing dots
        typingIndicator.style.display = 'none';

        if (data.error) {
            addMessageBubble('AI', `⚠️ Ne pare rău, a apărut o eroare la comunicarea cu serverul: ${data.error}`);
        } else {
            // Add AI response bubble
            addMessageBubble('AI', data.text);
            saveMessageToHistory('AI', data.text);
        }
    } catch (error) {
        typingIndicator.style.display = 'none';
        addMessageBubble('AI', `⚠️ Eroare de rețea. Te rugăm să verifici conexiunea la internet sau statusul serverului. Eroare: ${error.message}`);
    }

    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Render message bubbles in DOM
function addMessageBubble(sender, text) {
    const row = document.createElement('div');
    row.className = `message-row ${sender === 'USER' ? 'user' : 'ai'}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    // Simple markdown formatting implementation (bold, bullets, lists)
    bubble.innerHTML = parseMarkdown(text);
    
    row.appendChild(bubble);
    chatContainer.appendChild(row);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Simple client-side Markdown parser
function parseMarkdown(text) {
    let html = text;
    // Replace custom warnings
    html = html.replace(/⚠️/g, '⚠️');
    // Escape HTML to prevent XSS
    html = html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // Code blocks
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Bullet points (split by newline and wrap)
    const lines = html.split('\n');
    let inList = false;
    for (let j = 0; j < lines.length; j++) {
        if (lines[j].trim().startsWith('* ') || lines[j].trim().startsWith('- ')) {
            if (!inList) {
                lines[j] = '<ul><li>' + lines[j].trim().substring(2) + '</li>';
                inList = true;
            } else {
                lines[j] = '<li>' + lines[j].trim().substring(2) + '</li>';
            }
        } else {
            if (inList) {
                lines[j] = '</ul>' + lines[j];
                inList = false;
            }
        }
    }
    if (inList) {
        lines[lines.length - 1] += '</ul>';
    }
    
    // Join back and add paragraph breaks
    return lines.join('<br>').replace(/(<br>){2,}/g, '</p><p>');
}

// Keydown handler in textarea (Send on Enter, new line on Shift+Enter)
function handleInputKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendUserMessage();
    }
}

// LocalStorage History
const getHistoryKey = () => `history_${currentExamType}_${currentSubject}`;

function getHistoryArray() {
    return JSON.parse(localStorage.getItem(getHistoryKey()) || '[]');
}

function saveMessageToHistory(sender, text) {
    const history = getHistoryArray();
    history.push({ sender, text });
    localStorage.setItem(getHistoryKey(), JSON.stringify(history));
}

function loadChatHistory() {
    // Clear current DOM chat except onboarding and typing dots
    const messageRows = chatContainer.querySelectorAll('.message-row');
    messageRows.forEach(row => row.remove());

    const history = getHistoryArray();
    if (history.length === 0) {
        onboardingView.style.display = 'flex';
    } else {
        onboardingView.style.display = 'none';
        history.forEach(msg => {
            addMessageBubble(msg.sender, msg.text);
        });
    }
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Clear current chat session
function clearCurrentChat() {
    localStorage.removeItem(getHistoryKey());
    loadChatHistory();
}

// Stripe Payment Session Call
async function initiateStripeCheckout(planName) {
    // Check if running locally via file:/// protocol (Stripe requires http/https for redirects)
    if (window.location.protocol === 'file:') {
        const confirmMock = confirm(`[Simulare Plată Locală] Deoarece rulați fișierul index.html direct de pe calculator (file:///), Stripe nu poate redirecționa securizat înapoi pe PC.

Doriți să simulați o plată reușită pentru a debloca și testa funcționalitățile Premium locale?`);
        if (confirmMock) {
            isPremiumUnlocked = true;
            localStorage.setItem('isPremiumUnlocked', 'true');
            updatePremiumUI();
            closePremiumModal();
            alert(`[Simulare Reușită] Contul EduBuddy Premium a fost deblocat cu succes (Pachet: ${planName === 'single_subject' ? 'Materie Individuală' : 'Pachet Complet'}).`);
        }
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/create-checkout-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                planName: planName,
                successUrl: window.location.href.split('?')[0],
                cancelUrl: window.location.href.split('?')[0]
            })
        });
        
        const data = await response.json();
        
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert(`Eroare la inițierea plății: ${data.error || 'Încearcă din nou.'}`);
        }
    } catch (error) {
        alert(`Eroare de conexiune la serverul de plăți: ${error.message}`);
    }
}

// Check if returned from Stripe successfully
async function checkStripeSessionStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/verify-session?session_id=${sessionId}`);
            const data = await response.json();
            
            if (data.paid) {
                isPremiumUnlocked = true;
                localStorage.setItem('isPremiumUnlocked', 'true');
                updatePremiumUI();
                
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
                
                // Show celebration alert
                alert(`Felicitări! Plata a fost confirmată. Contul tău EduBuddy Premium a fost activat cu succes: ${data.planDescription || 'Abonament complet'}.`);
            } else {
                alert('Plata nu a putut fi confirmată încă. Dacă banii au fost retrași din cont, contactează suportul.');
            }
        } catch (error) {
            console.error("Error verifying payment session:", error);
        }
    }
}

// Update Premium/UI components
function updatePremiumUI() {
    usedMessagesCount.textContent = messageCounter.toString();
    
    if (isPremiumUnlocked) {
        premiumStatusBadge.textContent = 'PLAN PREMIUM PRO 👑';
        premiumStatusBadge.className = 'status-value badge-premium';
        inputLockOverlay.style.display = 'none';
        inputRow.style.opacity = '1';
        chatInput.disabled = false;
    } else {
        premiumStatusBadge.textContent = 'PLAN GRATUIT';
        premiumStatusBadge.className = 'status-value badge-free';
        
        if (isLimitHit()) {
            inputLockOverlay.style.display = 'flex';
            inputRow.style.opacity = '0.1';
            chatInput.disabled = true;
        } else {
            inputLockOverlay.style.display = 'none';
            inputRow.style.opacity = '1';
            chatInput.disabled = false;
        }
    }
}
