document.addEventListener("DOMContentLoaded", () => {
  // Theme favicon colors
  const themeColors = {
    dark: { bg: "#0a0a0a", primary: "#a8c7a5", accent: "#6b7a69" },
    light: { bg: "#f4f4f0", primary: "#111111", accent: "#555555" },
    nord: { bg: "#2e3440", primary: "#88c0d0", accent: "#5e81ac" },
    dracula: { bg: "#282a36", primary: "#8be9fd", accent: "#6272a4" },
    cyberpunk: { bg: "#0d0221", primary: "#ff006e", accent: "#b537f2" },
    solar: { bg: "#fff6d8", primary: "#33260a", accent: "#c4841d" },
    mono: { bg: "#f7f7f7", primary: "#050505", accent: "#6f6f6f" },
    matrix: { bg: "#020804", primary: "#00ff66", accent: "#11a64f" },
    ember: { bg: "#160d09", primary: "#ffd2a1", accent: "#c54d24" },
    paper: { bg: "#fbf7ef", primary: "#24312d", accent: "#8c6d46" },
  };

  function updateFavicon(theme) {
    const colors = themeColors[theme] || themeColors.dark;
    const bgHex = colors.bg.replace("#", "%23");
    const primaryHex = colors.primary.replace("#", "%23");
    const accentHex = colors.accent.replace("#", "%23");

    // ClawdBot-inspired cute robot face
    const faviconSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><style>.bg{fill:${bgHex}}.head{fill:${primaryHex};stroke:${primaryHex};stroke-width:1}.eyes{fill:${bgHex}}.antenna{stroke:${primaryHex};stroke-width:2;stroke-linecap:round}</style></defs><rect class='bg' width='100' height='100'/><g><circle class='head' cx='50' cy='55' r='28'/><line class='antenna' x1='35' y1='20' x2='35' y2='28'/><circle cx='35' cy='18' r='2' fill='${primaryHex}'/><line class='antenna' x1='65' y1='20' x2='65' y2='28'/><circle cx='65' cy='18' r='2' fill='${primaryHex}'/><circle class='eyes' cx='42' cy='50' r='4'/><circle class='eyes' cx='58' cy='50' r='4'/><path d='M 40 60 Q 50 67 60 60' stroke='${primaryHex}' stroke-width='2' fill='none' stroke-linecap='round'/></g></svg>`;
    document.getElementById("favicon").href = faviconSvg;
  }

  // Theme switcher
  const themeLabels = {
    dark: "[ dark ]",
    light: "[ light ]",
    nord: "[ nord ]",
    dracula: "[ dracula ]",
    cyberpunk: "[ cyber ]",
    solar: "[ solar ]",
    mono: "[ mono ]",
    matrix: "[ matrix ]",
    ember: "[ ember ]",
    paper: "[ paper ]",
  };
  const themeSwitcher = document.getElementById("theme-switcher");
  const themePicker = document.getElementById("theme-picker");
  const themeOptions = document.querySelectorAll(".theme-option");
  const savedTheme = localStorage.getItem("theme") || "dark";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    updateFavicon(theme);
  }

  function setSelectedTheme(theme) {
    if (themeSwitcher) {
      themeSwitcher.textContent = themeLabels[theme] || themeLabels.dark;
    }

    themeOptions.forEach((option) => {
      option.setAttribute(
        "aria-selected",
        String(option.dataset.theme === theme),
      );
    });
  }

  applyTheme(savedTheme);
  setSelectedTheme(savedTheme);

  if (themeSwitcher) {
    themeSwitcher.addEventListener("mouseenter", () => {
      themeSwitcher.setAttribute("aria-expanded", "true");
    });
  }

  if (themePicker) {
    themePicker.addEventListener("mouseleave", () => {
      const currentTheme = localStorage.getItem("theme") || "dark";
      applyTheme(currentTheme);
      setSelectedTheme(currentTheme);
      themeSwitcher?.setAttribute("aria-expanded", "false");
    });
  }

  themeOptions.forEach((option) => {
    option.addEventListener("mouseenter", () => {
      const theme = option.dataset.theme;
      if (theme) {
        applyTheme(theme);
        setSelectedTheme(theme);
      }
    });

    option.addEventListener("click", () => {
      const theme = option.dataset.theme;
      if (theme) {
        localStorage.setItem("theme", theme);
        applyTheme(theme);
        setSelectedTheme(theme);
      }
    });
  });

  const hzWrapper = document.getElementById("hz-wrapper");
  const hzTrack = document.getElementById("hz-track");
  const progressBar = document.getElementById("scroll-progress-bar");
  const mobileLayout = window.matchMedia("(max-width: 768px)");
  let maxHorizontalTravel = 0;
  let frameRequested = false;

  function syncHorizontalTrack() {
    if (!hzTrack || mobileLayout.matches) {
      return;
    }

    // Infinite circular scrolling with seamless loop
    const totalTrackWidth = hzTrack.scrollWidth;
    const viewportWidth = window.innerWidth;
    const effectiveMaxTravel = totalTrackWidth - viewportWidth;

    // Get current scroll position
    let y = window.scrollY;

    // If user scrolls past the end, loop back to start seamlessly
    if (y > maxHorizontalTravel && maxHorizontalTravel > 0) {
      // Calculate how far past the max they've scrolled
      const overshoot = y - maxHorizontalTravel;
      // Map it back to near the start (with small offset for smoothness)
      const loopPosition = overshoot % effectiveMaxTravel;
      window.scrollTo({ top: loopPosition, behavior: "auto" });
      y = loopPosition;
    }

    hzTrack.style.transform = `translate3d(${-y}px, 0, 0)`;

    if (progressBar) {
      // Progress bar shows position in current "loop"
      const ratio =
        effectiveMaxTravel > 0
          ? (y % effectiveMaxTravel) / effectiveMaxTravel
          : 0;
      progressBar.style.transform = `scaleX(${ratio})`;
    }
  }

  function syncOnAnimationFrame() {
    if (frameRequested) {
      return;
    }

    frameRequested = true;
    requestAnimationFrame(() => {
      frameRequested = false;
      syncHorizontalTrack();
    });
  }

  function refreshHorizontalMetrics(resetScroll = false) {
    if (!hzWrapper || !hzTrack) {
      return;
    }

    if (mobileLayout.matches) {
      hzWrapper.style.height = "auto";
      hzTrack.style.transform = "none";
      if (progressBar) {
        progressBar.style.transform = "scaleX(0)";
      }
      return;
    }

    const totalTrackWidth = hzTrack.scrollWidth;
    const viewportWidth = window.innerWidth;
    // Allow scrolling beyond max to enable infinite loop detection
    maxHorizontalTravel = Math.max(totalTrackWidth - viewportWidth, 0);
    // Set wrapper height to allow infinite scrolling
    hzWrapper.style.height = `${window.innerHeight * 2 + maxHorizontalTravel}px`;

    if (resetScroll) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    syncHorizontalTrack();
  }

  window.addEventListener("scroll", syncOnAnimationFrame, { passive: true });
  window.addEventListener("resize", () => refreshHorizontalMetrics(false), {
    passive: true,
  });
  mobileLayout.addEventListener("change", () => refreshHorizontalMetrics(true));

  document.querySelectorAll('nav a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href) {
        return;
      }

      const target = document.querySelector(href);
      if (!target) {
        return;
      }

      e.preventDefault();

      if (mobileLayout.matches) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      const destination = Math.min(
        Math.max(target.offsetLeft, 0),
        maxHorizontalTravel,
      );
      window.scrollTo({ top: destination, behavior: "smooth" });
    });
  });

  refreshHorizontalMetrics(false);

  // Keyboard shortcut for terminal access.
  document.addEventListener("keydown", (e) => {
    // Press '/' to focus terminal input for immediate command entry.
    if (
      e.key === "/" &&
      document.activeElement.tagName !== "INPUT" &&
      document.activeElement.tagName !== "TEXTAREA"
    ) {
      e.preventDefault();
      const terminalInput = document.getElementById("terminal-input");
      if (terminalInput) {
        terminalInput.focus();
      }
    }
  });

  // Interactive portfolio chatbot
  const terminalRoot = document.getElementById("interactive-terminal");
  const terminalInput = document.getElementById("terminal-input");
  const terminalOutput = document.getElementById("terminal-output");

  if (terminalInput && terminalOutput) {
    const suggestionPrompts = [
      "what did you build at ITC Infotech?",
      "tell me about NovaMed",
      "what is your tech stack?",
      "how can I contact you?",
      "what are your current interests?",
    ];

    const botAnswers = [
      {
        keys: ["hello", "hi", "hey"],
        text: "Hi. Ask me about Asim's experience, projects, stack, education, or contact details.",
      },
      {
        keys: ["kodx", "kots", "dots", "opencode", "coding agent"],
        text: "At ITC Infotech, Asim built KODX from the ground up — an OpenCode-style AI coding agent for K-Fabrik — and KOTS, K-Fabrik's in-house equivalent of OpenAI Dots, taking it from concept to an internal release.",
      },
      {
        keys: ["experience", "itc", "job", "k-fabrik", "k-fabric"],
        text: "Asim is an AI Engineer at ITC Infotech (Jan 2026 - Present) on the K-Fabrik platform. He built KODX (an OpenCode-style coding agent) and KOTS (K-Fabrik's equivalent of OpenAI Dots), designed a pluggable agent-orchestration backend in Python/FastAPI, and built a Coding Standards Enforcer Agent, a Build Orchestration Agent, and a Dependency Resolver Agent with human-in-the-loop approval.",
      },
      {
        keys: ["novamed", "doctor booking", "stripe", "razorpay"],
        text: "NovaMed is a live doctor-booking platform (team project) with three role-based apps for patients, doctors, and admins on a shared REST API. Asim designed the auth layer and RBAC, owned the appointment flow end to end with Stripe and Razorpay payments, and built the doctor-management backend. Stack: React, Node.js, Express, MongoDB. Live: https://doctor-booking-application-frontend-2u2g.onrender.com/ | GitHub: https://github.com/cryptasim/Doctor-Booking-Application",
      },
      {
        keys: ["phonesay", "stream sdk", "language"],
        text: "PhoneSay is a language-exchange app that matches users by language and connects them over real-time chat and video calls via Stream SDK. It has cookie-based JWT auth, bcrypt hashing, an onboarding flow, Zustand + React Query state, and 30+ TailwindCSS/DaisyUI themes. Live: https://phonesay.onrender.com/ | GitHub: https://github.com/cryptasim/PhoneSay",
      },
      {
        keys: ["mehfil", "mehfil.wtf", "sufi", "ghazal"],
        text: "Mehfil.wtf is an atmospheric late-night music player built with Next.js, Tailwind CSS, Edge API routes, and MediaSession controls. Live: https://mehfil-wtf.vercel.app/ | GitHub: https://github.com/cryptasim/mehfil.wtf",
      },
      {
        keys: ["project", "projects"],
        text: 'Asim\'s featured projects are NovaMed, PhoneSay, and Mehfil.wtf. Ask "tell me about NovaMed", "tell me about PhoneSay", or "tell me about Mehfil" for details.',
      },
      {
        keys: ["skill", "stack", "tech", "technology"],
        text: "Languages: Python, JavaScript, SQL, C++ | AI/LLM: LangChain, LangGraph, agentic workflows, RAG, prompt engineering, Claude | Backend: Node.js, Express.js, FastAPI, REST API design, JWT auth, RBAC, Stripe, Razorpay | Databases: PostgreSQL, MySQL, MongoDB, Neo4j | Frontend: React, Zustand, React Query, TailwindCSS, HTML, CSS | Tools: Git, GitHub, Linux, Azure ML, VS Code, Cursor.",
      },
      {
        keys: ["education", "university", "jadavpur", "cgpa", "coursework", "school", "kendriya"],
        text: "Education: Jadavpur University, B.E. in Information Technology (2022 - 2026), CGPA 7.35. Coursework includes Operating Systems, DBMS, OOP, Computer Networks, DSA, and Web Technologies. School: Kendriya Vidyalaya, IIT Kharagpur (CBSE, 2020 - 2022) — Class XII (Science) 88.6%, Class X 94.6%.",
      },
      {
        keys: ["contact", "email", "github", "linkedin", "phone", "leetcode", "codeforces"],
        text: "Contact Asim at asimkumarhansda@gmail.com | GitHub: https://github.com/cryptasim | LinkedIn: https://www.linkedin.com/in/asimkumarhansda/ | LeetCode: https://leetcode.com/asimkumarhansda/ | Codeforces: https://codeforces.com/profile/asimkumarhansda | Phone: +91-8101061561",
      },
      {
        keys: ["about", "interested", "interests"],
        text: "Asim likes simple interfaces and hard engineering problems. Current focus areas: AI systems, agentic workflows, backend engineering, developer tools, and product engineering.",
      },
    ];

    const helpText =
      'Ask in plain language. Try: "what did you build at ITC Infotech?", "tell me about NovaMed", "what is your tech stack?", "how can I contact you?". Type "clear" to reset chat.';

    let promptTimer = null;
    let promptIndex = Math.floor(Math.random() * suggestionPrompts.length);
    let promptCharIndex = 0;
    let isDeletingPrompt = false;
    let hasUserInteracted = false;

    function pickNextPromptIndex() {
      if (suggestionPrompts.length <= 1) {
        return 0;
      }

      let nextIndex = Math.floor(Math.random() * suggestionPrompts.length);
      while (nextIndex === promptIndex) {
        nextIndex = Math.floor(Math.random() * suggestionPrompts.length);
      }

      return nextIndex;
    }

    function stopPromptAnimation() {
      if (promptTimer) {
        clearTimeout(promptTimer);
        promptTimer = null;
      }
    }

    function startPromptAnimation() {
      if (hasUserInteracted || terminalInput.value.trim() !== "") {
        return;
      }

      const activePrompt = suggestionPrompts[promptIndex];

      if (!isDeletingPrompt) {
        promptCharIndex += 1;
        terminalInput.placeholder = `ask: ${activePrompt.slice(0, promptCharIndex)}`;

        if (promptCharIndex >= activePrompt.length) {
          isDeletingPrompt = true;
          promptTimer = setTimeout(startPromptAnimation, 1200);
          return;
        }

        promptTimer = setTimeout(
          startPromptAnimation,
          45 + Math.floor(Math.random() * 35),
        );
        return;
      }

      promptCharIndex -= 1;
      terminalInput.placeholder =
        promptCharIndex > 0
          ? `ask: ${activePrompt.slice(0, promptCharIndex)}`
          : "ask: ";

      if (promptCharIndex <= 0) {
        isDeletingPrompt = false;
        promptIndex = pickNextPromptIndex();
        promptTimer = setTimeout(startPromptAnimation, 250);
        return;
      }

      promptTimer = setTimeout(startPromptAnimation, 24);
    }

    terminalInput.addEventListener("focus", () => {
      stopPromptAnimation();
      if (!hasUserInteracted) {
        terminalInput.placeholder = "ask:";
      }
    });

    terminalInput.addEventListener("blur", () => {
      if (!hasUserInteracted && terminalInput.value.trim() === "") {
        promptTimer = setTimeout(startPromptAnimation, 350);
      }
    });

    terminalInput.addEventListener("input", () => {
      if (terminalInput.value.trim() !== "") {
        hasUserInteracted = true;
        stopPromptAnimation();
      }
    });

    promptTimer = setTimeout(startPromptAnimation, 700);

    function getBotReply(userText) {
      const text = userText.toLowerCase();

      if (text === "help") {
        return helpText;
      }

      for (const item of botAnswers) {
        if (item.keys.some((key) => text.includes(key))) {
          return item.text;
        }
      }

      return 'I can help with experience, projects, stack, education, about, and contact. Type "help" for example prompts.';
    }

    if (terminalRoot) {
      terminalRoot.addEventListener("click", () => terminalInput.focus());
    }

    terminalInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        const val = this.value.trim();
        const cmd = val.toLowerCase();
        this.value = "";

        if (!cmd) return;

        if (cmd === "clear") {
          terminalOutput.innerHTML = "";
          const infoDiv = document.createElement("div");
          infoDiv.className = "answer";
          infoDiv.innerText = "chat cleared. ask me anything about Asim.";
          terminalOutput.appendChild(infoDiv);
          return;
        }

        // Add user command
        const cmdDiv = document.createElement("div");
        const cmdSpan = document.createElement("span");
        cmdSpan.className = "cmd";
        cmdSpan.textContent = "$ " + val;
        cmdDiv.appendChild(cmdSpan);
        terminalOutput.appendChild(cmdDiv);

        // Add response
        const resDiv = document.createElement("div");
        resDiv.className = "answer";
        resDiv.innerText = getBotReply(val);

        terminalOutput.appendChild(resDiv);
        terminalOutput.appendChild(document.createElement("br"));
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
      }

      if (e.key === "Escape") {
        this.value = "";
      }
    });
  }

  // Easter egg: Browser console terminal commands
  console.log(
    "%cONLINE",
    "color: #A8C7A5; font-size: 14px; font-weight: bold;",
  );
  console.log("Welcome to ASIM.DEV.");
  console.log(
    "Type `help` for available console commands in this console instance.",
  );

  const consoleCommands = {
    help: "Available commands:\nabout      - Print about info\nexperience - Show experience\nprojects   - List projects\ncontact    - Show contact links\nclear      - Clear terminal",
    about:
      "AI ENGINEER\nI like simple interfaces, difficult engineering problems, and products that feel obvious in hindsight.",
    experience:
      "> ITC INFOTECH - AI ENGINEER, K-FABRIK PLATFORM (Jan 2026 - Present)\n  KODX · KOTS · agent orchestration",
    projects: "> 01 / NOVAMED\n> 02 / PHONESAY\n> 03 / MEHFIL.WTF",
    contact:
      "> Email: asimkumarhansda@gmail.com\n> GitHub: github.com/cryptasim\n> LinkedIn: linkedin.com/in/asimkumarhansda\n> LeetCode: leetcode.com/asimkumarhansda\n> Codeforces: codeforces.com/profile/asimkumarhansda",
  };

  // Attach commands as getters to the window object so you can just type `help` instead of `help()`
  Object.keys(consoleCommands).forEach((cmd) => {
    Object.defineProperty(window, cmd, {
      get: function () {
        console.log(consoleCommands[cmd]);
        return "";
      },
      configurable: true,
    });
  });

  // Explicitly handle 'clear' because window.clear doesn't conflict dangerously in modern browsers
  Object.defineProperty(window, "clear", {
    get: function () {
      console.clear();
      return "Console cleared.";
    },
    configurable: true,
  });

  // Live status terminal boot sequence
  const stBody = document.getElementById("status-terminal-body");
  if (stBody) {
    const sequences = [
      [
        { text: "> booting asim.sys ...", cls: "dim" },
        { text: "[ok] python 3.12", cls: "dim" },
        { text: "[ok] fastapi runtime", cls: "dim" },
        { text: "[ok] langchain agents", cls: "dim" },
        { text: "[ok] react frontend", cls: "dim" },
        { text: "", cls: "dim" },
        { text: "STATUS: READY TO BUILD", cls: "bright" },
      ],
      [
        { text: "> loading stack ...", cls: "dim" },
        { text: "python ██████████ core", cls: "" },
        { text: "js     ████████░░ strong", cls: "" },
        { text: "c++    ██████░░░░ solid", cls: "" },
        { text: "sql    ████████░░ strong", cls: "" },
        { text: "", cls: "dim" },
        { text: "4 LANGUAGES LOADED", cls: "bright" },
      ],
      [
        { text: "> scanning agents ...", cls: "dim" },
        { text: "01 kodx (coding agent)", cls: "" },
        { text: "02 kots", cls: "" },
        { text: "03 coding-standards-enforcer", cls: "" },
        { text: "04 build-orchestration-agent", cls: "" },
        { text: "05 dependency-resolver-agent", cls: "" },
        { text: "PLATFORM: K-FABRIK @ ITC", cls: "bright" },
        { text: "STACK: FASTAPI + LLM WORKFLOWS", cls: "bright" },
      ],
      [
        { text: "> listing deploys ...", cls: "dim" },
        { text: "01 novamed      [LIVE]", cls: "" },
        { text: "   react · node · mongo", cls: "dim" },
        { text: "   stripe + razorpay", cls: "dim" },
        { text: "02 phonesay     [LIVE]", cls: "" },
        { text: "   react · stream sdk", cls: "dim" },
        { text: "03 mehfil.wtf   [LIVE]", cls: "" },
        { text: "   next.js · edge api", cls: "dim" },
        { text: "3 PRODUCTS SHIPPED", cls: "bright" },
      ],
      [
        { text: "> sys.profile()", cls: "dim" },
        { text: "", cls: "dim" },
        { text: "ASIM KUMAR HANSDA", cls: "bright" },
        { text: "ai engineer @ itc infotech", cls: "" },
        { text: "jadavpur university '26", cls: "dim" },
        { text: "", cls: "dim" },
        { text: "BUILDING AI THAT BUILDS SOFTWARE", cls: "bright" },
      ],
      [
        { text: "> ping tools ...", cls: "dim" },
        { text: "[ok] git · github", cls: "dim" },
        { text: "[ok] linux · vs code · cursor", cls: "dim" },
        { text: "[ok] azure ml", cls: "dim" },
        { text: "[ok] langchain · langgraph", cls: "dim" },
        { text: "[ok] rag · prompt eng", cls: "dim" },
        { text: "", cls: "dim" },
        { text: "ALL SYSTEMS ONLINE", cls: "bright" },
      ],
    ];

    let seqIdx = 0;

    function runSequence() {
      const seq = sequences[seqIdx % sequences.length];
      seqIdx++;
      stBody.innerHTML = "";
      let i = 0;

      function addLine() {
        if (i >= seq.length) {
          setTimeout(runSequence, 3200);
          return;
        }

        const div = document.createElement("div");
        div.className = "st-line" + (seq[i].cls ? " " + seq[i].cls : "");
        div.textContent = seq[i].text || "\u00A0";
        stBody.appendChild(div);
        i++;
        setTimeout(addLine, 120 + Math.random() * 80);
      }

      addLine();
    }

    runSequence();
  }
});
