const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // للسماح برفع الصور بحجم كبير

const PORT = process.env.PORT || 3000;

// نقطة النهاية (Endpoint) لمعالجة الطلبات
app.post('/generate', async (req, res) => {
    try {
        const { prompt, motherImage, fatherImage } = req.body;

        // التحقق من وجود مفتاح الـ API في إعدادات Render
        const API_KEY = process.env.GEMINI_API_KEY;
        
        if (!API_KEY) {
            return res.status(500).json({ error: "API Key is missing on server" });
        }

        // إعداد الطلب لإرساله لـ Gemini (نموذج Imagen أو Gemini Multimodal)
        // ملاحظة: هنا نستخدم هيكلية إرسال الصور والنص معاً
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: `Task: Create a hybrid child image based on these two parents. ${prompt}` },
                        { inline_data: { mime_type: "image/jpeg", data: motherImage } },
                        { inline_data: { mime_type: "image/jpeg", data: fatherImage } }
                    ]
                }]
            })
        });

        const data = await response.json();

        // استلام الصورة الناتجة (بافتراض أن Gemini يعيد رابطاً أو كوداً للصورة)
        // ملاحظة: قد تختلف هيكلية البيانات حسب نوع الـ Model المستخدم
        if (data && data.candidates) {
            res.json({ imageUrl: data.candidates[0].content.parts[0].text }); 
        } else {
            res.status(400).json({ error: "فشل الذكاء الاصطناعي في تكوين الصورة" });
        }

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ error: "حدث خطأ في الخادم" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
