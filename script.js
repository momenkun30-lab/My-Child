/**
 * MY CHILD - المحرك المحدث
 * ميزات الكود: 
 * 1. تصغير الصور برمجياً لضمان نجاح المعالجة.
 * 2. دعم الواجهة الكلاسيكية (المعاينة داخل دوائر).
 * 3. الربط المباشر مع سيرفر Render.
 */

let motherBase64 = "";
let fatherBase64 = "";

/**
 * وظيفة إعداد رفع الصور ومعالجتها
 */
function setupUpload(inputId, previewId, placeholderId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                // إنشاء "كانفاس" لتصغير أبعاد الصورة
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // تحديد أبعاد 400x400 بكسل (مثالية للذكاء الاصطناعي وخفيفة)
                canvas.width = 400;
                canvas.height = 400;
                
                // رسم الصورة بشكل مربع في المركز
                ctx.drawImage(img, 0, 0, 400, 400);
                
                // تحويل الصورة إلى نص Base64 بجودة مضغوطة 0.7
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
                
                if(inputId === 'motherInput') {
                    motherBase64 = compressedBase64;
                } else {
                    fatherBase64 = compressedBase64;
                }

                // تحديث واجهة المستخدم بالمعاينة
                const preview = document.getElementById(previewId);
                const placeholder = document.getElementById(placeholderId);
                
                preview.src = canvas.toDataURL('image/jpeg');
                preview.style.display = 'block'; // إظهار الدائرة
                if (placeholder) placeholder.style.display = 'none'; // إخفاء الأيقونة
                
                console.log("تمت معالجة وتصغير صورة: " + inputId);
            }
        };
        reader.readAsDataURL(file);
    });
}

// تفعيل المعالجة للأم والأب فور تحميل الملف
setupUpload('motherInput', 'motherPreview', 'motherPlaceholder');
setupUpload('fatherInput', 'fatherPreview', 'fatherPlaceholder');

/**
 * وظيفة إرسال الطلب لذكاء Gemini الاصطناعي
 */
document.getElementById('generateBtn').addEventListener('click', async () => {
    // التحقق من رفع الصور
    if(!motherBase64 || !fatherBase64) {
        alert("يرجى رفع صورة الأم وصورة الأب أولاً");
        return;
    }
    
    const btn = document.getElementById('generateBtn');
    const resultArea = document.getElementById('resultArea');
    const finalImage = document.getElementById('finalImage');

    // تغيير حالة الزر أثناء التحميل
    btn.innerText = "جاري دمج الجينات... يرجى الانتظار";
    btn.disabled = true;
    btn.style.opacity = "0.7";

    try {
        // إرسال البيانات إلى السيرفر الخاص بك على Render
        const response = await fetch('https://my-child.onrender.com/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                prompt: `Hyper-realistic portrait of a ${document.getElementById('age').value} year old ${document.getElementById('gender').value}. Blend of both parents.`,
                motherImage: motherBase64,
                fatherImage: fatherBase64
            })
        });

        const data = await response.json();
        
        if(data.imageUrl) {
            // إظهار منطقة النتيجة وعرض الصورة النهائية
            resultArea.classList.remove('hidden');
            finalImage.src = data.imageUrl;
            
            // تمرير الشاشة تلقائياً للأسفل لرؤية النتيجة
            finalImage.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert("واجه الذكاء الاصطناعي مشكلة في دمج الصور. يرجى التأكد من أن الوجوه واضحة جداً.");
        }
    } catch (e) {
        alert("فشل الاتصال بالسيرفر. تأكد من أن خدمة Render في حالة 'Live'.");
        console.error("Connection Error:", e);
    } finally {
        // إعادة الزر لحالته الأصلية
        btn.innerText = "إنشاء ملامح الطفل الآن";
        btn.disabled = false;
        btn.style.opacity = "1";
    }
});
