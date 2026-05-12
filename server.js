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
        const { motherImage, fatherImage } = req.body;
        
        if (!motherImage || !fatherImage) {
            return res.status(400).json({ error: "الرجاء رفع الصور أولاً" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // أمر التحليل الجيني لضمان الشبه المطلوب (70% أم، 30% أب)
        const analysisPrompt = `
            Act as a master geneticist. Analyze these two parents.
            Describe a 5-year-old child that has exactly:
            - 70% resemblance to the Mother (specifically eyes, hair texture, and face shape).
            - 30% resemblance to the Father (specifically skin tone, nose, and jawline).
            Output ONLY a high-quality descriptive prompt for image generation.
        `;

        const result = await model.generateContent([
            analysisPrompt,
            { inlineData: { mimeType: "image/jpeg", data: motherImage } },
            { inlineData: { mimeType: "image/jpeg", data: fatherImage } }
        ]);
        
        const promptForImage = (await result.response).text();
        const seed = Math.floor(Math.random() * 1000000);

        // تأكد أن هذا هو السطر الأخير في سيرفرك قبل إرسال json
        const finalUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptForImage)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;
        
        res.json({ imageUrl: finalUrl });

    } catch (error) {
        console.error("Error:", error);
        // خطة البديلة بنفس الملامح في حال تعثر Gemini
        const fallbackPrompt = "A realistic 5-year-old child, 70% mother features, curly hair, 30% father skin tone, high resolution portrait.";
        const seed = Math.floor(Math.random() * 1000000);
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fallbackPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;
        
        res.json({ imageUrl: fallbackUrl });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
