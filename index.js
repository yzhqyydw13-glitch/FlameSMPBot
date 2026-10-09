require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    Client,
    EmbedBuilder,
    GatewayIntentBits,
    ModalBuilder,
    Partials,
    PermissionFlagsBits,
    StringSelectMenuBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const DATA_FILE = path.join(__dirname, 'bot-data.json');
const INSTANCE_LOCK_FILE = path.join(__dirname, '.bot-instance.lock');
const SIX_MONTHS = 6;
const DEFAULT_COLOR = '#5865F2';
const DEFAULT_STAFF_APPLICATION_DESCRIPTION = 'הגישו טופס ואולי תתקבלו!\n\n**תנאי קבלה:**\n1. בגרות ואחריות מלאה\n2. גיל 12+\n3. רצון אמיתי לקדם את השרת\n\nאז למה אתם מחכים? לחצו על הכפתור למטה כדי להתחיל בחינה!';
const NOTIFICATION_ROLE_OPTIONS = {
    events: { label: 'עדכוני אירועים', button: 'Event Updates', emoji: '📅' },
    giveaways: { label: 'הגרלות ודרופים', button: 'Giveaways And Drops Updates', emoji: '🎉' },
    announcements: { label: 'הודעות ועדכונים', button: 'Announcements Updates', emoji: '📢' }
};
const LOG_EVENT_OPTIONS = {
    'member-join': { label: 'הצטרפות חבר', emoji: '📥', color: '#2ECC71' },
    'member-leave': { label: 'עזיבת חבר', emoji: '📤', color: '#E74C3C' },
    'member-update': { label: 'עדכון חבר / רולים', emoji: '👤', color: '#3498DB' },
    'message-delete': { label: 'מחיקת הודעה', emoji: '🗑️', color: '#E74C3C' },
    'message-edit': { label: 'עריכת הודעה', emoji: '✏️', color: '#F1C40F' },
    'message-bulk-delete': { label: 'מחיקת הודעות מרובה', emoji: '🧹', color: '#E67E22' },
    'reaction-add': { label: 'הוספת תגובה', emoji: '➕', color: '#2ECC71', defaultEnabled: false },
    'reaction-remove': { label: 'הסרת תגובה', emoji: '➖', color: '#E67E22', defaultEnabled: false },
    'reaction-remove-all': { label: 'הסרת כל התגובות', emoji: '🧹', color: '#E74C3C', defaultEnabled: false },
    'pins-update': { label: 'עדכון הודעות נעוצות', emoji: '📌', color: '#3498DB' },
    'channel-create': { label: 'יצירת ערוץ', emoji: '📁', color: '#2ECC71' },
    'channel-delete': { label: 'מחיקת ערוץ', emoji: '🗑️', color: '#E74C3C' },
    'channel-update': { label: 'עדכון ערוץ', emoji: '📝', color: '#3498DB' },
    'role-create': { label: 'יצירת רול', emoji: '🆕', color: '#2ECC71' },
    'role-delete': { label: 'מחיקת רול', emoji: '🗑️', color: '#E74C3C' },
    'role-update': { label: 'עדכון רול', emoji: '🎭', color: '#3498DB' },
    'ban-add': { label: 'חסימת חבר', emoji: '🔨', color: '#E74C3C' },
    'ban-remove': { label: 'ביטול חסימה', emoji: '🔓', color: '#2ECC71' },
    voice: { label: 'פעילות בערוץ קולי', emoji: '🔊', color: '#9B59B6' },
    'emoji-create': { label: 'יצירת אימוג׳י', emoji: '😄', color: '#2ECC71' },
    'emoji-delete': { label: 'מחיקת אימוג׳י', emoji: '🗑️', color: '#E74C3C' },
    'emoji-update': { label: 'עדכון אימוג׳י', emoji: '😄', color: '#3498DB' },
    'thread-create': { label: 'יצירת שרשור', emoji: '🧵', color: '#2ECC71' },
    'thread-delete': { label: 'מחיקת שרשור', emoji: '🗑️', color: '#E74C3C' },
    'thread-update': { label: 'עדכון שרשור', emoji: '🧵', color: '#3498DB' },
    'invite-create': { label: 'יצירת הזמנה', emoji: '🔗', color: '#2ECC71' },
    'invite-delete': { label: 'מחיקת הזמנה', emoji: '🔗', color: '#E74C3C' },
    'scheduled-event-create': { label: 'יצירת אירוע', emoji: '📅', color: '#2ECC71' },
    'scheduled-event-delete': { label: 'מחיקת אירוע', emoji: '📅', color: '#E74C3C' },
    'scheduled-event-update': { label: 'עדכון אירוע', emoji: '📅', color: '#3498DB' },
    'stage-create': { label: 'פתיחת במה', emoji: '🎙️', color: '#2ECC71' },
    'stage-update': { label: 'עדכון במה', emoji: '🎙️', color: '#3498DB' },
    'stage-delete': { label: 'סגירת במה', emoji: '🎙️', color: '#E74C3C' },
    'sticker-create': { label: 'יצירת מדבקה', emoji: '🖼️', color: '#2ECC71' },
    'sticker-delete': { label: 'מחיקת מדבקה', emoji: '🖼️', color: '#E74C3C' },
    'sticker-update': { label: 'עדכון מדבקה', emoji: '🖼️', color: '#3498DB' },
    'automod-action': { label: 'פעולת AutoMod', emoji: '🛡️', color: '#E67E22' },
    'automod-rule-create': { label: 'יצירת כלל AutoMod', emoji: '🛡️', color: '#2ECC71' },
    'automod-rule-update': { label: 'עדכון כלל AutoMod', emoji: '🛡️', color: '#3498DB' },
    'automod-rule-delete': { label: 'מחיקת כלל AutoMod', emoji: '🛡️', color: '#E74C3C' },
    'integration-update': { label: 'עדכון אינטגרציות', emoji: '🔌', color: '#3498DB' },
    'webhook-update': { label: 'עדכון Webhook', emoji: '🪝', color: '#3498DB' },
    'server-update': { label: 'עדכון פרטי שרת', emoji: '⚙️', color: '#5865F2' }
};
const DEFAULT_TICKET_OPTIONS = [
    { id: 'player-report', label: 'דיווח על שחקן', description: 'דיווח על שחקן או הפרת כללים', emoji: '🚨' },
    { id: 'management', label: 'פנייה להנהלה', description: 'שאלה או בקשה עבור הנהלת השרת', emoji: '👑' },
    { id: 'other', label: 'נושא אחר', description: 'פנייה בנושא שאינו מופיע ברשימה', emoji: '📝' },
    { id: 'partner', label: 'פארטנר', description: 'הצעה לשיתוף פעולה או פארטנר', emoji: '🤝' },
    { id: 'general-help', label: 'עזרה כללית', description: 'שאלה או בקשה לעזרה בשרת', emoji: '🆘' }
];

function isProcessRunning(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch (error) {
        if (error.code === 'ESRCH') return false;
        if (error.code === 'EPERM') return true;
        throw error;
    }
}

function acquireInstanceLock() {
    for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
            const descriptor = fs.openSync(INSTANCE_LOCK_FILE, 'wx');
            fs.writeFileSync(descriptor, `${process.pid}\n`, 'utf8');
            return descriptor;
        } catch (error) {
            if (error.code !== 'EEXIST') throw error;

            let ownerPid = null;
            try {
                const value = fs.readFileSync(INSTANCE_LOCK_FILE, 'utf8').trim();
                if (/^\d+$/.test(value)) ownerPid = Number(value);
            } catch (readError) {
                if (readError.code !== 'ENOENT') throw readError;
                continue;
            }

            if (ownerPid && isProcessRunning(ownerPid)) {
                throw new Error(`הבוט כבר פועל בתהליך ${ownerPid}. עצור את ההרצה הקודמת עם Ctrl+C לפני הפעלה נוספת.`);
            }

            try {
                fs.unlinkSync(INSTANCE_LOCK_FILE);
            } catch (unlinkError) {
                if (unlinkError.code !== 'ENOENT') throw unlinkError;
            }
        }
    }
    throw new Error('לא ניתן ליצור נעילת הפעלה יחידה לבוט. בדוק אם קובץ .bot-instance.lock תפוס.');
}

let instanceLockDescriptor;
try {
    instanceLockDescriptor = acquireInstanceLock();
} catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
}

process.once('exit', () => {
    try {
        const ownerPid = Number(fs.readFileSync(INSTANCE_LOCK_FILE, 'utf8').trim());
        if (ownerPid === process.pid) fs.unlinkSync(INSTANCE_LOCK_FILE);
    } catch (error) {
        if (error.code !== 'ENOENT') console.error('לא הצלחתי לשחרר את נעילת הבוט:', error);
    }
    try {
        fs.closeSync(instanceLockDescriptor);
    } catch (error) {
        if (error.code !== 'EBADF') console.error('לא הצלחתי לסגור את קובץ נעילת הבוט:', error);
    }
});

function createGuildData() {
    return {
        settings: {
            prefix: '!',
            color: DEFAULT_COLOR,
            helpRoleId: null,
            helpChannelId: null,
            veteranRoleId: null,
            logs: {
                channelId: null,
                events: Object.fromEntries(Object.entries(LOG_EVENT_OPTIONS).map(([event, options]) => [
                    event,
                    options.defaultEnabled !== false
                ]))
            },
            notificationRoles: {
                roles: { events: null, giveaways: null, announcements: null },
                panelChannelId: null,
                panelMessageId: null,
                title: '🔔 בחרו את העדכונים שמעניינים אתכם',
                description: 'קבלו רק את ההתראות שתרצו! לחצו על הכפתורים כדי להצטרף או להסיר את עצמכם בכל רגע.',
                color: DEFAULT_COLOR
            },
            welcome: {
                channelId: null,
                title: '🎉 ברוך/ה הבא/ה לשרת!',
                message: 'אנחנו שמחים שהצטרפת אלינו!',
                greeting: '👋 {user} שמחים שהצטרפת ל-**{server}**!',
                tips: '• 📜 מומלץ לקרוא את חוקי השרת.\n• 💬 הציגו את עצמכם והכירו את הקהילה.\n• 🆘 צריכים עזרה? פנו לצוות.',
                color: DEFAULT_COLOR
            },
            tickets: {
                categoryId: null,
                staffRoleId: null,
                staffRoleIds: [],
                title: '🎫 מרכז התמיכה',
                description: 'ברוכים הבאים למרכז התמיכה!\nבחרו את נושא הפנייה מהרשימה למטה.\n\n📩 לאחר הבחירה ייפתח ערוץ פרטי שבו תוכלו לפרט לצוות איך אפשר לעזור.',
                options: DEFAULT_TICKET_OPTIONS.map(option => ({ ...option })),
                panelChannelId: null,
                panelMessageId: null
            },
            staffApplication: {
                title: '📑 בחינות לצוות זמינות!',
                description: DEFAULT_STAFF_APPLICATION_DESCRIPTION,
                buttonLabel: 'התחלת בחינה'
            },
            giveaway: {
                title: '🎉 הגרלה חדשה!',
                description: 'לחצו על הכפתור למטה כדי להירשם ולזכות בפרס! 🍀',
                buttonLabel: 'הירשם להגרלה',
                winnerTitle: '🏆 יש לנו זוכה!',
                winnerMessage: '🎊 מזל טוב {user}! זכית ב-**{prize}**! 🎁',
                color: '#2ECC71'
            },
            xp: {
                min: 10,
                max: 20,
                cooldownMs: 60000,
                levelChannelId: null,
                levelMessage: 'כל הכבוד {user}! עלית לרמה **{level}**! 🎉',
                levelRoles: {}
            },
            shop: [],
            shopPanel: {
                title: '🛒 חנות ה-XP',
                description: 'בחרו רול מהרשימה כדי לראות פרטים ולאשר רכישה.',
                buttonLabel: 'בחר רול לקנייה'
            },
            shopChannelId: null,
            shopPanelMessageId: null
        },
        members: {},
        games: {}
    };
}

function loadData() {
    if (!fs.existsSync(DATA_FILE)) return { guilds: {} };

    const parsed = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || !parsed.guilds || typeof parsed.guilds !== 'object') {
        throw new Error('bot-data.json אינו מכיל מבנה נתונים תקין.');
    }
    return parsed;
}

const database = loadData();

function saveData() {
    const temporaryFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(temporaryFile, JSON.stringify(database, null, 2), 'utf8');
    fs.renameSync(temporaryFile, DATA_FILE);
}

function getGuildData(guildId) {
    if (!database.guilds[guildId]) database.guilds[guildId] = createGuildData();
    const data = database.guilds[guildId];
    if (!Array.isArray(data.settings.tickets.options)) {
        data.settings.tickets.options = DEFAULT_TICKET_OPTIONS.map(option => ({ ...option }));
    }
    if (!Array.isArray(data.settings.tickets.staffRoleIds)) {
        data.settings.tickets.staffRoleIds = data.settings.tickets.staffRoleId
            ? [data.settings.tickets.staffRoleId]
            : [];
    }
    if (data.settings.tickets.staffRoleId && !data.settings.tickets.staffRoleIds.includes(data.settings.tickets.staffRoleId)) {
        data.settings.tickets.staffRoleIds.push(data.settings.tickets.staffRoleId);
    }
    if (!('panelChannelId' in data.settings.tickets)) data.settings.tickets.panelChannelId = null;
    if (!('panelMessageId' in data.settings.tickets)) data.settings.tickets.panelMessageId = null;
    if (!Array.isArray(data.settings.tickets.options)) {
        data.settings.tickets.options = createGuildData().settings.tickets.options;
    }
    if (!data.settings.staffApplication) {
        data.settings.staffApplication = createGuildData().settings.staffApplication;
    }
    if (data.settings.staffApplication.description === 'הגישו טופס ואולי תתקבלו!\n\n**תנאי קבלה:**\n1. בגרות ואחריות מלאה\n2. גיל 13+\n3. רצון אמיתי לקדם את השרת\n\nאז למה אתם מחכים? לחצו על הכפתור למטה כדי להתחיל בחינה!') {
        data.settings.staffApplication.description = DEFAULT_STAFF_APPLICATION_DESCRIPTION;
    }
    const defaultWelcomeSettings = createGuildData().settings.welcome;
    if (!data.settings.welcome) data.settings.welcome = defaultWelcomeSettings;
    for (const [key, value] of Object.entries(defaultWelcomeSettings)) {
        if (!(key in data.settings.welcome)) data.settings.welcome[key] = value;
    }
    const defaultGiveawaySettings = createGuildData().settings.giveaway;
    if (!data.settings.giveaway) data.settings.giveaway = defaultGiveawaySettings;
    for (const [key, value] of Object.entries(defaultGiveawaySettings)) {
        if (!(key in data.settings.giveaway)) data.settings.giveaway[key] = value;
    }
    if (!isValidColor(data.settings.giveaway.color)) {
        data.settings.giveaway.color = defaultGiveawaySettings.color;
    }
    const defaultLogSettings = createGuildData().settings.logs;
    if (!data.settings.logs) data.settings.logs = defaultLogSettings;
    if (!data.settings.logs.events) data.settings.logs.events = {};
    for (const [event, options] of Object.entries(LOG_EVENT_OPTIONS)) {
        if (!(event in data.settings.logs.events)) data.settings.logs.events[event] = options.defaultEnabled !== false;
    }
    const defaultNotificationSettings = createGuildData().settings.notificationRoles;
    if (!data.settings.notificationRoles) data.settings.notificationRoles = defaultNotificationSettings;
    if (!data.settings.notificationRoles.roles) data.settings.notificationRoles.roles = { ...defaultNotificationSettings.roles };
    for (const key of Object.keys(NOTIFICATION_ROLE_OPTIONS)) {
        if (!(key in data.settings.notificationRoles.roles)) data.settings.notificationRoles.roles[key] = null;
    }
    for (const key of ['panelChannelId', 'panelMessageId', 'title', 'description', 'color']) {
        if (!(key in data.settings.notificationRoles)) {
            data.settings.notificationRoles[key] = defaultNotificationSettings[key];
        }
    }
    if (!isValidColor(data.settings.notificationRoles.color)) {
        data.settings.notificationRoles.color = defaultNotificationSettings.color;
    }
    if (!data.settings.xp.levelMessage) {
        data.settings.xp.levelMessage = 'כל הכבוד {user}! עלית לרמה **{level}**! 🎉';
    }
    if (!data.settings.shopPanel) {
        data.settings.shopPanel = createGuildData().settings.shopPanel;
    }
    return data;
}

function getMemberData(guildId, userId) {
    const guildData = getGuildData(guildId);
    if (!guildData.members[userId]) guildData.members[userId] = { xp: 0, levelXp: 0, level: 1 };
    if (!Number.isFinite(guildData.members[userId].levelXp)) guildData.members[userId].levelXp = 0;
    return guildData.members[userId];
}

function addXp(stats, amount) {
    stats.xp += amount;
    stats.levelXp += amount;
    const levels = [];
    while (stats.levelXp >= stats.level * 100) {
        stats.levelXp -= stats.level * 100;
        stats.level += 1;
        levels.push(stats.level);
    }
    return levels;
}

async function grantLevelRoles(member, levels, settings) {
    for (const level of levels) {
        try {
            await giveLevelRole(member, level, settings);
        } catch (error) {
            console.error(`לא הצלחתי להעניק רול של רמה ${level} למשתמש ${member.id}:`, error);
        }
    }
}

