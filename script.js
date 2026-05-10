/**
 * MY CHILD - المحرك النهائي المحدث
 * يدعم المعاينة الفورية وإرسال الصور إلى Render
 */

// 1. مكتبة البرومبتس الاحترافية
const promptLibrary = {
    "boy_5": "The 5-Year-Old Boy Hybrid Prompt: Ultra-realistic 4K portrait, 70% Mother resemblance, 30% Father. Soft childhood features.",
    "girl_5": "The 5-Year-Old Girl Hybrid Prompt: Ultra-realistic 4K portrait, 70% Mother, 30% Father. Delicate facial features.",
    "boy_10": "The 10-Year-Old Boy Hybrid Prompt: Ultra-realistic 4K, 70% Mother (eye shape), 30% Father (nose bridge). Rembrandt lighting.",
    "girl_10": "The 10-Year-Old Girl Hybrid Prompt: Ultra-realistic 4K, 70% Mother, 30% Father. Sony A7R IV style.",
    "boy_teen": "The Teenager Boy Hybrid Prompt: Aged 15, developing jawline. 70% Mother, 30% Father. Cinematic lighting.",
    "girl_teen": "The Teenager Girl Hybrid Prompt: Aged 15, refined structure. 70% Mother, 30% Father. Editorial portrait.",
    "boy_25": "The 25-Year-Old Young Man Hybrid Prompt: Mature structure. 70% Mother, 30% Father. Sony A7R V, 85mm.",
    "girl_25": "The 25-Year-Old Young Woman Hybrid Prompt: Sophisticated woman. 70% Mother, 30% Father. 100mm macro style."
};

let motherBase64 = "";
let fatherBase64 = "";

/**
 * وظيفة معالجة رفع الصور وإظهار المعاينة فوراً
 */
function handleImageUpload(inputId, previewId, placeholderId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const placeholder = document.getElementById(placeholderId);

    if (!input) return;

    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // 1. عرض الصورة المختارة في الموقع
                preview.src = event.target.result;
                preview.style.display = 'block'; // إظهار عنصر الصورة
                
                // 2. إخفاء الأيقونة المؤقتة (Placeholder)
                if (placeholder) placeholder.style.display = 'none';
                
                // 3. تحويل الصورة لصيغة Base64 لإرسالها للسيرفر
                const baseData = event.target.result.split(',')[1];
                if (inputId === 'motherInput') motherBase64 = baseData;
                if (inputId === 'fatherInput') fatherBase64 = baseData;
                
                console.log("تم تحميل ومعاينة الصورة: " + inputId);
            };
            
            reader.readAsDataURL(file);
        }
    });
}

// تفعيل المعاينة للمدخلين (الأم والأب)
handleImageUpload('motherInput', 'motherPreview', 'motherPlaceholder');
handleImageUpload('fatherInput', 'fatherPreview', 'fatherPlaceholder');

/**
 * الدالة الرئيسية لإرسال البيانات لذكاء Gemini الاصطناعي
 */
async function generateChildImage() {
    const gender = document.getElementById('gender').value;
    const age = document.getElementById('age').value;
    const generateBtn = document.getElementById('generateBtn');
    const resultArea = document.getElementById('resultArea');
    const finalImage = document.getElementById('finalImage');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // التأكد من وجود الصور
    if (!motherBase64 || !fatherBase64) {
        alert("يرجى رفع صورة الأم وصورة الأب لرؤية النتيجة.");
        return;
    }

    const selectedKey = `${gender}_${age}`;
    const prompt = promptLibrary[selectedKey];

    // تجهيز واجهة المستخدم للتحميل
    resultArea.classList.remove('hidden');
    loadingOverlay.classList.remove('hidden');
    generateBtn.disabled = true;
    generateBtn.innerText = "جاري دمج الجينات... يرجى الانتظار";
    finalImage.style.opacity = "0.3";

    try {
        // الرابط الرسمي لموقعك على Render
        const response = await fetch('https://my-child.onrender.com/generate', {
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
            // عرض الصورة الناتجة
            finalImage.src = data.imageUrl;
            finalImage.style.opacity = "1";
            
            // حفظ في الإحصائيات (LocalStorage)
            saveToAdminStats(gender, age);
        } else {
            alert("عذراً، واجه الذكاء الاصطناعي مشكلة. حاول مرة أخرى بصور أوضح.");
        }

    } catch (error) {
        console.error("Error:", error);
        alert("خطأ في الاتصال بالسيرفر. تأكد من تشغيل السيرفر على Render.");
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerText = "إنشاء ملامح الطفل الآن";
        loadingOverlay.classList.add('hidden');
    }
}

// وظيفة حفظ الإحصائيات للوحة التحكم
function saveToAdminStats(gender, age) {
    let stats = JSON.parse(localStorage.getItem('adminStats')) || { total: 0, history: [] };
    stats.total += 1;
    stats.history.push({
        type: `${gender === 'boy' ? 'ولد' : 'بنت'} (${age} سنة)`,
        time: new Date().toLocaleTimeString('ar-EG')
    });
    localStorage.setItem('adminStats', JSON.stringify(stats));
}

// ربط الزر بالدالة
document.getElementById('generateBtn').addEventListener('click', generateChildImage);
