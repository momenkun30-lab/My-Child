/**
 * MY CHILD - المحرك الرئيسي للموقع
 * يحتوي على مكتبة البرومبتس ومنطق معالجة الصور والربط بالسيرفر
 */

// 1. مكتبة البرومبتس الكاملة (بناءً على الصور والنصوص التي قدمتها)
const promptLibrary = {
    "boy_5": "The 5-Year-Old Boy Hybrid Prompt: Ultra-realistic 4K portrait, 70% Mother resemblance, 30% Father. Focus on early childhood features and soft lighting.",
    "girl_5": "The 5-Year-Old Girl Hybrid Prompt: Ultra-realistic 4K portrait, 70% Mother, 30% Father. Delicate facial features, natural childhood innocence.",
    
    "boy_10": "The 10-Year-Old Boy Hybrid Prompt: Ultra-realistic 4K, 70% Mother (eye shape, lip structure), 30% Father (nose bridge, eyebrow density). Tech: Canon 5D Mark IV, 85mm f/1.4, Rembrandt style lighting, hyper-detailed skin pores.",
    "girl_10": "The 10-Year-Old Girl Hybrid Prompt: Task: Generate an ultra-realistic 4K portrait of a 10-year-old girl. 70% Mother (face soft contours), 30% Father (jawline strength). Tech: Sony A7R IV, 85mm prime, f/2.2, soft natural daylight.",

    "boy_teen": "The Teenager Boy Hybrid Prompt: Aged 14-16, developing jawline, transitional facial structure. 70% Mother (eye shape, lip curve), 30% Father (nose bridge, eyebrow density). Tech: 85mm prime, f/2.0, cinematic side-lighting.",
    "girl_teen": "The Teenager Girl Hybrid Prompt: Aged 14-16, refined facial structure, teenage poise. 70% Mother (overall aesthetic, lip curvature), 30% Father (eyebrow thickness, cheekbones). Tech: 85mm prime, f/2.0, editorial portrait style.",

    "boy_25": "The 25-Year-Old Young Man Hybrid Prompt: Fully developed jawline, mature facial structure. 70% Mother (eye shape, smile curve), 30% Father (nose bridge, chin structure). Tech: Sony A7R V, 85mm G-Master, f/1.8, cinematic Rembrandt lighting.",
    "girl_25": "The 25-Year-Old Young Woman Hybrid Prompt: Sophisticated mid-20s woman, refined bone structure. 70% Mother (near-identical young version), 30% Father (nose bridge profile, eyebrow density). Tech: 100mm macro, f/2.2, Golden Hour light."
};

// 2. متغيرات لحفظ الصور المرفوعة بصيغة Base64
let motherBase64 = "";
let fatherBase64 = "";

// 3. وظيفة تحويل الصورة إلى Base64 عند اختيار ملف
function setupImageUpload(inputId, targetVar) {
    document.getElementById(inputId).addEventListener('change', function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = function() {
            if (inputId === 'motherInput') motherBase64 = reader.result.split(',')[1];
            if (inputId === 'fatherInput') fatherBase64 = reader.result.split(',')[1];
            console.log(`${inputId} جاهزة المعالجة`);
        }
        reader.readAsDataURL(file);
    });
}

// تفعيل المستمعات لرفع الصور
// ملاحظة: تأكد أن ملف HTML يحتوي على id="motherInput" و id="fatherInput" في حقول الملفات
// سأقوم بتعديل بسيط في HTML الخاص بك ليتناسب مع هذا
setupImageUpload('motherInput', 'motherBase64');
setupImageUpload('fatherInput', 'fatherBase64');

// 4. الدالة الرئيسية لإنشاء الصورة
async function generateChildImage() {
    const gender = document.getElementById('gender').value;
    const age = document.getElementById('age').value;
    const generateBtn = document.getElementById('generateBtn');
    const resultArea = document.getElementById('resultArea');
    const finalImage = document.getElementById('finalImage');

    // التأكد من رفع الصور
    if (!motherBase64 || !fatherBase64) {
        alert("يرجى رفع صورة الأم وصورة الأب أولاً.");
        return;
    }

    // اختيار البرومبت
    const selectedKey = `${gender}_${age}`;
    const prompt = promptLibrary[selectedKey];

    // تحديث واجهة المستخدم
    resultArea.classList.remove('hidden');
    generateBtn.disabled = true;
    generateBtn.innerText = "جاري تحليل الجينات ودمج الملامح...";
    finalImage.style.opacity = "0.3";

    try {
        // الاتصال بسيرفر Render (استبدل الرابط برابط موقعك الفعلي بعد الرفع)
        const response = await fetch('https://your-app-name.onrender.com/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: prompt,
                motherImage: motherBase64,
                fatherImage: fatherBase64
            })
        });

        const data = await response.json();

        if (data.imageUrl) {
            finalImage.src = data.imageUrl;
            finalImage.style.opacity = "1";
            
            // حفظ العملية في إحصائيات الأدمين (LocalStorage)
            saveToAdminStats(gender, age);
            alert("تم إنشاء صورة طفلك بنجاح!");
        } else {
            throw new Error(data.error || "فشل إنشاء الصورة");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ في الاتصال بالسيرفر. تأكد من تشغيل السيرفر على Render.");
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerText = "إنشاء ملامح الطفل الآن";
    }
}

// 5. وظيفة حفظ الإحصائيات للوحة التحكم
function saveToAdminStats(gender, age) {
    let stats = JSON.parse(localStorage.getItem('adminStats')) || { total: 0, history: [] };
    stats.total += 1;
    stats.history.push({
        type: `${gender} (${age} سنة)`,
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    });
    localStorage.setItem('adminStats', JSON.stringify(stats));
}

// ربط الزر بالدالة الرئيسية
document.getElementById('generateBtn').addEventListener('click', generateChildImage);