function makeId() {
    return randomBytes(6).toString('hex');
}

function parseDuration(value) {
    const match = /^(\d+)(s|m|h|d)$/i.exec(value || '');
    if (!match) return null;
    const amount = Number(match[1]);
    const multiplier = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2].toLowerCase()];
    const duration = amount * multiplier;
    return duration >= 10000 && duration <= 30 * 86400000 ? duration : null;
}

function formatDuration(startedAt, now = Date.now()) {
    let months = (new Date(now).getFullYear() - startedAt.getFullYear()) * 12
        + new Date(now).getMonth() - startedAt.getMonth();
    const monthAnniversary = new Date(startedAt);
    monthAnniversary.setMonth(monthAnniversary.getMonth() + months);
    if (monthAnniversary > new Date(now)) months -= 1;

    const anniversary = new Date(startedAt);
    anniversary.setMonth(anniversary.getMonth() + months);
    const days = Math.max(0, Math.floor((now - anniversary.getTime()) / 86400000));
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const parts = [];
    if (years) parts.push(`${years} ${years === 1 ? 'שנה' : 'שנים'}`);
    if (remainingMonths) parts.push(`${remainingMonths} ${remainingMonths === 1 ? 'חודש' : 'חודשים'}`);
    if (days || parts.length === 0) parts.push(`${days} ימים`);
    return parts.join(' ו-');
}

function isAdministrator(member) {
    return member.permissions.has(PermissionFlagsBits.Administrator);
}

function isValidColor(value) {
    return /^#[0-9a-f]{6}$/i.test(value);
}

function isTextChannel(channel) {
    return channel && channel.type === ChannelType.GuildText;
}

function formatLogValue(value, limit = 1000) {
    const text = String(value ?? '').trim() || '—';
    return text.length > limit ? `${text.slice(0, limit - 3)}...` : text;
}

async function sendGuildLog(guild, eventKey, { description = '', fields = [], user = null, thumbnail = null } = {}, force = false) {
    const event = LOG_EVENT_OPTIONS[eventKey];
    if (!event) throw new Error(`סוג לוג לא מוכר: ${eventKey}`);
    const { settings } = getGuildData(guild.id);
    const logSettings = settings.logs;
    if (!logSettings.channelId || (!force && logSettings.events[eventKey] === false)) return false;

    const channel = guild.channels.cache.get(logSettings.channelId);
    if (!isTextChannel(channel)) {
        console.error(`ערוץ הלוגים ${logSettings.channelId} לא נמצא או אינו ערוץ טקסט בשרת ${guild.id}.`);
        return false;
    }

    const serverIcon = guild.iconURL({ size: 128 });
    const embed = new EmbedBuilder()
        .setColor(Number.parseInt(event.color.slice(1), 16))
        .setAuthor({
            name: `${guild.name} • לוגים`,
            ...(serverIcon ? { iconURL: serverIcon } : {})
        })
        .setTitle(`${event.emoji} ${event.label}`)
        .setTimestamp()
        .setFooter({ text: `שרת ${guild.id}` });
    if (description) embed.setDescription(formatLogValue(description, 4000));
    if (fields.length) {
        embed.addFields(fields.slice(0, 25).map(field => ({
            name: formatLogValue(field.name, 256),
            value: formatLogValue(field.value, 1024),
            inline: Boolean(field.inline)
        })));
    }
    const image = thumbnail || user?.displayAvatarURL?.({ size: 256 });
    if (image) embed.setThumbnail(image);

    try {
        await channel.send({ embeds: [embed], allowedMentions: { parse: [] } });
        return true;
    } catch (error) {
        console.error(`שליחת לוג "${event.label}" נכשלה בשרת ${guild.id}:`, error);
        return false;
    }
}

function getStaffRole(guild, settings) {
    if (!settings.helpRoleId) return null;
    return guild.roles.cache.get(settings.helpRoleId) || null;
}

function getTicketStaffRoleIds(settings) {
    const roleIds = Array.isArray(settings.tickets.staffRoleIds) ? [...settings.tickets.staffRoleIds] : [];
    if (settings.tickets.staffRoleId) roleIds.push(settings.tickets.staffRoleId);
    return [...new Set(roleIds)];
}

function buildShopPayload(settings) {
    if (!settings.shop.length) {
        return {
            embeds: [
                new EmbedBuilder()
                    .setColor(settings.color || DEFAULT_COLOR)
                    .setTitle(settings.shopPanel.title)
                    .setDescription('🛒 החנות ריקה כרגע. מנהלים יכולים להוסיף פריטים ולפרסם אותה מחדש.')
            ],
            components: []
        };
    }
    const description = [
        settings.shopPanel.description,
        '',
        ...settings.shop.map((item, index) =>
            `**${index + 1}.** ${item.name} (<@&${item.roleId}>) — **${item.cost} XP**`
        )
    ].join('\n');
    const menu = new StringSelectMenuBuilder()
        .setCustomId('shop_select')
        .setPlaceholder(settings.shopPanel.buttonLabel)
        .addOptions(settings.shop.map(item => ({
            label: item.name.slice(0, 100),
            value: item.roleId,
            description: `${item.cost} XP${item.name.length > 100 ? ` • ${item.name.slice(0, 40)}` : ''}`.slice(0, 100),
            emoji: '🛍️'
        })));
    const embed = new EmbedBuilder()
        .setColor(settings.color || DEFAULT_COLOR)
        .setTitle(settings.shopPanel.title)
        .setDescription(description.slice(0, 4096));
    return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] };
}

function isShopPanelMessage(message) {
    if (message.author.id !== client.user.id) return false;
    return message.components.some(row => row.components.some(component =>
        component.customId?.startsWith('shop_')
    ));
}

async function publishShopPanel(channel, settings) {
    const recentMessages = await channel.messages.fetch({ limit: 100 });
    const shopMessages = [...recentMessages.values()]
        .filter(isShopPanelMessage)
        .sort((first, second) => second.createdTimestamp - first.createdTimestamp);

    let panel = null;
    if (settings.shopPanelMessageId) {
        panel = shopMessages.find(message => message.id === settings.shopPanelMessageId) || null;
        if (!panel) {
            const savedMessage = await channel.messages.fetch(settings.shopPanelMessageId).catch(error => {
                if (error.code !== 10008) throw error;
                return null;
            });
            if (savedMessage?.author.id === client.user.id) panel = savedMessage;
        }
    }
    if (!panel) panel = shopMessages[0] || null;

    const payload = buildShopPayload(settings);
    if (panel) {
        await panel.edit(payload);
        for (const duplicate of shopMessages) {
            if (duplicate.id !== panel.id) await duplicate.delete();
        }
    } else {
        panel = await channel.send(payload);
    }

    settings.shopPanelMessageId = panel.id;
    saveData();
    return panel;
}

function buildTicketPanelPayload(settings) {
    const description = settings.tickets.description
        .split('\n')
        .map(line => `‏${line}`)
        .join('\n');
    const embed = new EmbedBuilder()
        .setColor(settings.color || DEFAULT_COLOR)
        .setTitle(`‏${settings.tickets.title}`)
        .setDescription(description)
        .setFooter({ text: 'בחרו נושא כדי לפתוח פנייה פרטית לצוות' });
    const menu = new StringSelectMenuBuilder()
        .setCustomId('ticket_select')
        .setPlaceholder('‏📩 בחרו את נושא הפנייה')
        .addOptions(settings.tickets.options.map(option => ({
            label: option.label,
            value: option.id,
            description: option.description,
            ...(option.emoji ? { emoji: option.emoji } : {})
        })));
    return { embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] };
}

function isTicketPanelMessage(message) {
    if (message.author.id !== client.user.id) return false;
    return message.components.some(row => row.components.some(component =>
        component.customId === 'ticket_select' || component.customId === 'ticket_open'
    ));
}

async function publishTicketPanel(channel, settings) {
    if (!settings.tickets.options.length) {
        throw new Error('לא ניתן לפרסם פאנל טיקטים ללא אפשרויות בתפריט.');
    }

    const oldChannelId = settings.tickets.panelChannelId;
    const oldMessageId = settings.tickets.panelMessageId;
    const recentMessages = await channel.messages.fetch({ limit: 100 });
    const ticketPanels = [...recentMessages.values()]
        .filter(isTicketPanelMessage)
        .sort((first, second) => second.createdTimestamp - first.createdTimestamp);

    let panel = settings.tickets.panelChannelId === channel.id
        ? ticketPanels.find(message => message.id === settings.tickets.panelMessageId) || null
        : null;
    if (!panel) panel = ticketPanels[0] || null;

    if (!panel && oldChannelId === channel.id && oldMessageId) {
        const savedMessage = await channel.messages.fetch(oldMessageId).catch(error => {
            if (error.code !== 10008) throw error;
            return null;
        });
        if (savedMessage && isTicketPanelMessage(savedMessage)) panel = savedMessage;
    }

    if (panel) {
        await panel.edit(buildTicketPanelPayload(settings));
        for (const duplicate of ticketPanels) {
            if (duplicate.id !== panel.id) await duplicate.delete();
        }
    } else {
        panel = await channel.send(buildTicketPanelPayload(settings));
    }

    if (oldChannelId && oldMessageId && oldChannelId !== channel.id) {
        const oldChannel = channel.guild.channels.cache.get(oldChannelId);
        if (isTextChannel(oldChannel)) {
            const oldPanel = await oldChannel.messages.fetch(oldMessageId).catch(error => {
                if (error.code !== 10008) throw error;
                return null;
            });
            if (oldPanel && isTicketPanelMessage(oldPanel)) await oldPanel.delete();
        }
    }

    settings.tickets.panelChannelId = channel.id;
    settings.tickets.panelMessageId = panel.id;
    saveData();
    return panel;
}

function buildNotificationRolePanelPayload(settings, guild) {
    const notificationSettings = settings.notificationRoles;
    const guildIcon = guild.iconURL({ size: 128 });
    const embed = new EmbedBuilder()
        .setColor(Number.parseInt(notificationSettings.color.slice(1), 16))
        .setAuthor({
            name: 'מרכז ההתראות של השרת',
            ...(guildIcon ? { iconURL: guildIcon } : {})
        })
        .setTitle(notificationSettings.title)
        .setDescription(notificationSettings.description)
        .addFields(Object.entries(NOTIFICATION_ROLE_OPTIONS).map(([key, option]) => {
            const roleId = notificationSettings.roles[key];
            return {
                name: `${option.emoji} ${option.label}`,
                value: roleId ? `<@&${roleId}>` : 'לא הוגדר עדיין',
                inline: true
            };
        }))
        .setFooter({ text: 'לחצו על כפתור כדי לקבל או להסיר את הרול • הבחירה ניתנת לשינוי בכל עת' })
        .setTimestamp();
    const buttons = Object.entries(NOTIFICATION_ROLE_OPTIONS).map(([key, option]) => {
        const button = new ButtonBuilder()
            .setCustomId(`notify_role_${key}`)
            .setLabel(option.button)
            .setEmoji(option.emoji)
            .setStyle(ButtonStyle.Primary);
        if (!notificationSettings.roles[key]) button.setDisabled(true);
        return button;
    });
    return {
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(buttons)],
        allowedMentions: { parse: [] }
    };
}

function isNotificationRolePanel(message) {
    if (message.author.id !== client.user.id) return false;
    return message.components.some(row => row.components.some(component =>
        component.customId?.startsWith('notify_role_')
    ));
}

async function refreshNotificationRolePanel(guild, settings) {
    const notificationSettings = settings.notificationRoles;
    if (!notificationSettings.panelChannelId || !notificationSettings.panelMessageId) return false;
    const channel = guild.channels.cache.get(notificationSettings.panelChannelId);
    if (!isTextChannel(channel)) return false;
    const panel = await channel.messages.fetch(notificationSettings.panelMessageId).catch(error => {
        if (error.code !== 10008) throw error;
        return null;
    });
    if (!panel || !isNotificationRolePanel(panel)) return false;
    await panel.edit(buildNotificationRolePanelPayload(settings, guild));
    return true;
}

async function publishNotificationRolePanel(channel, settings) {
    const notificationSettings = settings.notificationRoles;
    const oldChannelId = notificationSettings.panelChannelId;
    const oldMessageId = notificationSettings.panelMessageId;
    const recentMessages = await channel.messages.fetch({ limit: 100 });
    const existingPanels = [...recentMessages.values()]
        .filter(isNotificationRolePanel)
        .sort((first, second) => second.createdTimestamp - first.createdTimestamp);
    let panel = oldChannelId === channel.id
        ? existingPanels.find(message => message.id === oldMessageId) || null
        : null;

    if (!panel && oldChannelId === channel.id && oldMessageId) {
        const savedPanel = await channel.messages.fetch(oldMessageId).catch(error => {
            if (error.code !== 10008) throw error;
            return null;
        });
        if (savedPanel && isNotificationRolePanel(savedPanel)) panel = savedPanel;
    }
    if (!panel) panel = existingPanels[0] || null;

    const payload = buildNotificationRolePanelPayload(settings, channel.guild);
    if (panel) {
        await panel.edit(payload);
        for (const duplicate of existingPanels) {
            if (duplicate.id !== panel.id) await duplicate.delete();
        }
    } else {
        panel = await channel.send(payload);
    }

    if (oldChannelId && oldMessageId && oldChannelId !== channel.id) {
        const oldChannel = channel.guild.channels.cache.get(oldChannelId);
        if (isTextChannel(oldChannel)) {
            const oldPanel = await oldChannel.messages.fetch(oldMessageId).catch(error => {
                if (error.code !== 10008) throw error;
                return null;
            });
            if (oldPanel && isNotificationRolePanel(oldPanel)) await oldPanel.delete();
        }
    }

    notificationSettings.panelChannelId = channel.id;
    notificationSettings.panelMessageId = panel.id;
    saveData();
    return panel;
}

function buildShopConfirmation(item, settings) {
    const embed = new EmbedBuilder()
        .setColor(settings.color || DEFAULT_COLOR)
        .setTitle(`🛍️ רכישת ${item.name}`)
        .setDescription(`**הרול:** <@&${item.roleId}>\n**מחיר:** ${item.cost} XP\n\nלאישור הרכישה לחצו על הכפתור למטה.`);
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`shop_confirm_${item.roleId}`)
            .setLabel('אשר רכישה')
            .setEmoji('✅')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('shop_cancel')
            .setLabel('ביטול')
            .setStyle(ButtonStyle.Secondary)
    );
    return { embeds: [embed], components: [row] };
}

function fillWelcomeTemplate(template, member) {
    const joinedAt = member.joinedTimestamp;
    const accountCreatedAt = member.user.createdTimestamp;
    return template
        .replaceAll('{user}', `<@${member.id}>`)
        .replaceAll('{username}', member.displayName)
        .replaceAll('{server}', member.guild.name)
        .replaceAll('{members}', String(member.guild.memberCount))
        .replaceAll('{joined}', joinedAt ? `<t:${Math.floor(joinedAt / 1000)}:R>` : 'לא ידוע')
        .replaceAll('{created}', `<t:${Math.floor(accountCreatedAt / 1000)}:D>`);
}

