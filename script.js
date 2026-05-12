// وظيفة ذكية لإيجاد العناصر بأي اسم محتمل
const getEl = (id) => document.getElementById(id);

// 1. معاينة الصور فور الرفع
const setupPreview = (inputId, previewId) => {
    const input = getEl(inputId);
    const preview = getEl(previewId);
    if (input && preview) {
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) preview.src = URL.createObjectURL(file);
        };
    }
};

// تشغيل المعاينة للأم والأب
setupPreview('motherInput', 'motherPreview');
setupPreview('fatherInput', 'fatherPreview');

// 2. الوظيفة الرئيسية للدمج
async function generateChild() {
    // محاولة جلب العناصر
    const mInput = getEl('motherInput');
    const fInput = getEl('fatherInput');
    const resImg = getEl('resultImage');
    const loader = getEl('loadingMessage') || { style: {} };

    if (!mInput?.files[0] || !fInput?.files[0]) {
        return alert("من فضلك اختر صورتين أولاً!");
    }

    loader.style.display = 'block';
    if(resImg) resImg.style.display = 'none';

    try {
        const toB64 = (file) => new Promise((res) => {
            const r = new FileReader(); r.readAsDataURL(file);
            r.onload = () => res(r.result.split(',')[1]);
        });

        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                motherImage: await toB64(mInput.files[0]),
                fatherImage: await toB64(fInput.files[0])
            })
        });

        const data = await response.json();
        if (data.imageUrl && resImg) {
            resImg.src = data.imageUrl;
            resImg.style.display = 'block';
        } else {
            alert("خطأ من السيرفر: " + (data.error || "فشل الدمج"));
        }
    } catch (err) {
        alert("حدث خطأ في الاتصال بالسيرفر. تأكد أن الموقع Live في Render");
    } finally {
        loader.style.display = 'none';
    }
}
