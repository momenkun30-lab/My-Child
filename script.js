// 1. وظائف مساعدة
const getEl = (id) => document.getElementById(id);

// تحويل الصورة إلى نص (Base64) لإرسالها عبر السيرفر
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

// 2. إعداد معاينة الصور فور رفعها (لإظهار الصور في الدوائر البنفسجية)
function setupPreview(inputId, previewId, placeholderId) {
    const input = getEl(inputId);
    const preview = getEl(previewId);
    const placeholder = getEl(placeholderId);

    if (input && preview && placeholder) {
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                preview.src = url;
                preview.style.display = 'block'; // إظهار الصورة المرفوعة
                placeholder.style.display = 'none'; // إخفاء الأيقونة (👩/👨)
            }
        };
    }
}

// تشغيل المعاينة للأم والأب
setupPreview('motherInput', 'motherPreview', 'motherPlaceholder');
setupPreview('fatherInput', 'fatherPreview', 'fatherPlaceholder');

// 3. الوظيفة الرئيسية لإنشاء ملامح الطفل
async function generateChild() {
    const motherFile = getEl('motherInput').files[0];
    const fatherFile = getEl('fatherInput').files[0];
    const gender = getEl('gender').value;
    const age = getEl('age').value;
    const generateBtn = getEl('generateBtn');
    const resultArea = getEl('resultArea');
    const finalImage = getEl('finalImage');

    // التحقق من رفع الصور
    if (!motherFile || !fatherFile) {
        alert("الرجاء رفع صورة الأم وصورة الأب أولاً");
        return;
    }

    // تحديث حالة الزر أثناء المعالجة
    const originalText = generateBtn.innerText;
    generateBtn.innerText = "جاري دمج الجينات... يرجى الانتظار";
    generateBtn.disabled = true;
    generateBtn.style.opacity = "0.6";

    try {
        // تحويل الصور
        const mBase64 = await toBase64(motherFile);
        const fBase64 = await toBase64(fatherFile);

        // إرسال البيانات للسيرفر (Render)
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                motherImage: mBase64,
                fatherImage: fBase64,
                gender: gender,
                age: age
            })
        });

        const data = await response.json();

        if (data.imageUrl) {
            // إظهار النتيجة النهائية
            finalImage.src = data.imageUrl;
            resultArea.classList.remove('hidden'); // إزالة الإخفاء عن قسم النتيجة
            
            // النزول تلقائياً لمكان النتيجة
            resultArea.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert("حدث خطأ في السيرفر: " + (data.error || "يرجى المحاولة مرة أخرى"));
        }

    } catch (error) {
        console.error("Error:", error);
        alert("تعذر الاتصال بالسيرفر. تأكد من أن الموقع 'Live' على منصة Render.");
    } finally {
        // إعادة الزر لحالته الطبيعية
        generateBtn.innerText = originalText;
        generateBtn.disabled = false;
        generateBtn.style.opacity = "1";
    }
}

// ربط وظيفة الإنشاء بالزر
getEl('generateBtn').addEventListener('click', generateChild);