function buildWelcomeEmbed(member, settings) {
    const welcomeSettings = settings.welcome;
    const serverIcon = member.guild.iconURL({ size: 128 });
    const tips = fillWelcomeTemplate(welcomeSettings.tips, member)
        .replaceAll('\\n', '\n')
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean)
        .join('\n');
    const description = [
        `> ${fillWelcomeTemplate(welcomeSettings.message, member).replaceAll('\n', '\n> ')}`,
        tips ? `\n**📜 כדאי להתחיל כאן:**\n${tips}` : ''
    ].filter(Boolean).join('\n\n');
    return new EmbedBuilder()
        .setColor(welcomeSettings.color || settings.color || DEFAULT_COLOR)
        .setAuthor({
            name: `ברוכים הבאים ל-${member.guild.name}`,
            ...(serverIcon ? { iconURL: serverIcon } : {})
        })
        .setTitle(fillWelcomeTemplate(welcomeSettings.title, member))
        .setDescription(description)
        .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
        .addFields(
            { name: '👥 חבר/ה מספר', value: String(member.guild.memberCount), inline: true },
            { name: '📅 הצטרף/ה', value: member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'לא ידוע', inline: true },
            { name: '🗓️ חשבון נוצר', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:D>`, inline: true }
        )
        .setFooter({ text: `מזהה משתמש: ${member.id}` })
        .setTimestamp();
}

async function sendWelcome(member) {
    const { settings } = getGuildData(member.guild.id);
    const channel = member.guild.channels.cache.get(settings.welcome.channelId);
    if (!isTextChannel(channel)) return false;
    await channel.send({
        content: fillWelcomeTemplate(settings.welcome.greeting, member),
        embeds: [buildWelcomeEmbed(member, settings)],
        allowedMentions: { users: [member.id], parse: [] }
    });
    return true;
}

async function awardVeteranRole(member) {
    const { settings } = getGuildData(member.guild.id);
    if (!settings.veteranRoleId || !member.joinedTimestamp || member.user.bot) return false;
    const veteranRole = member.guild.roles.cache.get(settings.veteranRoleId);
    if (!veteranRole || member.roles.cache.has(veteranRole.id)) return false;

    const eligibleAt = new Date(member.joinedTimestamp);
    eligibleAt.setMonth(eligibleAt.getMonth() + SIX_MONTHS);
    if (Date.now() < eligibleAt.getTime()) return false;

    await member.roles.add(veteranRole, 'החבר/ה השלים/ה חצי שנת ותק בשרת');
    return true;
}

async function checkVeteranRoles(guild) {
    const { settings } = getGuildData(guild.id);
    if (!settings.veteranRoleId) return;
    for (const member of guild.members.cache.values()) {
        try {
            await awardVeteranRole(member);
        } catch (error) {
            console.error(`לא הצלחתי לבדוק/להעניק רול ותיקים למשתמש ${member.id}:`, error);
        }
    }
}

function buildLevelUpEmbed(member, settings, level, xp) {
    const description = settings.xp.levelMessage
        .replaceAll('{user}', `<@${member.id}>`)
        .replaceAll('{level}', String(level))
        .replaceAll('{xp}', String(xp));
    return new EmbedBuilder()
        .setColor(settings.color || DEFAULT_COLOR)
        .setTitle('🚀 עלית ברמה!')
        .setDescription(description)
        .addFields(
            { name: '⭐ XP כולל', value: String(xp), inline: true },
            { name: '🎖️ רמה נוכחית', value: String(level), inline: true }
        )
        .setTimestamp();
}

async function sendLevelUp(message, data) {
    const { settings } = data;
    const stats = getMemberData(message.guild.id, message.author.id);
    const embed = buildLevelUpEmbed(message.member, settings, stats.level, stats.xp);
    const channel = message.guild.channels.cache.get(settings.xp.levelChannelId) || message.channel;
    await channel.send({ embeds: [embed], allowedMentions: { users: [message.author.id], parse: [] } });
}

async function giveLevelRole(member, level, settings) {
    const roleId = settings.xp.levelRoles[String(level)];
    if (!roleId) return;
    const role = member.guild.roles.cache.get(roleId);
    if (role && !member.roles.cache.has(role.id)) {
        await member.roles.add(role, `הגעה לרמה ${level}`);
    }
}

function getGameCustomId(game, id) {
    return `${game.type === 'drop' ? 'drop' : 'giveaway'}_join_${id}`;
}

function formatGamePrize(game) {
    if (!game.roleId) return game.prize;
    return game.prize ? `${game.prize} (<@&${game.roleId}>)` : `<@&${game.roleId}>`;
}

function fillGiveawayTemplate(template, game, winnerId = null) {
    return template
        .replaceAll('{user}', winnerId ? `<@${winnerId}>` : '')
        .replaceAll('{host}', game.hostId ? `<@${game.hostId}>` : 'צוות השרת')
        .replaceAll('{prize}', formatGamePrize(game))
        .replaceAll('{role}', game.roleId ? `<@&${game.roleId}>` : '')
        .replaceAll('{participants}', String(game.participants.length));
}

function buildGameMessage(game, id, settings) {
    const isDrop = game.type === 'drop';
    const giveawaySettings = settings.giveaway;
    const prize = formatGamePrize(game);
    const description = isDrop
        ? `**🎁 הפרס:** ${formatGamePrize(game)}\n\nלחצו על הכפתור כדי לתפוס את הדרופ.\n\n⏳ **נסגר:** <t:${Math.floor(game.endsAt / 1000)}:R>`
        : `${fillGiveawayTemplate(giveawaySettings.description, game)}\n\n**🎁 הפרס:** ${prize}\n**👤 יוצר ההגרלה:** ${game.hostId ? `<@${game.hostId}>` : 'צוות השרת'}\n**⏳ נסגרת:** <t:${Math.floor(game.endsAt / 1000)}:R>`;
    const embed = new EmbedBuilder()
        .setColor(isDrop ? settings.color || DEFAULT_COLOR : Number.parseInt(giveawaySettings.color.slice(1), 16))
        .setTitle(isDrop ? '🎁 דרופ חדש!' : giveawaySettings.title)
        .setDescription(description)
        .addFields({ name: '👥 נרשמו', value: String(game.participants.length), inline: true })
        .setFooter({ text: `מזהה: ${id} • הגרלה הוגנת לכולם` })
        .setTimestamp();
    const button = new ButtonBuilder()
        .setCustomId(getGameCustomId(game, id))
        .setLabel(isDrop ? 'אני רוצה את הפרס!' : giveawaySettings.buttonLabel)
        .setEmoji(isDrop ? '🎁' : '🎉')
        .setStyle(ButtonStyle.Success);
    return { embeds: [embed], components: [new ActionRowBuilder().addComponents(button)] };
}

async function refreshGameMessage(guild, game, id) {
    const channel = guild.channels.cache.get(game.channelId);
    if (!isTextChannel(channel) || !game.messageId) return;
    const message = await channel.messages.fetch(game.messageId);
    await message.edit({
        ...buildGameMessage(game, id, getGuildData(guild.id).settings),
        allowedMentions: { parse: [] }
    });
}

async function finishGame(guild, id) {
    const data = getGuildData(guild.id);
    const game = data.games[id];
    if (!game || game.ended) return null;

    game.ended = true;
    const winnerId = game.participants.length
        ? game.type === 'drop'
            ? game.participants[0]
            : game.participants[Math.floor(Math.random() * game.participants.length)]
        : null;
    game.winnerId = winnerId;
    saveData();

    let rewardMessage = '';
    if (winnerId && game.type === 'drop' && Number.isSafeInteger(game.rewardXp) && game.rewardXp > 0) {
        const stats = getMemberData(guild.id, winnerId);
        const oldLevel = stats.level;
        const reachedLevels = addXp(stats, game.rewardXp);
        game.rewardGranted = true;
        rewardMessage = `✅ הוענקו לזוכה **${game.rewardXp} XP**!`;
        saveData();

        try {
            const winner = await guild.members.fetch(winnerId);
            await grantLevelRoles(winner, reachedLevels, data.settings);
            if (reachedLevels.length) {
                const levelChannel = guild.channels.cache.get(data.settings.xp.levelChannelId)
                    || guild.channels.cache.get(game.channelId);
                if (isTextChannel(levelChannel)) {
                    await levelChannel.send({
                        embeds: [buildLevelUpEmbed(winner, data.settings, stats.level, stats.xp)],
                        allowedMentions: { users: [winnerId], parse: [] }
                    });
                }
            }
        } catch (error) {
            console.error(`לא הצלחתי לעדכן רולים/הודעת רמה לזוכה בדרופ XP ${id}:`, error);
            rewardMessage += ' הרמה עודכנה, אבל לא הצלחתי לעדכן את רולי הרמה או לשלוח הודעת עלייה.';
        }
        if (stats.level > oldLevel) {
            rewardMessage += ` 🎖️ עלית לרמה ${stats.level}!`;
        }
    }
    if (winnerId && game.type === 'giveaway' && game.roleId) {
        const role = guild.roles.cache.get(game.roleId);
        if (!role) {
            rewardMessage = '⚠️ הרול שהוגדר כפרס כבר לא קיים, ולכן לא ניתן היה להעניק אותו.';
        } else {
            try {
                const winner = await guild.members.fetch(winnerId);
                const botMember = guild.members.me;
                if (winner.roles.cache.has(role.id)) {
                    rewardMessage = 'ℹ️ לזוכה כבר יש את הרול הזה.';
                    game.rewardGranted = true;
                } else if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
                    rewardMessage = '⚠️ הזוכה נבחר, אבל לבוט חסרה הרשאת Manage Roles ולכן הרול לא הוענק.';
                } else if (!role.editable) {
                    rewardMessage = '⚠️ הזוכה נבחר, אבל תפקיד הבוט אינו גבוה מספיק כדי להעניק את הרול.';
                } else {
                    await winner.roles.add(role, `זכייה בהגרלה ${id}`);
                    game.rewardGranted = true;
                    rewardMessage = '✅ הפרס הוענק לזוכה באופן אוטומטי!';
                }
            } catch (error) {
                console.error(`לא הצלחתי להעניק את רול הפרס ${game.roleId} לזוכה ${winnerId} בהגרלה ${id}:`, error);
                rewardMessage = '⚠️ הזוכה נבחר, אבל אירעה שגיאה בהענקת הרול. בדקו את הרשאות הבוט.';
            }
        }
    }
    game.rewardMessage = rewardMessage;
    saveData();

    const channel = guild.channels.cache.get(game.channelId);
    if (isTextChannel(channel) && game.messageId) {
        try {
            const message = await channel.messages.fetch(game.messageId);
            const giveawaySettings = data.settings.giveaway;
            const winnerText = winnerId
                ? fillGiveawayTemplate(giveawaySettings.winnerMessage, game, winnerId)
                : '😔 לא נרשמו משתתפים הפעם. ננסה שוב בהגרלה הבאה!';
            const description = [
                winnerText,
                '',
                `**🎁 הפרס:** ${formatGamePrize(game)}`,
                `**👥 משתתפים:** ${game.participants.length}`,
                rewardMessage
            ].filter(Boolean).join('\n');
            await message.edit({
                embeds: [
                    new EmbedBuilder()
                        .setColor(game.type === 'giveaway'
                            ? Number.parseInt(giveawaySettings.color.slice(1), 16)
                            : data.settings.color || DEFAULT_COLOR)
                        .setTitle(game.type === 'drop' ? '🎁 הדרופ הסתיים' : giveawaySettings.winnerTitle)
                        .setDescription(description)
                        .setFooter({ text: `הגרלה ${id} • תודה שהשתתפתם!` })
                        .setTimestamp()
                ],
                components: [],
                allowedMentions: { parse: [] }
            });
        } catch (error) {
            console.error(`לא הצלחתי לעדכן את הודעת המשחק ${id}:`, error);
        }
    }
    if (winnerId && game.type === 'giveaway' && isTextChannel(channel)) {
        try {
            await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Number.parseInt(data.settings.giveaway.color.slice(1), 16))
                        .setTitle(data.settings.giveaway.winnerTitle)
                        .setDescription([
                            fillGiveawayTemplate(data.settings.giveaway.winnerMessage, game, winnerId),
                            '',
                            `**🎁 הפרס:** ${formatGamePrize(game)}`,
                            rewardMessage
                        ].filter(Boolean).join('\n'))
                        .setFooter({ text: 'תודה לכל מי שהשתתף! 🍀' })
                        .setTimestamp()
                ],
                allowedMentions: { users: [winnerId], roles: [] }
            });
        } catch (error) {
            console.error(`לא הצלחתי לשלוח הודעת זכייה עבור ההגרלה ${id}:`, error);
        }
    }
    return winnerId;
}

const client = new Client({
    partials: [Partials.Channel, Partials.Message],
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution
    ]
});

const xpCooldowns = new Map();
const helpCooldowns = new Map();
const openingTickets = new Set();
const activePurchases = new Set();
const activeNotificationRoleChanges = new Set();

function requireAdmin(message) {
    if (isAdministrator(message.member)) return true;
    message.reply('❌ הפקודה הזו מיועדת למנהלי שרת בלבד.').catch(console.error);
    return false;
}

async function createTicket(interaction, reason, ticketTypeId = null) {
    const guild = interaction.guild;
    const data = getGuildData(guild.id);
    const ticketType = ticketTypeId
        ? data.settings.tickets.options.find(option => option.id === ticketTypeId)
        : null;
    if (ticketTypeId && !ticketType) {
        return interaction.reply({ content: '❌ סוג הטיקט הזה כבר לא זמין. פתחו טיקט חדש מהתפריט.', ephemeral: true });
    }
    const openingKey = `${guild.id}:${interaction.user.id}`;
    if (openingTickets.has(openingKey)) {
        await interaction.reply({ content: '⏳ הטיקט שלך כבר בתהליך פתיחה.', ephemeral: true });
        return;
    }

    const existing = guild.channels.cache.find(channel =>
        channel.type === ChannelType.GuildText && channel.topic === `ticket-owner:${interaction.user.id}`
    );
    if (existing) {
        await interaction.reply({ content: `כבר יש לך טיקט פתוח: ${existing}`, ephemeral: true });
        return;
    }

    openingTickets.add(openingKey);
    try {
        const permissionOverwrites = [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            {
                id: interaction.user.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
            }
        ];
        const staffRoleIds = getTicketStaffRoleIds(data.settings);
        for (const staffRoleId of staffRoleIds) {
            permissionOverwrites.push({
                id: staffRoleId,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
            });
        }

        const safeType = (ticketType?.id || 'support').replace(/[^a-z0-9-]/g, '-').slice(0, 20);
        const channel = await guild.channels.create({
            name: `ticket-${safeType}-${interaction.user.id.slice(-4)}`,
            type: ChannelType.GuildText,
            topic: `ticket-owner:${interaction.user.id}`,
            parent: data.settings.tickets.categoryId || undefined,
            permissionOverwrites
        });
        const closeButton = new ButtonBuilder()
            .setCustomId('ticket_close')
            .setLabel('סגור טיקט')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger);
        const staffRoles = staffRoleIds
            .map(roleId => guild.roles.cache.get(roleId))
            .filter(Boolean);
        await channel.send({
            content: `${interaction.user}${staffRoles.length ? ` ${staffRoles.join(' ')}` : ''}`,
            embeds: [
                new EmbedBuilder()
                    .setColor(data.settings.color || DEFAULT_COLOR)
                    .setTitle(ticketType ? `${ticketType.emoji || '🎫'} ${ticketType.label}` : '🎫 טיקט תמיכה')
                    .setDescription(`${ticketType ? `**נושא:** ${ticketType.label}\n` : ''}**נפתח על ידי:** ${interaction.user}\n**סיבה:** ${reason}`)
                    .setTimestamp()
            ],
            components: [new ActionRowBuilder().addComponents(closeButton)],
            allowedMentions: { users: [interaction.user.id], roles: staffRoles.map(role => role.id) }
        });
        await interaction.reply({ content: `✅ הטיקט נפתח: ${channel}`, ephemeral: true });
    } finally {
        openingTickets.delete(openingKey);
    }
}

async function showTicketReasonModal(interaction, ticketTypeId = null) {
    const data = getGuildData(interaction.guild.id);
    const ticketType = ticketTypeId
        ? data.settings.tickets.options.find(option => option.id === ticketTypeId)
        : null;
    if (ticketTypeId && !ticketType) {
        return interaction.reply({ content: '❌ סוג הטיקט הזה כבר לא זמין. פתחו טיקט חדש מהתפריט.', ephemeral: true });
    }
    const modal = new ModalBuilder()
        .setCustomId(ticketTypeId ? `ticket_reason_submit_${ticketTypeId}` : 'ticket_reason_submit')
        .setTitle(ticketType ? `טיקט: ${ticketType.label}`.slice(0, 45) : 'פתיחת טיקט');
    const reasonInput = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('במה אפשר לעזור?')
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(5)
        .setMaxLength(500)
        .setRequired(true)
        .setPlaceholder('תאר/י בקצרה את הסיבה לפתיחת הטיקט');
    modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));
    return interaction.showModal(modal);
}

async function createStaffApplication(interaction, answers) {
    const guild = interaction.guild;
    const data = getGuildData(guild.id);
    const staffRoleIds = getTicketStaffRoleIds(data.settings);
    if (!staffRoleIds.length) {
        return interaction.reply({
            content: '❌ מערכת הבחינות עדיין לא הוגדרה. בקשו ממנהל להגדיר רול צוות עם `!config staff @רול`.',
            ephemeral: true
        });
    }
    const validStaffRoleIds = staffRoleIds.filter(roleId => guild.roles.cache.has(roleId));
    if (!validStaffRoleIds.length) {
        return interaction.reply({
            content: '❌ רולי צוות הטיקטים שהוגדרו אינם קיימים. הגדירו אותם מחדש עם `!tickets staff @רול`.',
            ephemeral: true
        });
    }

    const openingKey = `${guild.id}:${interaction.user.id}`;
    if (openingTickets.has(openingKey)) {
        return interaction.reply({ content: '⏳ הבקשה שלך כבר בתהליך פתיחה.', ephemeral: true });
    }
    const existing = guild.channels.cache.find(channel =>
        channel.type === ChannelType.GuildText
        && channel.topic === `staff-application-owner:${interaction.user.id}`
    );
    if (existing) {
        return interaction.reply({ content: `כבר יש לך בחינה פתוחה: ${existing}`, ephemeral: true });
    }

    openingTickets.add(openingKey);
    try {
        const permissionOverwrites = [
            { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
            {
                id: interaction.user.id,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
            },
            ...validStaffRoleIds.map(roleId => ({
                id: roleId,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
            }))
        ];
        const channel = await guild.channels.create({
            name: `staff-apply-${interaction.user.id.slice(-5)}`,
            type: ChannelType.GuildText,
            topic: `staff-application-owner:${interaction.user.id}`,
            parent: data.settings.tickets.categoryId || undefined,
            permissionOverwrites
        });
        const closeButton = new ButtonBuilder()
            .setCustomId('ticket_close')
            .setLabel('סגור בחינה')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger);
        await channel.send({
            content: `<@${interaction.user.id}> ${validStaffRoleIds.map(roleId => `<@&${roleId}>`).join(' ')}`,
            embeds: [
                new EmbedBuilder()
                    .setColor(data.settings.color || DEFAULT_COLOR)
                    .setTitle('📋 בקשה להצטרפות לצוות')
                    .setDescription([
                        `**מועמד/ת:** <@${interaction.user.id}>`,
                        '',
                        `**האם גילך 12 ומעלה?**\n${answers.age}`,
                        '',
                        `**ספר/י על הניסיון והזמינות שלך:**\n${answers.experience}`,
                        '',
                        `**למה תרצה/י להצטרף לצוות ואיך תקדם/י את השרת?**\n${answers.motivation}`
                    ].join('\n'))
                    .setTimestamp()
            ],
            components: [new ActionRowBuilder().addComponents(closeButton)],
            allowedMentions: { users: [interaction.user.id], roles: validStaffRoleIds }
        });
        return await interaction.reply({
            content: `✅ הבחינה נשלחה לצוות. אפשר להמשיך לדבר איתם בערוץ ${channel}.`,
            ephemeral: true
        });
    } finally {
        openingTickets.delete(openingKey);
    }
}

async function completeShopPurchase(interaction, roleId) {
    const key = `${interaction.guild.id}:${interaction.user.id}`;
    if (activePurchases.has(key)) {
        return interaction.reply({ content: '⏳ רכישה אחרת שלך כבר מתבצעת.', ephemeral: true });
    }

    activePurchases.add(key);
    try {
        await interaction.deferReply({ ephemeral: true });
        const data = getGuildData(interaction.guild.id);
        const item = data.settings.shop.find(shopItem => shopItem.roleId === roleId);
        if (!item) return await interaction.editReply('❌ הפריט הזה כבר לא נמצא בחנות.');

        const member = interaction.guild.members.cache.get(interaction.user.id)
            || await interaction.guild.members.fetch(interaction.user.id);
        const role = interaction.guild.roles.cache.get(roleId);
        if (!role) return await interaction.editReply('❌ הרול כבר לא קיים בשרת.');
        if (member.roles.cache.has(roleId)) return await interaction.editReply('❌ כבר יש לך את הרול הזה.');

        const botMember = interaction.guild.members.me;
        if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return await interaction.editReply('❌ חסרה לבוט הרשאת **Manage Roles** (ניהול תפקידים).');
        }
        if (!role.editable) {
            return await interaction.editReply('❌ הבוט לא יכול להעניק את הרול הזה. ודא שתפקיד הבוט נמצא מעל הרול בחנות, ושהרול אינו מנוהל.');
        }

        const stats = getMemberData(interaction.guild.id, interaction.user.id);
        if (stats.xp < item.cost) {
            return await interaction.editReply(`❌ אין מספיק XP. המחיר ${item.cost}, ויש לך ${stats.xp}.`);
        }

        try {
            await member.roles.add(role, `רכישה בחנות XP (${item.cost} XP)`);
        } catch (error) {
            console.error(`הענקת רול ${role.id} למשתמש ${interaction.user.id} נכשלה:`, error);
            if (error.code === 50013) {
                return await interaction.editReply('❌ Discord דחה את הענקת הרול. ודא שלבוט יש **Manage Roles** ושתפקיד הבוט ממוקם מעל הרול בחנות.');
            }
            throw error;
        }

        stats.xp -= item.cost;
        saveData();
        return await interaction.editReply(`🎉 רכשת את **${role.name}** ב-${item.cost} XP! נשארו לך ${stats.xp} XP.`);
    } finally {
        activePurchases.delete(key);
    }
}

async function startGame(message, type, duration, prize, roleId = null, rewardXp = null) {
    const data = getGuildData(message.guild.id);
    const id = makeId();
    const game = {
        type,
        prize,
        roleId,
        rewardXp,
        hostId: message.author.id,
        channelId: message.channel.id,
        messageId: null,
        endsAt: Date.now() + duration,
        participants: [],
        ended: false,
        winnerId: null
    };
    const sent = await message.channel.send({
        ...buildGameMessage(game, id, data.settings),
        allowedMentions: { parse: [] }
    });
    game.messageId = sent.id;
    data.games[id] = game;
    saveData();
    return id;
}

async function handleAdminCommand(message, command, args, data) {
    const settings = data.settings;

    if (command === 'config') {
        const option = (args[0] || '').toLowerCase();
        if (!option) {
            return message.reply([
                '**הגדרות שרת**',
                '`!config prefix <סימן>`',
                '`!config color #RRGGBB`',
                '`!config staff @רול` — צוות לתמיכה',
                '`!config helpchannel #ערוץ|off`',
                '`!config veteran @רול`',
                '`!config levelchannel #ערוץ|off`',
                '`!config levelmessage <טקסט>` — משתנים: `{user}`, `{level}`, `{xp}`',
                '`!config xp <מינימום> <מקסימום> <cooldown בשניות>`'
            ].join('\n'));
        }
        if (option === 'prefix') {
            const prefix = args[1];
            if (!prefix || prefix.length > 5 || /\s/.test(prefix)) return message.reply('שימוש: `!config prefix ?` (עד 5 תווים, ללא רווחים).');
            settings.prefix = prefix;
            saveData();
            return message.reply(`✅ הקידומת עודכנה ל-${prefix}`);
        }
        if (option === 'color') {
            if (!isValidColor(args[1])) return message.reply('יש לציין צבע בפורמט `#RRGGBB`, לדוגמה `#5865F2`.');
            settings.color = args[1];
            saveData();
            return message.reply(`✅ צבע המערכת עודכן ל-${args[1]}.`);
        }
        if (option === 'staff') {
            const role = message.mentions.roles.first();
            if (!role && args[1]?.toLowerCase() === 'off') {
                settings.helpRoleId = null;
                settings.tickets.staffRoleId = null;
                saveData();
                return message.reply('✅ רול הצוות הוסר מהגדרות העזרה והטיקטים.');
            }
            if (!role || role.id === message.guild.id) return message.reply('שימוש: `!config staff @רול` (לא ניתן לבחור את @everyone).');
            settings.helpRoleId = role.id;
            settings.tickets.staffRoleId = role.id;
            saveData();
            return message.reply(`✅ רול הצוות עודכן ל-${role}.`);
        }
        if (option === 'helpchannel') {
            const channel = message.mentions.channels.first();
            if ((!isTextChannel(channel) && args[1]?.toLowerCase() !== 'off')) return message.reply('שימוש: `!config helpchannel #ערוץ` או `!config helpchannel off`.');
            settings.helpChannelId = channel ? channel.id : null;
            saveData();
            return message.reply(channel ? `✅ בקשות העזרה יישלחו ל-${channel}.` : '✅ בקשות העזרה יישלחו בערוץ שבו נכתבה הפקודה.');
        }
        if (option === 'veteran') {
            const role = message.mentions.roles.first();
            if (!role && args[1]?.toLowerCase() === 'off') {
                settings.veteranRoleId = null;
                saveData();
                return message.reply('✅ רול הוותיקים הוסר מההגדרות.');
            }
            if (!role || role.id === message.guild.id) return message.reply('שימוש: `!config veteran @רול` (לא ניתן לבחור את @everyone).');
            settings.veteranRoleId = role.id;
            saveData();
            return message.reply(`✅ רול הוותיקים עודכן ל-${role}. משתמשים פעילים יקבלו אותו עם השלמת חצי שנה.`);
        }
        if (option === 'levelchannel') {
            const channel = message.mentions.channels.first();
            if ((!isTextChannel(channel) && args[1]?.toLowerCase() !== 'off')) return message.reply('שימוש: `!config levelchannel #ערוץ` או `!config levelchannel off`.');
            settings.xp.levelChannelId = channel ? channel.id : null;
            saveData();
            return message.reply(channel ? `✅ הודעות עליית רמה יישלחו ל-${channel}.` : '✅ הודעות עליית רמה יישלחו בערוץ השיחה.');
        }
        if (option === 'levelmessage') {
            const text = args.slice(1).join(' ').trim();
            if (!text || text.length > 3000) {
                return message.reply('שימוש: `!config levelmessage כל הכבוד {user}! עלית לרמה {level} ויש לך {xp} XP` (עד 3000 תווים).');
            }
            settings.xp.levelMessage = text;
            saveData();
            return message.reply('✅ הודעת עליית הרמה עודכנה. משתנים זמינים: `{user}`, `{level}`, `{xp}`.');
        }
        if (option === 'xp') {
            const min = Number(args[1]);
            const max = Number(args[2]);
            const cooldown = Number(args[3]);
            if (!Number.isInteger(min) || !Number.isInteger(max) || !Number.isInteger(cooldown)
                || min < 1 || max < min || max > 1000 || cooldown < 5 || cooldown > 3600) {
                return message.reply('שימוש: `!config xp <מינימום 1-1000> <מקסימום> <cooldown בשניות 5-3600>`.');
            }
            Object.assign(settings.xp, { min, max, cooldownMs: cooldown * 1000 });
            saveData();
            return message.reply(`✅ הגדרות XP עודכנו: ${min}-${max} XP כל ${cooldown} שניות.`);
        }
        return message.reply('❌ הגדרה לא מוכרת. כתוב `!config` לרשימת האפשרויות.');
    }

    if (command === 'logs') {
        const option = (args[0] || '').toLowerCase();
        if (option === 'channel') {
            const channel = message.mentions.channels.first();
            if (args[1]?.toLowerCase() === 'off') {
                settings.logs.channelId = null;
                saveData();
                return message.reply('✅ מערכת הלוגים כובתה.');
            }
            if (!isTextChannel(channel)) return message.reply('שימוש: `!logs channel #ערוץ` או `!logs channel off`.');
            settings.logs.channelId = channel.id;
            saveData();
            return message.reply(`✅ כל סוגי הלוגים הפעילים יישלחו ל-${channel}. בדוק עם \`!logs test\`.`);
        }
        if (option === 'enable' || option === 'disable') {
            const eventKey = (args[1] || '').toLowerCase();
            const event = LOG_EVENT_OPTIONS[eventKey];
            if (!event) {
                return message.reply(`❌ סוג לוג לא מוכר. הצג את הרשימה עם \`${settings.prefix}logs list\`.`);
            }
            settings.logs.events[eventKey] = option === 'enable';
            saveData();
            return message.reply(`✅ לוג "${event.label}" ${option === 'enable' ? 'הופעל' : 'כובה'}.`);
        }
        if (option === 'list') {
            const lines = Object.entries(LOG_EVENT_OPTIONS).map(([key, event]) =>
                `${settings.logs.events[key] === false ? '🔴 כבוי' : '🟢 פעיל'} — \`${key}\` — ${event.label}`
            );
            const embed = new EmbedBuilder()
                .setColor(settings.color || DEFAULT_COLOR)
                .setTitle(`📋 הגדרות לוגים — ${settings.logs.channelId ? `<#${settings.logs.channelId}>` : 'לא הוגדר ערוץ'}`)
                .setDescription([
                    ...lines,
                    '',
                    `הפעלה/כיבוי: \`${settings.prefix}logs enable <שם>\` / \`${settings.prefix}logs disable <שם>\``
                ].join('\n'));
            return message.reply({ embeds: [embed] });
        }
        if (option === 'test') {
            if (!settings.logs.channelId) return message.reply(`❌ קודם הגדר ערוץ עם \`${settings.prefix}logs channel #ערוץ\`.`);
            const sent = await sendGuildLog(message.guild, 'member-join', {
                description: 'זוהי הודעת בדיקה של מערכת הלוגים. כך ייראו הלוגים בשרת.',
                fields: [{ name: 'נבדק על ידי', value: `${message.author}` }],
                user: message.author
            }, true);
            return message.reply(sent ? '✅ הודעת בדיקה נשלחה לערוץ הלוגים.' : '❌ לא הצלחתי לשלוח את הודעת הבדיקה. בדוק הרשאות ושהלוג הזה מופעל עם `!logs list`.');
        }
        return message.reply([
            '**ניהול מערכת הלוגים**',
            '`!logs channel #ערוץ` — בחירת ערוץ לוגים',
            '`!logs channel off` — כיבוי הלוגים',
            '`!logs list` — רשימת סוגי הלוגים ומצבם',
            '`!logs enable <שם>` / `!logs disable <שם>` — הפעלה או כיבוי של סוג לוג',
            '`!logs test` — שליחת הודעת בדיקה'
        ].join('\n'));
    }

    if (command === 'notifyroles') {
        const option = (args[0] || '').toLowerCase();
        const notificationSettings = settings.notificationRoles;
        if (option === 'role') {
            const aliases = {
                event: 'events',
                events: 'events',
                giveaway: 'giveaways',
                giveaways: 'giveaways',
                drops: 'giveaways',
                announcement: 'announcements',
                announcements: 'announcements',
                updates: 'announcements'
            };
            const roleKey = aliases[(args[1] || '').toLowerCase()];
            const role = message.mentions.roles.first();
            if (!roleKey) {
                return message.reply(`בחר סוג: \`${settings.prefix}notifyroles role events @רול\`, \`giveaways\` או \`announcements\`.`);
            }
            if (args[2]?.toLowerCase() === 'off') {
                notificationSettings.roles[roleKey] = null;
            } else {
                if (!role || role.id === message.guild.id) {
                    return message.reply(`שימוש: \`${settings.prefix}notifyroles role ${roleKey} @רול\` או \`${settings.prefix}notifyroles role ${roleKey} off\`.`);
                }
                const botMember = message.guild.members.me;
                if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
                    return message.reply('❌ חסרה לבוט הרשאת **Manage Roles**.');
                }
                if (!role.editable) {
                    return message.reply(`❌ הבוט לא יכול להעניק את ${role}. ודא שתפקיד הבוט גבוה ממנו ושהרול אינו מנוהל.`);
                }
                notificationSettings.roles[roleKey] = role.id;
            }
            saveData();
            const refreshed = await refreshNotificationRolePanel(message.guild, settings);
            const optionLabel = NOTIFICATION_ROLE_OPTIONS[roleKey].label;
            const configuredRole = notificationSettings.roles[roleKey]
                ? `<@&${notificationSettings.roles[roleKey]}>`
                : null;
            return message.reply(`✅ ${optionLabel} ${configuredRole ? `עודכנו לרול ${configuredRole}` : 'הוסרו מהפאנל'}${refreshed ? ', והפאנל עודכן' : '. הרץ `!notifyroles setup` לאחר הגדרת כל הרולים כדי לפרסם את הפאנל'}.`);
        }
        if (option === 'setup') {
            const channel = message.mentions.channels.first() || message.channel;
            if (!isTextChannel(channel)) return message.reply('בחר ערוץ טקסט לפאנל.');
            const missing = Object.entries(NOTIFICATION_ROLE_OPTIONS)
                .filter(([key]) => !notificationSettings.roles[key])
                .map(([, value]) => value.label);
            if (missing.length) {
                return message.reply(`❌ קודם הגדר רולים עבור: ${missing.join(', ')}. השתמש ב-\`!notifyroles role events @רול\`, \`giveaways\` ו-\`announcements\`.`);
            }
            const botMember = message.guild.members.me;
            if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return message.reply('❌ חסרה לבוט הרשאת **Manage Roles** כדי לתת ולהסיר את רולי ההתראות.');
            }
            for (const [key, optionData] of Object.entries(NOTIFICATION_ROLE_OPTIONS)) {
                const roleId = notificationSettings.roles[key];
                const role = message.guild.roles.cache.get(roleId);
                if (!role) return message.reply(`❌ הרול של "${optionData.label}" לא נמצא. הגדר אותו מחדש עם \`!notifyroles role ${key} @רול\`.`);
                if (!role.editable) {
                    return message.reply(`❌ הבוט לא יכול להעניק את ${role}. העבר את תפקיד הבוט מעליו ובדוק שהרול אינו מנוהל.`);
                }
            }
            const panel = await publishNotificationRolePanel(channel, settings);
            return message.reply(`✅ פאנל בחירת הרולים פורסם או עודכן ב-${channel}: https://discord.com/channels/${message.guild.id}/${channel.id}/${panel.id}`);
        }
        if (['title', 'message', 'color'].includes(option)) {
            const value = args.slice(1).join(' ').trim();
            if (option === 'color') {
                if (!isValidColor(args[1])) return message.reply('צבע חייב להיות בפורמט `#RRGGBB`, לדוגמה `#5865F2`.');
                notificationSettings.color = args[1];
            } else {
                const maxLength = option === 'title' ? 256 : 3000;
                if (!value || value.length > maxLength) return message.reply(`נא לציין טקסט באורך 1-${maxLength} תווים.`);
                notificationSettings[option] = value;
            }
            saveData();
            const refreshed = await refreshNotificationRolePanel(message.guild, settings);
            return message.reply(`✅ ${option === 'title' ? 'כותרת' : option === 'message' ? 'תיאור' : 'צבע'} הפאנל עודכנו${refreshed ? ' והפאנל פורסם מחדש' : ''}.`);
        }
        return message.reply([
            '**פאנל בחירת רולי התראות**',
            '`!notifyroles role events @רול`',
            '`!notifyroles role giveaways @רול`',
            '`!notifyroles role announcements @רול`',
            '`!notifyroles setup [#ערוץ]` — פרסום או עדכון הפאנל',
            '`!notifyroles title <טקסט>` / `!notifyroles message <טקסט>` / `!notifyroles color #RRGGBB`',
            'אפשר להסיר שיוך רול עם `!notifyroles role <סוג> off`. לחיצה על הכפתורים בפאנל מעניקה את הרול או מסירה אותו.'
        ].join('\n'));
    }

    if (command === 'welcome') {
        const option = (args[0] || '').toLowerCase();
        if (option === 'test') {
            if (!await sendWelcome(message.member)) return message.reply('❌ קודם צריך להגדיר ערוץ עם `!welcome channel #ערוץ`.');
            return message.reply('🧪 בדיקת Welcome נשלחה לערוץ שהוגדר.');
        }
        if (option === 'channel') {
            const channel = message.mentions.channels.first();
            if (!isTextChannel(channel)) return message.reply('שימוש: `!welcome channel #ערוץ`.');
            settings.welcome.channelId = channel.id;
            saveData();
            return message.reply(`✅ ערוץ ה-Welcome עודכן ל-${channel}.`);
        }
        if (['title', 'message', 'greeting', 'tips'].includes(option)) {
            const value = args.slice(1).join(' ').trim();
            const maxLength = {
                title: 256,
                message: 1000,
                greeting: 300,
                tips: 1500
            }[option];
            if (!value || value.length > maxLength) {
                return message.reply(`נא לציין טקסט באורך 1-${maxLength} תווים.`);
            }
            settings.welcome[option] = value;
            saveData();
            const labels = { title: 'הכותרת', message: 'ההודעה', greeting: 'הברכה', tips: 'טיפי ההצטרפות' };
            return message.reply(`✅ ${labels[option]} של ה-Welcome עודכנו. הרץ \`!welcome test\` לתצוגה מקדימה.`);
        }
        if (option === 'color') {
            if (!isValidColor(args[1])) return message.reply('יש לציין צבע בפורמט `#RRGGBB`.');
            settings.welcome.color = args[1];
            saveData();
            return message.reply('✅ צבע ה-Welcome עודכן.');
        }
        if (option === 'off') {
            settings.welcome.channelId = null;
            saveData();
            return message.reply('✅ מערכת ה-Welcome כובתה.');
        }
        return message.reply([
            '**הגדרות Welcome**',
            '`!welcome channel #ערוץ` — בחירת ערוץ',
            '`!welcome title <טקסט>` — עריכת הכותרת',
            '`!welcome message <טקסט>` — עריכת הודעת הברכה',
            '`!welcome greeting <טקסט>` — עריכת הברכה שמעל הכרטיס',
            '`!welcome tips <טקסט>` — עריכת טיפים (אפשר להשתמש ב-`\\n` לשורות חדשות)',
            '`!welcome color #RRGGBB` — שינוי צבע ה-Embed',
            '`!welcome test` — שליחת הודעת בדיקה',
            '`!welcome off` — כיבוי המערכת',
            'משתנים זמינים בטקסטים: `{user}`, `{username}`, `{server}`, `{members}`, `{joined}`, `{created}`.'
        ].join('\n'));
    }

    if (command === 'tickets') {
        const option = (args[0] || '').toLowerCase();
        if (option === 'setup') {
            const channel = message.mentions.channels.first() || message.channel;
            if (!isTextChannel(channel)) return message.reply('בחר ערוץ טקסט לפאנל הטיקטים.');
            if (!settings.tickets.options.length) {
                return message.reply('❌ אין אפשרויות בתפריט. הוסף אפשרות עם `!tickets option add` או שחזר את ברירת המחדל עם `!tickets preset`.');
            }
            const panel = await publishTicketPanel(channel, settings);
            return message.reply(`✅ פאנל הטיקטים עודכן ב-${channel}: https://discord.com/channels/${message.guild.id}/${channel.id}/${panel.id}`);
        }
        if (option === 'preset') {
            settings.tickets.title = '🎫 מרכז התמיכה';
            settings.tickets.description = 'ברוכים הבאים למרכז התמיכה!\nבחרו את נושא הפנייה מהרשימה למטה.\n\n📩 לאחר הבחירה ייפתח ערוץ פרטי שבו תוכלו לפרט לצוות איך אפשר לעזור.';
            settings.tickets.options = DEFAULT_TICKET_OPTIONS.map(ticketOption => ({ ...ticketOption }));
            const channel = message.mentions.channels.first() || message.channel;
            if (!isTextChannel(channel)) return message.reply('בחר ערוץ טקסט לפאנל הטיקטים.');
            const panel = await publishTicketPanel(channel, settings);
            return message.reply(`✅ הוגדרו חמש אפשרויות הטיקטים בעברית והפאנל פורסם או עודכן ב-${channel}: https://discord.com/channels/${message.guild.id}/${channel.id}/${panel.id}`);
        }
        if (option === 'option') {
            const action = (args[1] || '').toLowerCase();
            if (action === 'list') {
                const options = settings.tickets.options;
                if (!options.length) return message.reply('תפריט הטיקטים ריק כרגע.');
                return message.reply(`**אפשרויות הטיקטים:**\n${options.map(item => `\`${item.id}\` — ${item.emoji || ''} ${item.label}: ${item.description}`).join('\n')}`);
            }
            if (action === 'remove') {
                const id = args[2]?.toLowerCase();
                const index = settings.tickets.options.findIndex(item => item.id === id);
                if (index < 0) return message.reply('לא מצאתי אפשרות כזו. בדוק עם `!tickets option list`.');
                const [removed] = settings.tickets.options.splice(index, 1);
                saveData();
                return message.reply(`✅ האפשרות "${removed.label}" הוסרה. הרץ \`!tickets setup\` כדי לפרסם תפריט מעודכן.`);
            }
            if (action === 'add' || action === 'edit') {
                const input = args.slice(2).join(' ');
                const match = /^([a-z0-9_-]{1,50})\s+(\S+)\s+([^|]+)\|(.+)$/i.exec(input);
                if (!match) {
                    return message.reply(`שימוש: \`!tickets option ${action} <id באנגלית> <אימוג׳י או -> <שם> | <תיאור>\`\nלדוגמה: \`!tickets option add billing 💳 תשלומים | שאלות על רכישות\``);
                }
                const id = match[1].toLowerCase();
                const emoji = match[2] === '-' ? '' : match[2];
                const label = match[3].trim();
                const description = match[4].trim();
                if (!label || label.length > 100 || !description || description.length > 100) {
                    return message.reply('שם האפשרות והתיאור חייבים להיות באורך 1-100 תווים.');
                }
                const existingIndex = settings.tickets.options.findIndex(item => item.id === id);
                if (action === 'add') {
                    if (existingIndex >= 0) return message.reply('המזהה הזה כבר קיים. השתמש ב-`edit` כדי לשנות אותו.');
                    if (settings.tickets.options.length >= 25) return message.reply('Discord מאפשר עד 25 אפשרויות בתפריט.');
                    settings.tickets.options.push({ id, emoji, label, description });
                } else {
                    if (existingIndex < 0) return message.reply('לא מצאתי אפשרות כזו. בדוק עם `!tickets option list`.');
                    settings.tickets.options[existingIndex] = { id, emoji, label, description };
                }
                saveData();
                return message.reply(`✅ אפשרות הטיקט ${action === 'add' ? 'נוספה' : 'עודכנה'}. הרץ \`!tickets setup\` כדי לפרסם תפריט מעודכן.`);
            }
            return message.reply('פקודות תפריט: `!tickets option list`, `!tickets option add <id> <אימוג׳י או -> <שם> | <תיאור>`, `!tickets option edit <id> <אימוג׳י או -> <שם> | <תיאור>`, `!tickets option remove <id>`.');
        }
        if (option === 'staff') {
            const action = (args[1] || '').toLowerCase();
            const roles = [...message.mentions.roles.values()].filter(role => role.id !== message.guild.id);
            if (action === 'list') {
                const roleIds = getTicketStaffRoleIds(settings);
                const rolesText = roleIds
                    .map(roleId => message.guild.roles.cache.get(roleId))
                    .filter(Boolean)
                    .map(role => role.toString());
                return message.reply(rolesText.length
                    ? `**רולי צוות הטיקטים:**\n${rolesText.join('\n')}`
                    : 'לא הוגדרו רולי צוות לטיקטים. הוסף אותם עם `!tickets staff @רול1 @רול2`.');
            }
            if (action === 'off') {
                settings.tickets.staffRoleIds = [];
                settings.tickets.staffRoleId = null;
                saveData();
                return message.reply('✅ כל רולי צוות הטיקטים הוסרו.');
            }
            if (action === 'add' || action === 'remove') {
                if (roles.length !== 1) {
                    return message.reply(`שימוש: \`!tickets staff ${action} @רול\`.`);
                }
                const roleId = roles[0].id;
                const staffRoleIds = [...getTicketStaffRoleIds(settings)];
                if (action === 'add') {
                    if (staffRoleIds.includes(roleId)) return message.reply('הרול הזה כבר מורשה לטיקטים.');
                    if (staffRoleIds.length >= 20) return message.reply('אפשר להגדיר עד 20 רולי צוות לטיקטים.');
                    staffRoleIds.push(roleId);
                } else {
                    const index = staffRoleIds.indexOf(roleId);
                    if (index < 0) return message.reply('הרול הזה לא נמצא ברשימת צוות הטיקטים.');
                    staffRoleIds.splice(index, 1);
                }
                settings.tickets.staffRoleIds = staffRoleIds;
                settings.tickets.staffRoleId = settings.tickets.staffRoleIds[0] || null;
                saveData();
                return message.reply(`✅ הרול ${roles[0]} ${action === 'add' ? 'נוסף לרשימת' : 'הוסר מרשימת'} צוות הטיקטים.`);
            }
            if (!roles.length || roles.length !== message.mentions.roles.size || roles.length > 20) {
                return message.reply('שימוש: `!tickets staff @רול1 @רול2` להגדרת כמה רולים, `!tickets staff add @רול`, `!tickets staff remove @רול`, `!tickets staff list` או `!tickets staff off`.');
            }
            settings.tickets.staffRoleIds = [...new Set(roles.map(role => role.id))];
            settings.tickets.staffRoleId = settings.tickets.staffRoleIds[0] || null;
            saveData();
            return message.reply(`✅ עודכנו ${settings.tickets.staffRoleIds.length} רולים לצוות הטיקטים:\n${roles.map(role => role.toString()).join(' ')}`);
        }
        if (option === 'category') {
            const category = message.mentions.channels.first();
            if (!category && args[1]?.toLowerCase() === 'off') {
                settings.tickets.categoryId = null;
                saveData();
                return message.reply('✅ הטיקטים ייפתחו ללא קטגוריה.');
            }
            if (!category || category.type !== ChannelType.GuildCategory) return message.reply('שימוש: `!tickets category #קטגוריה`.');
            settings.tickets.categoryId = category.id;
            saveData();
            return message.reply(`✅ קטגוריית הטיקטים עודכנה ל-${category.name}.`);
        }
        if (option === 'title' || option === 'message') {
            const value = args.slice(1).join(' ').trim();
            const maxLength = option === 'title' ? 256 : 1000;
            if (!value || value.length > maxLength) return message.reply(`נא לציין טקסט עד ${maxLength} תווים.`);
            settings.tickets[option === 'title' ? 'title' : 'description'] = value;
            saveData();
            return message.reply('✅ פאנל הטיקטים עודכן.');
        }
        return message.reply('הגדרות טיקטים: `!tickets preset` לשחזור הפאנל העברי, `!tickets setup [#ערוץ]` לפרסום/עדכון הפאנל, `!tickets category #קטגוריה|off`, `!tickets staff @רול1 @רול2`, `!tickets staff add/remove @רול`, `!tickets staff list/off`, `!tickets title טקסט`, `!tickets message טקסט`, `!tickets option` לעריכת אפשרויות התפריט.');
    }

    if (command === 'staffapply') {
        const option = (args[0] || '').toLowerCase();
        if (option === 'setup') {
            const applicationSettings = settings.staffApplication;
            const panel = new EmbedBuilder()
                .setColor(settings.color || DEFAULT_COLOR)
                .setTitle(applicationSettings.title)
                .setDescription(applicationSettings.description);
            const button = new ButtonBuilder()
                .setCustomId('staff_application_open')
                .setLabel(applicationSettings.buttonLabel)
                .setEmoji('📋')
                .setStyle(ButtonStyle.Primary);
            await message.channel.send({
                embeds: [panel],
                components: [new ActionRowBuilder().addComponents(button)]
            });
            return message.reply('✅ פאנל בחינות הצוות נשלח.');
        }
        if (option === 'title' || option === 'message' || option === 'button') {
            const value = args.slice(1).join(' ').trim();
            const limits = { title: 256, message: 4000, button: 80 };
            if (!value || value.length > limits[option]) {
                return message.reply(`נא לציין טקסט באורך 1-${limits[option]} תווים.`);
            }
            settings.staffApplication[option === 'message' ? 'description' : option === 'button' ? 'buttonLabel' : 'title'] = value;
            saveData();
            return message.reply('✅ פאנל בחינות הצוות עודכן. הרץ `!staffapply setup` כדי לפרסם אותו מחדש.');
        }
        return message.reply('הגדרות בחינות צוות: `!staffapply setup`, `!staffapply title טקסט`, `!staffapply message טקסט`, `!staffapply button טקסט`. הטיקטים ייפתחו בקטגוריית `!tickets category` ויישלחו לרול שהוגדר ב-`!config staff`.');
    }

    if (command === 'levelrole') {
        if ((args[0] || '').toLowerCase() === 'remove') {
            const level = Number(args[1]);
            if (!Number.isInteger(level) || !settings.xp.levelRoles[String(level)]) return message.reply('שימוש: `!levelrole remove <רמה>`.');
            delete settings.xp.levelRoles[String(level)];
            saveData();
            return message.reply(`✅ רול התגמול של רמה ${level} הוסר.`);
        }
        const level = Number(args[0]);
        const role = message.mentions.roles.first();
        if (!Number.isInteger(level) || level < 2 || level > 10000 || !role || role.id === message.guild.id) {
            return message.reply('שימוש: `!levelrole <רמה> @רול`.');
        }
        settings.xp.levelRoles[String(level)] = role.id;
        saveData();
        return message.reply(`✅ מי שיגיע לרמה ${level} יקבל את ${role}.`);
    }

    if (command === 'shopadd') {
        const role = message.mentions.roles.first();
        const roleMention = message.mentions.roles.first()?.id;
        const mentionIndex = roleMention ? message.content.indexOf(`<@&${roleMention}>`) : -1;
        const remainder = mentionIndex >= 0 ? message.content.slice(mentionIndex + `<@&${roleMention}>`.length).trim() : '';
        const match = /^(\d+)\s+(.+)$/.exec(remainder);
        if (!role || role.id === message.guild.id || !match || !Number.isSafeInteger(Number(match[1]))
            || Number(match[1]) < 1 || Number(match[1]) > 1000000000 || match[2].length > 80) {
            return message.reply('שימוש: `!shopadd @רול <מחיר XP> <שם הפריט>`.');
        }
        if (settings.shop.some(item => item.roleId === role.id)) return message.reply('❌ הרול הזה כבר נמצא בחנות.');
        if (settings.shop.length >= 25) return message.reply('❌ החנות יכולה להכיל עד 25 פריטים.');
        settings.shop.push({ roleId: role.id, cost: Number(match[1]), name: match[2] });
        saveData();
        return message.reply(`✅ ${role} נוסף/ה לחנות במחיר ${match[1]} XP.`);
    }

    if (command === 'shopremove') {
        const index = Number(args[0]) - 1;
        if (!Number.isInteger(index) || !settings.shop[index]) return message.reply('מספר פריט לא תקין. בדוק ב-`!shop`.');
        const [removed] = settings.shop.splice(index, 1);
        saveData();
        return message.reply(`🗑️ הפריט "${removed.name}" הוסר מהחנות.`);
    }

    if (command === 'shopchannel') {
        const channel = message.mentions.channels.first();
        if (args[0]?.toLowerCase() === 'off') {
            settings.shopChannelId = null;
            saveData();
            return message.reply('✅ הוסר ערוץ הפרסום הקבוע של חנות ה-XP.');
        }
        if (!isTextChannel(channel)) return message.reply('שימוש: `!shopchannel #ערוץ` או `!shopchannel off`.');
        settings.shopChannelId = channel.id;
        saveData();
        return message.reply(`✅ חנות ה-XP תפורסם בערוץ ${channel} כשתריץ \`!shop post\`.`);
    }

    if (command === 'shopconfig') {
        const option = (args[0] || '').toLowerCase();
        if (!['title', 'message', 'button'].includes(option)) {
            return message.reply('הגדרות החנות: `!shopconfig title טקסט`, `!shopconfig message טקסט`, `!shopconfig button טקסט`.');
        }
        const value = args.slice(1).join(' ').trim();
        const maxLength = option === 'title' ? 256 : option === 'message' ? 1000 : 150;
        if (!value || value.length > maxLength) {
            return message.reply(`נא לציין טקסט באורך 1-${maxLength} תווים.`);
        }
        settings.shopPanel[option === 'message' ? 'description' : option === 'button' ? 'buttonLabel' : 'title'] = value;
        saveData();
        return message.reply('✅ עיצוב החנות עודכן. הרץ `!shop post` כדי לפרסם עותק מעודכן בערוץ החנות.');
    }

    if (command === 'xpadd') {
        const target = message.mentions.users.first();
        const amount = Number(args.find(argument => /^\d+$/.test(argument)));
        if (!target || !Number.isInteger(amount) || amount < 1 || amount > 1000000) {
            return message.reply('שימוש: `!xpadd @משתמש <כמות>` (1 עד 1,000,000).');
        }
        const memberData = getMemberData(message.guild.id, target.id);
        const oldLevel = memberData.level;
        const reachedLevels = addXp(memberData, amount);
        saveData();
        const targetMember = message.guild.members.cache.get(target.id);
        if (targetMember) await grantLevelRoles(targetMember, reachedLevels, settings);
        return message.reply(`✅ נוספו ${amount} XP ל-${target}. כעת יש לו/ה ${memberData.xp} XP${memberData.level > oldLevel ? ` ועלתה/ה לרמה ${memberData.level}` : ''}.`);
    }

    if (command === 'leveltest') {
        const member = message.mentions.members.first() || message.member;
        const stats = data.members[member.id] || { xp: 0, levelXp: 0, level: 1 };
        const nextLevel = stats.level + 1;
        const projectedXp = stats.xp + Math.max(0, stats.level * 100 - stats.levelXp);
        const channel = message.guild.channels.cache.get(settings.xp.levelChannelId) || message.channel;
        await channel.send({
            embeds: [buildLevelUpEmbed(member, settings, nextLevel, projectedXp)],
            allowedMentions: { users: [member.id], parse: [] }
        });
        return message.reply(`🧪 הודעת בדיקה נשלחה ב-${channel}. לא שונו נתוני ה-XP או הרמה של ${member}.`);
    }

    if (command === 'giveawayconfig') {
        const option = (args[0] || '').toLowerCase();
        const value = args.slice(1).join(' ').trim();
        const optionNames = {
            title: 'כותרת ההגרלה',
            description: 'תיאור ההגרלה',
            message: 'תיאור ההגרלה',
            button: 'טקסט כפתור ההרשמה',
            winner: 'הודעת הזכייה',
            'winner-title': 'כותרת הודעת הזכייה',
            color: 'צבע ההגרלה'
        };
        if (!option) {
            return message.reply([
                '**עיצוב הגרלות**',
                '`!giveawayconfig title <כותרת>`',
                '`!giveawayconfig description <תיאור>`',
                '`!giveawayconfig button <טקסט כפתור>`',
                '`!giveawayconfig winner <הודעת זכייה>`',
                '`!giveawayconfig winner-title <כותרת הודעת הזכייה>`',
                '`!giveawayconfig color #RRGGBB`',
                'בהודעות אפשר להשתמש ב-`{user}`, `{host}`, `{prize}`, `{role}` ו-`{participants}`.',
                'השינויים מתעדכנים גם בהגרלות פעילות.'
            ].join('\n'));
        }
        if (option === 'reset') {
            data.settings.giveaway = { ...createGuildData().settings.giveaway };
        } else {
            const settingKey = {
                title: 'title',
                description: 'description',
                message: 'description',
                button: 'buttonLabel',
                winner: 'winnerMessage',
                'winner-title': 'winnerTitle'
            }[option];
            if (option !== 'color' && !settingKey) {
                return message.reply('אפשרויות: `title`, `description`, `button`, `winner`, `winner-title`, `color`, `reset`.');
            }
            if (!value) return message.reply(`יש לציין ${optionNames[option] || 'ערך'} חדש.`);
            if (option === 'color') {
                if (!isValidColor(value)) return message.reply('צבע חייב להיות בפורמט `#RRGGBB`, לדוגמה `#2ECC71`.');
                settings.giveaway.color = value;
            } else {
                const maxLength = settingKey === 'title' || settingKey === 'winnerTitle'
                    ? 256
                    : settingKey === 'buttonLabel' ? 80
                        : settingKey === 'description' ? 2500 : 3000;
                if (value.length > maxLength) {
                    return message.reply(`הטקסט חייב להכיל בין 1 ל-${maxLength} תווים.`);
                }
                settings.giveaway[settingKey] = value;
            }
        }
        saveData();
        let updateFailures = 0;
        for (const [id, game] of Object.entries(data.games)) {
            if (game.type !== 'giveaway' || game.ended) continue;
            try {
                await refreshGameMessage(message.guild, game, id);
            } catch (error) {
                updateFailures += 1;
                console.error(`לא הצלחתי לעדכן את עיצוב ההגרלה הפעילה ${id}:`, error);
            }
        }
        return message.reply(`✅ ${option === 'reset' ? 'עיצוב ההגרלות אופס' : 'עיצוב ההגרלות עודכן'}${updateFailures ? `, אך לא הצלחתי לעדכן ${updateFailures} הודעות פעילות (הפרטים נרשמו ביומן)` : ', כולל הגרלות פעילות'}.`);
    }

    if (command === 'giveaway' || command === 'drop') {
        const duration = parseDuration(args[0]);
        const role = command === 'giveaway' ? message.mentions.roles.first() : null;
        const prizeText = (role
            ? args.slice(1).filter(argument => argument !== `<@&${role.id}>`)
            : args.slice(1)).join(' ').trim();
        const xpDropMatch = command === 'drop' ? /^(\d+)\s*xp$/i.exec(prizeText) : null;
        const rewardXp = xpDropMatch ? Number(xpDropMatch[1]) : null;
        const prize = rewardXp ? `${rewardXp} XP` : prizeText;
        if (xpDropMatch && (!Number.isSafeInteger(rewardXp) || rewardXp < 1 || rewardXp > 1000000)) {
            return message.reply('כמות ה-XP בדרופ חייבת להיות בין 1 ל-1,000,000.');
        }
        if (!duration || (!role && !prize) || prize.length > 500) {
            return message.reply(`שימוש: \`${settings.prefix}${command} <זמן> <פרס>\` (10 שניות עד 30 ימים). לדרופ XP: \`${settings.prefix}drop 30s 500 XP\`. להענקת רול אוטומטית בהגרלה: \`${settings.prefix}giveaway <זמן> @רול\`.`);
        }
        const id = await startGame(message, command === 'drop' ? 'drop' : 'giveaway', duration, prize, role?.id || null, rewardXp);
        return message.reply(`✅ ${command === 'drop' ? 'הדרופ' : 'ההגרלה'} נפתחה. מזהה לסיום מוקדם: \`${id}\`.`);
    }

    if (command === 'endgiveaway' || command === 'enddrop') {
        const id = args[0];
        if (!id) return message.reply('שימוש: `!endgiveaway <מזהה>`.');
        const game = getGuildData(message.guild.id).games[id];
        if (!game) return message.reply('❌ לא נמצאה הגרלה או דרופ עם המזהה הזה.');
        if (game.ended) return message.reply('ההגרלה או הדרופ כבר הסתיימו.');
        const winnerId = await finishGame(message.guild, id);
        return message.reply(winnerId ? `✅ המשחק הסתיים. הזוכה: <@${winnerId}>.` : '✅ המשחק הסתיים ללא זוכים.');
    }

    if (command === 'purge') {
        const count = Number(args[0]);
        if (!Number.isInteger(count) || count < 1 || count > 100) return message.reply('שימוש: `!purge <1-100>`.');
        const deleted = await message.channel.bulkDelete(count, true);
        const summary = await message.channel.send(`🧹 נמחקו ${deleted.size} הודעות.`);
        setTimeout(() => summary.delete().catch(console.error), 5000);
        return;
    }

    if (command === 'announce') {
        const channel = message.mentions.channels.first();
        const channelMention = channel ? `<#${channel.id}>` : null;
        const channelIndex = channelMention ? message.content.indexOf(channelMention) : -1;
        const text = channelIndex >= 0 ? message.content.slice(channelIndex + channelMention.length).trim() : '';
        if (!isTextChannel(channel) || !text || text.length > 4000) return message.reply('שימוש: `!announce #ערוץ <הודעה>` (הודעה עד 4000 תווים).');
        await channel.send({
            embeds: [new EmbedBuilder().setColor(settings.color || DEFAULT_COLOR).setDescription(text).setTimestamp()],
            allowedMentions: { parse: [] }
        });
        return message.reply(`✅ ההודעה נשלחה ל-${channel}.`);
    }

    return null;
}

