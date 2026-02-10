import {
    proto,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateWAMessage,
} from '@whiskeysockets/baileys';

export class InteractiveMessage {
    constructor(sock) {
        this.sock = sock;
    }

    async sendAlbum(jid, content, options = {}) {
        if (!this.sock.user?.id) {
            throw new Error("User not authenticated");
        }

        if (!content?.album || !Array.isArray(content.album) || content.album.length === 0) {
            throw new Error("Album content with items array is required");
        }

        const items = content.album;

        const imgCount = items.filter((item) => item?.image).length;
        const vidCount = items.filter((item) => item?.video).length;

        const msgSecret = new Uint8Array(32);
        crypto.getRandomValues(msgSecret);

        const msgContent = {
            albumMessage: {
                expectedImageCount: imgCount,
                expectedVideoCount: vidCount,
            },
            messageContextInfo: {
                messageSecret: msgSecret,
            },
        };

        const genOpt = {
            userJid: this.sock.user.id,
            upload: this.sock.waUploadToServer,
            quoted: options?.quoted || null,
            ephemeralExpiration: options?.quoted?.expiration ?? 0,
        };

        const album = generateWAMessageFromContent(jid, msgContent, genOpt);

        await this.sock.relayMessage(album.key.remoteJid, album.message, {
            messageId: album.key.id,
        });

        const mediaMsgs = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            const mediaSecret = new Uint8Array(32);
            crypto.getRandomValues(mediaSecret);

            let mediaMsg;

            if (item.image) {
                const mediaInput = {};
                if (Buffer.isBuffer(item.image)) {
                    mediaInput.image = item.image;
                } else if (typeof item.image === "object" && item.image.url) {
                    mediaInput.image = { url: item.image.url };
                } else if (typeof item.image === "string") {
                    mediaInput.image = { url: item.image };
                }

                if (item.caption) {
                    mediaInput.caption = item.caption;
                }

                mediaMsg = await generateWAMessage(album.key.remoteJid, mediaInput, {
                    upload: this.sock.waUploadToServer,
                    ephemeralExpiration: options?.quoted?.expiration ?? 0,
                });
            } else if (item.video) {
                const mediaInput = {};
                if (Buffer.isBuffer(item.video)) {
                    mediaInput.video = item.video;
                } else if (typeof item.video === "object" && item.video.url) {
                    mediaInput.video = { url: item.video.url };
                } else if (typeof item.video === "string") {
                    mediaInput.video = { url: item.video };
                }

                if (item.caption) {
                    mediaInput.caption = item.caption;
                }

                if (item.mimetype) {
                    mediaInput.mimetype = item.mimetype;
                }

                mediaMsg = await generateWAMessage(album.key.remoteJid, mediaInput, {
                    upload: this.sock.waUploadToServer,
                    ephemeralExpiration: options?.quoted?.expiration ?? 0,
                });
            } else {
                throw new Error(`Item ${i} must have image or video`);
            }

            mediaMsg.message.messageContextInfo = {
                messageSecret: mediaSecret,
                messageAssociation: {
                    associationType: 1,
                    parentMessageKey: album.key,
                },
            };

            mediaMsgs.push(mediaMsg);

            await this.sock.relayMessage(mediaMsg.key.remoteJid, mediaMsg.message, {
                messageId: mediaMsg.key.id,
            });

            if (i < items.length - 1) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }

