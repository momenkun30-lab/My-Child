// مكتبة البرومبتس الاحترافية التي تم بناؤها بناءً على طلبك
const promptLibrary = {
    // فئة 5 سنوات
    "boy_5": "The 5-Year-Old Boy Hybrid Prompt (English)... [تم إضافة النص الاحترافي الخاص بك هنا]",
    "girl_5": "The 5-Year-Old Girl Hybrid Prompt (English)... [تم إضافة النص الاحترافي الخاص بك هنا]",

    // فئة 10 سنوات (التي أرسلتها عبر الصور)
    "boy_10": `The 10-Year-Old Boy Hybrid Prompt: Ultra-realistic 4K portrait, 70% Mother, 30% Father. 
               Tech: Canon 5D Mark IV, 85mm f/1.4. Skin: Hyper-detailed, visible pores, no AI smoothing.`,
    
    "girl_10": `The 10-Year-Old Girl Hybrid Prompt: Task: Generate an ultra-realistic 4K portrait... 
                70% Mother (eye shape, lip curve), 30% Father (nose bridge, eyebrow density). 
                Tech: Sony A7R IV, 85mm prime, f/2.2, Rembrandt lighting.`,

    // فئة المراهقين (14-16 سنة)
    "boy_teen": `The Teenager Boy Hybrid Prompt: Mid-teens, transitional facial structure. 
                 70% Mother resemblance, 30% Father (jawline, nose bridge). 
                 Tech: 85mm prime, f/2.0, natural cinematic side-light.`,
    
    "girl_teen": `The Teenager Girl Hybrid Prompt: Aged 14-16, refined bone structure. 
                  70% Mother (eyes, lips), 30% Father (eyebrows, cheekbones). 
                  Tech: 85mm prime, f/2.0, editorial portrait style.`,

    // فئة الشباب (25 سنة)
    "boy_25": `The 25-Year-Old Young Man Hybrid Prompt: Fully developed jawline, mature structure. 
               70% Mother (eye shape, smile), 30% Father (chin, nose bridge). 
               Tech: Sony A7R V, 85mm G-Master, f/1.8.`,
    
    "girl_25": `The 25-Year-Old Young Woman Hybrid Prompt: Sophisticated, elegant bone structure. 
                70% Mother (near-identical), 30% Father (nose bridge, eyebrows). 
                Tech: 100mm macro, f/2.2, Golden Hour lighting.`
};

// الدالة الأساسية لبدء عملية الإنشاء
async function generateChildImage() {
    const gender = document.getElementById('gender').value;
    const age = document.getElementById('age').value;
    
    // اختيار البرومبت الصحيح من المكتبة
    const selectedKey = `${gender}_${age}`;
    const basePrompt = promptLibrary[selectedKey];

    if (!basePrompt) {
        alert("عذراً، هذا الخيار غير متوفر حالياً.");
        return;
    }

    console.log("تم اختيار البرومبت:", basePrompt);

    // إظهار واجهة التحميل
    document.getElementById('resultArea').classList.remove('hidden');
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('generateBtn').innerText = "جاري دمج الجينات...";

    try {
        // هنا يتم إرسال الصور والبرومبت إلى سيرفر Render
        // السيرفر هو من يتحدث مع Gemini API
        const response = await fetch('https://your-render-app.onrender.com/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: basePrompt,
                // هنا نرسل الصور المرفوعة (Base64)
                motherImage: "...", 
                fatherImage: "..."
            })
        });

        const data = await response.json();
        
        // عرض الصورة النهائية
        if (data.imageUrl) {
            document.getElementById('finalImage').src = data.imageUrl;
            // تسجيل العملية للوحة التحكم (Admin Panel)
            saveToAdminStats(gender, age);
        }

    } catch (error) {
        console.error("خطأ في الاتصال بالسيرفر:", error);
        alert("حدث خطأ أثناء معالجة الصور. يرجى المحاولة لاحقاً.");
    } finally {
        document.getElementById('generateBtn').disabled = false;
        document.getElementById('generateBtn').innerText = "إنشاء ملامح الطفل الآن";
    }
}

// دالة لتحديث إحصائيات لوحة التحكم
function saveToAdminStats(gender, age) {
    let stats = JSON.parse(localStorage.getItem('adminStats')) || { total: 0, history: [] };
    stats.total += 1;
    stats.history.push({ type: `${gender} (${age} سنة)`, time: new Date().toLocaleTimeString() });
    localStorage.setItem('adminStats', JSON.stringify(stats));
}

// ربط الزر بالدالة
document.getElementById('generateBtn').addEventListener('click', generateChildImage);
