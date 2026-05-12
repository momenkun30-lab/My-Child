// وظيفة مساعدة لتحويل الملفات إلى Base64
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

// 1. منطق معاينة الصور عند اختيارها
function setupPreview(inputId, imgId, placeholderId) {
    const input = document.getElementById(inputId);
    const img = document.getElementById(imgId);
    const placeholder = document.getElementById(placeholderId);

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            img.src = url;
            img.style.display = 'block'; // إظهار الصورة
            placeholder.style.display = 'none'; // إخفاء الأيقونة (👨/👩)
        }
    };
}

// تفعيل المعاينة للأم والأب
setupPreview('motherInput', 'motherPreview', 'motherPlaceholder');
setupPreview('fatherInput', 'fatherPreview', 'fatherPlaceholder');

// 2. منطق زر الإنشاء
document.getElementById('generateBtn').onclick = async function() {
    const motherFile = document.getElementById('motherInput').files[0];
    const fatherFile = document.getElementById('fatherInput').files[0];
    const gender = document.getElementById('gender').value;
    const age = document.getElementById('age').value;
    const resultArea = document.getElementById('resultArea');
    const finalImage = document.getElementById('finalImage');
    const btn = this;

    if (!motherFile || !fatherFile) {
        alert("الرجاء رفع صورة الأم وصورة الأب أولاً");
        return;
    }

    // تغيير شكل الزر أثناء التحميل
    const originalText = btn.innerText;
    btn.innerText = "جاري الدمج... انتظر قليلاً";
    btn.disabled = true;
    btn.style.opacity = "0.7";

    try {
        const mBase64 = await toBase64(motherFile);
        const fBase64 = await toBase64(fatherFile);

        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                motherImage: mBase64,
                fatherImage: fBase64,
                prompt: `A photorealistic portrait of a ${age} years old ${gender}.`
            })
        });

        const data = await response.json();

        if (data.imageUrl) {
            finalImage.src = data.imageUrl;
            resultArea.classList.remove('hidden'); // إظهار قسم النتيجة
            resultArea.scrollIntoView({ behavior: 'smooth' }); // النزول للنتيجة تلقائياً
        } else {
            alert("حدث خطأ في السيرفر: " + (data.error || "حاول مرة أخرى"));
        }
    } catch (error) {
        console.error(error);
        alert("فشل الاتصال بالسيرفر. تأكد أن موقع Render في حالة Live");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
        btn.style.opacity = "1";
    }
};