        return {
            album,
            mediaMessages: mediaMsgs,
        };
    }

    async sendButton(jid, content = {}, options = {}) {
        if (!this.sock.user?.id) {
            throw new Error("User not authenticated");
        }

        const {
            text = "",
            caption = "",
            title = "",
            footer = "",
            buttons = [],
            hasMediaAttachment = false,
            image = null,
            video = null,
            document = null,
            mimetype = null,
            fileName = null,
            jpegThumbnail = null,
            location = null,
            externalAdReply = null,
        } = content;

        if (!Array.isArray(buttons) || buttons.length === 0) {
            throw new Error("buttons must be a non-empty array");
        }

        let messageContent = {};

        if (image) {
            const mediaInput = {};
            if (Buffer.isBuffer(image)) {
                mediaInput.image = image;
            } else if (typeof image === "object" && image.url) {
                mediaInput.image = { url: image.url };
            } else if (typeof image === "string") {
                mediaInput.image = { url: image };
            }

            const preparedMedia = await prepareWAMessageMedia(mediaInput, {
                upload: this.sock.waUploadToServer,
            });

            messageContent.header = {
                title: title || "",
                hasMediaAttachment: hasMediaAttachment || true,
                imageMessage: preparedMedia.imageMessage,
            };
        } else if (video) {
            const mediaInput = {};
            if (Buffer.isBuffer(video)) {
                mediaInput.video = video;
            } else if (typeof video === "object" && video.url) {
                mediaInput.video = { url: video.url };
            } else if (typeof video === "string") {
                mediaInput.video = { url: video };
            }

            const preparedMedia = await prepareWAMessageMedia(mediaInput, {
                upload: this.sock.waUploadToServer,
            });

            messageContent.header = {
                title: title || "",
                hasMediaAttachment: hasMediaAttachment || true,
                videoMessage: preparedMedia.videoMessage,
            };
        } else if (document) {
            const mediaInput = { document: {} };

            if (Buffer.isBuffer(document)) {
                mediaInput.document = {
                    buffer: document,
                    ...(mimetype && { mimetype }),
                    ...(fileName && { fileName }),
                };
            } else if (typeof document === "object" && document.url) {
                mediaInput.document = {
                    url: document.url,
                    ...(mimetype && { mimetype }),
                    ...(fileName && { fileName }),
                };
            } else if (typeof document === "string") {
                mediaInput.document = {
                    url: document,
                    ...(mimetype && { mimetype }),
                    ...(fileName && { fileName }),
                };
            }

            if (jpegThumbnail) {
                if (Buffer.isBuffer(jpegThumbnail)) {
                    if (typeof mediaInput.document === "object") {
                        mediaInput.document.jpegThumbnail = jpegThumbnail;
                    }
                } else if (typeof jpegThumbnail === "string") {
                    try {
                        const res = await fetch(jpegThumbnail);
                        const arr = await res.arrayBuffer();
                        if (typeof mediaInput.document === "object") {
                            mediaInput.document.jpegThumbnail = Buffer.from(arr);
                        }
                    } catch {
                        //
                    }
                }
            }

            const preparedMedia = await prepareWAMessageMedia(mediaInput, {
                upload: this.sock.waUploadToServer,
            });

            if (preparedMedia.documentMessage) {
                if (fileName) preparedMedia.documentMessage.fileName = fileName;
                if (mimetype) preparedMedia.documentMessage.mimetype = mimetype;
            }

            messageContent.header = {
                title: title || "",
                hasMediaAttachment: hasMediaAttachment || true,
                documentMessage: preparedMedia.documentMessage,
            };
        } else if (location && typeof location === "object") {
            messageContent.header = {
                title: title || location.name || "Location",
                hasMediaAttachment: hasMediaAttachment || false,
                locationMessage: {
                    degreesLatitude: location.degressLatitude || location.degreesLatitude || 0,
                    degreesLongitude: location.degressLongitude || location.degreesLongitude || 0,
                    name: location.name || "",
                    address: location.address || "",
                },
            };
        } else if (title) {
            messageContent.header = {
                title: title,
                hasMediaAttachment: false,
            };
        }

        const hasMedia = !!(image || video || document || location);
        const bodyText = hasMedia ? caption : text || caption;

        if (bodyText) {
            messageContent.body = { text: bodyText };
        }

        if (footer) {
            messageContent.footer = { text: footer };
        }

        messageContent.nativeFlowMessage = {
            buttons: buttons.map((btn, i) => ({
                name: btn.name || "quick_reply",
                buttonParamsJson: btn.buttonParamsJson || JSON.stringify({
                    display_text: btn.text || btn.displayText || `Button ${i + 1}`,
                    id: btn.id || `quick_${i + 1}`,
                }),
            })),
        };

        if (externalAdReply && typeof externalAdReply === "object") {
            messageContent.contextInfo = {
                externalAdReply: {
                    title: externalAdReply.title || "",
                    body: externalAdReply.body || "",
                    mediaType: externalAdReply.mediaType || 1,
                    sourceUrl: externalAdReply.sourceUrl || externalAdReply.url || "",
                    thumbnailUrl: externalAdReply.thumbnailUrl || externalAdReply.thumbnail || "",
                    renderLargerThumbnail: externalAdReply.renderLargerThumbnail || false,
                    showAdAttribution: externalAdReply.showAdAttribution !== false,
                    containsAutoReply: externalAdReply.containsAutoReply || false,
                    ...(externalAdReply.mediaUrl && {
                        mediaUrl: externalAdReply.mediaUrl,
                    }),
                    ...(externalAdReply.thumbnail &&
                        Buffer.isBuffer(externalAdReply.thumbnail) && {
                            thumbnail: externalAdReply.thumbnail,
                        }),
                    ...(externalAdReply.jpegThumbnail &&
                        Buffer.isBuffer(externalAdReply.jpegThumbnail) && {
                            jpegThumbnail: externalAdReply.jpegThumbnail,
                        }),
                },
            };
        }

        if (options.mentionedJid) {
            if (messageContent.contextInfo) {
                messageContent.contextInfo.mentionedJid = options.mentionedJid;
            } else {
                messageContent.contextInfo = {
                    mentionedJid: options.mentionedJid,
                };
            }
        }

        const payload = proto.Message.InteractiveMessage.create(messageContent);

        const msg = generateWAMessageFromContent(
            jid,
            {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: payload,
                    },
                },
            },
            {
                userJid: this.sock.user.id,
                quoted: options?.quoted || null,
            }
        );

        await this.sock.relayMessage(jid, msg.message, {
            messageId: msg.key.id,
        });

        return msg;
    }
}