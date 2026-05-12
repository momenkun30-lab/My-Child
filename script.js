// 1. وظائف مساعدة لجلب العناصر وتحويل الملفات
const getEl = (id) => document.getElementById(id);

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

// 2. إعداد معاينة الصور فور الرفع (إظهار الصور وإخفاء الأيقونات)
function setupPreview(inputId, previewId, placeholderId) {
    const input = getEl(inputId);
    const preview = getEl(previewId);
    const placeholder = getEl(placeholderId);

    if (input && preview && placeholder) {
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                preview.src = URL.createObjectURL(file);
                preview.style.display = 'block';
                placeholder.style.display = 'none';
            }
        };
    }
}

setupPreview('motherInput', 'motherPreview', 'motherPlaceholder');
setupPreview('fatherInput', 'fatherPreview', 'fatherPlaceholder');

// 3. الوظيفة الرئيسية لإنشاء الصورة
async function generateChild() {
    const mFile = getEl('motherInput').files[0];
    const fFile = getEl('fatherInput').files[0];
    const btn = getEl('generateBtn');
    const resultArea = getEl('resultArea');
    const finalImage = getEl('finalImage');

    if (!mFile || !fFile) {
        alert("الرجاء رفع صورة الأم والأب أولاً");
        return;
    }

    // تجهيز الواجهة للتحميل
    btn.innerText = "جاري دمج ملامح الوالدين...";
    btn.disabled = true;
    btn.style.opacity = "0.6";
    resultArea.classList.add('hidden'); // إخفاء النتيجة السابقة إن وجدت

    try {
        const mBase = await toBase64(mFile);
        const fBase = await toBase64(fFile);

        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ motherImage: mBase, fatherImage: fBase })
        });

        const data = await response.json();

        if (data.imageUrl) {
            // إضافة رقم عشوائي للرابط لمنع المتصفح من عرض الصورة القديمة المكسورة
            const finalUrl = data.imageUrl + "&t=" + new Date().getTime();

            // إعداد مستمع للأخطاء في حال تأخر السيرفر في تجهيز الصورة
            finalImage.onerror = function() {
                console.log("إعادة محاولة تحميل الصورة...");
                setTimeout(() => { finalImage.src = finalUrl; }, 2000);
            };

            // إظهار النتيجة فقط عندما تكتمل الصورة تماماً
            finalImage.onload = function() {
                resultArea.classList.remove('hidden');
                finalImage.style.display = 'block';
                resultArea.scrollIntoView({ behavior: 'smooth' });
            };

            finalImage.src = finalUrl;
            finalImage.crossOrigin = "anonymous"; // لحل مشاكل الحماية بين المواقع
        } else {
            alert("فشل الدمج: " + (data.error || "خطأ مجهول"));
        }

    } catch (error) {
        alert("خطأ في الاتصال بالسيرفر. تأكد أن Render يعمل (Live)");
        console.error(error);
    } finally {
        btn.innerText = "إنشاء ملامح الطفل الآن";
        btn.disabled = false;
        btn.style.opacity = "1";
    }
}

// ربط الوظيفة بالزر
getEl('generateBtn').addEventListener('click', generateChild);
