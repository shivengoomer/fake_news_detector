/* const makeWASocket = require("@whiskeysockets/baileys").default;
const { DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const P = require("pino");
const { GoogleGenerativeAI } = require("@google/generative-ai");

class Bot {
  #socket;
  #messageStore = {};
  #emptyChar = "‎ ";
  #authFolder;
  #selfReply;
  #saveCredentials;
  #logMessages;
  #plugins;
  #genAI;

  constructor(plugins = [], config = {}) {
    this.#plugins = plugins;
    this.#authFolder = config.authFolder || "auth";
    this.#selfReply = config.selfReply || false;
    this.#logMessages = config.logMessages || true;

    // Initialize Google Generative AI
    if (config.genAIKey) {
      this.#genAI = new GoogleGenerativeAI(config.genAIKey);
    } else {
      console.warn("Google Generative AI API key not provided.");
    }
  }

  async connect() {
    const { state, saveCreds } = await useMultiFileAuthState(this.#authFolder);

    this.#saveCredentials = saveCreds;

    this.#socket = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      getMessage: this.#getMessageFromStore,
      logger: P({ level: "error" }),
      downloadHistory: false,
    });

    this.#plugins.forEach((plugin) =>
        plugin.init(this.#socket, this.#getText, this.#sendMessage)
    );
  }

  async run() {
    this.#socket.ev.process(async (events) => {
      if (events["connection.update"]) {
        const update = events["connection.update"];
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
          // reconnect if not logged out
          if (
              lastDisconnect?.error?.output?.statusCode ===
              DisconnectReason.loggedOut
          ) {
            console.log("Connection closed. You are logged out.");
          } else if (
              lastDisconnect?.error?.output?.statusCode ===
              DisconnectReason.timedOut
          ) {
            console.log(
                new Date().toLocaleTimeString(),
                "Timed out. Will retry in 1 minute."
            );
            setTimeout(this.#restart.bind(this), 60 * 1000);
          } else {
            this.#restart();
          }
        }
      }

      if (events["creds.update"]) {
        await this.#saveCredentials();
      }

      if (events["messages.upsert"]) {
        const { messages } = events["messages.upsert"];

        if (this.#logMessages) console.log("msg upsert", messages);

        messages.forEach(async (msg) => {
          const { key, message } = msg;

          if (!message || this.#getText(key, message).includes(this.#emptyChar))
            return;

          // Handle incoming messages
          await this.#handleMessage(key, message);
        });
      }
    });
  }

  async #restart() {
    await this.connect();
    await this.run();
  }

  #getMessageFromStore = (key) => {
    const { id } = key;
    if (this.#messageStore[id]) return this.#messageStore[id].message;
  };

  #getText(key, message) {
    try {
      let text = message.conversation || message.extendedTextMessage.text;

      if (key.participant) {
        const me = key.participant.slice(0, 12);
        text = text.replace(/\@me\b/g, `@${me}`);
      }

      return text;
    } catch (err) {
      return "";
    }
  }

  #sendMessage = async (jid, content, ...args) => {
    try {
      if (!this.#selfReply) content.text = content.text + this.#emptyChar;

      const sent = await this.#socket.sendMessage(jid, content, ...args);
      this.#messageStore[sent.key.id] = sent;
    } catch (err) {
      console.log("Error sending message", err);
    }
  };

  // Handle Incoming Messages
  async #handleMessage(key, message) {
    const jid = key.remoteJid;
    const text = this.#getText(key, message);

    if (text.startsWith("!ask")) {
      const prompt = text.slice(5).trim();

      if (this.#genAI) {
        try {
          const model = this.#genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

          // *** FAKE NEWS DETECTION PROMPT ENGINEERING ***
          const fakeNewsPrompt = `
       
        ## Fake News Detection Instructions:
              
             

              You will be given a news article or headline. Your task is to determine if it is potentially "fake news" based on the following criteria:

              * **Factual Accuracy:** Check if the claims in the article can be verified through reputable sources.  Since I cannot directly browse the internet, consider these points:
              * **Plausibility:** Are the claims consistent with what is generally known about the topic? Highly improbable or extraordinary claims should be viewed with skepticism.
          * **Verifiability:** Does the article provide sources or evidence that *could* be used to verify the claims (even if I cannot directly access them)? Articles that rely heavily on unnamed sources or lack supporting evidence are more suspect.
          * **Contradictory Information:** Based on my existing knowledge, does the article contradict established facts or widely accepted information?

        * **Source Reliability:** Consider the source of the article. Articles from known unreliable sources should be flagged. (Provide a list of unreliable sources if you have one - e.g., "Examples of unreliable sources:  ConspiracyWebsite1.com, FakeNewsDaily.net")

        * **Propaganda/Bias:** Look for signs of strong bias, such as emotionally charged language, one-sided presentation of information, or clear attempts to manipulate the reader's opinion.  Is the language inflammatory or designed to incite strong emotions?

          * **Satire/Parody:** Determine if the article is intended as satire or parody. If so, it's not fake news in the traditional sense.

          * **Misleading Headlines:** Are the headlines accurate reflections of the article's content, or are they exaggerated or misleading?

          * **Indian Laws (Where Applicable):** If the article relates to India, consider if any of the claims made within it potentially violate Indian laws (e.g., laws related to defamation, hate speech, or national security).  Note that I am an AI and cannot provide legal advice. This is just a flag for potentially illegal content.

          **Article/Headline:** ${prompt}

        *Your Analysis:* (Explain your reasoning based on the criteria above. Be very short and precise.  Specifically mention if any claims are baseless.  If the article relates to India, briefly mention any potentially relevant Indian laws, but again, remember this is not legal advice.  Focus on the *content* of the article and its potential conflict with existing laws, not on providing legal interpretations.)

          *Fake News Verdict:* (Yes/No/Submit news to database for credibility)
            `;

          const result = await model.generateContent(fakeNewsPrompt); // Use the crafted prompt
          const response = result.response.text();

          await this.#sendMessage(jid, { text: response });
        } catch (err) {
          console.error("Error generating content:", err);
          await this.#sendMessage(jid, { text: "Sorry, I couldn't process that." });
        }
      } else {
        await this.#sendMessage(jid, {
          text: "Pathway integration is not configured.",
        });
      }
    }
  }
}

module.exports = Bot;*/