client.once('ready', () => {
    console.log(`✅ הבוט מחובר בתור ${client.user.tag}`);
    client.user.setPresence({ activities: [], status: 'online' });
    for (const guild of client.guilds.cache.values()) {
        checkVeteranRoles(guild).catch(error => console.error(`שגיאה בסריקת רולי ותק בשרת ${guild.id}:`, error));
    }
    setInterval(async () => {
        for (const guild of client.guilds.cache.values()) {
            const { games } = getGuildData(guild.id);
            for (const [id, game] of Object.entries(games)) {
                if (!game.ended && game.endsAt <= Date.now()) {
                    try {
                        await finishGame(guild, id);
                    } catch (error) {
                        console.error(`שגיאה בסיום משחק ${id}:`, error);
                    }
                }
            }
        }
    }, 15000);
    setInterval(() => {
        for (const guild of client.guilds.cache.values()) {
            checkVeteranRoles(guild).catch(error => console.error(`שגיאה בסריקת רולי ותק בשרת ${guild.id}:`, error));
        }
    }, 6 * 60 * 60 * 1000);
});

client.on('guildMemberAdd', async member => {
    try { await sendWelcome(member); }
    catch (error) { console.error('לא הצלחתי לשלוח הודעת Welcome:', error); }
    try { await awardVeteranRole(member); }
    catch (error) { console.error('לא הצלחתי להעניק רול ותיקים למצטרף/ת:', error); }
    await sendGuildLog(member.guild, 'member-join', {
        description: `${member} הצטרף/ה לשרת.`,
        fields: [
            { name: 'נוצר חשבון', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true },
            { name: 'מזהה משתמש', value: member.id, inline: true }
        ],
        user: member.user
    });
});

