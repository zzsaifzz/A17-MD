const fs = require("fs");
const chalk = require("chalk");
require("dotenv").config();

global.available = process.env.AVAILABLE || true;
global.autoReadAll = process.env.AUTO_READ_ALL || false;
global.antitags = process.env.ANTITAGS || true;

global.autoTyping = process.env.AUTO_TYPING || false;
global.autoRecord = process.env.AUTO_RECORD || false;
global.groupevent = process.env.GROUPEVENT || false;
global.statusseen = process.env.STATUSSEEN || true;
global.autoreadgc = process.env.AUTOREADGC || true;


global.pairNumber = "";                         // Add your pairing number with country code example "916297175943"; 
global.port = process.env.PORT || "10000";
global.auth = process.env.AUTH || "qr";                // Changed from "QR" to "pairing" (lowercase)
global.sessionFile = process.env.SESSION_FILE || "A17-SESSION";
global.mongodb = process.env.MONGODB || "";                 // Mongodb url
global.website = ""; 
global.github = "https://github.com/saif";

// Default prefix
global.prefa = process.env.PREFIX ? process.env.PREFIX.split(",") : ["."];

// Owner information
global.Owner = process.env.OWNER ? process.env.OWNER.split(",") : ["916297175943"];
global.OwnerNumber = process.env.OWNER_NUMBER ? process.env.OWNER_NUMBER.split(",") : ["916297175943"];
global.ownertag = process.env.OWNER_TAG ? process.env.OWNER_TAG.split(",") : ["916297175943"];
global.OwnerName = process.env.OWNER_NAME || "saif";
global.BotName = process.env.BOT_NAME || "dazai-bot";
global.packname = process.env.PACK_NAME || "dazai-bot";
global.author = "saif";
global.BotSourceCode = "https://github.com/Aeon-San/A17-MD";
global.SupportGroupLink = "https://chat.whatsapp.com/GhRGdwfaMVDCoeAdzILfl";

// OpenAI and other APIs
global.openAiAPI = process.env.OPENAI_API || "";
global.location = process.env.LOCATION || "West Bengal, India";
global.reactmoji = process.env.REACT_MOJI || "❤️";
global.themeemoji = process.env.THEME_EMOJI || "💖";
global.vidmenu = { url: process.env.VID_MENU_URL || 'https://media.tenor.com/Jdu0Ov8X2sIAAAAC/A17-Bot.mp4' };

// Bot assets
global.BotLogo = fs.readFileSync("./Assets/pic1.jpg");
global.Thumb = fs.readFileSync("./Assets/pic9.jpg");
global.Thumb1 = fs.readFileSync("./Assets/pic5.jpg");
global.ErrorPic = fs.readFileSync("./Assets/pic7.jpg");
global.them = "https://r4.wallpaperflare.com/wallpaper/1003/376/845/makoto-shinkai-kimi-no-na-wa-wallpaper-0816ade8b0301c58302c014e48d2441a.jpg";

// Group settings arrays
global.ntilinkytvid = []
global.ntilinkytch = []
global.ntilinkig = []
global.ntilinkfb = []
global.ntilinktg = []
global.ntilinktt = []
global.ntilinktwt = []
global.ntilinkall = []
global.nticall = []
global.ntwame = []
global.nttoxic = []
global.ntnsfw = []
global.ntvirtex = []
global.rkyt = []
global.wlcm = []
global.gcrevoke = []
global.autorep = []
global.ntilink = []

global.mess = {
  jobdone: 'Here you go...',
  useradmin: 'Sorry, only *Group Admins* can use this command *Baka*!',
  botadmin: 'Sorry, i cant execute this command without being an *Admin* of this group.',
  botowner: 'Only my *Owner* can use this command, Baka!',
  grouponly: 'This command is only made for *Groups*, Baka!',
  privateonly: 'This command is only made for *Private Chat*, Baka!',
  botonly: 'Only the *Bot itself* can use this command!',
  waiting: 'Just Wait...',
  nolink: 'Please provide me *link*, Baka!',
  error: 'An error occurd!',
  banned: 'You are *Banned* fron using commands!',
  bangc: 'This Group is *Banned* from using Commands!',
  nonsfw: 'Dont be a pervert Baka! This is not a NSFW enabled group!'
}

const config = {
  auth: global.auth,
  sessionFile: global.sessionFile,
  botName: global.BotName,
}

module.exports = config;