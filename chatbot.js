class ChatbotWidget {
  constructor(options = {}) {
    this.options = {
      workflowId: "69b7bb9d8b6293366ca8b53a",
      agentId: "69b7bb9c8b6293366ca8b537",
      customerId: "698eeebea3774969a286dba5",
      botType: "general",
      agentName: "RhinoBot",
      agentImage: "",
      agentStatus: "active",
      isBranding: false,
      initialMessage: "",
      width: "400px",
      height: "550px",
      position: { bottom: "20px", right: "20px" },
      containerId: "chatbot-widget",
      voiceServiceUrl: "https://app.rhinoagents.com/stt-service",
      ragServiceUrl: "https://app.rhinoagents.com/rag-service",
      queryCustomNodes: [],
      customNodes: [],
      menuOptions: {},
      languages: [],
      ...options,
    };

    this.isOpen = false;
    this.isTyping = false;
    this.agentTyping = false;
    this.messages = [];
    this.connected = false;
    this.selectedLanguage = "english";
    this.initialized = false;
    this.historyLoaded = false;

    this.escalationMode = false;
    this.agentAssigned = false;
    this.collectingUserName = false;
    this.userName = "";
    this._escalationJustResolved = false;

    this.isUploadingEnabled = false;
    this.uploading = false;
    this.uploadEnabledMessageId = null;
    this.uploadingMessageId = null;
    this.fileResponseType = "content";
    this.afterUploadQuestion = "Please describe the uploaded document";

    this.isRecording = false;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.isVoiceMode = false;
    this.openAIKey = "";
    this.silenceStartTime = null;
    this.animationFrameId = null;
    this.audioContext = null;
    this.analyserNode = null;
    this.sourceNode = null;
    this.hasWorkflowKey = false;
    this.isVoiceEnabled = false;

    this.styles = {
      headerBackground: "#4f46e5",
      headerText: "#ffffff",
      chatBackground: "#f8fafc",
      userMessageBackground: "#4f46e5",
      botMessageBackground: "#ffffff",
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: "14px",
      buttonBorderRadius: "16px",
    };

    this.loadConfiguration(false);
  }

  async loadConfiguration(isRefresh = false) {
    try {
      console.log(
        "🔄 [ChatbotWidget] loadConfiguration called. isRefresh:",
        isRefresh,
      );
      // Single fetch instead of two identical calls
      const res = await fetch(
        "https://app.rhinoagents.com/agent-service/api/public/workflows/" +
          this.options.customerId +
          "/" +
          this.options.workflowId,
      );
      const json = await res.json();
      const agentData = json.data || {};
      const workflowData = json.data || {};

      if (agentData.name) this.options.agentName = agentData.name;
      if (agentData.image) this.options.agentImage = agentData.image;

      if (agentData.developmentMode === "developing") {
        this.options.agentStatus = "inactive";
      } else if (agentData.developmentMode === "published") {
        this.options.agentStatus = "active";
      } else if (agentData.status === "draft") {
        this.options.agentStatus = "inactive";
      } else if (agentData.status) {
        this.options.agentStatus = agentData.status;
      }

      if (agentData.isFileUploadEnabled !== undefined)
        this.options.isFileUploadEnabled = agentData.isFileUploadEnabled;
      this.options.isBranding =
        agentData?.isBranding === true || workflowData?.isBranding === true;
      if (workflowData.botResponse)
        this.options.initialMessage = workflowData.botResponse;
      if (workflowData.languages)
        this.options.languages = workflowData.languages;
      if (workflowData.metadata && workflowData.metadata.menuOptions) {
        this.options.menuOptions = workflowData.metadata.menuOptions;
      }
      if (
        workflowData.metadata &&
        workflowData.metadata.isVoiceEnabled !== undefined
      ) {
        this.isVoiceEnabled = workflowData.metadata.isVoiceEnabled;
      }
      if (
        this.options.queryCustomNodes &&
        this.options.queryCustomNodes.length > 0
      ) {
        this.options.customNodes = this.options.queryCustomNodes;
      } else if (workflowData.customNodes) {
        this.options.customNodes = workflowData.customNodes;
      }
    } catch (error) {
      console.error("❌ [ChatbotWidget] loadConfiguration FAILED:", error);
    } finally {
      this.updateChatButtonIcon();
      if (!isRefresh) this.initialize();
      else this.updateUIState();
    }
  }

  // ✅ NEW: Fetch OpenAI Key
  async fetchOpenAIKey() {
    try {
      const response = await fetch(
        `https://app.rhinoagents.com/agent-service/api/integrationsData/${this.options.customerId}/workflow/${this.options.workflowId}/openai-key`,
      );

      if (!response.ok) {
        console.warn(`⚠️ API returned status ${response.status}`);
        console.warn("⚠️ No OpenAI key found, voice features will be disabled");
        return;
      }

      const data = await response.json();

      if (data.success && data.apiKey) {
        this.openAIKey = data.apiKey;
        this.hasWorkflowKey = true;
      } else {
        this.hasWorkflowKey = false;
        console.warn("⚠️ API response missing apiKey:", data);
      }
    } catch (e) {
      this.hasWorkflowKey = false;
      console.error("❌ Failed to fetch OpenAI key:", e.message);
      console.warn("⚠️ Voice features will be disabled");
    }
  }

  async initialize() {
    await this.initializeUserId();
    await this.fetchStyles();
    this.createStyles();
    this.createChatButton();
    this.createChatContainer();
    if (!document.getElementById(this.options.containerId)) {
      document.body.appendChild(this.container);
    }
    this.updateUIState();
    this.initialized = true;
  }

  generateUniqueId() {
    return (
      "user_" +
      Date.now().toString() +
      "_" +
      Math.random().toString(36).substr(2, 9)
    );
  }

  async initializeUserId() {
    let userId = localStorage.getItem("WidgetChatBotUserId");
    if (!userId) {
      userId = this.generateUniqueId();
      localStorage.setItem("WidgetChatBotUserId", userId);
    }
    this.userId = userId;
    this.combinedUserId = `${this.options.workflowId}:${this.userId}`;
  }

  async fetchStyles() {
    try {
      const response = await fetch(
        `https://app.rhinoagents.com/api/chatbots/style/${this.options.customerId}/${this.options.workflowId}`,
      );
      const data = await response.json();
      if (data.success && data.styles)
        this.styles = { ...this.styles, ...data.styles };
    } catch (e) {
      console.warn("Using default styles");
    }
  }

  createStyles() {
    const style = document.createElement("style");
    style.textContent = `
      #${this.options.containerId} { font-family: ${this.styles.fontFamily}; z-index: 2147483647 !important; }
      #${this.options.containerId} * { box-sizing: border-box; }
      #${this.options.containerId} .chat-button {
        position: fixed; bottom: ${this.options.position.bottom}; right: ${this.options.position.right};
        width: 60px; height: 60px; border-radius: 50%;
        background: linear-gradient(135deg, ${this.styles.headerBackground}, ${this.styles.headerBackground}dd);
        color: ${this.styles.headerText}; display: flex; align-items: center; justify-content: center;
        cursor: pointer; box-shadow: 0 8px 25px rgba(0,0,0,0.3); z-index: 2147483647 !important; transition: transform 0.3s ease;
        animation: chat-wink 2.5s infinite;
      }
      #${this.options.containerId} .chat-button.chat-open {
        animation: none;
      }
      #${this.options.containerId} .chat-button:hover { transform: scale(1.1); }
      #${this.options.containerId} .chat-container {
        position: fixed; bottom: ${this.options.position.bottom}; right: ${this.options.position.right};
        width: ${this.options.width}; height: ${this.options.height};
        border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
        background: ${this.styles.chatBackground}; display: none; flex-direction: column;
        overflow: hidden; border: 1px solid rgba(0,0,0,0.1);
        z-index: 2147483647 !important;
      }
      #${this.options.containerId} .chat-header {
        background: linear-gradient(to right, ${this.styles.headerBackground}, ${this.styles.headerBackground}dd);
        color: ${this.styles.headerText}; padding: 15px; display: flex; align-items: center; gap: 10px;
      }
      #${this.options.containerId} .header-info { flex: 1; }
      #${this.options.containerId} .header-title { font-weight: bold; font-size: 16px; }
      #${this.options.containerId} .header-status { font-size: 11px; opacity: 0.9; display: flex; align-items: center; gap: 4px; }
      #${this.options.containerId} .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; animation: pulse 2s infinite; }
      #${this.options.containerId} .lang-select {
        background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); color: white;
        padding: 4px 8px; border-radius: 6px; font-size: 11px; outline: none; cursor: pointer;
      }
      #${this.options.containerId} .lang-select option { color: #333; }
      #${this.options.containerId} .messages-area {
        flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px;
      }
      #${this.options.containerId} .message {
        max-width: 85%; padding: 12px 14px; border-radius: ${this.styles.buttonBorderRadius};
        font-size: ${this.styles.fontSize}; line-height: 1.5; position: relative; word-wrap: break-word;
      }
      #${this.options.containerId} .user-message {
        align-self: flex-end;
        background: linear-gradient(to bottom right, ${this.styles.userMessageBackground}, ${this.styles.userMessageBackground}dd);
        color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      #${this.options.containerId} .bot-message {
        align-self: flex-start; background: ${this.styles.botMessageBackground};
        color: #1e293b; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      }
      #${this.options.containerId} .inline-upload-box {
        margin-top: 12px; padding: 12px; background: #f8fafc;
        border: 2px dashed #cbd5e1; border-radius: 8px; text-align: center;
      }
      #${this.options.containerId} .upload-btn-label {
        display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px;
        background: #4f46e5; color: white; border-radius: 6px; font-size: 13px;
        cursor: pointer; font-weight: 500; transition: background 0.2s;
      }
      #${this.options.containerId} .upload-btn-label:hover { background: #4338ca; }
      #${this.options.containerId} .processing-box {
        margin-top: 8px; padding: 8px; background: #eff6ff; border: 1px solid #bfdbfe;
        border-radius: 6px; display: flex; align-items: center; gap: 8px; font-size: 12px; color: #1d4ed8;
      }
      #${this.options.containerId} .spinner {
        width: 14px; height: 14px; border: 2px solid #3b82f6;
        border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;
      }
      #${this.options.containerId} .message-time { font-size: 10px; margin-top: 4px; text-align: right; opacity: 0.7; }
      #${this.options.containerId} .msg-options { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
      #${this.options.containerId} .option-btn {
        background: linear-gradient(135deg, ${this.styles.headerBackground}, ${this.styles.headerBackground}EE);
        color: white; border: none; padding: 8px 12px; border-radius: 8px;
        cursor: pointer; text-align: left; font-size: 13px; transition: all 0.2s;
      }
      #${this.options.containerId} .option-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(59,130,246,0.3); }
      #${this.options.containerId} .feedback-container { margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; }
      #${this.options.containerId} .feedback-btn { padding: 4px 8px; font-size: 11px; border-radius: 4px; border: 1px solid #eee; background: white; cursor: pointer; margin-right: 5px; }
      #${this.options.containerId} .feedback-yes { color: green; border-color: #dcfce7; }
      #${this.options.containerId} .feedback-no { color: red; border-color: #fee2e2; }
      #${this.options.containerId} .agent-banner { text-align: center; margin: 10px 0; font-size: 11px; }
      #${this.options.containerId} .agent-badge {
        background: linear-gradient(to right, #6366f1, #a855f7);
        color: white; padding: 4px 12px; border-radius: 20px; font-weight: bold;
      }
      #${this.options.containerId} .input-area {
        padding: 12px; background: rgba(255,255,255,0.9);
        border-top: 1px solid rgba(0,0,0,0.05); display: flex; align-items: center; gap: 8px;
      }
      #${this.options.containerId} .voice-input-container {
        display: flex; flex-direction: column; align-items: center; justify-content: center; margin-right: 4px;
      }
      #${this.options.containerId} .mic-btn {
        position: relative; width: 40px; height: 40px; border-radius: 50%; border: none;
        display: flex; align-items: center; justify-content: center; cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
        color: white; background: linear-gradient(135deg, ${this.styles.headerBackground}, ${this.styles.headerBackground}EE);
      }
      #${this.options.containerId} .mic-btn:hover { background: linear-gradient(135deg, ${this.styles.headerBackground}DD, ${this.styles.headerBackground}); transform: scale(1.05); }
      #${this.options.containerId} .mic-btn.recording { background: linear-gradient(to right, #ef4444, #ec4899); animation: pulse-ring 2s infinite; }
      #${this.options.containerId} .mic-btn:disabled { opacity: 0.5; cursor: not-allowed; background: #cbd5e1; }
      #${this.options.containerId} .ping-ring {
        position: absolute; inset: 0; border-radius: 50%; background-color: #ef4444;
        opacity: 0.75; animation: ping 1s cubic-bezier(0,0,0.2,1) infinite; display: none;
      }
      #${this.options.containerId} .mic-btn.recording .ping-ring { display: block; }
      #${this.options.containerId} .mic-status-text {
        font-size: 10px; font-weight: 500; margin-top: 4px; text-align: center;
        color: #dc2626; animation: pulse 2s infinite; display: none;
      }
      #${this.options.containerId} .mic-status-text.active { display: block; }
      #${this.options.containerId} .message-input {
        flex: 1; padding: 10px 14px; border: 1px solid #e2e8f0;
        border-radius: ${this.styles.buttonBorderRadius}; outline: none; font-size: 14px;
      }
      #${this.options.containerId} .message-input:focus { border-color: ${this.styles.headerBackground}; }
      #${this.options.containerId} .send-btn {
        width: 40px; height: 40px; border-radius: 50%;
        background: linear-gradient(135deg, ${this.styles.headerBackground}, ${this.styles.headerBackground}dd);
        color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
      }
      #${this.options.containerId} .send-btn:disabled { background: #cbd5e1; cursor: not-allowed; }
      #${this.options.containerId} .typing-container {
        display: flex; justify-content: flex-start; margin-bottom: 16px; animation: fadeIn 0.3s ease-in;
      }
      #${this.options.containerId} .typing-bubble {
        background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); border-radius: 16px;
        padding: 12px 16px; color: #1e293b; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        border: 1px solid rgba(255,255,255,0.6); display: flex; align-items: center; gap: 8px;
      }
      #${this.options.containerId} .typing-dots-wrapper { display: flex; gap: 4px; }
      #${this.options.containerId} .typing-dot {
        width: 8px; height: 8px; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both;
      }
      #${this.options.containerId} .typing-dot:nth-child(1) { background: linear-gradient(to right, #10b981, #14b8a6); animation-delay: -0.32s; }
      #${this.options.containerId} .typing-dot:nth-child(2) { background: linear-gradient(to right, #14b8a6, #06b6d4); animation-delay: -0.16s; }
      #${this.options.containerId} .typing-dot:nth-child(3) { background: linear-gradient(to right, #06b6d4, #3b82f6); }
      #${this.options.containerId} .typing-text { font-size: 13px; color: #475569; font-weight: 500; }
      #${this.options.containerId} .powered-by {
        text-align: center; font-size: 10px; color: #94a3b8; padding: 6px;
        background: #f8fafc; border-top: 1px solid #f1f5f9; font-weight: 500; letter-spacing: 0.5px;
      }
      #${this.options.containerId} .dev-mode-ui {
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        height: 100%; padding: 32px; text-align: center; background: white;
      }
      #${this.options.containerId} .dev-icon { width: 56px; height: 56px; color: #f59e0b; margin-bottom: 16px; }

      /* ── 3-dots menu ── */
      #${this.options.containerId} .header-actions { display: flex; align-items: center; gap: 4px; position: relative; }
      #${this.options.containerId} .dots-btn {
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        width: 28px; height: 28px; border-radius: 6px; transition: background 0.2s; color: white;
      }
      #${this.options.containerId} .dots-btn:hover { background: rgba(255,255,255,0.2); }
      #${this.options.containerId} .dots-menu {
        position: absolute; right: 0; top: 100%; margin-top: 6px; background: white; color: #1e293b;
        border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); display: none; flex-direction: column;
        min-width: 140px; z-index: 100; overflow: hidden; border: 1px solid rgba(0,0,0,0.05);
        animation: fadeIn 0.2s ease;
      }
      #${this.options.containerId} .dots-menu.show { display: flex; }
      #${this.options.containerId} .dots-menu-item {
        padding: 10px 14px; font-size: 12px; cursor: pointer; transition: background 0.2s;
        display: flex; align-items: center; gap: 8px; font-weight: 500;
      }
      #${this.options.containerId} .dots-menu-item:hover { background: #f1f5f9; }

      /* ── Confirm modal ── */
      #${this.options.containerId} .confirm-modal-overlay {
        position: absolute; inset: 0; background: rgba(255,255,255,0.6); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center; z-index: 99999; animation: fadeIn 0.2s ease;
      }
      #${this.options.containerId} .confirm-modal-box {
        background: white; padding: 24px; border-radius: 14px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.15); width: 85%; max-width: 320px;
        text-align: center; border: 1px solid rgba(0,0,0,0.08);
      }
      #${this.options.containerId} .confirm-modal-text {
        color: #1e293b; font-size: 14px; margin-bottom: 24px; line-height: 1.5; font-weight: 500;
      }
      #${this.options.containerId} .confirm-modal-actions { display: flex; gap: 12px; justify-content: center; }
      #${this.options.containerId} .confirm-btn-cancel {
        padding: 10px 16px; border-radius: 8px; border: 1px solid #cbd5e1; background: white;
        color: #475569; cursor: pointer; font-size: 13px; font-weight: 600; flex: 1; transition: background 0.2s;
      }
      #${this.options.containerId} .confirm-btn-cancel:hover { background: #f8fafc; }
      #${this.options.containerId} .confirm-btn-confirm {
        padding: 10px 16px; border-radius: 8px; border: none; background: #ef4444; color: white;
        cursor: pointer; font-size: 13px; font-weight: 600; flex: 1; transition: background 0.2s;
      }
      #${this.options.containerId} .confirm-btn-confirm:hover { background: #dc2626; }

      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes ping { 75%, 100% { transform: scale(1.5); opacity: 0; } }
      @keyframes pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); } 70% { box-shadow: 0 0 0 10px rgba(239,68,68,0); } 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); } }
      @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
      @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes chat-wink {
        0% { box-shadow: 0 8px 25px rgba(0,0,0,0.3), 0 0 0 0 ${this.styles.headerBackground}b3; }
        70% { box-shadow: 0 8px 25px rgba(0,0,0,0.3), 0 0 0 15px ${this.styles.headerBackground}00; }
        100% { box-shadow: 0 8px 25px rgba(0,0,0,0.3), 0 0 0 0 ${this.styles.headerBackground}00; }
      }
      #${this.options.containerId} .circular-text {
        position: fixed; 
        bottom: calc(${this.options.position.bottom} - 20px); 
        right: calc(${this.options.position.right} - 20px);
        width: 100px; height: 100px;
        z-index: 2147483646 !important;
        pointer-events: none;
        animation: rotate-text 20s linear infinite;
        transition: opacity 0.3s ease, transform 0.3s ease;
        display: flex; align-items: center; justify-content: center;
      }
      #${this.options.containerId} .circular-text text {
        font-family: ${this.styles.fontFamily};
        font-size: 7.2px;
        font-weight: 700;
        fill: ${this.styles.headerBackground};
        letter-spacing: 1.5px;
        text-transform: uppercase;
        opacity: 0.8;
      }
      #${this.options.containerId} .chat-button.chat-open ~ .circular-text {
        opacity: 0;
        transform: scale(0.8);
      }
      @keyframes rotate-text {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* ── Responsive & Accessibility ── */
      #${this.options.containerId} .chat-container {
        max-width: 100vw;
        max-height: 100vh;
      }

      @media (max-width: 480px) {
        #${this.options.containerId} .chat-container {
          width: calc(100vw - 30px) !important;
          height: 80vh !important;
          bottom: 15px !important;
          right: 15px !important;
          border-radius: 16px !important;
          max-width: calc(100vw - 30px) !important;
          max-height: 85vh !important;
        }
        #${this.options.containerId} .chat-button.chat-open {
          display: none !important;
        }
        #${this.options.containerId} .chat-button.chat-open ~ .circular-text {
          display: none !important;
        }
        #${this.options.containerId} .chat-button {
          width: 50px !important;
          height: 50px !important;
          bottom: 80px !important;
          right: 15px !important;
        }
        #${this.options.containerId} .chat-button img {
          width: 100% !important;
          height: 100% !important;
        }
        #${this.options.containerId} .circular-text {
          bottom: 55px !important;
          right: -15px !important;
          transform: scale(0.65);
        }
        #${this.options.containerId} .chat-header {
          padding: 12px;
        }
        #${this.options.containerId} .message {
          max-width: 92%;
        }
      }

      /* ── Extra Small Dimensions (e.g., 200px width) ── */
      @media (max-width: 300px) {
        #${this.options.containerId} .chat-container {
          width: calc(100vw - 10px) !important;
          height: calc(100vh - 10px) !important;
          bottom: 5px !important;
          right: 5px !important;
        }
        #${this.options.containerId} .chat-header {
          padding: 8px 10px !important;
          gap: 6px !important;
        }
        #${this.options.containerId} .chat-header > div:first-child,
        #${this.options.containerId} .lang-select {
          display: none !important; /* Hide avatar and lang selector to save space */
        }
        #${this.options.containerId} .header-title {
          font-size: 13px !important;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100px;
        }
        #${this.options.containerId} .header-actions {
          gap: 2px !important;
        }
        #${this.options.containerId} .dots-btn {
          display: none !important; /* Hide dots menu on tiny screens */
        }
        #${this.options.containerId} .messages-area {
          padding: 8px !important;
          gap: 6px !important;
        }
        #${this.options.containerId} .input-area {
          padding: 6px !important;
          gap: 4px !important;
          flex-wrap: nowrap !important;
        }
        #${this.options.containerId} .message-input {
          font-size: 12px !important;
          padding: 6px 10px !important;
          min-width: 0 !important;
          flex: 1 !important;
        }
        #${this.options.containerId} .send-btn, 
        #${this.options.containerId} .mic-btn {
          width: 34px !important;
          height: 34px !important;
          flex-shrink: 0 !important;
        }
      }

      @media (max-height: 550px) and (min-width: 481px) {
        #${this.options.containerId} .chat-container {
          height: calc(100vh - 20px) !important;
          bottom: 10px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  createChatButton() {
    this.container = document.createElement("div");
    this.container.id = this.options.containerId;
    
    const btn = document.createElement("div");
    btn.className = "chat-button";
    btn.id = "chat-embed-btn";
    this.chatBtn = btn;
    this.updateChatButtonIcon();
    btn.onclick = () => this.toggleChat();
    
    // Circular Text SVG
    const circularText = document.createElement("div");
    circularText.className = "circular-text";
    circularText.innerHTML = `
        <svg viewBox="0 0 100 100" width="100" height="100">
            <path id="circlePath" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" fill="none" />
            <text>
                <textPath href="#circlePath">
                    • CHAT WITH OUR SOLAR AI EXPERT •
                </textPath>
            </text>
        </svg>
    `;

    this.container.appendChild(btn);
    this.container.appendChild(circularText);
  }

  updateChatButtonIcon() {
    if (!this.chatBtn) return;

    // Sync open class for animation control
    if (this.isOpen) {
        this.chatBtn.classList.add("chat-open");
    } else {
        this.chatBtn.classList.remove("chat-open");
    }

    // If open, always show the close (X) icon
    if (this.isOpen) {
      this.chatBtn.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      this.chatBtn.style.background = ""; // Reset background to show primary color
      this.chatBtn.style.padding = "";
      this.chatBtn.style.overflow = "";
      return;
    }

    if (this.options.agentImage && this.options.agentImage.trim() !== "") {
      this.chatBtn.innerHTML =
        '<img src="' +
        this.options.agentImage +
        '" style="width:60px;height:60px;border-radius:50%;object-fit:cover;display:block;" alt="Agent">';
      this.chatBtn.style.background = "none";
      this.chatBtn.style.padding = "0";
      this.chatBtn.style.overflow = "hidden";
    } else {
      this.chatBtn.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
      this.chatBtn.style.background = "";
      this.chatBtn.style.padding = "";
      this.chatBtn.style.overflow = "";
    }
  }

  createChatContainer() {
    this.chatWindow = document.createElement("div");
    this.chatWindow.className = "chat-container";
    this.container.appendChild(this.chatWindow);
  }

  updateUIState() {
    if (this.options.agentStatus === "inactive") {
      this.renderInactiveMode();
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      return;
    }
    this.renderActiveMode();
    // Dynamically sync powered-by visibility after every config refresh
    const poweredByEl = this.chatWindow.querySelector(".powered-by");
    if (poweredByEl) {
      poweredByEl.style.display = this.options.isBranding ? "none" : "";
    }
    if (!this.socket) {
      this.initSocket();
      if (this.messages.length === 0) this.loadChatSession();
    }
  }

  renderInactiveMode() {
    this.chatWindow.innerHTML = `
      <div class="chat-header">
        <div style="font-weight:bold;">${this.options.agentName}</div>
        <div class="close-btn" style="cursor:pointer;margin-left:auto;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </div>
      </div>
      <div class="dev-mode-ui">
        <svg class="dev-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z"></path>
        </svg>
        <h2 style="font-size:20px;font-weight:600;color:#4f46e5;margin-bottom:8px;">This Chatbot is currently in Development Mode</h2>
      </div>
      ${!this.options.isBranding ? '<div class="powered-by"><a href="https://www.rhinoagents.com/" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:none;">Powered by RhinoAgents</a></div>' : ""}
    `;
    this.chatWindow.querySelector(".close-btn").onclick = () =>
      this.toggleChat();
  }

  renderActiveMode() {
    if (this.chatWindow.querySelector("#messages-area")) {
      const titleEl = this.chatWindow.querySelector(".header-title");
      if (titleEl) titleEl.textContent = this.options.agentName;
      this.renderLanguageDropdown();
      return;
    }

    let iconHtml =
      '<div style="width:36px;height:36px;flex-shrink:0;align-self:center;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg></div>';
    if (this.options.agentImage && this.options.agentImage.trim() !== "") {
      iconHtml = `<div style="width:36px;height:36px;flex-shrink:0;align-self:center;border-radius:50%;overflow:hidden;border:2px solid rgba(255,255,255,0.5);"><img src="${this.options.agentImage}" style="width:100%;height:100%;object-fit:cover;display:block;" alt="Agent"></div>`;
    }

    const micIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
    const langDropdownHtml = this.buildLanguageDropdownHtml();

    const voiceInputHtml = this.isVoiceEnabled
      ? `
      <div class="voice-input-container">
        <button class="mic-btn" id="mic-btn" title="Start voice input">
          <span class="ping-ring"></span>
          <span id="mic-icon-wrapper">${micIcon}</span>
        </button>
        <div id="mic-status-text" class="mic-status-text">🎙️ Recording...</div>
      </div>
    `
      : "";

    this.chatWindow.innerHTML = `
      <div class="chat-header">
        ${iconHtml}
        <div class="header-info">
          <div class="header-title">${this.options.agentName}</div>
          <div class="header-status" id="status-text"><span class="status-dot"></span> <span>Connecting...</span></div>
        </div>
        ${langDropdownHtml}
        <div class="header-actions">
          <div class="dots-btn" id="header-dots-btn" title="Options">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="1.5"></circle>
              <circle cx="12" cy="5" r="1.5"></circle>
              <circle cx="12" cy="19" r="1.5"></circle>
            </svg>
          </div>
          <div class="dots-menu" id="header-dots-menu">
            <div class="dots-menu-item" id="menu-new-chat">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              Start New Chat
            </div>
          </div>
          <div class="close-btn" style="cursor:pointer;display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:6px;transition:background 0.2s;color:white;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </div>
        </div>
      </div>
      <div class="messages-area" id="messages-area"></div>
      <div class="input-area">
        ${voiceInputHtml}
        <input type="text" class="message-input" placeholder="Type your message..." id="message-input">
        <button class="send-btn" id="send-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      ${!this.options.isBranding ? '<div class="powered-by"><a href="https://www.rhinoagents.com/" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:none;">Powered by RhinoAgents</a></div>' : ""}
    `;

    this.messagesArea = this.chatWindow.querySelector("#messages-area");
    this.input = this.chatWindow.querySelector("#message-input");
    this.sendBtn = this.chatWindow.querySelector("#send-btn");
    this.statusText = this.container.querySelector("#status-text");
    this.micBtn = this.container.querySelector("#mic-btn");
    this.micIconWrapper = this.container.querySelector("#mic-icon-wrapper");
    this.micStatusText = this.container.querySelector("#mic-status-text");

    this.container.querySelector(".close-btn").onclick = () =>
      this.toggleChat();
    this.sendBtn.onclick = () => this.sendMessage();
    this.input.onkeypress = (e) => {
      if (e.key === "Enter") this.sendMessage();
    };

    // 3-dots menu wiring
    const dotsBtn = this.chatWindow.querySelector("#header-dots-btn");
    const dotsMenu = this.chatWindow.querySelector("#header-dots-menu");
    const newChatMenuItem = this.chatWindow.querySelector("#menu-new-chat");
    if (dotsBtn && dotsMenu) {
      dotsBtn.onclick = (e) => {
        e.stopPropagation();
        dotsMenu.classList.toggle("show");
      };
      document.addEventListener("click", () => {
        if (dotsMenu.classList.contains("show"))
          dotsMenu.classList.remove("show");
      });
    }
    if (newChatMenuItem) {
      newChatMenuItem.onclick = () => {
        dotsMenu.classList.remove("show");
        this.showNewChatModal();
      };
    }

    if (this.micBtn) this.micBtn.onclick = () => this.handleMicClick();
    this.attachLanguageDropdownListener();
  }

  buildLanguageDropdownHtml() {
    if (!this.options.languages || this.options.languages.length === 0)
      return "";
    const options = this.options.languages
      .map(
        (lang) =>
          `<option value="${lang.toLowerCase()}" ${lang.toLowerCase() === this.selectedLanguage ? "selected" : ""}>${lang}</option>`,
      )
      .join("");
    return `<select class="lang-select" id="lang-select">${options}</select>`;
  }

  renderLanguageDropdown() {
    const existingSelect = this.chatWindow.querySelector("#lang-select");
    if (existingSelect) return;
    if (!this.options.languages || this.options.languages.length === 0) return;
    const headerActions = this.chatWindow.querySelector(".header-actions");
    if (!headerActions) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.buildLanguageDropdownHtml();
    const selectEl = wrapper.firstElementChild;
    headerActions.parentNode.insertBefore(selectEl, headerActions);
    this.attachLanguageDropdownListener();
  }

  attachLanguageDropdownListener() {
    const langSelect = this.chatWindow.querySelector("#lang-select");
    if (langSelect) {
      langSelect.onchange = (e) => {
        this.selectedLanguage = e.target.value;
      };
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    this.chatWindow.style.display = this.isOpen ? "flex" : "none";

    // Update the button icon immediately
    this.updateChatButtonIcon();

    if (this.isOpen) {
      this.loadConfiguration(true);
      // Sync latest messages from server whenever window is opened
      if (this.userId) this.loadChatSession();

      this.scrollToBottom();
      if (this.input) this.input.focus();
    }
  }

  // ── New Chat ──────────────────────────────────────────────────────────────

  showNewChatModal() {
    const existing = document.getElementById("chatbot-confirm-modal-overlay");
    if (existing) existing.remove();
    const overlay = document.createElement("div");
    overlay.className = "confirm-modal-overlay";
    overlay.id = "chatbot-confirm-modal-overlay";
    overlay.innerHTML = `
      <div class="confirm-modal-box">
        <div class="confirm-modal-text">Do you want to start a new chat? Old chat will be completely gone.</div>
        <div class="confirm-modal-actions">
          <button class="confirm-btn-cancel" id="confirm-cancel-btn">Cancel</button>
          <button class="confirm-btn-confirm" id="confirm-start-btn">Start New Chat</button>
        </div>
      </div>
    `;
    this.chatWindow.appendChild(overlay);
    overlay
      .querySelector("#confirm-cancel-btn")
      .addEventListener("click", () => overlay.remove());
    overlay
      .querySelector("#confirm-start-btn")
      .addEventListener("click", async () => {
        overlay.querySelector(".confirm-modal-box").innerHTML =
          '<div class="confirm-modal-text" style="margin-bottom:0;">Starting new chat...</div>';
        await this.handleNewChat();
        overlay.remove();
      });
  }

  async handleNewChat() {
    this.messages = [];
    if (this.messagesArea) this.messagesArea.innerHTML = "";
    this.historyLoaded = false;
    await this.clearChatHistory();
    const historyLoaded = await this.loadMessageHistory();
    if (!historyLoaded || this.messages.length === 0)
      this.sendInitialGreeting();
  }

  async clearChatHistory() {
    try {
      await fetch(
        `https://app.rhinoagents.com/rag-service/clear/${this.options.workflowId}/${this.userId}`,
        { method: "DELETE" },
      );
    } catch (e) {
      console.warn("Failed to clear RAG history:", e);
    }
    try {
      await fetch(
        `https://app.rhinoagents.com/langchain-service/api/message-history/${this.userId}/${this.options.workflowId}`,
        { method: "DELETE" },
      );
    } catch (e) {
      console.warn("Failed to clear chat history:", e);
    }
  }

  // ── Message History ───────────────────────────────────────────────────────

  async loadMessageHistory(forceResolvedMode = false) {
    try {
      const url = `https://app.rhinoagents.com/langchain-service/api/message-history/${this.userId}/${this.options.workflowId}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.success && data.messages && data.messages.length > 0) {
        let uploadEnabledMsgId = null;
        let restoredFileResponseType = "content";
        let restoredAfterUploadQuestion = "Please upload the document";

        data.messages.forEach((m) => {
          if (m.uploadEnabled) {
            uploadEnabledMsgId = m.messageId;
            restoredFileResponseType = m.fileResponseType || "content";
            restoredAfterUploadQuestion =
              m.afterUploadQuestion || "Please upload the document";
          }
        });

        if (uploadEnabledMsgId) {
          this.uploadEnabledMessageId = uploadEnabledMsgId;
          this.fileResponseType = restoredFileResponseType;
          this.afterUploadQuestion = restoredAfterUploadQuestion;
        }

        this._suppressScroll = true;
        data.messages.forEach((msg) => {
          if (msg.text === "AGENT_CONNECTED") {
            if (!forceResolvedMode) {
              this.escalationMode = true;
              this.agentAssigned = true;
            }
            this._renderBannerOnly("🤝 YOU ARE CONNECTED TO AN AGENT");
            return;
          }
          if (msg.text === "AGENT_RESOLVED") {
            this.escalationMode = false;
            this.agentAssigned = false;
            this._renderBannerOnly("✅ CONVERSATION RESOLVED", "#22c55e");
            return;
          }
          const messageObj = {
            id:
              msg.messageId || "msg_" + Math.random().toString(36).substr(2, 9),
            text: msg.text,
            sender: msg.sender,
            buttons: msg.buttons,
            showFeedback: msg.showFeedback,
            timestamp: msg.timestamp,
          };
          // ✅ Smart Deduplication: Robust comparison ignoring whitespace
          const isDuplicate = this.messages.some(
            (m) =>
              m.text?.trim() === messageObj.text?.trim() &&
              m.sender === messageObj.sender,
          );
          if (!isDuplicate) {
            this.messages.push(messageObj);
            this.renderSingleMessage(messageObj);
          }
        });

        // ✅ Always hide the typing indicator first when loading history
        this.hideTypingIndicator();
        this.isTyping = false;

        // ✅ If the last message was from the user, the bot is still processing
        if (
          this.messages.length > 0 &&
          this.messages[this.messages.length - 1].sender === "user"
        ) {
          this.isTyping = true;
          this.updateStatus();
          this.showTypingIndicator();
        } else {
          this.updateStatus();
        }

        if (forceResolvedMode) {
          this.escalationMode = false;
          this.agentAssigned = false;
          this.agentTyping = false;
          this.collectingUserName = false;
          this._escalationJustResolved = true;
        }
        this._suppressScroll = false;
        this.historyLoaded = true;

        setTimeout(() => {
          if (uploadEnabledMsgId) {
            const el = this.messagesArea?.querySelector(
              `[data-msg-id="${uploadEnabledMsgId}"]`,
            );
            if (el) el.scrollIntoView({ block: "start", behavior: "smooth" });
          } else {
            const last = this.messagesArea.lastElementChild;
            if (last)
              last.scrollIntoView({ block: "start", behavior: "smooth" });
          }
        }, 100);
        return true;
      }
    } catch (e) {
      console.error("❌ Failed to load message history:", e);
    }
    this.historyLoaded = true;
    return false;
  }

  async saveMessageToHistory(messageObj, skipHistory = false) {
    if (skipHistory) return;
    try {
      const isUploadEnabled = messageObj.id === this.uploadEnabledMessageId;
      await fetch(
        "https://app.rhinoagents.com/langchain-service/api/message-history/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: this.userId,
            workflowId: this.options.workflowId,
            message: {
              text: messageObj.text,
              sender: messageObj.sender,
              buttons: messageObj.buttons,
              showFeedback: Boolean(messageObj.showFeedback),
              messageId: messageObj.id,
              timestamp: messageObj.timestamp,
              uploadEnabled: isUploadEnabled || false,
              fileResponseType: isUploadEnabled
                ? this.fileResponseType
                : undefined,
              afterUploadQuestion: isUploadEnabled
                ? this.afterUploadQuestion
                : undefined,
            },
          }),
        },
      );
    } catch (e) {
      console.warn("Failed to save message to history:", e);
    }
  }

  async updateMessageUploadState(
    messageId,
    fileResponseType,
    afterUploadQuestion,
  ) {
    try {
      await fetch(
        "https://app.rhinoagents.com/langchain-service/api/message-history/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: this.userId,
            workflowId: this.options.workflowId,
            updateMessageId: messageId,
            uploadUpdate: {
              uploadEnabled: true,
              fileResponseType,
              afterUploadQuestion,
            },
          }),
        },
      );
    } catch (e) {
      console.warn("Failed to update message upload state:", e);
    }
  }
  initSocket() {
    this.socket = io("https://app.rhinoagents.com", {
      path: "/notification-service/socket.io",
      transports: ["websocket", "polling"],
      query: { userId: this.combinedUserId },
      withCredentials: true,
    });
    this.socket.on("connect", () => {
      this.connected = true;
      this.updateStatus();
      this.socket.emit("join", this.combinedUserId);
    });
    this.socket.on("disconnect", () => {
      this.connected = false;
      this.updateStatus();
    });
    this.socket.on("chat_response", (data) => {
      this.handleChatResponse(data);
    });
    this.socket.on("bot_response", (data) => {
      this.handleChatResponse(data);
    });
    this.socket.on("escalation_assigned", (data) => {
      this.escalationMode = true;
      this.agentAssigned = true;
      this.isTyping = false;
      this.messages = [];
      this.messagesArea.innerHTML = "";
      this.updateStatus();
      this._saveBannerMarker("AGENT_CONNECTED");
      this._renderBannerOnly("🤝 YOU ARE CONNECTED TO AN AGENT");
    });
    this.socket.on("agent_typing", (data) => {
      this.agentTyping = data.isTyping;
      this.updateStatus();
    });
    this.socket.on("escalation_resolved", async (data) => {
      this.escalationMode = false;
      this.agentAssigned = false;
      this.agentTyping = false;
      this.isTyping = false;
      this.collectingUserName = false;
      this._escalationJustResolved = true;
      this.hideTypingIndicator();
      this.messages = [];
      this.messagesArea.innerHTML = "";
      await this.loadMessageHistory(true);
      this._saveBannerMarker("AGENT_RESOLVED");
      this._renderBannerOnly("✅ CONVERSATION RESOLVED", "#22c55e");
      this.addMessage(
        data.message ||
          "Your conversation with the agent has been resolved. You can continue chatting with me! 🤖",
        "bot",
      );
      this.escalationMode = false;
      this.agentAssigned = false;
      this.updateStatus();
      setTimeout(() => {
        this._escalationJustResolved = false;
      }, 15000);
    });
  }

  updateStatus() {
    if (!this.statusText) return;
    let text = "Online",
      isTypingNow = false,
      typeName = "";
    if (this.escalationMode && this.agentTyping) {
      text = "Agent is typing...";
      isTypingNow = true;
      typeName = "Agent";
    } else if (!this.escalationMode && this.isTyping) {
      text = "Typing...";
      isTypingNow = true;
      typeName = this.options.agentName;
    } else if (!this.connected) {
      text = "Connecting...";
    }
    this.statusText.innerHTML = `<span class="status-dot" style="background:${this.connected ? "#4ade80" : "#f87171"}"></span> <span>${text}</span>`;
    if (isTypingNow) this.showTypingIndicator(typeName || "Agent");
    else this.hideTypingIndicator();
    if (this.micBtn)
      this.micBtn.disabled = !this.connected || this.escalationMode;
  }

  async loadChatSession() {
    const isEscalated = await this.checkEscalationStatus();
    if (isEscalated) return;
    const historyLoaded = await this.loadMessageHistory();
    if (!historyLoaded) {
      setTimeout(() => {
        if (this.messages.length === 0) this.sendInitialGreeting();
      }, 1000);
    }
  }

  async checkEscalationStatus() {
    if (this._escalationJustResolved) return false;
    try {
      const res = await fetch(
        `https://app.rhinoagents.com/langchain-service/api/human-escalation/${this.combinedUserId}/${this.options.workflowId}/assigned`,
      );
      const data = await res.json();
      if (this._escalationJustResolved) return false;
      if (
        data.success &&
        data.conversation &&
        data.conversation.status === "assigned"
      ) {
        this.escalationMode = true;
        this.agentAssigned = true;
        this.updateStatus();
        this.messages = [];
        this.messagesArea.innerHTML = "";
        this.addBanner("🤝 YOU ARE CONNECTED TO AN AGENT");
        if (data.conversation.messages) {
          const userMsgs = (data.conversation.messages.user || []).map((m) => ({
            ...m,
            sender: "user",
          }));
          const agentMsgs = (data.conversation.messages.agent || []).map(
            (m) => ({ ...m, sender: "bot" }),
          );
          const allMsgs = [...userMsgs, ...agentMsgs].sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
          );
          this._suppressScroll = true;
          allMsgs
            .slice(1)
            .forEach((msg) =>
              this.addMessage(msg.message, msg.sender, null, false, null, true),
            );
          this._suppressScroll = false;
        }
        this.historyLoaded = true;
        setTimeout(() => {
          const last = this.messagesArea.lastElementChild;
          if (last) last.scrollIntoView({ block: "start", behavior: "smooth" });
        }, 100);
        return true;
      }
    } catch (e) {}
    return false;
  }

  sendInitialGreeting() {
    let initialButtons = null;
    if (
      this.options.menuOptions &&
      Object.keys(this.options.menuOptions).length > 0
    ) {
      initialButtons = Object.entries(this.options.menuOptions).map(
        ([key, value]) => ({
          title: key,
          customMessage: value,
          reply: { title: key },
        }),
      );
    }
    const greetingText =
      this.options.initialMessage && this.options.initialMessage.trim() !== ""
        ? this.options.initialMessage
        : `Hello! 👋 I'm ${this.options.agentName}, your AI assistant. How can I assist you today?`;
    this.showTypingIndicator();
    setTimeout(() => {
      this.hideTypingIndicator();
      this.addMessage(greetingText, "bot", initialButtons, false);
    }, 1500);
  }

  handleChatResponse(data) {
    this.isTyping = false;
    this.updateStatus();

    // Extract text from any possible field
    let text =
      data.response ||
      data.message ||
      data.data?.response ||
      data.data?.message;
    if (typeof text !== "string") return;

    // ✅ Extra-strong filter for system/success messages
    const isSystemMessage = [
      "message sent",
      "notification sent",
      "event emitted",
      "success",
      "response generation successful",
    ].some((sys) => text.toLowerCase().includes(sys));

    if (isSystemMessage) {
      console.log("♻️ System notification filtered:", text);
      return;
    }

    if (text.includes("CLEAR_CHAT")) {
      this.showNewChatModal();
      return;
    }
    if (this.isVoiceMode) {
      this.playTextToSpeech(text);
      this.isVoiceMode = false;
    }
    const botMessageId =
      data.messageId || "msg_" + Math.random().toString(36).substr(2, 9);
    this.detectUploadRequirement(text, botMessageId, data);
    let buttons =
      data.actions?.action?.buttons ||
      data.actions?.buttons ||
      data.data?.actions?.action?.buttons;
    let showFeedback =
      data.taskEnd === true ||
      data.data?.taskEnd === true ||
      data.intent === "support_question";
    this.addMessage(text, "bot", buttons, showFeedback, botMessageId);
  }

  async detectUploadRequirement(message, botMessageId, socketData = {}) {
    if (
      this.options.isFileUploadEnabled !== true &&
      this.options.isFileUploadEnabled !== "true"
    )
      return;

    const uploadKeywords =
      /\b(upload|send|attach|submit|file|document|resume|pdf|image|photo|picture|attachment)\b/i;
    if (!uploadKeywords.test(message)) return;
    try {
      const res = await fetch(
        `${this.options.ragServiceUrl}/detect-upload-requirement`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        },
      );
      const aiResponse = await res.json();
      if (aiResponse.success && aiResponse.data.fileUpload) {
        const finalResponseType =
          socketData.responseType ||
          socketData.data?.responseType ||
          aiResponse.data.responseType ||
          "content";
        const finalAfterUploadQuestion =
          socketData.afterUploadQuestion ||
          socketData.data?.afterUploadQuestion ||
          aiResponse.data.afterUploadQuestion ||
          "Please upload the document";
        this.uploadEnabledMessageId = botMessageId;
        this.fileResponseType = finalResponseType;
        this.afterUploadQuestion = finalAfterUploadQuestion;
        this.updateMessageUploadState(
          botMessageId,
          finalResponseType,
          finalAfterUploadQuestion,
        );
        const msgEl = this.messagesArea?.querySelector(
          `[data-msg-id="${botMessageId}"]`,
        );
        if (msgEl && !msgEl.querySelector(".inline-upload-box")) {
          const uploadBox = document.createElement("div");
          uploadBox.className = "inline-upload-box";
          uploadBox.innerHTML = `
            <label class="upload-btn-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
              Choose File
              <input type="file" style="display:none" class="inline-file-input-dynamic" accept=".pdf,.doc,.docx,.txt,.jpg,.png">
            </label>
            <div style="font-size:10px;color:#64748b;margin-top:4px;">Supported: PDF, DOC, JPG, PNG</div>
          `;
          const fi = uploadBox.querySelector(".inline-file-input-dynamic");
          if (fi)
            fi.onchange = (e) => {
              if (e.target.files[0])
                this.handleFileUpload(e.target.files[0], botMessageId);
            };
          msgEl.appendChild(uploadBox);
        }
      }
    } catch (e) {
      console.warn("Upload detection failed", e);
    }
  }

  async handleFileUpload(file, botMessageId) {
    if (!file) return;
    this.uploading = true;
    this.uploadingMessageId = botMessageId;
    this.updateStatus();
    this.refreshMessagesUI();
    try {
      const reader = new FileReader();
      const fileContent = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const fileData = {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileContent,
        uploadedAt: new Date().toISOString(),
      };
      const uploadRes = await fetch(
        `${this.options.ragServiceUrl}/upload-file`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileData,
            userId: this.userId,
            responseType: this.fileResponseType,
            afterUploadQuestion: this.afterUploadQuestion,
            workflowId: this.options.workflowId,
            customerId: this.options.customerId,
          }),
        },
      );
      const uploadResult = await uploadRes.json();
      if (!uploadResult.success)
        throw new Error(uploadResult.message || "File upload failed");
      const responseData = uploadResult.data;
      this.addMessage(`✅ ${file.name} uploaded successfully`, "user");
      this.uploadEnabledMessageId = null;
      await this.handleApiRequest(responseData.uploadResponse, responseData);
    } catch (error) {
      console.error("File upload error", error);
      this.addMessage(`❌ Failed to process file: ${error.message}`, "bot");
    } finally {
      this.uploading = false;
      this.uploadingMessageId = null;
      this.refreshMessagesUI();
    }
  }

  handleMicClick() {
    if (this.isRecording) this.stopRecording();
    else this.startRecording();
  }

  cleanupAudioContext() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.silenceStartTime = null;
  }

  detectSilence() {
    if (!this.analyserNode || !this.isRecording) return;
    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);
    const volume =
      dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    if (volume < 30) {
      if (!this.silenceStartTime) this.silenceStartTime = Date.now();
      else if (Date.now() - this.silenceStartTime > 3000) {
        this.stopRecording();
        return;
      }
    } else {
      this.silenceStartTime = null;
    }
    this.animationFrameId = requestAnimationFrame(() => this.detectSilence());
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      this.audioChunks = [];
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      this.analyserNode = this.audioContext.createAnalyser();
      this.sourceNode = this.audioContext.createMediaStreamSource(stream);
      this.sourceNode.connect(this.analyserNode);
      this.analyserNode.fftSize = 256;
      this.silenceStartTime = null;
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) this.audioChunks.push(event.data);
      };
      this.mediaRecorder.onstop = () => this.handleRecordingStop();
      this.mediaRecorder.start();
      this.isRecording = true;
      this.detectSilence();
      this.micBtn.classList.add("recording");
      const micOffIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
      this.micIconWrapper.innerHTML = micOffIcon;
      this.micStatusText.classList.add("active");
      this.input.placeholder = "Listening...";
      this.input.disabled = true;
    } catch (error) {
      console.error("❌ Microphone error:", error);
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      this.cleanupAudioContext();
      this.micBtn.classList.remove("recording");
      const micIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
      this.micIconWrapper.innerHTML = micIcon;
      this.micStatusText.classList.remove("active");
      this.input.placeholder = "Type your message...";
      this.input.disabled = false;
      if (this.mediaRecorder.stream)
        this.mediaRecorder.stream.getTracks().forEach((t) => t.stop());
    }
  }

  async handleRecordingStop() {
    const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "audio.webm");
    this.isTyping = true;
    this.updateStatus();
    try {
      const fetchOptions = { method: "POST", body: formData };
      if (this.openAIKey)
        fetchOptions.headers = { "x-openai-key": this.openAIKey };
      const response = await fetch(
        `${this.options.voiceServiceUrl}/api/transcribe`,
        fetchOptions,
      );
      if (!response.ok) {
        const e = await response.json();
        throw new Error(e.error || "Transcription failed");
      }
      const data = await response.json();
      if (data.transcription) {
        this.isVoiceMode = true;
        this.addMessage(data.transcription, "user");
        this.handleApiRequest(data.transcription);
      } else {
        this.isTyping = false;
        this.updateStatus();
      }
    } catch (error) {
      console.error("Transcription error:", error);
      this.isTyping = false;
      this.updateStatus();
      this.addMessage(
        "Sorry, I couldn't understand that. " + error.message,
        "bot",
      );
    }
  }

  async playTextToSpeech(text) {
    if (!text) return;
    try {
      const fetchOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      };
      if (this.openAIKey) fetchOptions.headers["x-openai-key"] = this.openAIKey;
      const response = await fetch(
        `${this.options.voiceServiceUrl}/api/text-to-speech`,
        fetchOptions,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.audio) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
          audio.play().catch((e) => console.error("Audio play error", e));
        }
      }
    } catch (e) {
      console.error("TTS Error", e);
    }
  }

  refreshMessagesUI() {
    if (!this.messagesArea) return;
    const savedScrollTop = this.messagesArea.scrollTop;
    this._suppressScroll = true;
    this.messagesArea.innerHTML = "";
    this.messages.forEach((msg) => this.renderSingleMessage(msg));
    this._suppressScroll = false;
    this.messagesArea.scrollTop = savedScrollTop;
  }

  addMessage(
    text,
    sender,
    buttons = null,
    showFeedback = false,
    msgId = null,
    skipHistory = false,
  ) {
    if (!this.messagesArea) return;
    this.hideTypingIndicator();

    // ✅ Smart Deduplication: Prevent duplicates by ID OR by Text+Sender content (ignoring whitespace)
    if (msgId && this.messages.some((m) => m.id === msgId)) return;
    if (
      this.messages.some(
        (m) => m.text?.trim() === text?.trim() && m.sender === sender,
      )
    ) {
      console.log("♻️ Duplicate content ignored:", text);
      return;
    }

    const id = msgId || "msg_" + Math.random().toString(36).substr(2, 9);
    const messageObj = {
      id,
      text,
      sender,
      buttons,
      showFeedback,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    this.messages.push(messageObj);
    this.renderSingleMessage(messageObj);
    this.saveMessageToHistory(messageObj, skipHistory);
  }

  renderSingleMessage(msg) {
    let formatted = msg.text
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(
        /^\s*[\*\-•]\s+(.*)/gm,
        '<div style="display:flex;margin-bottom:4px;padding-left:4px;"><span style="margin-right:8px;">•</span><span>$1</span></div>',
      )
      .replace(
        /^\s*(\d+\.)\s+(.*)/gm,
        '<div style="display:flex;margin-bottom:4px;padding-left:4px;"><span style="margin-right:8px;font-weight:bold;">$1</span><span>$2</span></div>',
      )
      .replace(/\n/g, "<br>")
      .replace(
        /(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" style="color:#4f46e5;text-decoration:underline;">Link</a>',
      );

    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${msg.sender}-message`;
    msgDiv.setAttribute("data-msg-id", msg.id);
    msgDiv.innerHTML = `<div>${formatted}</div>`;

    if (msg.sender === "bot" && msg.id === this.uploadEnabledMessageId) {
      const uploadBox = document.createElement("div");
      uploadBox.className = "inline-upload-box";
      if (this.uploading && this.uploadingMessageId === msg.id) {
        uploadBox.innerHTML =
          '<div class="processing-box"><div class="spinner"></div>Processing file...</div>';
      } else {
        uploadBox.innerHTML = `
          <label class="upload-btn-label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            Choose File
            <input type="file" style="display:none" id="inline-file-input" accept=".pdf,.doc,.docx,.txt,.jpg,.png">
          </label>
          <div style="font-size:10px;color:#64748b;margin-top:4px;">Supported: PDF, DOC, JPG, PNG</div>
        `;
        uploadBox.querySelector("#inline-file-input").onchange = (e) => {
          if (e.target.files[0])
            this.handleFileUpload(e.target.files[0], msg.id);
        };
      }
      msgDiv.appendChild(uploadBox);
    }

    if (msg.buttons && msg.buttons.length > 0) {
      const btnContainer = document.createElement("div");
      btnContainer.className = "msg-options";
      msg.buttons.forEach((btn) => {
        const b = document.createElement("button");
        b.className = "option-btn";
        b.innerText = btn.reply?.title || btn.title;
        b.onclick = () => {
          this.addMessage(b.innerText, "user");
          this.handleApiRequest(btn.customMessage || btn.reply?.title);
          btnContainer.remove();
        };
        btnContainer.appendChild(b);
      });
      msgDiv.appendChild(btnContainer);
    }

    if (msg.showFeedback && msg.sender === "bot") {
      const fbContainer = document.createElement("div");
      fbContainer.className = "feedback-container";
      fbContainer.innerHTML =
        '<div style="font-size:10px;color:#888;margin-bottom:4px;">Was this helpful?</div>';

      const sendFeedback = async (satisfied) => {
        try {
          const reversedMsgs = [...this.messages].reverse();
          const lastBotMessage = reversedMsgs.find((m) => m.sender === "bot");
          const lastUserMessage = reversedMsgs.find((m) => m.sender === "user");
          const userQuestion = lastUserMessage
            ? lastUserMessage.text
            : "Unknown question";
          const botResponse = lastBotMessage ? lastBotMessage.text : "";

          await fetch(
            "https://app.rhinoagents.com/langchain-service/api/feedback-sentiment",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                agentId: this.options.agentId,
                workflowId: this.options.workflowId,
                customerId: this.options.customerId,
                userId: this.userId,
                userQuestion: userQuestion,
                botResponse: botResponse,
                feedbackType: satisfied ? "positive" : "negative",
                messageId: msg.id,
              }),
            },
          );
        } catch (e) {
          console.warn("Feedback save failed:", e);
        }
      };

      const yesBtn = document.createElement("button");
      yesBtn.className = "feedback-btn feedback-yes";
      yesBtn.innerText = "Yes";
      yesBtn.onclick = () => {
        sendFeedback(true);
        fbContainer.remove();
        this.addMessage("Thank you for your feedback! 😊", "bot");
      };

      const noBtn = document.createElement("button");
      noBtn.className = "feedback-btn feedback-no";
      noBtn.innerText = "No";
      noBtn.onclick = () => {
        sendFeedback(false);
        fbContainer.remove();
        this.askToConnectAgent();
      };

      fbContainer.appendChild(yesBtn);
      fbContainer.appendChild(noBtn);
      msgDiv.appendChild(fbContainer);
    }

    const timeDiv = document.createElement("div");
    timeDiv.className = "message-time";
    timeDiv.innerText = msg.timestamp;
    msgDiv.appendChild(timeDiv);

    this.messagesArea.appendChild(msgDiv);
    if (!this._suppressScroll)
      msgDiv.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  addBanner(text) {
    if (!this.messagesArea) return;
    const banner = document.createElement("div");
    banner.className = "agent-banner";
    banner.innerHTML = `<span class="agent-badge">${text}</span>`;
    this.messagesArea.appendChild(banner);
  }

  _renderBannerOnly(text, color = null) {
    if (!this.messagesArea) return;
    const banner = document.createElement("div");
    banner.className = "agent-banner";
    const style = color
      ? `background:linear-gradient(to right, ${color}, ${color}cc);`
      : "";
    banner.innerHTML = `<span class="agent-badge" style="${style}">${text}</span>`;
    this.messagesArea.appendChild(banner);
    this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
  }

  async _saveBannerMarker(markerText) {
    try {
      await fetch(
        "https://app.rhinoagents.com/langchain-service/api/message-history/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: this.userId,
            workflowId: this.options.workflowId,
            message: {
              text: markerText,
              sender: "bot",
              messageId: "marker_" + Date.now(),
              timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          }),
        },
      );
    } catch (e) {
      console.warn("Failed to save banner marker:", e);
    }
  }

  askToConnectAgent() {
    const msgDiv = document.createElement("div");
    msgDiv.className = "message bot-message";
    msgDiv.innerHTML = `<div>I'm sorry I couldn't help. Would you like to connect with an expert?</div><div class="msg-options"><button class="option-btn" id="agent-yes">Yes</button><button class="option-btn" id="agent-no">No</button></div>`;
    this.messagesArea.appendChild(msgDiv);
    msgDiv.querySelector("#agent-yes").onclick = async () => {
      msgDiv.remove();
      this.showTypingIndicator();
      try {
        const params = new URLSearchParams({
          userId: this.combinedUserId,
          workflowId: this.options.workflowId,
          model: "gpt-4o",
        });
        const res = await fetch(
          `https://app.rhinoagents.com/langchain-service/api/human-escalation/analyze-conversation?${params.toString()}`,
        );
        const analysis = await res.json();
        this.hideTypingIndicator();
        const summary =
          analysis.summary || "User requested to connect with an expert.";
        if (analysis.nameFound && analysis.userName) {
          this.userName = analysis.userName;
          this.initiateEscalation(analysis.userName, summary);
        } else {
          this._pendingEscalationSummary = summary;
          this.collectingUserName = true;
          this.addMessage(
            "Before connecting you with our expert, may I have your name?",
            "bot",
            null,
            false,
            null,
            true,
          );
        }
      } catch (e) {
        this.hideTypingIndicator();
        this._pendingEscalationSummary = null;
        this.collectingUserName = true;
        this.addMessage(
          "Before connecting you with our expert, may I have your name?",
          "bot",
          null,
          false,
          null,
          true,
        );
      }
    };
    msgDiv.querySelector("#agent-no").onclick = () => {
      msgDiv.remove();
      this.addMessage(
        "No problem! Feel free to ask me anything else.",
        "bot",
        null,
        false,
        null,
        true,
      );
    };
  }

  showTypingIndicator(name = "Agent") {
    if (
      !this.messagesArea ||
      document.getElementById("typing-indicator-bubble")
    )
      return;
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator-bubble";
    typingDiv.className = "typing-container";
    typingDiv.innerHTML = `<div class="typing-bubble"><div class="typing-dots-wrapper"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div><span class="typing-text">${name} is typing...</span></div>`;
    this.messagesArea.appendChild(typingDiv);
    if (!this._suppressScroll)
      typingDiv.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  hideTypingIndicator() {
    const el = document.getElementById("typing-indicator-bubble");
    if (el) el.remove();
  }

  async sendMessage() {
    const text = this.input.value.trim();
    if (!text) return;
    this.input.value = "";
    this.addMessage(text, "user");
    if (this.collectingUserName) {
      this.userName = text;
      this.collectingUserName = false;
      const summary =
        this._pendingEscalationSummary ||
        "User requested to connect with an expert.";
      this._pendingEscalationSummary = null;
      this.initiateEscalation(text, summary);
      return;
    }
    this.handleApiRequest(text);
  }

  async initiateEscalation(
    userName,
    summary = "User requested to connect with an expert.",
  ) {
    this.isTyping = true;
    this.updateStatus();
    try {
      await fetch(
        "https://app.rhinoagents.com/langchain-service/api/human-escalation/escalate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: this.combinedUserId,
            workflowId: this.options.workflowId,
            customerId: this.options.customerId,
            messageToAgent: summary,
            senderType: "user",
            userName,
          }),
        },
      );
      this.escalationMode = true;
    } catch (e) {
      this.addMessage(
        "Sorry, we couldn't connect you to an expert right now. Please try again shortly.",
        "bot",
      );
      this.isTyping = false;
    }
  }

  async handleApiRequest(text, fileDataFromRag = null) {
    this.isTyping = true;
    this.updateStatus();
    if (this.escalationMode && !this._escalationJustResolved) {
      try {
        await fetch(
          "https://app.rhinoagents.com/langchain-service/api/human-escalation/escalate",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: this.combinedUserId,
              workflowId: this.options.workflowId,
              customerId: this.options.customerId,
              messageToAgent: text,
              senderType: "user",
            }),
          },
        );
      } catch (e) {
        this.addMessage("Error sending message to agent.", "bot");
        this.isTyping = false;
      }
      return;
    }
    try {
      const payload = {
        customerId: this.options.customerId,
        workflowId: this.options.workflowId,
        userId: this.combinedUserId,
        inputs: {
          message: text,
          messages: text,
          userId: this.combinedUserId,
          agentId: this.options.agentId,
          chatLanguage: this.selectedLanguage,
          timestamp: new Date().toISOString(),
          event: "chat_response",
          room: this.combinedUserId,
          uploadFileData: fileDataFromRag,
          fileUploaded: !!fileDataFromRag,
          ...this.options.customNodes,
        },
      };
      const res = await fetch(
        "https://app.rhinoagents.com/api/chatbots/process-message",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json();

      if (!res.ok) {
        if (
          data.error === "SUBSCRIPTION_EXPIRED" ||
          data.error === "EXECUTION_LIMIT_EXCEEDED"
        ) {
          this.addMessage(
            data.message || "This chatbot is currently unavailable.",
            "bot",
            null,
            true,
          );
          if (this.input) {
            this.input.disabled = true;
            this.input.placeholder = "Chat disabled";
          }
        } else {
          this.addMessage(
            data.message ||
              "Sorry, something went wrong processing your request.",
            "bot",
            null,
            true,
          );
        }
        this.isTyping = false;
        this.updateStatus();
        return;
      }

      const responseText =
        data.response?.response ||
        data.response?.message ||
        data.directResponse ||
        data.botResponse;
      if (responseText) {
        this.handleChatResponse({
          ...data,
          response: responseText,
          messageId: data.response?.messageId || data.messageId,
        });
      }
    } catch (e) {
      console.error(e);
      // Ignore fetch abortion or TypeError (Failed to fetch) which happens on navigation/refresh
      if (e.name !== "AbortError" && !e.message.includes("Failed to fetch")) {
        this.addMessage(
          "Sorry, something went wrong processing your request.",
          "bot",
          null,
          true,
        );
      }
      this.isTyping = false;
      this.updateStatus();
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  new ChatbotWidget();
});
