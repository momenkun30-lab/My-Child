// 1. وظائف معاينة الصور فور رفعها لضمان ظهورها في الموقع
document.getElementById('motherInput').onchange = function (evt) {
    const file = evt.target.files[0];
    if (file) {
        // تحديث العنصر الذي يعرض صورة الأم في الواجهة
        document.getElementById('motherPreview').src = URL.createObjectURL(file);
        console.log("تم تحميل صورة الأم للمعاينة");
    }
};

document.getElementById('fatherInput').onchange = function (evt) {
    const file = evt.target.files[0];
    if (file) {
        // تحديث العنصر الذي يعرض صورة الأب في الواجهة
        document.getElementById('fatherPreview').src = URL.createObjectURL(file);
        console.log("تم تحميل صورة الأب للمعاينة");
    }
};

// 2. الوظيفة الرئيسية لدمج الصور وإرسالها للسيرفر
async function generateChild() {
    const motherFile = document.getElementById('motherInput').files[0];
    const fatherFile = document.getElementById('fatherInput').files[0];
    const resultImg = document.getElementById('resultImage');
    const loadingDiv = document.getElementById('loadingMessage'); // تأكد من وجود هذا الـ ID في HTML

    // التحقق من وجود الصور
    if (!motherFile || !fatherFile) {
        alert("من فضلك اختر صورة الأم وصورة الأب أولاً");
        return;
    }

    // إظهار حالة التحميل
    if(loadingDiv) loadingDiv.style.display = 'block';
    resultImg.style.display = 'none';

    try {
        // تحويل الصور إلى Base64
        const mBase64 = await toBase64(motherFile);
        const fBase64 = await toBase64(fatherFile);

        // إرسال البيانات إلى سيرفر Render
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                motherImage: mBase64.split(',')[1],
                fatherImage: fBase64.split(',')[1]
            })
        });

        const data = await response.json();

        if (data.imageUrl) {
            // عرض النتيجة النهائية
            resultImg.src = data.imageUrl;
            resultImg.style.display = 'block';
            console.log("تم استلام صورة الطفل بنجاح");
        } else {
            alert("حدث خطأ: " + (data.error || "فشل الدمج"));
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        alert("تعذر الاتصال بالسيرفر. تأكد أن موقع Render في حالة Live");
    } finally {
        if(loadingDiv) loadingDiv.style.display = 'none';
    }
}

// 3. وظيفة مساعدة لتحويل الملفات
function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