client.on('guildMemberRemove', async member => {
    await sendGuildLog(member.guild, 'member-leave', {
        description: `${member.user} עזב/ה את השרת.`,
        fields: [{ name: 'מזהה משתמש', value: member.id }],
        user: member.user
    });
});

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const fields = [];
    if (oldMember.nickname !== newMember.nickname) {
        fields.push({
            name: 'כינוי',
            value: `לפני: ${oldMember.nickname || oldMember.user.username}\nאחרי: ${newMember.nickname || newMember.user.username}`
        });
    }
    const oldRoles = new Set(oldMember.roles.cache.keys());
    const newRoles = new Set(newMember.roles.cache.keys());
    const addedRoles = [...newRoles].filter(roleId => !oldRoles.has(roleId)).map(roleId => newMember.guild.roles.cache.get(roleId)).filter(Boolean);
    const removedRoles = [...oldRoles].filter(roleId => !newRoles.has(roleId)).map(roleId => newMember.guild.roles.cache.get(roleId)).filter(Boolean);
    if (addedRoles.length) fields.push({ name: 'רולים שנוספו', value: addedRoles.map(role => `${role}`).join(', ') });
    if (removedRoles.length) fields.push({ name: 'רולים שהוסרו', value: removedRoles.map(role => role.name).join(', ') });
    if (oldMember.communicationDisabledUntilTimestamp !== newMember.communicationDisabledUntilTimestamp) {
        fields.push({
            name: 'הגבלת תקשורת',
            value: newMember.communicationDisabledUntilTimestamp
                ? `עד <t:${Math.floor(newMember.communicationDisabledUntilTimestamp / 1000)}:F>`
                : 'ההגבלה הוסרה'
        });
    }
    if (oldMember.premiumSinceTimestamp !== newMember.premiumSinceTimestamp) {
        fields.push({
            name: 'בוסט לשרת',
            value: newMember.premiumSinceTimestamp ? 'החבר/ה התחיל/ה לתת בוסט 🚀' : 'החבר/ה הפסיק/ה לתת בוסט'
        });
    }
    if (!fields.length) return;
    await sendGuildLog(newMember.guild, 'member-update', {
        description: `עודכנו פרטים של ${newMember}.`,
        fields,
        user: newMember.user
    });
});

