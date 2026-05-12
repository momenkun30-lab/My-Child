const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// إعدادات الأمان واستقبال البيانات
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '/')));

// التأكد من وجود مفتاح الـ API
if (!process.env.GEMINI_API_KEY) {
    console.error("خطأ: لم يتم العثور على مفتاح GEMINI_API_KEY في إعدادات Render");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', async (req, res) => {
    try {
        const { motherImage, fatherImage, prompt } = req.body;

        if (!motherImage || !fatherImage) {
            return res.status(400).json({ error: "يرجى رفع صور الوالدين" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const requestBody = {
            contents: [{
                parts: [
                    { text: prompt + " Generate a highly realistic photo of a child. 70% mother features, 30% father features. High quality portrait." },
                    { inline_data: { mime_type: "image/jpeg", data: motherImage } },
                    { inline_data: { mime_type: "image/jpeg", data: fatherImage } }
                ]
            }],
            generationConfig: {
                temperature: 0.9,
                topP: 0.95,
                maxOutputTokens: 1024,
            },
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

        // فحص النتيجة: إذا كانت رابطاً أو وصفاً
        if (text.includes("http")) {
            res.json({ imageUrl: text.trim() });
        } else {
            // استخدام محرك خارجي موثوق في حال أعاد الوصف فقط
            const finalUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(text)}?width=512&height=512&nologo=true`;
            res.json({ imageUrl: finalUrl });
        }

    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "فشلت المعالجة، يرجى المحاولة مرة أخرى بصور أوضح." });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
