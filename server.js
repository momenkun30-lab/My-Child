const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();

// إعدادات السيرفر للتعامل مع البيانات والصور الكبيرة
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// إخبار السيرفر بمكان ملفات الموقع (الصور، التنسيقات، والجافا سكريبت)
app.use(express.static(path.join(__dirname, '/')));

const PORT = process.env.PORT || 3000;

// --- توجيهات المسارات (Routing) لفتح الصفحات ---

// فتح الصفحة الرئيسية عند الدخول على الرابط المباشر
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// فتح لوحة التحكم عند الدخول على رابط /admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// --- نقطة النهاية الخاصة بالذكاء الاصطناعي ---
app.post('/generate', async (req, res) => {
    try {
        const { prompt, motherImage, fatherImage } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;
        
        if (!API_KEY) {
            return res.status(500).json({ error: "API Key is missing on Render settings" });
        }

        const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        const requestBody = {
            contents: [{
                parts: [
                    { text: `Instructions: You are a professional genetic image blender. Create a child portrait based on these two parents. ${prompt}` },
                    { inline_data: { mime_type: "image/jpeg", data: motherImage } },
                    { inline_data: { mime_type: "image/jpeg", data: fatherImage } }
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

        if (data.candidates && data.candidates[0].content) {
            // إرسال النص الناتج (الذي يفترض أن يكون رابط الصورة أو وصفها)
            res.json({ imageUrl: data.candidates[0].content.parts[0].text });
        } else {
            console.error("Gemini Error:", data);
            res.status(400).json({ error: "فشل الذكاء الاصطناعي في المعالجة" });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "حدث خطأ داخلي في الخادم" });
    }
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server is running live on port ${PORT}`);
});