const makeWASocket = require("@whiskeysockets/baileys").default;
const {
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
} = require("@whiskeysockets/baileys");
const P = require("pino");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require("node-fetch");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const Optiic = require("optiic");
const { BlobServiceClient } = require("@azure/storage-blob");
const NodeCache = require("node-cache");
const qrcode = require("qrcode-terminal");

class Bot {
  #socket;
  #messageStore = {};
  #emptyChar = "‎ ";
  #authFolder;
  #selfReply;
  #saveCredentials;
  #logMessages;
  #plugins;
  #genAI;
  #ipqsApiKey;
  #optiicApiKey;
  #optiic;
  #blobServiceClient;
  #azureContainerName;

  constructor(plugins = [], config = {}) {
    this.#plugins = plugins;
    this.#authFolder = config.authFolder || "auth";
    this.#selfReply = config.selfReply || false;
    this.#logMessages = config.logMessages || true;
    this.#ipqsApiKey = config.ipqsApiKey;
    this.#optiicApiKey = config.optiicApiKey;

    if (config.optiicApiKey) {
      this.#optiic = new Optiic({
        apiKey: config.optiicApiKey,
      });
    } else {
      console.warn("Optiic API key not provided. Media processing disabled.");
    }

    this.#azureContainerName = config.azureContainerName || "whatsapp-media";

    if (config.azureConnectionString) {
      this.#blobServiceClient = BlobServiceClient.fromConnectionString(
        config.azureConnectionString
      );
    } else {
      console.warn("Azure Storage connection string not provided");
    }

    if (config.genAIKey) {
      this.#genAI = new GoogleGenerativeAI(config.genAIKey);
    } else {
      console.warn("Google Generative AI API key not provided.");
    }
  }

  async connect() {
    const { state, saveCreds } = await useMultiFileAuthState(this.#authFolder);
    this.#saveCredentials = saveCreds;
    const msgRetryCounterCache = new NodeCache();

    this.#socket = makeWASocket({
      logger: P({ level: "silent" }),
      printQRInTerminal: true,
      browser: Browsers.ubuntu("Firefox"),
      auth: state,
      version: [2, 3000, 1028442591],
      getMessage: this.#getMessageFromStore,
      downloadHistory: false,
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
      emitOwnEvents: true,
      msgRetryCounterCache,
      defaultQueryTimeoutMs: undefined,
      getMessage: async (key) => ({}),
    });

    this.#plugins.forEach((plugin) =>
      plugin.init(this.#socket, this.#getText, this.#sendMessage)
    );
  }

  async run() {
    this.#socket.ev.process(async (events) => {
      if (events["connection.update"]) {
        const update = events["connection.update"];
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          qrcode.generate(qr, { small: true });
          console.log("📱 Scan the QR code above to log in.");
        }

        if (connection === "open") {
          console.log("hnji");
        } else if (connection === "close") {
          if (
            lastDisconnect?.error?.output?.statusCode ===
            DisconnectReason.loggedOut
          ) {
            console.log("Connection closed. You are logged out.");
          } else if (
            lastDisconnect?.error?.output?.statusCode ===
            DisconnectReason.timedOut
          ) {
            console.log(
              new Date().toLocaleTimeString(),
              "Timed out. Will retry in 1 minute."
            );
            setTimeout(this.#restart.bind(this), 60 * 1000);
          } else {
            this.#restart();
          }
        }
      }

      if (events["creds.update"]) {
        await this.#saveCredentials();
      }

      if (events["messages.upsert"]) {
        const { messages } = events["messages.upsert"];

        messages.forEach(async (msg) => {
          console.log("Received message:", msg);
          const { key, message } = msg;

          if (!message) {
            console.log("Empty message received");
            return;
          }

          if (this.#getText(key, message).includes(this.#emptyChar)) {
            console.log("Message contains hidden character");
            return;
          }

          await this.#handleMessage(key, message);
        });
      }
    });
  }

  async #restart() {
    await this.connect();
    await this.run();
  }

  async #uploadMediaToAzure(mediaBuffer, mediaMimeType) {
    if (!this.#blobServiceClient) {
      throw new Error("Azure Storage not configured");
    }

    try {
      const containerClient = this.#blobServiceClient.getContainerClient(
        this.#azureContainerName
      );
      await containerClient.createIfNotExists({ access: "blob" });

      const blobName = `media-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 15)}`;
      const blobClient = containerClient.getBlockBlobClient(blobName);

      await blobClient.uploadData(mediaBuffer, {
        blobHTTPHeaders: {
          blobContentType: mediaMimeType,
          blobContentDisposition: "attachment",
        },
      });

      console.log(blobClient.url);

      return blobClient.url;
    } catch (error) {
      console.error("Azure upload failed:", error);
      throw error;
    }
  }

  async #processMediaWithOptiic(mediaUrl) {
    try {
      console.log("Processing media URL with Optiic:", mediaUrl);
      const result = await this.#optiic.process({
        url: mediaUrl,
        options: {
          mode: "ocr",
        },
      });
      return result.text;
    } catch (error) {
      console.error("Optiic processing failed:", error);
      return "";
    }
  }

  #getMessageFromStore = (key) => {
    const { id } = key;
    if (this.#messageStore[id]) return this.#messageStore[id].message;
  };

  #getText(key, message) {
    try {
      let text = message.conversation || message.extendedTextMessage.text;

      if (key.participant) {
        const me = key.participant.slice(0, 12);
        text = text.replace(/\@me\b/g, `@${me}`);
      }

      return text;
    } catch (err) {
      return "";
    }
  }

  #sendMessage = async (jid, content, ...args) => {
    try {
      if (!this.#selfReply) content.text = content.text + this.#emptyChar;
      const sent = await this.#socket.sendMessage(jid, content, ...args);
      this.#messageStore[sent.key.id] = sent;
    } catch (err) {
      console.log("Error sending message", err);
    }
  };

  #extractUrls(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    return text.match(urlRegex) || [];
  }

  async #checkLinkSafety(url) {
    if (!this.#ipqsApiKey) {
      throw new Error("IPQualityScore API key not configured");
    }

    const apiUrl = `https://www.ipqualityscore.com/api/json/url/${
      this.#ipqsApiKey
    }/${encodeURIComponent(url)}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.message || "IPQS API error");
      }

      const isUnsafe =
        data.malicious ||
        data.phishing ||
        data.suspicious ||
        data.risk_score >= 85;

      return {
        safe: !isUnsafe,
        details: data,
      };
    } catch (error) {
      console.error("IPQS API Error:", error);
      throw error;
    }
  }

  #formatFlags(details) {
    const flags = [];
    if (details.malicious) flags.push("Malware");
    if (details.phishing) flags.push("Phishing");
    if (details.suspicious) flags.push("Suspicious");
    if (details.adult) flags.push("Adult Content");
    if (details.risk_score > 85) flags.push("High Risk Score");
    return flags.join(", ") || "No specific flags";
  }

  async #handleMediaAttachment(msg) {
    if (
      !msg.message?.imageMessage &&
      !msg.message?.videoMessage &&
      !msg.message?.documentMessage
    ) {
      return null;
    }

    try {
      const mediaBuffer = await downloadMediaMessage(msg, "buffer", {});
      const mediaMimeType =
        msg.message.imageMessage?.mimetype ||
        msg.message.videoMessage?.mimetype ||
        msg.message.documentMessage?.mimetype;
      const mediaName = `media_${Date.now()}.${mediaMimeType.split("/")[1]}`;

      return await this.#uploadMediaToAzure(
        mediaBuffer,
        mediaMimeType,
        mediaName
      );
    } catch (error) {
      console.error("Error handling media attachment:", error);
      throw new Error("Failed to process media attachment: " + error.message);
    }
  }

  async #handleMessage(key, message) {
    const jid = key.remoteJid;
    let text = this.#getText(key, message);

    // Process media messages

    if (
      message?.message &&
      (message.message.imageMessage ||
        message.message.videoMessage ||
        message.message.documentMessage)
    ) {
      // Upload to Azure
      const mediaUrl = await this.#handleMediaAttachment(message);
      console.log("Media uploaded to Azure:", mediaUrl);

      // Process with Optiic
      const extractedText = await this.#processMediaWithOptiic(mediaUrl);
      text += " " + extractedText;
    }

    // URL Safety Check
    const urls = this.#extractUrls(text);
    if (urls.length > 0) {
      for (const url of urls) {
        try {
          const safetyResult = await this.#checkLinkSafety(url);

          let responseText;
          if (!safetyResult.safe) {
            responseText =
              `⚠️ *Dangerous Link Detected!* ⚠️\n` +
              `URL: ${url}\n` +
              `Risk Score: ${safetyResult.details.risk_score}/100\n` +
              `Flags: ${this.#formatFlags(safetyResult.details)}`;
          } else {
            responseText =
              `🔒 Safe Link\n` +
              `URL: ${url}\n` +
              `Risk Score: ${safetyResult.details.risk_score}/100`;
          }

          await this.#sendMessage(jid, { text: responseText });
        } catch (error) {
          await this.#sendMessage(jid, {
            text: `❌ Error checking URL: ${url}\n${error.message}`,
          });
        }
      }
    }

    // Existing !ask command
    if (text.startsWith("!assssk")) {
      const prompt = text.slice(5).trim();

      if (this.#genAI) {
        try {
          const model = this.#genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
          });
          const fakeNewsPrompt = `
       
        ## Fake News Detection Instructions:
              
             

              You will be given a news article or headline. Your task is to determine if it is potentially "fake news" based on the following criteria:

              * **Factual Accuracy:** Check if the claims in the article can be verified through reputable sources.  Since I cannot directly browse the internet, consider these points:
              * **Plausibility:** Are the claims consistent with what is generally known about the topic? Highly improbable or extraordinary claims should be viewed with skepticism.
          * **Verifiability:** Does the article provide sources or evidence that *could* be used to verify the claims (even if I cannot directly access them)? Articles that rely heavily on unnamed sources or lack supporting evidence are more suspect.
          * **Contradictory Information:** Based on my existing knowledge, does the article contradict established facts or widely accepted information?

        * **Source Reliability:** Consider the source of the article. Articles from known unreliable sources should be flagged. (Provide a list of unreliable sources if you have one - e.g., "Examples of unreliable sources:  ConspiracyWebsite1.com, FakeNewsDaily.net")

        * **Propaganda/Bias:** Look for signs of strong bias, such as emotionally charged language, one-sided presentation of information, or clear attempts to manipulate the reader's opinion.  Is the language inflammatory or designed to incite strong emotions?

          * **Satire/Parody:** Determine if the article is intended as satire or parody. If so, it's not fake news in the traditional sense.

          * **Misleading Headlines:** Are the headlines accurate reflections of the article's content, or are they exaggerated or misleading?

          * **Indian Laws (Where Applicable):** If the article relates to India, consider if any of the claims made within it potentially violate Indian laws (e.g., laws related to defamation, hate speech, or national security).  Note that I am an AI and cannot provide legal advice. This is just a flag for potentially illegal content.

          **Article/Headline:** ${prompt}

        *Your Analysis:* (Explain your reasoning based on the criteria above. Be very short and precise.  Specifically mention if any claims are baseless.  If the article relates to India, briefly mention any potentially relevant Indian laws, but again, remember this is not legal advice.  Focus on the *content* of the article and its potential conflict with existing laws, not on providing legal interpretations.)

          *Fake News Verdict:* (Yes/No/Submit news to database for credibility)
            `; // Keep your existing prompt here

          const result = await model.generateContent(fakeNewsPrompt);
          const response = result.response.text();

          await this.#sendMessage(jid, { text: response });
        } catch (err) {
          console.error("Error generating content:", err);
          await this.#sendMessage(jid, {
            text: "Sorry, I couldn't process that.",
          });
        }
      } else {
        await this.#sendMessage(jid, {
          text: "AI integration not configured.",
        });
      }
    }
  }
}

module.exports = Bot;