client.on('messageDelete', async message => {
    if (!message.guild || message.author?.bot) return;
    await sendGuildLog(message.guild, 'message-delete', {
        description: message.partial ? 'נמחקה הודעה שלא הייתה זמינה במטמון.' : formatLogValue(message.content, 1500),
        fields: [
            { name: 'נשלחה על ידי', value: message.author ? `${message.author}` : 'לא ידוע', inline: true },
            { name: 'ערוץ', value: `${message.channel}`, inline: true },
            { name: 'מזהה הודעה', value: message.id, inline: true }
        ],
        user: message.author
    });
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (!newMessage.guild || newMessage.author?.bot) return;
    if (oldMessage.partial || newMessage.partial) {
        try {
            if (oldMessage.partial) await oldMessage.fetch();
            if (newMessage.partial) await newMessage.fetch();
        } catch (error) {
            console.error(`לא הצלחתי לטעון הודעה חלקית לעריכת לוג בשרת ${newMessage.guild.id}:`, error);
        }
    }
    if (oldMessage.content === newMessage.content) return;
    await sendGuildLog(newMessage.guild, 'message-edit', {
        description: `${newMessage.author} ערך/ה הודעה ב-${newMessage.channel}.`,
        fields: [
            { name: 'לפני', value: oldMessage.partial ? 'תוכן ההודעה המקורי לא זמין במטמון.' : formatLogValue(oldMessage.content, 1000) },
            { name: 'אחרי', value: formatLogValue(newMessage.content, 1000) },
            { name: 'קישור להודעה', value: `[פתיחת ההודעה](${newMessage.url})` }
        ],
        user: newMessage.author
    });
});

client.on('messageDeleteBulk', async (messages, channel) => {
    const guild = channel.guild;
    if (!guild) return;
    const authors = new Set([...messages.values()].map(message => message.author?.tag).filter(Boolean));
    await sendGuildLog(guild, 'message-bulk-delete', {
        description: `נמחקו **${messages.size} הודעות** ב-${channel}.`,
        fields: [{ name: 'כותבים שנכללו', value: [...authors].slice(0, 20).join(', ') || 'לא ידוע' }]
    });
});

client.on('messageReactionAdd', async (reaction, user) => {
    const message = reaction.message;
    if (!message.guild || user.bot) return;
    await sendGuildLog(message.guild, 'reaction-add', {
        description: `${user} הוסיף/ה תגובה ${reaction.emoji} ב-${message.channel}.`,
        fields: [{ name: 'קישור להודעה', value: `[פתיחת ההודעה](${message.url})` }],
        user
    });
});

client.on('messageReactionRemove', async (reaction, user) => {
    const message = reaction.message;
    if (!message.guild || user.bot) return;
    await sendGuildLog(message.guild, 'reaction-remove', {
        description: `${user} הסיר/ה תגובה ${reaction.emoji} מ-${message.channel}.`,
        fields: [{ name: 'קישור להודעה', value: `[פתיחת ההודעה](${message.url})` }],
        user
    });
});

client.on('messageReactionRemoveAll', async (message, reactions) => {
    if (!message.guild) return;
    await sendGuildLog(message.guild, 'reaction-remove-all', {
        description: `הוסרו כל התגובות (${reactions.size}) מהודעה ב-${message.channel}.`,
        fields: [{ name: 'קישור להודעה', value: `[פתיחת ההודעה](${message.url})` }]
    });
});

client.on('channelPinsUpdate', async (channel, lastPinAt) => {
    if (!channel.guild) return;
    await sendGuildLog(channel.guild, 'pins-update', {
        description: `רשימת ההודעות הנעוצות ב-${channel} עודכנה.`,
        fields: [{ name: 'נעיצה אחרונה', value: lastPinAt ? `<t:${Math.floor(lastPinAt.getTime() / 1000)}:F>` : 'אין הודעות נעוצות' }]
    });
});

client.on('channelCreate', async channel => {
    if (!channel.guild) return;
    await sendGuildLog(channel.guild, 'channel-create', {
        description: `נוצר ערוץ ${channel}.`,
        fields: [
            { name: 'שם', value: channel.name, inline: true },
            { name: 'מזהה', value: channel.id, inline: true },
            { name: 'סוג', value: String(channel.type), inline: true }
        ]
    });
});

client.on('channelDelete', async channel => {
    if (!channel.guild) return;
    await sendGuildLog(channel.guild, 'channel-delete', {
        description: `נמחק הערוץ **${channel.name}**.`,
        fields: [{ name: 'מזהה ערוץ', value: channel.id }]
    });
});

client.on('channelUpdate', async (oldChannel, newChannel) => {
    if (!newChannel.guild) return;
    const fields = [];
    for (const [label, oldValue, newValue] of [
        ['שם', oldChannel.name, newChannel.name],
        ['נושא', oldChannel.topic, newChannel.topic],
        ['קטגוריה', oldChannel.parentId, newChannel.parentId],
        ['איטיות הודעות', oldChannel.rateLimitPerUser, newChannel.rateLimitPerUser],
        ['NSFW', oldChannel.nsfw, newChannel.nsfw]
    ]) {
        if (oldValue !== newValue) fields.push({ name: label, value: `לפני: ${oldValue ?? '—'}\nאחרי: ${newValue ?? '—'}` });
    }
    if (!fields.length) return;
    await sendGuildLog(newChannel.guild, 'channel-update', {
        description: `עודכן הערוץ ${newChannel}.`,
        fields
    });
});

