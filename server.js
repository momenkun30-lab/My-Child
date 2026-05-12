const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// متغير عداد المستخدمين
let userCount = 0; 

// إعدادات السيرفر
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '/')));

// تهيئة الذكاء الاصطناعي Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/generate', async (req, res) => {
    try {
        // استلام البيانات من المتصفح (الصور، النوع، والعمر)
        const { motherImage, fatherImage, gender, age } = req.body;
        
        if (!motherImage || !fatherImage) {
            return res.status(400).json({ error: "الرجاء رفع الصور أولاً" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // صياغة الأمر البرمجي بناءً على اختيارات المستخدم والنسب المطلوبة
        const analysisPrompt = `
            Act as a master geneticist. Analyze these two parents.
            Describe a ${age} years old ${gender === 'boy' ? 'male child (boy)' : 'female child (girl)'}.
            The child must have:
            - 70% resemblance to the Mother (eyes, hair texture, and face shape).
            - 30% resemblance to the Father (skin tone, nose, and jawline).
            Output ONLY a high-quality descriptive prompt for image generation.
        `;

        const result = await model.generateContent([
            analysisPrompt,
            { inlineData: { mimeType: "image/jpeg", data: motherImage } },
            { inlineData: { mimeType: "image/jpeg", data: fatherImage } }
        ]);
        
        const promptForImage = (await result.response).text();
        const seed = Math.floor(Math.random() * 1000000);

        // الرابط الموجه لمحرك الرسم Flux
        const finalUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptForImage)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;
        
        // زيادة عداد المستخدمين عند نجاح العملية
        userCount++; 

        res.json({ imageUrl: finalUrl });

    } catch (error) {
        console.error("Error:", error);
        // خطة الطوارئ في حال فشل التحليل
        const fallbackPrompt = "A realistic 5-year-old child, high resolution portrait, cinematic lighting.";
        const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fallbackPrompt)}?width=1024&height=1024&nologo=true&model=flux`;
        
        res.json({ imageUrl: fallbackUrl });
    }
});

// لوحة التحكم البسيطة لمشاهدة عدد المستخدمين
app.get('/admin-dashboard', (req, res) => {
    res.send(`
        <div style="text-align:center; margin-top:50px; font-family:Arial; background-color:#f4f4f9; padding:50px; border-radius:20px;">
            <h1 style="color:#bc13fe;">إحصائيات موقع طفلي</h1>
            <hr style="width:200px; border:1px solid #bc13fe;">
            <p style="font-size:24px; color:#333;">عدد المستخدمين الذين قاموا بدمج الصور حالياً: 
                <br><br>
                <strong style="color:purple; font-size:50px;">${userCount}</strong>
            </p>
            <button onclick="location.reload()" style="padding:10px 20px; background:#bc13fe; color:white; border:none; border-radius:5px; cursor:pointer;">تحديث العدد</button>
            <p style="margin-top:30px; color:#666; font-size:12px;">ملاحظة: سيتم إعادة العداد لـ 0 في حال إعادة تشغيل السيرفر على Render</p>
        </div>
    `);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
