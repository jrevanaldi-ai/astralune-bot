import { proto } from '@whiskeysockets/baileys';

const SYM_PROCESSED = Symbol.for("smsg.processed");

export function smsg(sock, m) {
    if (!m) return m;
    if (m[SYM_PROCESSED]) {
        m.sock = sock;
        return m;
    }

    const M = proto.WebMessageInfo;
    if (M?.create) {
        m = M.create(m);
    }

    m.sock = sock;

    const msg = m.message;
    if (!msg) {
        m[SYM_PROCESSED] = true;
        return m;
    }

    if (m.mtype === "protocolMessage" && m.msg?.key) {
        const key = { ...m.msg.key };

        if (key.remoteJid === "status@broadcast" && m.chat) {
            key.remoteJid = m.chat;
        }

        if ((!key.participant || key.participant === "status_me") && m.sender) {
            key.participant = m.sender;
        }

        const botId = sock.decodeJid?.(sock.user?.id || "") || "";
        if (botId) {
            const partId = sock.decodeJid?.(key.participant) || "";
            key.fromMe = partId === botId;

            if (!key.fromMe && key.remoteJid === botId && m.sender) {
                key.remoteJid = m.sender;
            }
        }

        m.msg.key = key;
        sock.ev?.emit("messages.delete", { keys: [key] });
    }

    m[SYM_PROCESSED] = true;
    return m;
}