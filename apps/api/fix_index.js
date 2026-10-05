const fs = require('fs');

const lines = fs.readFileSync('index.js', 'utf8').split('\n');
const goodLines = lines.slice(0, 419);

const appendContent = `                    await chatRef.update({
                        lastMessage: data.text || "📷 Media",
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                } catch (e) {
                    console.error("Send Error:", e.message);
                    await doc.ref.update({ status: "failed", error: e.message });
                }
            });
        });

    require("./broadcast_worker");

    // Keep process alive
    setInterval(() => {}, 1000);

    process.on('uncaughtException', (err) => {
        console.error('🔥 Uncaught Exception:', err);
    });

    process.on('unhandledRejection', (reason, promise) => {
        console.error('🔥 Unhandled Rejection:', reason);
    });
`;

const newContent = goodLines.join('\n') + '\n' + appendContent;
fs.writeFileSync('index.js', newContent);
console.log('Fixed index.js');
