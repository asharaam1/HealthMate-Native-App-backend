// config/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const analyzeMedicalReport = async (fileUrl, reportType) => {
  try {
    console.log("🔍 Starting AI analysis...");
    console.log("Report Type:", reportType);
    console.log("File URL:", fileUrl);
    console.log("API Key Present:", !!process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `You are an AI health assistant named HealthMate.

⚠️ **IMPORTANT - FIRST CHECK THE IMAGE**:
1. First, determine if the uploaded image is a REAL medical report
2. If it contains text like "SAMPLE", "DEMO", "TEST", "EXAMPLE", or looks like a dummy report, respond ONLY with: 
   {"status": "invalid", "message": "This appears to be a sample/demo report. Please upload your actual medical report for real analysis."}
3. If it's a valid medical report, then proceed with the analysis as instructed below.

When a user uploads any valid lab report, scan, or prescription, carefully analyze the report, identify key readings and abnormalities, and generate a clear summary. Present output in both English and Roman Urdu, highlight abnormal values, suggest 3–5 questions for the doctor, provide food recommendations and home remedies.

If the image shows a complete blood count (CBC) or any other test, analyze the actual numbers present in that specific image.

End with: 'This information is for understanding only, not medical advice.'`,
    });

    const prompt = `Analyze this ${reportType} medical report from the following link and provide a comprehensive, easy-to-understand summary.

File URL: ${fileUrl}

📋 **IMPORTANT INSTRUCTIONS:**
- Read the entire medical report/document carefully
- Extract all test parameters, values, and findings
- Explain everything in simple, non-technical language
- Provide bilingual explanations (English + Roman Urdu)
- Highlight any abnormal or concerning values
- Give practical, actionable advice

📊 **ANALYSIS REQUIRED:**

1. **English Summary** (2-3 paragraphs):
   - What type of test/report is this?
   - What are the main findings?
   - Are the results normal or concerning?
   - What does this mean for the patient's health?

2. **Roman Urdu Summary** (2-3 paragraphs):
   - Same information in Roman Urdu/Hinglish
   - Use simple words that common people understand
   - Example: "Aapki blood report normal hai" or "Sugar level thora zyada hai"

3. **Abnormal Values** (if any):
   - List each abnormal parameter with:
     * Parameter name (e.g., "Hemoglobin", "Blood Sugar")
     * Your value
     * Normal range
     * Status: "high", "low", or "critical"

4. **Doctor Questions** (3-5 questions):
   - Important questions patient should ask their doctor
   - Both in English and Roman Urdu
   - Example: "Should I change my diet? / Kya mujhe apni diet change karni chahiye?"

5. **Foods to Avoid**:
   - List 5-7 foods/items to avoid based on the report
   - Be specific (e.g., "White rice", "Fried foods", "Sugary drinks")

6. **Recommended Foods**:
   - List 5-7 beneficial foods to eat
   - Foods that can help improve the condition
   - Example: "Leafy greens", "Almonds", "Fresh fruits"

7. **Home Remedies** (if applicable):
   - 3-5 simple, safe home remedies
   - Traditional remedies that are scientifically backed
   - Example: "Drink warm water with lemon in morning", "Walk 30 minutes daily"

**FORMAT YOUR RESPONSE AS JSON:**
\`\`\`json
{
  "englishSummary": "Your detailed English summary here...",
  "romanUrduSummary": "Aapki Roman Urdu summary yahan...",
  "abnormalValues": [
    {
      "parameter": "Blood Sugar",
      "value": "180 mg/dL",
      "normalRange": "70-100 mg/dL",
      "status": "high"
    }
  ],
  "doctorQuestions": [
    "Should I start medication? / Kya mujhe dawa shuru karni chahiye?",
    "Do I need to follow a special diet? / Kya mujhe khas diet follow karni hogi?"
  ],
  "foodsToAvoid": ["White sugar", "White rice", "Fried foods", "Sugary drinks"],
  "recommendedFoods": ["Oats", "Brown rice", "Vegetables", "Nuts", "Fish"],
  "homeRemedies": [
    "Drink 8-10 glasses of water daily / Din mein 8-10 glass pani piyen",
    "Walk for 30 minutes after meals / Khane ke baad 30 minute walk karein"
  ]
}
\`\`\`

⚠️ **CRITICAL**: Return ONLY valid JSON. No extra text before or after.`;

    console.log("📤 Sending request to Gemini API...");

    const result = await model.generateContent(prompt);

    console.log("📥 Received response from Gemini");

    const response = result.response;
    const text = response.text();
    console.log("📄 Response text length:", text.length);
    console.log("📄 First 200 chars:", text.substring(0, 200));

    try {
      let jsonText = text.trim();

      jsonText = jsonText.replace(/```json\s*/g, "");
      jsonText = jsonText.replace(/```\s*/g, "");

      // Find JSON object
      const jsonStart = jsonText.indexOf("{");
      const jsonEnd = jsonText.lastIndexOf("}");

      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
      }

      console.log("🔄 Attempting to parse JSON...");
      const parsedData = JSON.parse(jsonText);
      console.log("✅ Successfully parsed AI response");

      // Ensure all required fields exist
      const data = {
        englishSummary:
          parsedData.englishSummary ||
          "Analysis completed. Please consult your doctor for detailed interpretation.",
        romanUrduSummary:
          parsedData.romanUrduSummary ||
          "Report ka analysis ho gaya hai. Mazeed tafseel ke liye doctor se milein.",
        abnormalValues: parsedData.abnormalValues || [],
        doctorQuestions: parsedData.doctorQuestions || [],
        foodsToAvoid: parsedData.foodsToAvoid || [],
        recommendedFoods: parsedData.recommendedFoods || [],
        homeRemedies: parsedData.homeRemedies || [],
        disclaimer:
          "This AI summary is for understanding only, not for medical advice. Always consult your doctor. / Yeh AI sirf samajhne ke liye hai, ilaaj ke liye nahi.",
      };

      return {
        success: true,
        data: data,
      };
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError.message);
      console.log("📄 Raw text that failed to parse:", text.substring(0, 500));

      return {
        success: true,
        data: {
          englishSummary: text.substring(0, 1000) + "...",
          romanUrduSummary:
            "AI ne aapki report ka analysis kar diya hai. Upar English mein tafseel di gayi hai. Doctor se zaroor mashwara karein.",
          abnormalValues: [],
          doctorQuestions: [
            "What do these results mean for my health? / Yeh results meri sehat ke liye kya matlab rakhte hain?",
            "Do I need any follow-up tests? / Kya mujhe aur tests karwane honge?",
            "Should I make any lifestyle changes? / Kya mujhe apni lifestyle mein koi tabdeeli karni chahiye?",
          ],
          foodsToAvoid: [],
          recommendedFoods: [],
          homeRemedies: [],
          disclaimer:
            "This AI summary is for understanding only, not for medical advice. Always consult your doctor. / Yeh AI sirf samajhne ke liye hai, ilaaj ke liye nahi.",
        },
      };
    }
  } catch (error) {
    console.error("❌ Gemini API error:", error.message);
    console.error("❌ Full error:", error);

    throw new Error(`AI Analysis Failed: ${error.message}`);
  }
};

