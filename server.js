const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// إعدادات الوصول والأمان
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' })); // السماح باستقبال صور كبيرة
app.use(express.static(path.join(__dirname, '/')));

// تهيئة مكتبة Google AI باستخدام المفتاح الجديد
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', async (req, res) => {
    try {
        const { motherImage, fatherImage, prompt } = req.body;

        if (!motherImage || !fatherImage) {
            return res.status(400).json({ error: "يرجى رفع صفتي الأم والأب" });
        }

        // استخدام موديل Gemini 1.5 Flash (الأفضل في معالجة الصور)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // تجهيز الطلب للذكاء الاصطناعي مع إعدادات الأمان لفتح القيود
        const requestBody = {
            contents: [{
                parts: [
                    { text: prompt + " Task: Generate a highly realistic 4K portrait image of a human child. Use the facial features from the provided parent photos. Ratio: 70% mother, 30% father. Output only the image." },
                    { inline_data: { mime_type: "image/jpeg", data: motherImage } },
                    { inline_data: { mime_type: "image/jpeg", data: fatherImage } }
                ]
            }],
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
            // ضبط إعدادات الأمان لمنع حظر توليد صور الأشخاص
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
        };

        const result = await model.generateContent(requestBody);
        const response = await result.response;
        const text = response.text();

        // ملاحظة: إذا كان الـ API يدعم Image Generation سيرسل رابطاً، وإلا سيعيد وصفاً
        // سنفترض هنا أننا نستقبل رابط الصورة أو نقوم بتحويلها
        if (text.includes("http")) {
             res.json({ imageUrl: text.trim() });
        } else {
            // خطة بديلة في حال أعاد Gemini وصفاً نصياً فقط
            res.json({ imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}` });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "واجه الذكاء الاصطناعي مشكلة في دمج الصور. تأكد من أن الوجوه واضحة جداً." });
    }
});

// تشغيل السيرفر
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
