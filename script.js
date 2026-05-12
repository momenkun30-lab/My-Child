async function startGeneration() {
    // 1. استلام الصور من المدخلات
    const mImg = document.getElementById('motherInput').files[0];
    const fImg = document.getElementById('fatherInput').files[0];
    const resultBox = document.getElementById('resultImage'); // المربع الذي ستظهر فيه الصورة
    
    if(!mImg || !fImg) return alert("الرجاء رفع الصور أولاً");

    // 2. تحويل الصور لبيانات نصية (Base64)
    const toBase64 = file => new Promise((res, rej) => {
        const r = new FileReader(); r.readAsDataURL(file);
        r.onload = () => res(r.result.split(',')[1]);
    });

    try {
        const mBase = await toBase64(mImg);
        const fBase = await toBase64(fImg);

        // 3. إرسال الطلب للسيرفر
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ motherImage: mBase, fatherImage: fBase })
        });

        const data = await response.json();
        
        // 4. عرض النتيجة النهائية
        if(data.imageUrl) {
            resultBox.src = data.imageUrl;
            resultBox.style.display = 'block';
        }
    } catch (e) {
        alert("حدث خطأ في الاتصال بالسيرفر");
    }
}