export const generateVitalsInsights = async (vitalsData) => {
  try {
    console.log("🔍 Starting AI vitals analysis...");
    console.log("Vitals Data:", JSON.stringify(vitalsData, null, 2));

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction:
        "You are an AI health assistant named HealthMate, created to help users understand their health vitals easily. When a user provides their health readings (BP, sugar, weight, heart rate, etc.), your task is to carefully analyze the values, identify any abnormalities, and generate a clear and easy-to-understand summary. Present the output in both English and Roman Urdu, highlight abnormal values, and suggest 3–5 important questions the user can ask their doctor. Also provide basic food recommendations and simple home remedies related to the vitals. End the summary with a note: 'This information is for understanding only, not medical advice.'",
    });

    // Build vitals summary text
    let vitalsText = "User's Health Vitals:\n\n";
    if (
      vitalsData.bloodPressure?.systolic &&
      vitalsData.bloodPressure?.diastolic
    ) {
      vitalsText += `Blood Pressure: ${vitalsData.bloodPressure.systolic}/${vitalsData.bloodPressure.diastolic} mmHg\n`;
    }
    if (vitalsData.bloodSugar?.value) {
      vitalsText += `Blood Sugar (${vitalsData.bloodSugar.type || "random"}): ${
        vitalsData.bloodSugar.value
      } mg/dL\n`;
    }
    if (vitalsData.weight?.value) {
      vitalsText += `Weight: ${vitalsData.weight.value} ${vitalsData.weight.unit}\n`;
    }
    if (vitalsData.height?.value) {
      vitalsText += `Height: ${vitalsData.height.value} ${vitalsData.height.unit}\n`;
    }
    if (vitalsData.heartRate?.value) {
      vitalsText += `Heart Rate: ${vitalsData.heartRate.value} bpm\n`;
    }
    if (vitalsData.temperature?.value) {
      vitalsText += `Temperature: ${vitalsData.temperature.value}°${
        vitalsData.temperature.unit === "celsius" ? "C" : "F"
      }\n`;
    }
    if (vitalsData.oxygenLevel?.value) {
      vitalsText += `Oxygen Level: ${vitalsData.oxygenLevel.value}%\n`;
    }
    if (vitalsData.notes) {
      vitalsText += `\nUser Notes: ${vitalsData.notes}\n`;
    }
    if (vitalsData.symptoms && vitalsData.symptoms.length > 0) {
      vitalsText += `\nSymptoms: ${vitalsData.symptoms.join(", ")}\n`;
    }

    const prompt = `Analyze these health vitals and provide a comprehensive, easy-to-understand assessment.

${vitalsText}

📋 **IMPORTANT INSTRUCTIONS:**
- Analyze all the vital signs provided
- Identify which values are normal and which are abnormal
- Explain everything in simple, non-technical language
- Provide bilingual explanations (English + Roman Urdu)
- Give practical, actionable advice

📊 **ANALYSIS REQUIRED:**

1. **English Summary** (2-3 paragraphs):
   - Overall health assessment based on these vitals
   - Which values are normal and which need attention?
   - What do these readings indicate about the person's health?
   - Any immediate concerns or positive signs?

2. **Roman Urdu Summary** (2-3 paragraphs):
   - Same information in Roman Urdu/Hinglish
   - Use simple words that common people understand
   - Example: "Aapka blood pressure normal hai" or "Sugar level thora zyada hai"

3. **Abnormal Values** (if any):
   - List each abnormal parameter with:
     * Parameter name (e.g., "Blood Pressure", "Blood Sugar")
     * Current value
     * Normal range
     * Status: "high", "low", or "critical"

4. **Doctor Questions** (3-5 questions):
   - Important questions patient should ask their doctor
   - Both in English and Roman Urdu
   - Example: "Should I adjust my medications? / Kya mujhe apni dawa adjust karni chahiye?"

5. **Foods to Avoid**:
   - List 5-7 foods/items to avoid based on the vitals
   - Be specific (e.g., "White rice", "Salty foods", "Sugary drinks")

6. **Recommended Foods**:
   - List 5-7 beneficial foods to eat
   - Foods that can help improve the condition
   - Example: "Leafy greens", "Almonds", "Fresh fruits", "Whole grains"

7. **Home Remedies**:
   - 3-5 simple, safe home remedies
   - Traditional remedies that are scientifically backed
   - Example: "Walk 30 minutes daily", "Drink warm water in morning", "Practice deep breathing"

**FORMAT YOUR RESPONSE AS JSON:**
\`\`\`json
{
  "englishSummary": "Your detailed English summary here...",
  "romanUrduSummary": "Aapki Roman Urdu summary yahan...",
  "abnormalValues": [
    {
      "parameter": "Blood Pressure",
      "value": "140/90 mmHg",
      "normalRange": "120/80 mmHg",
      "status": "high"
    }
  ],
  "doctorQuestions": [
    "Should I start blood pressure medication? / Kya mujhe BP ki dawa shuru karni chahiye?",
    "Do I need to monitor my vitals daily? / Kya mujhe rozana vitals check karne chahiye?"
  ],
  "foodsToAvoid": ["Salt", "Fried foods", "Red meat", "Processed foods"],
  "recommendedFoods": ["Vegetables", "Fruits", "Whole grains", "Fish", "Nuts"],
  "homeRemedies": [
    "Walk for 30 minutes daily / Rozana 30 minute walk karein",
    "Reduce salt intake / Namak kam khayein"
  ]
}
\`\`\`

⚠️ **CRITICAL**: Return ONLY valid JSON. No extra text before or after.`;

    console.log("📤 Sending vitals analysis request to Gemini API...");

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log("📥 Received vitals analysis from Gemini");
    console.log("📄 Response text length:", text.length);
    console.log("📄 First 200 chars:", text.substring(0, 200));

    try {
      // Clean up the response
      let jsonText = text.trim();
      jsonText = jsonText.replace(/```json\s*/g, "");
      jsonText = jsonText.replace(/```\s*/g, "");

      // Find JSON object
      const jsonStart = jsonText.indexOf("{");
      const jsonEnd = jsonText.lastIndexOf("}");

      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
      }

      console.log("🔄 Attempting to parse vitals JSON...");
      const parsedData = JSON.parse(jsonText);
      console.log("✅ Successfully parsed AI vitals analysis");

      // Ensure all required fields exist
      const data = {
        englishSummary:
          parsedData.englishSummary ||
          "Your vitals have been recorded. Please consult your doctor for detailed interpretation.",
        romanUrduSummary:
          parsedData.romanUrduSummary ||
          "Aapki vitals record ho gayi hain. Mazeed tafseel ke liye doctor se milein.",
        abnormalValues: parsedData.abnormalValues || [],
        doctorQuestions: parsedData.doctorQuestions || [],
        foodsToAvoid: parsedData.foodsToAvoid || [],
        recommendedFoods: parsedData.recommendedFoods || [],
        homeRemedies: parsedData.homeRemedies || [],
        disclaimer:
          "This AI summary is for understanding only, not for medical advice. Always consult your doctor. / Yeh AI sirf samajhne ke liye hai, ilaaj ke liye nahi.",
      };

      return {
        success: true,
        data: data,
      };
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError.message);
      console.log("📄 Raw text that failed to parse:", text.substring(0, 500));

      // Return fallback with the text summary
      return {
        success: true,
        data: {
          englishSummary: text.substring(0, 1000) + "...",
          romanUrduSummary:
            "AI ne aapki vitals ka analysis kar diya hai. Upar English mein tafseel di gayi hai. Doctor se zaroor mashwara karein.",
          abnormalValues: [],
          doctorQuestions: [
            "Are my vitals within normal range? / Kya meri vitals normal range mein hain?",
            "Do I need any lifestyle changes? / Kya mujhe apni lifestyle mein tabdeeli karni chahiye?",
            "Should I monitor these readings daily? / Kya mujhe yeh readings rozana check karni chahiye?",
          ],
          foodsToAvoid: [],
          recommendedFoods: [],
          homeRemedies: [],
          disclaimer:
            "This AI summary is for understanding only, not for medical advice. Always consult your doctor. / Yeh AI sirf samajhne ke liye hai, ilaaj ke liye nahi.",
        },
      };
    }
  } catch (error) {
    console.error("❌ Gemini vitals analysis error:", error.message);
    console.error("❌ Full error:", error);

    throw new Error(`AI Vitals Analysis Failed: ${error.message}`);
  }
};

export default { analyzeMedicalReport, generateVitalsInsights };
