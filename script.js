/**
 * MY CHILD - المحرك النهائي
 * تم تحديث الرابط ليعمل مع سيرفر Render الرسمي
 */

// 1. مكتبة البرومبتس الاحترافية
const promptLibrary = {
    "boy_5": "The 5-Year-Old Boy Hybrid Prompt: Ultra-realistic 4K portrait, 70% Mother resemblance, 30% Father. Focus on early childhood features and soft lighting.",
    "girl_5": "The 5-Year-Old Girl Hybrid Prompt: Ultra-realistic 4K portrait, 70% Mother, 30% Father. Delicate facial features, natural childhood innocence.",
    "boy_10": "The 10-Year-Old Boy Hybrid Prompt: Ultra-realistic 4K, 70% Mother (eye shape, lip structure), 30% Father (nose bridge, eyebrow density). Tech: Canon 5D Mark IV, 85mm f/1.4, Rembrandt style lighting.",
    "girl_10": "The 10-Year-Old Girl Hybrid Prompt: Task: Generate an ultra-realistic 4K portrait of a 10-year-old girl. 70% Mother, 30% Father. Tech: Sony A7R IV, 85mm prime, f/2.2.",
    "boy_teen": "The Teenager Boy Hybrid Prompt: Aged 14-16, developing jawline. 70% Mother (eye shape), 30% Father (nose bridge). Tech: 85mm prime, f/2.0, cinematic lighting.",
    "girl_teen": "The Teenager Girl Hybrid Prompt: Aged 14-16, refined facial structure. 70% Mother, 30% Father. Tech: 85mm prime, f/2.0, editorial style.",
    "boy_25": "The 25-Year-Old Young Man Hybrid Prompt: Fully developed jawline, mature structure. 70% Mother, 30% Father. Tech: Sony A7R V, 85mm G-Master, f/1.8.",
    "girl_25": "The 25-Year-Old Young Woman Hybrid Prompt: Sophisticated mid-20s woman. 70% Mother (near-identical young version), 30% Father. Tech: 100mm macro, f/2.2."
};

let motherBase64 = "";
let fatherBase64 = "";

// وظيفة معالجة رفع الصور
function setupImageUpload(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;

    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = function() {
            const base64String = reader.result.split(',')[1];
            if (inputId === 'motherInput') motherBase64 = base64String;
            if (inputId === 'fatherInput') fatherBase64 = base64String;
            console.log(inputId + " جاهزة");
        }
        reader.readAsDataURL(file);
    });
}

setupImageUpload('motherInput');
setupImageUpload('fatherInput');

// الدالة الرئيسية للربط مع السيرفر
async function generateChildImage() {
    const gender = document.getElementById('gender').value;
    const age = document.getElementById('age').value;
    const generateBtn = document.getElementById('generateBtn');
    const resultArea = document.getElementById('resultArea');
    const finalImage = document.getElementById('finalImage');

    if (!motherBase64 || !fatherBase64) {
        alert("يرجى رفع صورة الأم وصورة الأب أولاً.");
        return;
    }

    const selectedKey = `${gender}_${age}`;
    const prompt = promptLibrary[selectedKey];

    // تحديث الواجهة لبدء التحميل
    resultArea.classList.remove('hidden');
    generateBtn.disabled = true;
    generateBtn.innerText = "جاري دمج الجينات... (قد يستغرق دقيقة)";
    finalImage.style.opacity = "0.3";

    try {
        // تم تعديل الرابط هنا ليكون رابط سيرفرك المباشر
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
            finalImage.src = data.imageUrl;
            finalImage.style.opacity = "1";
            saveToAdminStats(gender, age);
        } else {
            alert("فشل في إنشاء الصورة: " + (data.error || "خطأ مجهول"));
        }

    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ في الاتصال بالسيرفر. يرجى التأكد أن السيرفر يعمل على Render.");
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerText = "إنشاء ملامح الطفل الآن";
    }
}

// حفظ العمليات للوحة التحكم
function saveToAdminStats(gender, age) {
    let stats = JSON.parse(localStorage.getItem('adminStats')) || { total: 0, history: [] };
    stats.total += 1;
    stats.history.push({
        type: `${gender} (${age} سنة)`,
        time: new Date().toLocaleTimeString('ar-EG')
    });
    localStorage.setItem('adminStats', JSON.stringify(stats));
}

document.getElementById('generateBtn').addEventListener('click', generateChildImage);
