// Contains the default configuration for Bot & Plugins
// Any attribute not given in the configuration will take its default value

require('dotenv').config();

const botConfig = {
  authFolder: process.env.AUTH_FOLDER || "auth",
  selfReply: process.env.SELF_REPLY === "true",
  logMessages: process.env.LOG_MESSAGES !== "false",
  ipqsApiKey: process.env.IPQS_API_KEY,
  optiicApiKey: process.env.OPTIIC_API_KEY,
  genAIKey: process.env.GENAI_KEY,
  azureConnectionString: process.env.AZURE_CONNECTION_STRING
};
  
  const pluginsConfig = {
    tagEveryone: {
      membersLimit: 1000,
      trigger: "TagAll",
    },
    warner:{
      membersLimit: 1000,
      trigger: "chat.whatsapp"
    },
      jobs: {
          membersLimit: 1000, // Limit for the number of members
          trigger: "jobs", // Trigger command for manual execution
          groupJid: "120363366629931445@g.us", // Target group JID
          jsonFilePath: "./dwata.json", // Path to the JSON file
      },
      chanel: {
          membersLimit: 1000,
          trigger: "job",
          channelJid: "120363328396555346@newsletter",
          //scheduleTime: "10 16 * * *",

      },
    help: {
        membersLimit: 1000,
        trigger: "help",
      },
      Add: {
          membersLimit: 1000,
          trigger: "MassAdd",
      },
      heck: {
          membersLimit: 1000,
          trigger: "heck",
      },
      onlyme:{
          membersLimit: 1000,
          trigger: "chat.whatsapp"
      },
  };
  
  module.exports = { botConfig, pluginsConfig };