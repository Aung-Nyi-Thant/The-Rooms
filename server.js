const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error("Error occurred handling", req.url, err);
            res.statusCode = 500;
            res.end("internal server error");
        }
    });

    const io = new Server(httpServer);

    io.on("connection", (socket) => {
        // console.log("Client connected", socket.id);

        socket.on("join-chat", (chatId) => {
            socket.join(chatId);
            // console.log(`Socket ${socket.id} joined chat ${chatId}`);
        });

        socket.on("identify", (userId) => {
            socket.join(userId);
        });

        socket.on("broadcast-delete-chat", ({ chatId, memberIds }) => {
            // Notify members to remove from list
            if (memberIds && Array.isArray(memberIds)) {
                memberIds.forEach(uid => {
                    io.to(uid).emit("chat-removed", chatId);
                });
            }
            // Notify those inside the room
            io.to(chatId).emit("chat-closed", chatId);
        });

        socket.on("send-message", async (data, callback) => {
            const { chatId, content, senderId, type, expiresIn } = data;

            try {
                const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

                // 1. Save to DB
                const message = await prisma.message.create({
                    data: {
                        chatId,
                        content,
                        senderId,
                        type: type || "text",
                        expiresAt
                    },
                    include: {
                        sender: {
                            select: { username: true }
                        }
                    }
                });

                // 2. Broadcast to room (including sender, or exclude sender? 
                // Usually exclude sender if they optimistically updated, but safest is to broadcast to all
                // and let client dedupe or replace pending message. 
                // For simplicity here: Broadcast to everyone in room including sender to confirm ID.
                io.to(chatId).emit("new-message", message);

                // 3. Update Chat timestamp
                await prisma.chat.update({
                    where: { id: chatId },
                    data: { updatedAt: new Date() }
                });

                if (callback) callback({ status: "ok", message });
            } catch (e) {
                console.error("Error saving message", e);
                if (callback) callback({ status: "error" });
            }
        });

        socket.on("disconnect", () => {
            // console.log("Client disconnected");
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
