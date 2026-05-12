const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '/')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', async (req, res) => {
    try {
        const { motherImage, fatherImage, prompt } = req.body;
        
        // استخدام الموديل الأحدث والأسرع
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent([
            { text: prompt + " Task: Describe the child's face based on these parents for image generation." },
            { inlineData: { mimeType: "image/jpeg", data: motherImage } },
            { inlineData: { mimeType: "image/jpeg", data: fatherImage } }
        ]);

        const response = await result.response;
        const aiText = response.text();
        
        // تحويل وصف الذكاء الاصطناعي لرابط صورة حقيقي
        const finalImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiText)}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;
        
        res.json({ imageUrl: finalImageUrl });

    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ error: "فشلت المعالجة، يرجى المحاولة لاحقاً." });
    }
});

app.listen(port, () => console.log(`Server started on port ${port}`));