client.on('roleCreate', async role => {
    await sendGuildLog(role.guild, 'role-create', {
        description: `נוצר הרול ${role}.`,
        fields: [{ name: 'מזהה רול', value: role.id }],
        thumbnail: role.iconURL?.({ size: 256 }) || null
    });
});

client.on('roleDelete', async role => {
    await sendGuildLog(role.guild, 'role-delete', {
        description: `נמחק הרול **${role.name}**.`,
        fields: [{ name: 'מזהה רול', value: role.id }]
    });
});

client.on('roleUpdate', async (oldRole, newRole) => {
    const fields = [];
    for (const [label, oldValue, newValue] of [
        ['שם', oldRole.name, newRole.name],
        ['צבע', oldRole.hexColor, newRole.hexColor],
        ['מוצג בנפרד', oldRole.hoist, newRole.hoist],
        ['ניתן לאזכור', oldRole.mentionable, newRole.mentionable],
        ['הרשאות', oldRole.permissions.bitfield.toString(), newRole.permissions.bitfield.toString()]
    ]) {
        if (oldValue !== newValue) fields.push({ name: label, value: `לפני: ${oldValue}\nאחרי: ${newValue}` });
    }
    if (!fields.length) return;
    await sendGuildLog(newRole.guild, 'role-update', {
        description: `עודכן הרול ${newRole}.`,
        fields
    });
});

client.on('guildBanAdd', async ban => {
    await sendGuildLog(ban.guild, 'ban-add', {
        description: `${ban.user} נחסם/ה מהשרת.`,
        fields: [
            { name: 'סיבה', value: ban.reason || 'לא צוינה סיבה' },
            { name: 'מזהה משתמש', value: ban.user.id }
        ],
        user: ban.user
    });
});

client.on('guildBanRemove', async ban => {
    await sendGuildLog(ban.guild, 'ban-remove', {
        description: `החסימה של ${ban.user} הוסרה.`,
        fields: [{ name: 'מזהה משתמש', value: ban.user.id }],
        user: ban.user
    });
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    const member = newState.member || oldState.member;
    if (!member) return;
    const fields = [];
    if (oldState.channelId !== newState.channelId) {
        fields.push({
            name: 'ערוץ קולי',
            value: `לפני: ${oldState.channel?.name || 'מנותק/ת'}\nאחרי: ${newState.channel?.name || 'מנותק/ת'}`
        });
    }
    for (const [label, oldValue, newValue] of [
        ['השתקה עצמית', oldState.selfMute, newState.selfMute],
        ['חירשות עצמית', oldState.selfDeaf, newState.selfDeaf],
        ['הושתק/ה על ידי שרת', oldState.serverMute, newState.serverMute],
        ['חירשות על ידי שרת', oldState.serverDeaf, newState.serverDeaf],
        ['שיתוף מסך', oldState.streaming, newState.streaming],
        ['מצלמה', oldState.selfVideo, newState.selfVideo]
    ]) {
        if (oldValue !== newValue) fields.push({ name: label, value: newValue ? 'הופעל' : 'כובה', inline: true });
    }
    if (!fields.length) return;
    await sendGuildLog(newState.guild, 'voice', {
        description: `עודכנה פעילות קולית של ${member}.`,
        fields,
        user: member.user
    });
});

client.on('emojiCreate', async emoji => {
    await sendGuildLog(emoji.guild, 'emoji-create', {
        description: `נוצר האימוג׳י ${emoji}.`,
        fields: [{ name: 'שם', value: emoji.name || 'ללא שם', inline: true }, { name: 'מזהה', value: emoji.id, inline: true }]
    });
});

client.on('emojiDelete', async emoji => {
    await sendGuildLog(emoji.guild, 'emoji-delete', {
        description: `נמחק האימוג׳י **${emoji.name || 'ללא שם'}**.`,
        fields: [{ name: 'מזהה', value: emoji.id }]
    });
});

client.on('emojiUpdate', async (oldEmoji, newEmoji) => {
    if (oldEmoji.name === newEmoji.name) return;
    await sendGuildLog(newEmoji.guild, 'emoji-update', {
        description: `שם האימוג׳י עודכן.`,
        fields: [
            { name: 'לפני', value: oldEmoji.name || 'ללא שם', inline: true },
            { name: 'אחרי', value: newEmoji.name || 'ללא שם', inline: true },
            { name: 'מזהה', value: newEmoji.id, inline: true }
        ]
    });
});

client.on('threadCreate', async thread => {
    await sendGuildLog(thread.guild, 'thread-create', {
        description: `נוצר שרשור **${thread.name}** ב-${thread.parent}.`,
        fields: [{ name: 'מזהה שרשור', value: thread.id }]
    });
});

client.on('threadDelete', async thread => {
    await sendGuildLog(thread.guild, 'thread-delete', {
        description: `נמחק השרשור **${thread.name}**.`,
        fields: [{ name: 'מזהה שרשור', value: thread.id }]
    });
});

client.on('threadUpdate', async (oldThread, newThread) => {
    const fields = [];
    for (const [label, oldValue, newValue] of [
        ['שם', oldThread.name, newThread.name],
        ['ארכיון', oldThread.archived, newThread.archived],
        ['נעול', oldThread.locked, newThread.locked],
        ['איטיות הודעות', oldThread.rateLimitPerUser, newThread.rateLimitPerUser]
    ]) {
        if (oldValue !== newValue) fields.push({ name: label, value: `לפני: ${oldValue ?? '—'}\nאחרי: ${newValue ?? '—'}` });
    }
    if (!fields.length) return;
    await sendGuildLog(newThread.guild, 'thread-update', {
        description: `עודכן השרשור **${newThread.name}**.`,
        fields
    });
});

client.on('inviteCreate', async invite => {
    if (!invite.guild) return;
    await sendGuildLog(invite.guild, 'invite-create', {
        description: `נוצר קישור הזמנה ל-${invite.channel || 'ערוץ לא ידוע'}.`,
        fields: [
            { name: 'קוד', value: invite.code, inline: true },
            { name: 'יוצר', value: invite.inviter ? `${invite.inviter}` : 'לא ידוע', inline: true },
            { name: 'תפוגה', value: invite.expiresAt ? `<t:${Math.floor(invite.expiresAt.getTime() / 1000)}:R>` : 'ללא תפוגה', inline: true }
        ],
        user: invite.inviter
    });
});

client.on('inviteDelete', async invite => {
    if (!invite.guild) return;
    await sendGuildLog(invite.guild, 'invite-delete', {
        description: `נמחק קישור הזמנה **${invite.code}**.`,
        fields: [{ name: 'ערוץ', value: invite.channel ? `${invite.channel}` : 'לא ידוע' }]
    });
});

client.on('guildScheduledEventCreate', async event => {
    await sendGuildLog(event.guild, 'scheduled-event-create', {
        description: `נוצר אירוע **${event.name}**.`,
        fields: [{ name: 'מתחיל', value: `<t:${Math.floor(event.scheduledStartTimestamp / 1000)}:F>` }]
    });
});

client.on('guildScheduledEventDelete', async event => {
    await sendGuildLog(event.guild, 'scheduled-event-delete', {
        description: `נמחק האירוע **${event.name}**.`
    });
});

client.on('guildScheduledEventUpdate', async (oldEvent, newEvent) => {
    const fields = [];
    for (const [label, oldValue, newValue] of [
        ['שם', oldEvent.name, newEvent.name],
        ['תיאור', oldEvent.description, newEvent.description],
        ['מועד התחלה', oldEvent.scheduledStartTimestamp, newEvent.scheduledStartTimestamp],
        ['מיקום', oldEvent.entityMetadata?.location, newEvent.entityMetadata?.location]
    ]) {
        if (oldValue !== newValue) fields.push({ name: label, value: `לפני: ${oldValue ?? '—'}\nאחרי: ${newValue ?? '—'}` });
    }
    if (!fields.length) return;
    await sendGuildLog(newEvent.guild, 'scheduled-event-update', {
        description: `עודכן האירוע **${newEvent.name}**.`,
        fields
    });
});

client.on('stageInstanceCreate', async stage => {
    if (!stage.guild) return;
    await sendGuildLog(stage.guild, 'stage-create', {
        description: `נפתחה במה ב-${stage.channel || stage.channelId}.`,
        fields: [{ name: 'נושא', value: stage.topic }]
    });
});

client.on('stageInstanceUpdate', async (oldStage, newStage) => {
    if (!newStage.guild || !oldStage || oldStage.topic === newStage.topic) return;
    await sendGuildLog(newStage.guild, 'stage-update', {
        description: `עודכן נושא הבמה ב-${newStage.channel || newStage.channelId}.`,
        fields: [{ name: 'נושא קודם', value: oldStage.topic }, { name: 'נושא חדש', value: newStage.topic }]
    });
});

client.on('stageInstanceDelete', async stage => {
    if (!stage.guild) return;
    await sendGuildLog(stage.guild, 'stage-delete', {
        description: `הבמה ב-${stage.channel || stage.channelId} נסגרה.`,
        fields: [{ name: 'נושא', value: stage.topic }]
    });
});

client.on('stickerCreate', async sticker => {
    if (!sticker.guild) return;
    await sendGuildLog(sticker.guild, 'sticker-create', {
        description: `נוצרה המדבקה **${sticker.name}**.`,
        fields: [{ name: 'תיאור', value: sticker.description || 'ללא תיאור' }, { name: 'מזהה', value: sticker.id }]
    });
});

client.on('stickerDelete', async sticker => {
    if (!sticker.guild) return;
    await sendGuildLog(sticker.guild, 'sticker-delete', {
        description: `נמחקה המדבקה **${sticker.name}**.`,
        fields: [{ name: 'מזהה', value: sticker.id }]
    });
});

client.on('stickerUpdate', async (oldSticker, newSticker) => {
    if (!newSticker.guild) return;
    const fields = [];
    if (oldSticker.name !== newSticker.name) fields.push({ name: 'שם', value: `לפני: ${oldSticker.name}\nאחרי: ${newSticker.name}` });
    if (oldSticker.description !== newSticker.description) fields.push({ name: 'תיאור', value: `לפני: ${oldSticker.description || '—'}\nאחרי: ${newSticker.description || '—'}` });
    if (!fields.length) return;
    await sendGuildLog(newSticker.guild, 'sticker-update', {
        description: `עודכנה המדבקה **${newSticker.name}**.`,
        fields
    });
});

client.on('autoModerationActionExecution', async execution => {
    const rule = execution.autoModerationRule;
    await sendGuildLog(execution.guild, 'automod-action', {
        description: `AutoMod הפעיל את הכלל **${rule?.name || execution.ruleId}**.`,
        fields: [
            { name: 'משתמש', value: execution.user ? `${execution.user}` : `<@${execution.userId}>`, inline: true },
            { name: 'ערוץ', value: execution.channel ? `${execution.channel}` : 'לא ידוע', inline: true },
            { name: 'פעולה', value: String(execution.action.type), inline: true },
            { name: 'תוכן שסומן', value: execution.matchedContent || 'לא זמין' }
        ],
        user: execution.user
    });
});

client.on('autoModerationRuleCreate', async rule => {
    await sendGuildLog(rule.guild, 'automod-rule-create', {
        description: `נוצר כלל AutoMod בשם **${rule.name}**.`,
        fields: [{ name: 'יוצר הכלל', value: `<@${rule.creatorId}>` }, { name: 'מזהה כלל', value: rule.id }]
    });
});

client.on('autoModerationRuleDelete', async rule => {
    await sendGuildLog(rule.guild, 'automod-rule-delete', {
        description: `נמחק כלל AutoMod בשם **${rule.name}**.`,
        fields: [{ name: 'מזהה כלל', value: rule.id }]
    });
});

client.on('autoModerationRuleUpdate', async (oldRule, newRule) => {
    const fields = [];
    if (!oldRule || oldRule.name !== newRule.name) fields.push({ name: 'שם הכלל', value: `לפני: ${oldRule?.name || '—'}\nאחרי: ${newRule.name}` });
    if (!oldRule || oldRule.enabled !== newRule.enabled) fields.push({ name: 'מצב', value: newRule.enabled ? 'מופעל' : 'כבוי', inline: true });
    if (!fields.length) return;
    await sendGuildLog(newRule.guild, 'automod-rule-update', {
        description: `עודכן כלל AutoMod **${newRule.name}**.`,
        fields
    });
});

client.on('guildIntegrationsUpdate', async guild => {
    await sendGuildLog(guild, 'integration-update', {
        description: 'הגדרות האינטגרציות של השרת עודכנו.'
    });
});

client.on('webhooksUpdate', async channel => {
    if (!channel.guild) return;
    await sendGuildLog(channel.guild, 'webhook-update', {
        description: `ה-Webhooks של ${channel} עודכנו.`,
        fields: [{ name: 'מזהה ערוץ', value: channel.id }]
    });
});

