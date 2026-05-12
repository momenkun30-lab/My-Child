// 1. وظائف مساعدة لجلب العناصر وتحويل الصور
const getEl = (id) => document.getElementById(id);

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

// 2. إعداد معاينة الصور فور رفعها (لإظهار صور الأب والأم في الدوائر)
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
                preview.style.display = 'block';
                placeholder.style.display = 'none';
            }
        };
    }
}

// تفعيل المعاينة
setupPreview('motherInput', 'motherPreview', 'motherPlaceholder');
setupPreview('fatherInput', 'fatherPreview', 'fatherPlaceholder');

// 3. الوظيفة الرئيسية لإنشاء ملامح الطفل (المحدثة بالعمر والنوع)
async function generateChild() {
    const mInput = getEl('motherInput');
    const fInput = getEl('fatherInput');
    const gender = getEl('gender').value; // جلب القيمة (ولد/بنت)
    const age = getEl('age').value;       // جلب القيمة (العمر)
    
    const btn = getEl('generateBtn');
    const resultArea = getEl('resultArea');
    const finalImage = getEl('finalImage');

    // التأكد من رفع الصور
    if (!mInput.files[0] || !fInput.files[0]) {
        alert("الرجاء رفع صورة الأم والأب أولاً");
        return;
    }

    // تجهيز الواجهة للتحميل
    const originalText = btn.innerText;
    btn.innerText = "جاري دمج الملامح... انتظر قليلاً";
    btn.disabled = true;
    btn.style.opacity = "0.6";

    try {
        // تحويل الصور وإرسال الطلب للسيرفر مع (العمر والنوع)
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                motherImage: await toBase64(mInput.files[0]), 
                fatherImage: await toBase64(fInput.files[0]),
                gender: gender, 
                age: age        
            })
        });

        const data = await response.json();

        if (data.imageUrl) {
            // إضافة Timestamp للرابط لمنع المتصفح من عرض صورة قديمة أو مكسورة
            const finalUrl = data.imageUrl + "&t=" + new Date().getTime();

            // إعداد مستمع للأخطاء (إعادة محاولة إذا لم تكن الصورة جاهزة)
            finalImage.onerror = function() {
                console.log("الصورة قيد المعالجة، إعادة المحاولة...");
                setTimeout(() => { finalImage.src = finalUrl; }, 2500);
            };

            // إظهار النتيجة عند اكتمال تحميل الصورة
            finalImage.onload = function() {
                resultArea.classList.remove('hidden');
                finalImage.style.display = 'block';
                resultArea.scrollIntoView({ behavior: 'smooth' });
            };

            finalImage.src = finalUrl;
            finalImage.crossOrigin = "anonymous";
        } else {
            alert("حدث خطأ في السيرفر: " + (data.error || "فشل الدمج"));
        }

    } catch (error) {
        console.error("Fetch Error:", error);
        alert("تعذر الاتصال بالسيرفر. تأكد من أن الموقع 'Live' على Render");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
        btn.style.opacity = "1";
    }
}

// 4. ربط الزر بالوظيفة
getEl('generateBtn').addEventListener('click', generateChild);
