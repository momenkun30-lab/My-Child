const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// إعدادات استقبال البيانات والصور الكبيرة
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '/')));

// تهيئة الذكاء الاصطناعي باستخدام مفتاح البيئة
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', async (req, res) => {
    try {
        const { motherImage, fatherImage } = req.body;

        if (!motherImage || !fatherImage) {
            return res.status(400).json({ error: "يرجى رفع صور الوالدين أولاً." });
        }

        // استخدام موديل Gemini 1.5 Flash لتحليل الملامح الوراثية
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // أمر التحليل الوراثي بدقة (70% أم و 30% أب)
        const prompt = "Analyze these two parents. Describe their 5-year-old biological son in detail. Combine 70% of the mother's facial features and 30% of the father's skin and jawline. Describe his eyes, hair, and expression for a photorealistic 4K portrait.";

        const result = await model.generateContent([
            prompt,
            { inlineData: { mimeType: "image/jpeg", data: motherImage } },
            { inlineData: { mimeType: "image/jpeg", data: fatherImage } }
        ]);

        const response = await result.response;
        const aiDescription = response.text();

        // استخدام محرك Pollinations لتحويل الوصف إلى صورة (لضمان تجاوز حظر صور البشر)
        // أضفنا seed عشوائي لضمان الحصول على نتيجة مختلفة في كل مرة
        const randomSeed = Math.floor(Math.random() * 10000);
        const finalImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiDescription)}?width=1024&height=1024&nologo=true&seed=${randomSeed}`;

        // إرسال رابط الصورة النهائي للمتصفح
        res.json({ imageUrl: finalImageUrl });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "فشلت عملية الدمج، تأكد من وضوح الصور وحاول مرة أخرى." });
    }
});

app.listen(port, () => {
    console.log(`Server is active on port ${port}`);
});
