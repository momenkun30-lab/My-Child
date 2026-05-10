const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

// إعدادات للسماح برفع الصور وحل مشكلة الـ CORS
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = process.env.PORT || 3000;

/**
 * نقطة النهاية لاستقبال طلبات إنشاء الصور
 */
app.post('/generate', async (req, res) => {
    try {
        const { prompt, motherImage, fatherImage } = req.body;

        // سحب مفتاح الـ API من إعدادات الاستضافة (Render)
        const API_KEY = process.env.GEMINI_API_KEY;
        
        if (!API_KEY) {
            console.error("Error: GEMINI_API_KEY is not defined in environment variables.");
            return res.status(500).json({ error: "تكوين السيرفر غير مكتمل: مفتاح الـ API مفقود." });
        }

        // رابط واجهة Gemini Pro Vision (أو النموذج المخصص للصور)
        const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        // تجهيز البيانات لإرسالها للذكاء الاصطناعي
        const requestBody = {
            contents: [{
                parts: [
                    { text: `Instructions: You are a professional genetic image blender. ${prompt}` },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: motherImage // تأتي من الفرونت إند كـ Base64
                        }
                    },
                    {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: fatherImage // تأتي من الفرونت إند كـ Base64
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        };

        const response = await fetch(URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();

        // معالجة الرد وإرسال رابط الصورة أو النص الناتج للمستخدم
        if (data.candidates && data.candidates[0].content) {
            // ملاحظة: اعتماداً على التحديثات، قد يعيد Gemini نصاً يصف الصورة أو رابطاً
            const resultText = data.candidates[0].content.parts[0].text;
            res.json({ imageUrl: resultText });
        } else {
            console.error("Gemini API Error:", data);
            res.status(400).json({ error: "فشل الذكاء الاصطناعي في معالجة الصور." });
        }

    } catch (error) {
        console.error("Server Crash:", error);
        res.status(500).json({ error: "حدث خطأ داخلي في السيرفر." });
    }
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server is live on port ${PORT}`);
});