client.on('guildUpdate', async (oldGuild, newGuild) => {
    const fields = [];
    if (oldGuild.name !== newGuild.name) fields.push({ name: 'שם השרת', value: `לפני: ${oldGuild.name}\nאחרי: ${newGuild.name}` });
    if (oldGuild.icon !== newGuild.icon) fields.push({ name: 'אייקון השרת', value: 'אייקון השרת עודכן.' });
    if (oldGuild.description !== newGuild.description) fields.push({ name: 'תיאור השרת', value: `לפני: ${oldGuild.description || '—'}\nאחרי: ${newGuild.description || '—'}` });
    if (!fields.length) return;
    await sendGuildLog(newGuild, 'server-update', { description: 'עודכנו פרטי השרת.', fields });
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild || !message.member) return;
    const data = getGuildData(message.guild.id);
    const settings = data.settings;
    const userId = message.author.id;
    const cooldownKey = `${message.guild.id}:${userId}`;

    try {
        if (!xpCooldowns.has(cooldownKey)) {
            const stats = getMemberData(message.guild.id, userId);
            const gainedXp = Math.floor(Math.random() * (settings.xp.max - settings.xp.min + 1)) + settings.xp.min;
            const reachedLevels = addXp(stats, gainedXp);
            xpCooldowns.set(cooldownKey, Date.now() + settings.xp.cooldownMs);
            setTimeout(() => xpCooldowns.delete(cooldownKey), settings.xp.cooldownMs);
            saveData();
            await grantLevelRoles(message.member, reachedLevels, settings);
            if (reachedLevels.length) await sendLevelUp(message, data);
        }

        if (settings.veteranRoleId && message.member.joinedTimestamp) {
            const eligibleAt = new Date(message.member.joinedTimestamp);
            eligibleAt.setMonth(eligibleAt.getMonth() + SIX_MONTHS);
            if (Date.now() >= eligibleAt.getTime()) await awardVeteranRole(message.member);
        }

        const prefix = settings.prefix;
        if (!message.content.startsWith(prefix)) return;
        const content = message.content.slice(prefix.length).trim();
        const [rawCommand, ...args] = content.split(/\s+/);
        const command = (rawCommand || '').toLowerCase();

        if (command === 'h') {
            const reason = args.join(' ').trim();
            if (!reason || reason.length > 500) return message.reply('כדי לקרוא לצוות יש לכתוב סיבה: `!h <מה קרה ואיך אפשר לעזור?>` (עד 500 תווים).');
            const now = Date.now();
            if ((helpCooldowns.get(cooldownKey) || 0) > now) return message.reply('⏳ אפשר לשלוח בקשת עזרה פעם בדקה.');
            helpCooldowns.set(cooldownKey, now + 60000);
            setTimeout(() => helpCooldowns.delete(cooldownKey), 60000);
            const channel = message.guild.channels.cache.get(settings.helpChannelId) || message.channel;
            const staffRole = getStaffRole(message.guild, settings);
            const embed = new EmbedBuilder()
                .setColor(settings.color || DEFAULT_COLOR)
                .setTitle('🆘 בקשת עזרה חדשה')
                .setDescription(`**משתמש:** ${message.author}\n**ערוץ:** ${message.channel}\n**סיבה:** ${reason}`)
                .setTimestamp();
            await channel.send({
                content: staffRole ? `${staffRole}` : '📣 צוות, יש בקשת עזרה חדשה.',
                embeds: [embed],
                allowedMentions: { roles: staffRole ? [staffRole.id] : [] }
            });
            return message.reply('✅ הצוות קיבל את בקשת העזרה שלך.');
        }

        if (command === 'v') {
            const member = message.mentions.members.first() || message.member;
            if (!member.joinedTimestamp) return message.reply('לא הצלחתי למצוא את תאריך ההצטרפות לשרת.');
            const joined = new Date(member.joinedTimestamp);
            const eligibleAt = new Date(joined);
            eligibleAt.setMonth(eligibleAt.getMonth() + SIX_MONTHS);
            let roleMessage = '';
            if (Date.now() >= eligibleAt.getTime()) {
                const awarded = await awardVeteranRole(member);
                if (awarded) roleMessage = '\n🏅 רול הוותיקים הוענק!';
            }
            return message.reply(`📅 ${member} נמצא/ת בשרת **${formatDuration(joined)}** (מאז <t:${Math.floor(joined.getTime() / 1000)}:D>).${roleMessage}`);
        }

        if (command === 'help' || command === 'פקודות') {
            const embed = new EmbedBuilder()
                .setColor(settings.color || DEFAULT_COLOR)
                .setTitle('📚 פקודות הבוט')
                .setDescription([
                    `**קידומת:** \`${prefix}\``,
                    '`help` — רשימת פקודות',
                    '`ping` — בדיקת תגובה',
                    '`server` — פרטי השרת',
                    '`user [@משתמש]` — פרטי משתמש',
                    '`avatar [@משתמש]` — תמונת פרופיל',
                    '`v [@משתמש]` — ותק בשרת (רול אחרי חצי שנה)',
                    '`h <סיבה>` — בקשת עזרה מהצוות',
                    '`level` / `rank` — הרמה וה-XP שלך',
                    '`leaderboard` — 10 המובילים',
                    '`shop` — חנות XP',
                    '`logs` — הגדרות לוגים (למנהלים)',
                    '`notifyroles` — פאנל רולי התראות (למנהלים)',
                    '`roll [מספר]` — הטלת קובייה',
                    '`poll שאלה | אפשרות 1 | אפשרות 2` — יצירת סקר',
                    '`giveaway 30m @רול` — הגרלה עם הענקת רול אוטומטית; אפשר גם פרס בטקסט',
                    '`drop 30s פרס` — דרופ לתופס/ת הראשון/ה',
                    '',
                    '**מנהלים:** `config`, `logs`, `notifyroles`, `welcome`, `tickets`, `staffapply`, `levelrole`, `leveltest`, `shopadd`, `shopremove`, `shopchannel`, `shopconfig`, `giveawayconfig`, `xpadd`, `endgiveaway`, `purge`, `announce`'
                ].join('\n'));
            return message.reply({ embeds: [embed] });
        }

        if (command === 'ping') return message.reply(`🏓 Pong! ${client.ws.ping}ms`);
        if (command === 'server') {
            const embed = new EmbedBuilder()
                .setColor(settings.color || DEFAULT_COLOR)
                .setTitle(message.guild.name)
                .setThumbnail(message.guild.iconURL({ size: 256 }))
                .addFields(
                    { name: '👥 חברים', value: String(message.guild.memberCount), inline: true },
                    { name: '🆔 מזהה', value: message.guild.id, inline: true },
                    { name: '📅 נוצר', value: `<t:${Math.floor(message.guild.createdTimestamp / 1000)}:D>`, inline: true }
                );
            return message.reply({ embeds: [embed] });
        }
        if (command === 'user') {
            const member = message.mentions.members.first() || message.member;
            const joined = member.joinedTimestamp ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : 'לא ידוע';
            const embed = new EmbedBuilder()
                .setColor(settings.color || DEFAULT_COLOR)
                .setTitle(`👤 ${member.user.tag}`)
                .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
                .addFields(
                    { name: 'נוצר חשבון', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:D>`, inline: true },
                    { name: 'הצטרף לשרת', value: joined, inline: true }
                );
            return message.reply({ embeds: [embed] });
        }
        if (command === 'avatar') {
            const user = message.mentions.users.first() || message.author;
            return message.reply({ content: user.displayAvatarURL({ size: 1024 }) });
        }
        if (command === 'level' || command === 'rank' || command === 'balance') {
            const stats = getMemberData(message.guild.id, userId);
            return message.reply(`📊 ${message.author}\n⭐ **XP בחשבון:** ${stats.xp}\n🎖️ **רמה:** ${stats.level}\nהתקדמות לרמה הבאה: ${stats.levelXp}/${stats.level * 100} XP`);
        }
        if (command === 'leaderboard' || command === 'top') {
            const top = Object.entries(data.members)
                .sort((first, second) => second[1].level - first[1].level || second[1].xp - first[1].xp)
                .slice(0, 10);
            const lines = await Promise.all(top.map(async ([id, stats], index) => {
                const user = await client.users.fetch(id).catch(() => null);
                return `**${index + 1}.** ${user ? user.username : `<@${id}>`} — רמה ${stats.level}, ${stats.xp} XP`;
            }));
            return message.reply(lines.length ? `🏆 **טבלת מובילים**\n${lines.join('\n')}` : 'עוד אין נתוני XP בשרת.');
        }
        if (command === 'shop' || command === 'חנות') {
            if (args[0]?.toLowerCase() === 'post') {
                if (!isAdministrator(message.member)) return message.reply('❌ פרסום החנות בערוץ מוגדר זמין למנהלים בלבד.');
                const channel = message.guild.channels.cache.get(settings.shopChannelId);
                if (!isTextChannel(channel)) return message.reply('❌ לא הוגדר ערוץ חנות. הגדר אותו עם `!shopchannel #ערוץ`.');
                await publishShopPanel(channel, settings);
                return message.reply(`✅ פאנל החנות ${settings.shop.length ? 'פורסם או עודכן' : 'עודכן לחנות ריקה'} ב-${channel}. לא נוצרו עותקים חדשים.`);
            }
            if (!settings.shop.length) return message.reply('🛒 החנות ריקה. מנהלים יכולים להוסיף פריטים עם `!shopadd @רול מחיר שם`.');
            const shopChannel = message.guild.channels.cache.get(settings.shopChannelId);
            if (isTextChannel(shopChannel) && settings.shopPanelMessageId) {
                return message.reply(`🛒 חנות ה-XP נמצאת כאן: https://discord.com/channels/${message.guild.id}/${shopChannel.id}/${settings.shopPanelMessageId}`);
            }
            return message.reply(buildShopPayload(settings));
        }
        if (command === 'roll') {
            const sides = Number(args[0] || 6);
            if (!Number.isInteger(sides) || sides < 2 || sides > 1000000) return message.reply('שימוש: `!roll [מספר צדדים 2-1,000,000]`.');
            return message.reply(`🎲 יצא לך **${Math.floor(Math.random() * sides) + 1}** מתוך ${sides}.`);
        }
        if (command === 'poll') {
            const [question, ...options] = content.slice(command.length).trim().split('|').map(value => value.trim());
            const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
            if (!question || question.length > 200 || options.length < 2 || options.length > emojis.length
                || options.some(option => !option || option.length > 500)) {
                return message.reply('שימוש: `!poll שאלה | אפשרות 1 | אפשרות 2` (2-5 אפשרויות).');
            }
            const embed = new EmbedBuilder()
                .setColor(settings.color || DEFAULT_COLOR)
                .setTitle(`📊 ${question}`)
                .setDescription(options.map((option, index) => `${emojis[index]} ${option}`).join('\n'))
                .setFooter({ text: `סקר מאת ${message.author.username}` });
            const poll = await message.channel.send({ embeds: [embed] });
            for (let index = 0; index < options.length; index += 1) await poll.react(emojis[index]);
            return;
        }

        const adminCommands = new Set([
            'config', 'logs', 'notifyroles', 'welcome', 'tickets', 'staffapply', 'levelrole', 'leveltest', 'shopadd', 'shopremove', 'shopchannel', 'shopconfig', 'xpadd',
            'giveaway', 'giveawayconfig', 'drop', 'endgiveaway', 'enddrop', 'purge', 'announce'
        ]);
        if (adminCommands.has(command)) {
            if (!isAdministrator(message.member)) return message.reply('❌ הפקודה הזו מיועדת למנהלי שרת בלבד.');
            return await handleAdminCommand(message, command, args, data);
        }
    } catch (error) {
        console.error(`שגיאה בעיבוד הודעה מהשרת ${message.guild.id}:`, error);
        await message.reply('❌ אירעה שגיאה בביצוע הפעולה. בדוק הרשאות של הבוט ונסה שוב.').catch(console.error);
    }
});

client.on('interactionCreate', async interaction => {
    try {
        if (interaction.isButton() && interaction.customId === 'ticket_open') {
            return await showTicketReasonModal(interaction);
        }

        if (interaction.isStringSelectMenu() && interaction.customId === 'ticket_select') {
            if (!interaction.guild) return;
            return await showTicketReasonModal(interaction, interaction.values[0]);
        }

        if (interaction.isStringSelectMenu() && interaction.customId === 'shop_select') {
            if (!interaction.guild) return;
            const data = getGuildData(interaction.guild.id);
            const item = data.settings.shop.find(shopItem => shopItem.roleId === interaction.values[0]);
            if (!item) return await interaction.reply({ content: '❌ הפריט הזה כבר לא נמצא בחנות.', ephemeral: true });
            const member = interaction.guild.members.cache.get(interaction.user.id)
                || await interaction.guild.members.fetch(interaction.user.id);
            if (member.roles.cache.has(item.roleId)) {
                return await interaction.reply({ content: '❌ כבר יש לך את הרול הזה.', ephemeral: true });
            }
            const stats = getMemberData(interaction.guild.id, interaction.user.id);
            return await interaction.reply({
                ...buildShopConfirmation(item, data.settings),
                content: `יש לך כרגע **${stats.xp} XP**.`,
                ephemeral: true
            });
        }

        if (interaction.isModalSubmit() && interaction.customId.startsWith('ticket_reason_submit')) {
            const ticketTypeId = interaction.customId === 'ticket_reason_submit'
                ? null
                : interaction.customId.slice('ticket_reason_submit_'.length);
            return await createTicket(
                interaction,
                interaction.fields.getTextInputValue('reason').trim(),
                ticketTypeId
            );
        }

        if (interaction.isButton() && interaction.customId === 'staff_application_open') {
            const modal = new ModalBuilder()
                .setCustomId('staff_application_submit')
                .setTitle('📋 בחינה להצטרפות לצוות');
            const ageInput = new TextInputBuilder()
                .setCustomId('age')
                .setLabel('האם גילך 12 ומעלה?')
                .setStyle(TextInputStyle.Short)
                .setMinLength(2)
                .setMaxLength(20)
                .setRequired(true)
                .setPlaceholder('כן / לא');
            const experienceInput = new TextInputBuilder()
                .setCustomId('experience')
                .setLabel('ניסיון וזמינות')
                .setStyle(TextInputStyle.Paragraph)
                .setMinLength(10)
                .setMaxLength(1000)
                .setRequired(true)
                .setPlaceholder('ספר/י על הניסיון שלך וכמה זמן פנוי יש לך');
            const motivationInput = new TextInputBuilder()
                .setCustomId('motivation')
                .setLabel('למה להצטרף לצוות ולקדם את השרת?')
                .setStyle(TextInputStyle.Paragraph)
                .setMinLength(10)
                .setMaxLength(1500)
                .setRequired(true)
                .setPlaceholder('מה הופך אותך למתאים/ה לצוות?');
            modal.addComponents(
                new ActionRowBuilder().addComponents(ageInput),
                new ActionRowBuilder().addComponents(experienceInput),
                new ActionRowBuilder().addComponents(motivationInput)
            );
            return await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'staff_application_submit') {
            const answers = {
                age: interaction.fields.getTextInputValue('age').trim(),
                experience: interaction.fields.getTextInputValue('experience').trim(),
                motivation: interaction.fields.getTextInputValue('motivation').trim()
            };
            return await createStaffApplication(interaction, answers);
        }

        if (!interaction.isButton() || !interaction.guild) return;

        if (interaction.customId.startsWith('notify_role_')) {
            const roleKey = interaction.customId.slice('notify_role_'.length);
            const roleOption = NOTIFICATION_ROLE_OPTIONS[roleKey];
            if (!roleOption || !isNotificationRolePanel(interaction.message)) {
                return await interaction.reply({ content: '❌ כפתור בחירת הרולים אינו תקין.', ephemeral: true });
            }
            const settings = getGuildData(interaction.guild.id).settings;
            const roleId = settings.notificationRoles.roles[roleKey];
            const role = roleId ? interaction.guild.roles.cache.get(roleId) : null;
            if (!role) {
                return await interaction.reply({ content: `❌ הרול של "${roleOption.label}" לא הוגדר או כבר לא קיים. פנו למנהלי השרת.`, ephemeral: true });
            }
            const botMember = interaction.guild.members.me;
            if (!botMember?.permissions.has(PermissionFlagsBits.ManageRoles) || !role.editable) {
                return await interaction.reply({ content: '❌ הבוט לא יכול לנהל את הרול הזה. בדקו הרשאת Manage Roles ואת מיקום תפקיד הבוט.', ephemeral: true });
            }

            const lockKey = `${interaction.guild.id}:${interaction.user.id}:${role.id}`;
            if (activeNotificationRoleChanges.has(lockKey)) {
                return await interaction.reply({ content: '⏳ שינוי הרול שלך כבר מתבצע, נסה שוב בעוד רגע.', ephemeral: true });
            }
            activeNotificationRoleChanges.add(lockKey);
            try {
                const member = await interaction.guild.members.fetch(interaction.user.id);
                if (member.roles.cache.has(role.id)) {
                    await member.roles.remove(role, 'המשתמש הסיר רול דרך פאנל התראות');
                    return await interaction.reply({ content: `🔕 הסרנו ממך את הרול **${role.name}**.`, ephemeral: true });
                }
                await member.roles.add(role, 'המשתמש בחר רול דרך פאנל התראות');
                return await interaction.reply({ content: `🔔 קיבלת את הרול **${role.name}**! תקבל/י את העדכונים המתאימים.`, ephemeral: true });
            } catch (error) {
                console.error(`שינוי רול התראות ${role.id} נכשל למשתמש ${interaction.user.id}:`, error);
                const response = error.code === 50013
                    ? '❌ Discord דחה את שינוי הרול. בדקו הרשאת Manage Roles ואת היררכיית התפקידים.'
                    : '❌ לא הצלחתי לעדכן את הרול. נסה שוב או פנה למנהלי השרת.';
                return await interaction.reply({ content: response, ephemeral: true });
            } finally {
                activeNotificationRoleChanges.delete(lockKey);
            }
        }

        if (interaction.customId === 'ticket_close') {
            const channel = interaction.channel;
            const topicPrefix = channel.topic?.startsWith('ticket-owner:')
                ? 'ticket-owner:'
                : channel.topic?.startsWith('staff-application-owner:') ? 'staff-application-owner:' : null;
            const ownerId = topicPrefix ? channel.topic.slice(topicPrefix.length) : null;
            const data = getGuildData(interaction.guild.id);
            const staffRoleIds = getTicketStaffRoleIds(data.settings);
            const isOwner = ownerId === interaction.user.id;
            const interactionMember = interaction.guild.members.cache.get(interaction.user.id);
            const isStaff = interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)
                || staffRoleIds.some(roleId => interactionMember?.roles.cache.has(roleId));
            if (!isOwner && !isStaff) return await interaction.reply({ content: '❌ רק פותח/ת הטיקט או הצוות יכולים לסגור אותו.', ephemeral: true });
            await interaction.reply('🔒 הטיקט ייסגר בעוד 5 שניות...');
            setTimeout(() => channel.delete('הטיקט נסגר').catch(error => console.error('לא הצלחתי למחוק את הטיקט:', error)), 5000);
            return;
        }

        if (interaction.customId === 'shop_cancel') {
            return await interaction.update({
                content: 'הרכישה בוטלה.',
                embeds: [],
                components: []
            });
        }

        if (interaction.customId.startsWith('shop_confirm_')) {
            const roleId = interaction.customId.slice('shop_confirm_'.length);
            return await completeShopPurchase(interaction, roleId);
        }

        if (interaction.customId.startsWith('giveaway_join_') || interaction.customId.startsWith('drop_join_')) {
            const id = interaction.customId.slice(interaction.customId.lastIndexOf('_') + 1);
            const game = getGuildData(interaction.guild.id).games[id];
            if (!game || game.ended || game.endsAt <= Date.now()) {
                return await interaction.reply({ content: '❌ ההגרלה/הדרופ כבר הסתיימו.', ephemeral: true });
            }
            if (game.participants.includes(interaction.user.id)) {
                return await interaction.reply({ content: '❌ כבר נרשמת!', ephemeral: true });
            }
            game.participants.push(interaction.user.id);
            saveData();
            if (game.type === 'drop') {
                await finishGame(interaction.guild, id);
                const rewardText = game.rewardXp ? ` הוענקו לך **${game.rewardXp} XP**!` : ' הפרס שלך!';
                return await interaction.reply({ content: `🎉 תפסת את הדרופ!${rewardText}${game.rewardMessage?.includes('עלית לרמה') ? ` ${game.rewardMessage.slice(game.rewardMessage.indexOf('🎖️'))}` : ''}`, ephemeral: true });
            }
            await refreshGameMessage(interaction.guild, game, id);
            return await interaction.reply({ content: '✅ נרשמת בהצלחה! בהצלחה 🍀', ephemeral: true });
        }

        if (interaction.customId.startsWith('shop_buy_')) {
            const roleId = interaction.customId.slice('shop_buy_'.length);
            return await completeShopPurchase(interaction, roleId);
        }
    } catch (error) {
        console.error('שגיאה בעיבוד אינטראקציה:', error);
        if (interaction.isRepliable()) {
            const response = { content: '❌ אירעה שגיאה. בדוק את הרשאות הבוט ונסה שוב.', ephemeral: true };
            if (interaction.deferred || interaction.replied) await interaction.followUp(response).catch(console.error);
            else await interaction.reply(response).catch(console.error);
        }
    }
});

if (!process.env.DISCORD_TOKEN) {
    console.error('❌ חסר DISCORD_TOKEN. צור קובץ .env לפי .env.example והוסף אליו את הטוקן החדש שלך.');
    process.exitCode = 1;
} else {
    client.login(process.env.DISCORD_TOKEN).catch(error => {
        console.error('❌ התחברות ל-Discord נכשלה. בדוק שהטוקן החדש תקין:', error.message);
        process.exitCode = 1;
    });
}
