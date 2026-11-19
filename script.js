/* ==========================================================================
   HEALTHIFY — Application logic (vanilla JavaScript)
   All data is stored locally in the browser with localStorage.
   This file mirrors the educational calculations implemented in backend.c.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- 1. Storage helpers ---------- */
  var PREFIX = "healthify_v1_";
  var store = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem(PREFIX + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
        return true;
      } catch (e) {
        toast(tr("storageFull"), "warning");
        return false;
      }
    },
    remove: function (key) {
      try { localStorage.removeItem(PREFIX + key); } catch (e) { /* ignore */ }
    },
    clearAll: function () {
      try {
        Object.keys(localStorage)
          .filter(function (k) { return k.indexOf(PREFIX) === 0; })
          .forEach(function (k) { localStorage.removeItem(k); });
      } catch (e) { /* ignore */ }
    }
  };

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function uniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function $(id) { return document.getElementById(id); }
  function $$(selector, root) { return Array.prototype.slice.call((root || document).querySelectorAll(selector)); }

  /* ---------- 2. Language support ---------- */
  var currentLang = store.get("lang", "en") === "ta" ? "ta" : "en";

  var STRINGS = {
    en: {
      storageFull: "Local storage is full. Some data could not be saved.",
      saved: "Saved on this device.",
      profileSaved: "Profile saved. Your dashboard is ready!",
      profileNeeded: "Save your profile first to personalise your dashboard.",
      nameRequired: "Please enter a valid name (at least 2 letters).",
      waterAdded: "Water added. Keep it up!",
      waterMax: "That is already a full day of water. Great work!",
      waterRemoved: "One glass removed.",
      waterEmpty: "No glasses to remove yet.",
      activityAdded: "Activity added to your day.",
      activityInvalid: "Enter an activity name and minutes between 1 and 600.",
      activityRemoved: "Activity removed.",
      mealsComplete: "All four meals marked. Wonderful consistency!",
      mealSaved: "Plan saved on this device.",
      planCleared: "Your meal plan has been cleared.",
      plannerAdded: "Food added to your {meal} plan.",
      plannerUpdated: "Food item updated.",
      plannerInvalid: "Please enter a food item.",
      plannerEditHint: "Edit food item",
      expiryAdded: "Product saved to your kitchen list.",
      expiryDeleted: "Product removed.",
      expiryInvalid: "Enter a name and valid dates (expiry after purchase).",
      contactOk: "Thanks! Your message passed validation. This demo has no server, so nothing was sent.",
      contactInvalid: "Enter a valid email and a message of at least 5 characters.",
      resetDone: "All saved HEALTHIFY data has been reset.",
      noProfile: "No profile yet",
      saveProfileCta: "Save your profile to begin",
      noActivities: "No activities added today.",
      emptyPlan: "Your plan is empty. Add foods above to get started.",
      planSummary: "{total} food items planned across {meals} meal(s).",
      savedAt: "Last saved: {time}",
      zeroProducts: "No products saved yet.",
      productsCount: "{n} saved",
      fresh: "Fresh",
      soon: "Expiring Soon",
      expired: "Expired",
      daysLeft: "{n} day(s) left",
      expiredAgo: "Expired {n} day(s) ago",
      today: "Today",
      under: "Below standard range",
      healthy: "Standard range",
      above: "Above standard range",
      high: "Well above standard range",
      lowActivity: "Low activity",
      moderateActivity: "Moderate activity",
      highActivity: "Very active",
      vegetarian: "Vegetarian",
      nonvegetarian: "Non-vegetarian",
      vegan: "Vegan / plant-based",
      female: "Female",
      male: "Male",
      other: "Not specified",
      preferNot: "Prefer not to say",
      edit: "Edit",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      breakfast: "Breakfast",
      lunch: "Lunch",
      snacks: "Evening Snacks",
      dinner: "Dinner",
      viewRecipe: "View Recipe",
      consult: "When to consult a healthcare professional",
      overview: "What it is",
      habits: "Everyday lifestyle ideas",
      foodGuide: "Food guidance",
      ingredients: "Ingredients",
      steps: "Simple method",
      note: "Gentle reminder",
      addToPlanPrompt: "Choose a meal and add to your plan",
      quoteFallback: "Small steps, repeated daily, create big changes over time.",
      addDetails: "Add your details",
      profileSavedShort: "Profile saved on this device"
    },
    ta: {
      storageFull: "உள்ளூர் சேமிப்பு நிரம்பிவிட்டது. சில தரவுகள் சேமிக்கப்படவில்லை.",
      saved: "இந்த சாதனத்தில் சேமிக்கப்பட்டது.",
      profileSaved: "சுயவிவரம் சேமிக்கப்பட்டது. உங்கள் டாஷ்போர்டு தயார்!",
      profileNeeded: "டாஷ்போர்டை தனிப்பயனாக்க முதலில் சுயவிவரத்தைச் சேமிக்கவும்.",
      nameRequired: "செல்லுபடியாகும் பெயரை உள்ளிடவும் (குறைந்தது 2 எழுத்துக்கள்).",
      waterAdded: "நீர் சேர்க்கப்பட்டது. தொடர்ந்து செய்யுங்கள்!",
      waterMax: "இன்றைய நீர் இலக்கு நிறைவடைந்தது. சிறப்பு!",
      waterRemoved: "ஒரு கிளாஸ் அகற்றப்பட்டது.",
      waterEmpty: "அகற்ற ஏதும் கிளாஸ்கள் இல்லை.",
      activityAdded: "உடற்பயிற்சி உங்கள் நாளில் சேர்க்கப்பட்டது.",
      activityInvalid: "உடற்பயிற்சி பெயரையும் 1–600 நிமிடங்களையும் உள்ளிடவும்.",
      activityRemoved: "உடற்பயிற்சி அகற்றப்பட்டது.",
      mealsComplete: "நான்கும் உணவுகள் குறிக்கப்பட்டன. நல்ல தொடர்ச்சி!",
      mealSaved: "திட்டம் இந்த சாதனத்தில் சேமிக்கப்பட்டது.",
      planCleared: "உங்கள் உணவு திட்டம் அழிக்கப்பட்டது.",
      plannerAdded: "உணவு {meal} திட்டத்தில் சேர்க்கப்பட்டது.",
      plannerUpdated: "உணவுப் பொருள் புதுப்பிக்கப்பட்டது.",
      plannerInvalid: "உணவுப் பொருளை உள்ளிடவும்.",
      plannerEditHint: "உணவுப் பொருளைத் திருத்தவும்",
      expiryAdded: "பொருள் சமையலறைப் பட்டியலில் சேமிக்கப்பட்டது.",
      expiryDeleted: "பொருள் அகற்றப்பட்டது.",
      expiryInvalid: "பெயரையும் செல்லுபடியாகும் தேதிகளையும் உள்ளிடவும் (காலாவதி தேதி கொள்முதலுக்குப் பிறகு).",
      contactOk: "நன்றி! உங்கள் செய்தி சரிபார்க்கப்பட்டது. இந்த மாதிரியில் சேவையகம் இல்லை, எனவே எதுவும் அனுப்பப்படவில்லை.",
      contactInvalid: "செல்லுபடியாகும் மின்னஞ்சல் மற்றும் 5 எழுத்துகளுக்கு மேலான செய்தி உள்ளிடவும்.",
      resetDone: "HEALTHIFY இன் சேமித்த அனைத்து தரவும் அழிக்கப்பட்டது.",
      noProfile: "இதுவரை சுயவிவரம் இல்லை",
      saveProfileCta: "தொடங்க உங்கள் சுயவிவரத்தைச் சேமிக்கவும்",
      noActivities: "இன்று எந்த உடற்பயிற்சியும் சேர்க்கப்படவில்லை.",
      emptyPlan: "உங்கள் திட்டம் காலியாக உள்ளது. தொடங்க மேலே உணவுகளைச் சேர்க்கவும்.",
      planSummary: "{meals} உணவு நேரங்களில் மொத்தம் {total} உணவுப் பொருட்கள் திட்டமிடப்பட்டுள்ளன.",
      savedAt: "கடைசியாக சேமித்தது: {time}",
      zeroProducts: "இதுவரை எந்த பொருளும் சேமிக்கப்படவில்லை.",
      productsCount: "{n} சேமிக்கப்பட்டது",
      fresh: "புத்துணர்வு",
      soon: "விரைவில் காலாவதி",
      expired: "காலாவதியானது",
      daysLeft: "{n} நாள்(கள்) உள்ளது",
      expiredAgo: "{n} நாள்(கள்) காலாவதியானது",
      today: "இன்று",
      under: "வழக்கமான வரம்பிற்கு கீழே",
      healthy: "வழக்கமான வரம்பு",
      above: "வழக்கமான வரம்பிற்கு மேலே",
      high: "வழக்கமான வரம்பை விட அதிகம்",
      lowActivity: "குறைந்த உடற்பயிற்சி",
      moderateActivity: "மிதமான உடற்பயிற்சி",
      highActivity: "அதிக உடற்பயிற்சி",
      vegetarian: "சைவம்",
      nonvegetarian: "அசைவம்",
      vegan: "வீகன் / தாவர அடிப்படை",
      female: "பெண்",
      male: "ஆண்",
      other: "வேறுபட்டு கூறப்பட்டது",
      preferNot: "கூற விரும்பவில்லை",
      edit: "திருத்து",
      cancel: "ரத்து செய்",
      save: "சேமி",
      delete: "அழி",
      breakfast: "காலை உணவு",
      lunch: "மதிய உணவு",
      snacks: "மாலை சிற்றுண்டி",
      dinner: "இரவு உணவு",
      viewRecipe: "செய்முறையைக் காண்க",
      consult: "மருத்துவ நிபுணரை எப்போது அணுக வேண்டும்",
      overview: "இது என்ன",
      habits: "நாள் வாழ்க்கை யோசனைகள்",
      foodGuide: "உணவு வழிகாட்டுதல்",
      ingredients: "தேவையான பொருட்கள்",
      steps: "எளிய செய்முறை",
      note: "அன்பான நினைவூட்டல்",
      addToPlanPrompt: "உணவு நேரத்தைத் தேர்ந்தெடுத்து திட்டத்தில் சேர்க்கவும்",
      quoteFallback: "சிறு படிகள் தினமும் தொடர்ந்தால் பெரும் மாற்றங்களை உருவாக்கும்.",
      addDetails: "உங்கள் விவரங்களைச் சேர்க்கவும்",
      profileSavedShort: "சுயவிவரம் இந்த சாதனத்தில் சேமிக்கப்பட்டது"
    }
  };

  function tr(key, vars) {
    var text = (STRINGS[currentLang] && STRINGS[currentLang][key]) || STRINGS.en[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        text = text.split("{" + k + "}").join(vars[k]);
      });
    }
    return text;
  }

  /* Write only into the element's own text nodes so child icons/spans survive. */
  function setText(el, value) {
    if (!el) return;
    if (el.children.length === 0) { el.textContent = value; return; }
    var nodes = Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 3; });
    if (nodes.length) nodes[0].nodeValue = value;
  }

  function translateStatic() {
    $$("[data-en]").forEach(function (el) {
      setText(el, currentLang === "ta" && el.dataset.ta ? el.dataset.ta : el.dataset.en);
    });
    $$("[data-en-ph]").forEach(function (el) {
      el.placeholder = currentLang === "ta" && el.dataset.taPh ? el.dataset.taPh : el.dataset.enPh;
    });
    document.documentElement.lang = currentLang === "ta" ? "ta" : "en";
    var label = $("lang-label");
    if (label) label.textContent = currentLang === "ta" ? "தமிழ்" : "EN";
    var toggle = $("lang-toggle");
    if (toggle) {
      toggle.setAttribute("aria-label", currentLang === "ta" ? "Switch language to English" : "Switch language to Tamil");
    }
  }

  /* ---------- 3. Educational content (health topics, recipes, quotes) ---------- */
  var CONDITIONS = {
    diabetes: {
      en: {
        title: "Diabetes / Blood Sugar",
        overview: "Blood sugar is the glucose carried in your blood. The body uses insulin to move glucose into cells for energy. When this process works differently, sugar levels may rise. Understanding food and routine can support everyday balance.",
        habits: ["Keep regular meal and sleep times.", "Include a short walk after meals when possible.", "Check feet and stay hydrated daily."],
        foods: ["Choose whole grains such as oats, ragi and millets.", "Pair carbohydrates with protein or healthy fats.", "Keep sweets and sweet drinks as occasional treats.", "Include fibre-rich vegetables and fruits in sensible portions."],
        consult: "Seek professional care for repeated high or low readings, unusual thirst, frequent urination, wounds that heal slowly, or before changing any treatment plan."
      },
      ta: {
        title: "நீரிழிவு / இரத்த சர்க்கரை",
        overview: "இரத்த சர்க்கரை என்பது இரத்தத்தில் உள்ள க்ளூக்கோஸ் ஆகும். இன்சுலின் உதவியால் அது செல்களுக்குச் சென்று ஆற்றல் தருகிறது. இந்த செயல்முறை மாறுபடும் போது சர்க்கரை அளவு உயரலாம். உணவு மற்றும் வழக்கம் பற்றி அறிவது நாள் சமநிலைக்கு உதவும்.",
        habits: ["வழக்கமான உணவு மற்றும் தூக்க நேரத்தைப் பேணுங்கள்.", "முடிந்தால் உணவுக்குப் பின் சிறிது நடக்கவும்.", "நாள்தோறும் பாதங்களைப் பார்த்து, நீர் குடிக்கவும்."],
        foods: ["ஓட்ஸ், ராகி, சிறுதானியங்கள் போன்ற முழு தானியங்களைத் தேர்வு செய்யுங்கள்.", "கார்ப் உணவுகளுடன் புரதம் அல்லது நல்ல கொழுப்பு சேர்க்கவும்.", "இனிப்பு மற்றும் இனிப்பான பானங்களை அவ்வப்போது மட்டும் எடுக்கவும்.", "நார்ச்சத்து மிக்க காய்கறிகள் மற்றும் பழங்களை மிதமான அளவில் சாப்பிடவும்."],
        consult: "தொடர்ச்சியாக அதிக அல்லது குறைந்த readings, அதிக தாகம், அடிக்கடி சிறுநீர், காயங்கள் தாமதமாக ஆறுதல், அல்லது சிகிச்சை மாற்றத்திற்கு முன் நிபுணரை அணுகவும்."
      }
    },
    bloodpressure: {
      en: {
        title: "Blood Pressure",
        overview: "Blood pressure is the force of blood against artery walls. It naturally changes through the day. Long-term habits such as salt intake, movement, sleep and stress can influence it.",
        habits: ["Keep a regular walking or movement routine.", "Practise slow breathing or quiet rest each day.", "Limit very salty packaged and fried foods.", "Keep a consistent sleep schedule."],
        foods: ["Choose fresh foods more often than packaged ones.", "Include potassium-rich foods such as bananas and leafy greens for most people.", "Read labels and watch sodium in pickles, snacks and sauces.", "Reduce excess salt added at the table."],
        consult: "Get professional advice for repeated high readings, severe headache, chest pain, shortness of breath, vision changes, or if you are advised to monitor at home."
      },
      ta: {
        title: "இரத்த அழுத்தம்",
        overview: "இரத்த அழுத்தம் என்பது தமனி சுவர்களில் இரத்தம் கொண்டு வரும் விசை. இது நாள் முழுவதும் இயல்பாக மாறும். உப்பு, உடற்பயிற்சி, தூக்கம் மற்றும் மன அழுத்தம் போன்ற நீண்டகால பழக்கங்கள் இதனைப் பாதிக்கலாம்.",
        habits: ["வழக்கமான நடை அல்லது உடற்பயிற்சி பழக்கத்தை வைத்துக்கொள்ளுங்கள்.", "நாள்தோறும் மெதுவான சுவாசம் அல்லது அமைதியான ஓய்வு செய்யுங்கள்.", "அதிக உப்புள்ள பொட்டல உணவுகள் மற்றும் பொரித்த உணவுகளைக் குறைக்கவும்.", "ஒழுங்கான தூக்க நேரத்தைப் பேணுங்கள்."],
        foods: ["பொட்டல உணவுகளை விட புதிய உணவுகளை அதிகம் தேர்வு செய்யுங்கள்.", "பெரும்பாலானவருக்கு வாழைப்பழம், பச்சை கீரை போன்ற பொட்டாசியம் உணவுகள் நல்லவை.", "லேபிள்களைப் படித்து ஊறுகாய், சிற்றுண்டி, சாஸ்களில் உள்ள சோடியத்தைக் கவனிக்கவும்.", "உணவில் சேர்க்கும் உப்பின் அளவைக் குறைக்கவும்."],
        consult: "தொடர்ச்சியாக அதிக அளவுகள், கடுமையான தலைவலி, மார்பு வலி, மூச்சு திணறல், பார்வை மாற்றம், அல்லது வீட்டிலேயே கண்காணிக்குமாறு கூறப்பட்டால் நிபுணரை அணுகவும்."
      }
    },
    obesity: {
      en: {
        title: "Obesity",
        overview: "Body weight is influenced by many factors including food, movement, sleep, medicines and genetics. A sustainable approach focuses on steady habits rather than quick fixes or judging appearance.",
        habits: ["Aim for regular, achievable movement each week.", "Eat at calm times and notice fullness cues.", "Prioritise consistent sleep and stress care.", "Celebrate habit changes, not just numbers."],
        foods: ["Build plates with vegetables, protein and whole grains.", "Choose water instead of sugary drinks.", "Keep portions comfortable and avoid eating straight from large packs.", "Include fibre-rich foods that help you feel satisfied."],
        consult: "Talk to a professional before starting a major weight-change plan, especially with existing health conditions, or if you notice rapid unexplained weight change."
      },
      ta: {
        title: "உடல் பருமன்",
        overview: "உடல் எடை உணவு, உடற்பயிற்சி, தூக்கம், மருந்துகள் மற்றும் பாரம்பரியம் உள்ளிட்ட பல காரணிகளால் பாதிக்கப்படுகிறது. நீடித்த அணுகுமுறை தோற்றத்தை அளப்பதற்குப் பதிலாக நிலையான பழக்கங்களை மையமாகக் கொள்கிறது.",
        habits: ["வாரந்தோறும் செய்யக்கூடிய உடற்பயிற்சியைத் திட்டமிடுங்கள்.", "அமைதியான நேரங்களில் உண்ணுங்கள்; பசி தணிவதை உணருங்கள்.", "ஒழுங்கான தூக்கம் மற்றும் மன அழுத்த பராமரிப்புக்கு முன்னுரிமை தாருங்கள்.", "எண்களை விட பழக்க மாற்றங்களைக் கொண்டாடுங்கள்."],
        foods: ["காய்கறி, புரதம், முழு தானியங்கள் அடங்கிய உணவை உருவாக்குங்கள்.", "இனிப்பான பானங்களுக்குப் பதிலாக நீர் குடிக்கவும்.", "பெரிய பொட்டலங்களில் நேரடியாக உண்பதைத் தவிர்த்து, மிதமான அளவு எடுக்கவும்.", "திருப்தி தரும் நார்ச்சத்து உணவுகளைச் சேர்க்கவும்."],
        consult: "பெரும் எடை மாற்றத் திட்டத்தைத் தொடங்குவதற்கு முன், குறிப்பாக ஏற்கனவே உடல்நல நிலைகள் இருந்தால், அல்லது விளக்கமற்ற விரைவான எடை மாற்றம் தென்படின் நிபுணரை அணுகவும்."
      }
    },
    heart: {
      en: {
        title: "Heart Health",
        overview: "Your heart works hard every day. Regular movement, enough sleep, not smoking and balanced food choices all support cardiovascular wellbeing over time.",
        habits: ["Move most days, even if it is a short walk.", "Take breaks from long sitting.", "Keep sleep and stress routines steady.", "Avoid smoke and second-hand smoke."],
        foods: ["Choose vegetables, fruits, whole grains and legumes often.", "Prefer unsaturated fats and limit deep-fried foods.", "Watch sodium in processed foods.", "Keep added sugar and sweet drinks low."],
        consult: "Seek urgent help for chest pain, fainting, severe breathlessness or pain spreading to the arm/jaw. For routine prevention, discuss your personal risk with a clinician."
      },
      ta: {
        title: "இதய ஆரோக்கியம்",
        overview: "இதயம் ஒவ்வொரு நாளும் கடினமாக உழைக்கிறது. வழக்கமான உடற்பயிற்சி, போதுமான தூக்கம், புகைப்பதைத் தவிர்த்தல், சமநிலையான உணவு ஆகியவை இதய நலனை ஆதரிக்கின்றன.",
        habits: ["பெரும்பாலான நாட்களில் சிறு நடைப்பயணமாக இருந்தாலும் உடல் நகர்த்தவும்.", "நீண்ட நேரம் உட்கார்ந்திருந்தால் இடைவேளை எடுக்கவும்.", "தூக்கம் மற்றும் மன அழுத்த வழக்கங்களை ஒழுங்காக வைத்துக்கொள்ளவும்.", "புகை மற்றும் புகையிலிருந்து விலகி இருக்கவும்."],
        foods: ["காய்கறி, பழங்கள், முழு தானியங்கள், பயறு வகைகளை அடிக்கடி உண்ணவும்.", "நல்ல எண்ணெய்களைத் தேர்வு செய்து, ஆழமாக பொரித்த உணவுகளைக் குறைக்கவும்.", "பதப்படுத்தப்பட்ட உணவுகளில் உள்ள சோடியத்தைக் கவனிக்கவும்.", "சேர்க்கப்பட்ட சர்க்கரை மற்றும் இனிப்பு பானங்களைக் குறைக்கவும்."],
        consult: "மார்பு வலி, மயக்கம், கடுமையான மூச்சு திணறல், கை / தாடைக்கு பரவும் வலி ஏற்பட்டால் உடனடி உதவி பெறுங்கள். வழக்கமான தடுப்புக்கு நிபுணருடன் கலந்தாலோசிக்கவும்."
      }
    },
    joint: {
      en: {
        title: "Joint Pain",
        overview: "Joints can feel stiff or sore for many reasons. Gentle, regular movement and comfortable habits often help, while rest and professional guidance matter when pain is new or severe.",
        habits: ["Warm up gently before activity and cool down after.", "Avoid staying in one position too long.", "Use comfortable footwear and supportive seating.", "Keep a healthy body weight to reduce joint load."],
        foods: ["Include a variety of vegetables and fruits daily.", "Choose whole grains and adequate protein.", "Stay hydrated, as fluids support tissues.", "Discuss any supplement use with a professional."],
        consult: "Get advice for sudden swelling, redness, fever, inability to bear weight, morning stiffness that lasts a long time, or pain after an injury."
      },
      ta: {
        title: "மூட்டு வலி",
        overview: "மூட்டுகள் பல காரணங்களால் விறைப்பு அல்லது வலியை உணரலாம். மென்மையான, வழக்கமான உடற்பயிற்சி பெரும்பாலும் உதவும்; புதிய அல்லது கடுமையான வலியில் ஓய்வும் நிபுணர் ஆலோசனையும் முக்கியம்.",
        habits: ["உடற்பயிற்சிக்கு முன் மெதுவாக உடலை வெப்பமாக்கி, பிறகு தணிக்கவும்.", "ஒரே நிலையில் நீண்ட நேரம் இருப்பதைத் தவிர்க்கவும்.", "வசதியான காலணிகள் மற்றும் தாங்கும் இருக்கைகளைப் பயன்படுத்தவும்.", "மூட்டு சுமையைக் குறைக்க ஆரோக்கியமான எடையைப் பேணவும்."],
        foods: ["நாள்தோறும் பலவகையான காய்கறிகள் மற்றும் பழங்கள் உண்ணவும்.", "முழு தானியங்களும் போதிய புரதமும் எடுக்கவும்.", "திசுக்களுக்கு உதவும் நீரைப் போதுமான அளவு குடிக்கவும்.", "ஏதேனும் சப்ளிமெண்ட்ஸ் பற்றி நிபுணருடன் கலந்தாலோசிக்கவும்."],
        consult: "திடீர் வீக்கம், சிவப்பு, காய்ச்சல், எடை தாங்க இயலாமை, நீண்ட நேரம் நீடிக்கும் காலை விறைப்பு, அல்லது காயத்திற்குப் பிறகு வலி ஏற்பட்டால் ஆலோசனை பெறுங்கள்."
      }
    },
    cold: {
      en: {
        title: "Cold & Fever",
        overview: "Common colds are usually caused by viruses and often settle with rest and time. Fever is a sign that the body is responding. Comfort care and fluids are usually the focus.",
        habits: ["Rest and keep fluids nearby.", "Cover your mouth when coughing and wash hands often.", "Keep rooms comfortably ventilated.", "Return to normal routines gradually as you feel better."],
        foods: ["Warm soups and plenty of fluids can feel soothing.", "Choose easy-to-digest foods such as porridge or khichdi.", "Include fruits when appetite returns.", "Avoid very oily or heavily spiced food if it feels uncomfortable."],
        consult: "Contact a professional for high or lasting fever, difficulty breathing, chest pain, confusion, dehydration signs, symptoms in infants, or if you are unsure about medicines. This app never prescribes medicines."
      },
      ta: {
        title: "சளி & காய்ச்சல்",
        overview: "சாதாரண சளி பெரும்பாலும் வைரஸ்களால் ஏற்பட்டு, ஓய்வு மற்றும் காலப்போக்கில் குணமடையும். காய்ச்சல் என்பது உடல் எதிர்வினைக்கான அறிகுறி. வசதி பராமரிப்பும் திரவங்களுமே முக்கியம்.",
        habits: ["ஓய்வு எடுத்து, திரவங்களை அருகில் வைத்துக்கொள்ளுங்கள்.", "இருமும்போது வாயை மூடி, கைகளை அடிக்கடி கழுவுங்கள்.", "அறைகளை வசதியாக காற்றோட்டம் செய்யுங்கள்.", "படிப்படியாக நலம் பெறும்போது வழக்கமான பழக்கங்களுக்குத் திரும்புங்கள்."],
        foods: ["சூடான சூப்கள் மற்றும் ஏராளமான திரவங்கள் வசதி தரலாம்.", "கஞ்சி அல்லது கிச்சடி போன்ற எளிதில் சீரணமாகும் உணவுகளைத் தேர்வு செய்யுங்கள்.", "பசி திரும்பும் போது பழங்களைச் சேர்க்கவும்.", "உபாதகமாக இருந்தால் அதிக எண்ணெய் மற்றும் காரமான உணவுகளைத் தவிர்க்கவும்."],
        consult: "அதிக அல்லது நீடிக்கும் காய்ச்சல், மூச்சு திணறல், மார்பு வலி, குழப்பம், நீரிழப்பு அறிகுறிகள், குழந்தைகளில் அறிகுறிகள், அல்லது மருந்துகள் குறித்த ஐயம் ஏற்பட்டால் நிபுணரை அணுகவும். இந்த ஆப் மருந்துகளைப் பரிந்துரைக்காது."
      }
    },
    wellness: {
      en: {
        title: "General Wellness",
        overview: "Wellness is a mix of physical activity, food, sleep, connection and mental wellbeing. Small, repeatable actions usually last longer than big, sudden changes.",
        habits: ["Drink water regularly through the day.", "Take short movement breaks.", "Keep a regular sleep and wake time.", "Talk with someone you trust when stressed."],
        foods: ["Aim for variety: grains, pulses, vegetables, fruits and healthy fats.", "Eat slowly and stop when comfortably full.", "Keep processed snacks as occasional choices.", "Cook at home more often when possible."],
        consult: "Ask a professional for personal advice if you have ongoing symptoms, a long-term condition, or before major lifestyle or supplement changes."
      },
      ta: {
        title: "பொது நல்வாழ்வு",
        overview: "நல்வாழ்வு என்பது உடற்பயிற்சி, உணவு, தூக்கம், உறவுகள், மன நலன் ஆகியவற்றின் கலவை. பெரிய திடீர் மாற்றங்களை விட சிறிய, தொடரக்கூடிய செயல்கள் நீடிக்கும்.",
        habits: ["நாள் முழுவதும் தொடர்ந்து நீர் குடிக்கவும்.", "குறுகிய உடல் நகர்வு இடைவேளைகள் எடுக்கவும்.", "ஒழுங்கான உறக்கம் மற்றும் எழும் நேரத்தைப் பேணவும்.", "மன அழுத்தம் ஏற்படும்போது நம்பகமானவரிடம் பேசவும்."],
        foods: ["தானியங்கள், பயறுகள், காய்கறிகள், பழங்கள், நல்ல கொழுப்புகள் உள்ளிட்ட பல்வேறு உணவுகளை உண்ணவும்.", "மெதுவாக உண்ணுங்கள்; வசதியாக நிறைந்ததும் நிறுத்துங்கள்.", "பதப்படுத்தப்பட்ட சிற்றுண்டிகளை அவ்வப்போது மட்டும் உண்ணவும்.", "முடிந்தால் வீட்டிலேயே அதிகம் சமைக்கவும்."],
        consult: "தொடர்ச்சியான அறிகுறிகள், நீண்டகால உடல்நிலை, அல்லது பெரிய வாழ்க்கை முறை / சப்ளிமெண்ட் மாற்றங்களுக்கு முன் நிபுணரின் தனிப்பட்ட ஆலோசனையைப் பெறுங்கள்."
      }
    }
  };

  var RECIPES = {
    salad: {
      en: { title: "Vegetable Salad", time: "15 min", level: "Easy", ingredients: ["1 cucumber, diced", "2 tomatoes, chopped", "1 carrot, grated", "A handful of leafy greens", "Lemon juice, salt and pepper to taste"], steps: ["Wash all vegetables thoroughly.", "Chop and place them in a large bowl.", "Add lemon juice and season lightly.", "Toss well and serve fresh."], note: "A colourful bowl adds a variety of nutrients. Add a spoon of curd or roasted seeds for extra protein." },
      ta: { title: "காய்கறி சலாத்", time: "15 நிமி", level: "எளிது", ingredients: ["1 வெள்ளரி, நறுக்கியது", "2 தக்காளி, நறுக்கியது", "1 கேரட், துருவியது", "ஒரு கைப்பிடி பச்சை இலைகள்", "எலுமிச்சை சாறு, உப்பு, மிளகு"], steps: ["அனைத்து காய்கறிகளையும் நன்றாக கழுவவும்.", "நறுக்கி பெரிய கிண்ணத்தில் போடவும்.", "எலுமிச்சை சாறு சேர்த்து லேசாக உப்பு தூவவும்.", "நன்றாகக் கலந்து புதிதாகப் பரிமாறவும்."], note: "பல நிறங்களுடைய காய்கறிகள் பல ஊட்டச்சத்துகளைத் தரும். புரதத்திற்கு ஒரு ஸ்பூன் தயிர் அல்லது வறுத்த விதைகள் சேர்க்கவும்." }
    },
    oats: {
      en: { title: "Oats Breakfast Bowl", time: "10 min", level: "Easy", ingredients: ["1 cup rolled oats", "1 cup water or milk", "1 banana, sliced", "1 tsp seeds", "Optional: a little honey"], steps: ["Cook oats with water or milk for 5–6 minutes.", "Pour into a bowl and let it cool slightly.", "Top with banana and seeds.", "Add a little honey if you like and serve."], note: "Oats contain fibre. Adjust the portion to your own appetite and activity level." },
      ta: { title: "ஓட்ஸ் காலை உணவு", time: "10 நிமி", level: "எளிது", ingredients: ["1 கோப்பை ஓட்ஸ்", "1 கோப்பை நீர் அல்லது பால்", "1 வாழைப்பழம், துண்டுகள்", "1 தேக்கரண்டி விதைகள்", "விருப்பம்: சிறிது தேன்"], steps: ["ஓட்ஸை நீர் அல்லது பாலுடன் 5–6 நிமிடம் வேகவைக்கவும்.", "கிண்ணத்தில் ஊற்றி சிறிது ஆறவிடவும்.", "மேலே வாழைப்பழம் மற்றும் விதைகள் போடவும்.", "விருப்பமானால் சிறிது தேன் சேர்த்து பரிமாறவும்."], note: "ஓட்ஸில் நார்ச்சத்து உள்ளது. உங்கள் பசி மற்றும் உடற்பயிற்சிக்கு ஏற்ற அளவைத் தேர்வு செய்யவும்." }
    },
    "ragi-dosa": {
      en: { title: "Ragi Dosa", time: "25 min", level: "Medium", ingredients: ["1 cup ragi flour", "1/2 cup rice flour", "2 tbsp curd", "Water as needed", "Onion, carrot and green chilli, finely chopped"], steps: ["Mix flours, curd and water into a smooth batter.", "Rest the batter for 10 minutes.", "Fold in the chopped vegetables.", "Pour a thin layer on a hot greased pan and cook both sides until crisp."], note: "Ragi contains calcium. Use very little oil and enjoy with a light chutney." },
      ta: { title: "ராகி தோசை", time: "25 நிமி", level: "நடுத்தரம்", ingredients: ["1 கோப்பை ராகி மாவு", "1/2 கோப்பை அரிசி மாவு", "2 தேக்கரண்டி தயிர்", "தேவையான அளவு நீர்", "வெங்காயம், கேரட், பச்சை மிளகாய், நறுக்கியது"], steps: ["மாவு, தயிர், நீர் சேர்த்து மென்மையான மாவாக கலக்கவும்.", "10 நிமிடம் ஓய்வு தரவும்.", "நறுக்கிய காய்கறிகளைச் சேர்க்கவும்.", "சூடான தவாவில் மெல்லியதாக ஊற்றி இருபுறமும் மொறுமொறுப்பாக வேகவைக்கவும்."], note: "ராகியில் கால்சியம் உள்ளது. குறைந்த எண்ணெய் பயன்படுத்தி லேசான சட்னியுடன் சாப்பிடவும்." }
    },
    soup: {
      en: { title: "Vegetable Soup", time: "20 min", level: "Easy", ingredients: ["1 carrot, diced", "1 potato, diced", "A handful of beans", "1 tomato", "Herbs, salt and pepper"], steps: ["Wash and dice the vegetables.", "Boil with water until tender.", "Add seasoning and a little herbs.", "Serve warm. Blend lightly if you prefer."], note: "A light soup can be a gentle way to include vegetables. Avoid adding too much salt." },
      ta: { title: "காய்கறி சூப்", time: "20 நிமி", level: "எளிது", ingredients: ["1 கேரட், நறுக்கியது", "1 உருளைக்கிழங்கு, நறுக்கியது", "ஒரு கைப்பிடி பீன்ஸ்", "1 தக்காளி", "மூலிகைகள், உப்பு, மிளகு"], steps: ["காய்கறிகளைக் கழுவி நறுக்கவும்.", "நீருடன் மெதுவாக வேகவைக்கவும்.", "உப்பு, மிளகு, மூலிகைகள் சேர்க்கவும்.", "சூடாகப் பரிமாறவும்; விருப்பமானால் லேசாக கலக்கவும்."], note: "லேசான சூப் காய்கறிகளைச் சேர்க்க நல்ல வழி. அதிக உப்பு சேர்க்காதீர்கள்." }
    },
    smoothie: {
      en: { title: "Fruit Smoothie", time: "8 min", level: "Easy", ingredients: ["1 banana", "1/2 cup berries", "1/2 cup curd or yogurt", "A few ice cubes", "Optional: chia seeds"], steps: ["Add all ingredients to a blender.", "Blend until smooth and creamy.", "Pour into a glass and serve immediately."], note: "Keep fruit portions sensible and skip added sugar — the fruit already brings natural sweetness." },
      ta: { title: "பழ ஸ்மூத்தி", time: "8 நிமி", level: "எளிது", ingredients: ["1 வாழைப்பழம்", "1/2 கோப்பை பெர்ரி", "1/2 கோப்பை தயிர்", "சில ஐஸ் கட்டிகள்", "விருப்பம்: சியா விதைகள்"], steps: ["அனைத்து பொருட்களையும் பிளெண்டரில் போடவும்.", "க்ரீமியானதாகும் வரை கலக்கவும்.", "கிளாஸில் ஊற்றி உடனே பரிமாறவும்."], note: "பழ அளவை மிதமாக வைத்து, சேர்க்கப்பட்ட சர்க்கரையைத் தவிர்க்கவும் — பழத்திலேயே இயற்கை இனிப்பு உள்ளது." }
    },
    upma: {
      en: { title: "Millet Upma", time: "18 min", level: "Medium", ingredients: ["1 cup millets", "2 cups water", "Onion, carrot, beans", "Mustard seeds and curry leaves", "A little oil"], steps: ["Dry roast millets lightly and keep aside.", "Boil water in a pan.", "Add millets and cook covered until soft.", "Temper spices and vegetables in a little oil, then mix into the cooked millets."], note: "Millets are a wholesome grain option. Add vegetables for colour, fibre and flavour." },
      ta: { title: "சிறுதானிய உப்பிடு", time: "18 நிமி", level: "நடுத்தரம்", ingredients: ["1 கோப்பை சிறுதானியம்", "2 கோப்பை நீர்", "வெங்காயம், கேரட், பீன்ஸ்", "கடுகு, கறிவேப்பிலை", "சிறிது எண்ணெய்"], steps: ["சிறுதானியத்தை லேசாக வறுத்து எடுக்கவும்.", "பாத்திரத்தில் நீர் கொதிக்கவைக்கவும்.", "சிறுதானியம் சேர்த்து மூடி மெதுவாக வேகவைக்கவும்.", "குறைந்த எண்ணெயில் மசாலா மற்றும் காய்கறிகளைத் தாளித்து கலக்கவும்."], note: "சிறுதானியங்கள் நல்ல தானிய வகை. நிறம், நார்ச்சத்து, சுவைக்காக காய்கறிகள் சேர்க்கவும்." }
    }
  };

  var QUOTES = [
    { en: "Small steps, repeated daily, create big changes over time.", ta: "சிறு படிகள் தினமும் தொடர்ந்தால் பெரும் மாற்றங்களை உருவாக்கும்." },
    { en: "A glass of water is a simple act of care for your body.", ta: "ஒரு கிளாஸ் நீர் உங்கள் உடலுக்கு நீங்கள் செய்யும் எளிய பராமரிப்பு." },
    { en: "Choose balance, not perfection — every single day.", ta: "பூரணத்திற்கு அல்ல, சமநிலைக்கு தேர்வு செய்யுங்கள் — ஒவ்வொரு நாளும்." },
    { en: "A short walk can change the shape of a whole afternoon.", ta: "குறுகிய நடைப்பயணம் ஒரு பிற்பகல் முழுவதையும் மாற்றக்கூடும்." },
    { en: "Good sleep is a quiet investment in tomorrow's energy.", ta: "நல்ல தூக்கம் நாளைய ஆற்றலில் செய்யும் அமைதியான முதலீடு." },
    { en: "Your body listens to your habits, not your intentions.", ta: "உங்கள் உடல் உங்கள் எண்ணங்களை அல்ல, பழக்கங்களையே கேட்கிறது." },
    { en: "Adding a vegetable is easier than removing a habit.", ta: "ஒரு பழக்கத்தை நீக்குவதை விட ஒரு காய்கறி சேர்ப்பது எளிது." }
  ];

  /* ---------- 4. Toast notifications ---------- */
  function toast(message, type) {
    var container = $("toast-container");
    if (!container) return;
    var el = document.createElement("div");
    el.className = "toast" + (type ? " " + type : "");
    var dot = document.createElement("span");
    dot.className = "toast-dot";
    var text = document.createElement("span");
    text.textContent = message;
    el.appendChild(dot);
    el.appendChild(text);
    container.appendChild(el);
    setTimeout(function () {
      el.classList.add("leaving");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
    }, 3200);
  }

  /* ---------- 5. Validation helpers ---------- */
  function setFieldState(fieldId, errorId, invalid) {
    var field = $(fieldId) ? $(fieldId).closest(".field") : null;
    var error = $(errorId);
    if (field) field.classList.toggle("invalid", invalid);
    if (error) {
      error.hidden = !invalid;
      error.setAttribute("aria-live", "polite");
    }
    return !invalid;
  }

  function isEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()); }

  /* ---------- 6. Modal manager (focus + Escape + scroll lock) ---------- */
  var lastFocused = null;
  function openModal(id) {
    var modal = $(id);
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    var focusable = modal.querySelector("button, [href], input, select, textarea");
    if (focusable) focusable.focus();
  }
  function closeModal(id) {
    var modal = $(id);
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
  }
  function closeAllModals() {
    $$(".modal").forEach(function (m) { m.hidden = true; });
    document.body.style.overflow = "";
  }

  /* ---------- 7. Navigation, scrolling, reveals ---------- */
  function initNavigation() {
    var navbar = $("navbar");
    var toggle = $("nav-toggle");
    var menu = $("nav-menu");
    var top = $("back-to-top");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var open = menu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
      });
      $$(".nav-link", menu).forEach(function (link) {
        link.addEventListener("click", function () {
          menu.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        });
      });
      document.addEventListener("click", function (e) {
        if (menu.classList.contains("open") && !menu.contains(e.target) && !toggle.contains(e.target)) {
          menu.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (navbar) navbar.classList.toggle("scrolled", y > 24);
      if (top) top.classList.toggle("visible", y > 500);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (top) top.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    if ("IntersectionObserver" in window) {
      var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          $$(".nav-link").forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id);
          });
        });
      }, { rootMargin: "-35% 0px -60% 0px" });
      ["home", "about", "features", "health-tracker", "food", "contact"].forEach(function (id) {
        var el = $(id);
        if (el) sectionObserver.observe(el);
      });

      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
      $$(".reveal").forEach(function (el) { revealObserver.observe(el); });
    } else {
      $$(".reveal").forEach(function (el) { el.classList.add("visible"); });
    }
  }

  /* ---------- 8. Health profile & BMI (mirrors backend.c) ---------- */
  var profile = store.get("profile", null);

  function calculateBMI(weightKg, heightCm) {
    var metres = heightCm / 100;
    return weightKg / (metres * metres);
  }
  function bmiCategory(bmi) {
    if (bmi < 18.5) return "under";
    if (bmi < 25) return "healthy";
    if (bmi < 30) return "above";
    return "high";
  }

  function initProfile() {
    var form = $("profile-form");
    if (!form) return;
    if (profile) {
      $("profile-name").value = profile.name || "";
      $("profile-age").value = profile.age || "";
      $("profile-height").value = profile.height || "";
      $("profile-weight").value = profile.weight || "";
      $("profile-gender").value = profile.gender || "";
      $("profile-activity").value = profile.activity || "low";
      $("profile-diet").value = profile.diet || "vegetarian";
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("profile-name").value.trim();
      var age = Number($("profile-age").value);
      var height = Number($("profile-height").value);
      var weight = Number($("profile-weight").value);

      var okName = setFieldState("profile-name", "error-name", name.length < 2 || !/[\u0B80-\u0BFF\u0600-\u06FFa-zA-Z]/.test(name));
      var okAge = setFieldState("profile-age", "error-age", !Number.isFinite(age) || age < 2 || age > 120);
      var okHeight = setFieldState("profile-height", "error-height", !Number.isFinite(height) || height < 80 || height > 250);
      var okWeight = setFieldState("profile-weight", "error-weight", !Number.isFinite(weight) || weight < 10 || weight > 300);

      if (!(okName && okAge && okHeight && okWeight)) {
        toast(tr("nameRequired"), "warning");
        return;
      }

      profile = {
        name: name, age: age, height: height, weight: weight,
        gender: $("profile-gender").value,
        activity: $("profile-activity").value,
        diet: $("profile-diet").value,
        savedAt: new Date().toISOString()
      };
      store.set("profile", profile);
      renderDashboard();
      toast(tr("profileSaved"));
      var dash = $("dashboard");
      if (dash) dash.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    ["profile-name", "profile-age", "profile-height", "profile-weight"].forEach(function (id) {
      $(id).addEventListener("input", function () {
        var map = { "profile-name": "error-name", "profile-age": "error-age", "profile-height": "error-height", "profile-weight": "error-weight" };
        var field = $(id).closest(".field");
        if (field) field.classList.remove("invalid");
        if ($(map[id])) $(map[id]).hidden = true;
      });
    });
  }

  function renderDashboard() {
    var nameEl = $("dash-name");
    var metaEl = $("dash-meta");
    var ageEl = $("dash-age");
    var activityEl = $("dash-activity");
    var dietEl = $("dash-diet");
    var avatarEl = $("dash-avatar");
    var bmiValue = $("bmi-value");
    var bmiBadge = $("bmi-category");
    var marker = $("bmi-marker");

    if (!profile) {
      if (nameEl) { nameEl.textContent = tr("noProfile"); nameEl.dataset.en = "No profile yet"; nameEl.dataset.ta = "இதுவரை சுயவிவரம் இல்லை"; }
      if (metaEl) { metaEl.textContent = tr("saveProfileCta"); metaEl.dataset.en = "Save your profile to begin"; metaEl.dataset.ta = "தொடங்க உங்கள் சுயவிவரத்தைச் சேமிக்கவும்"; }
      if (ageEl) ageEl.textContent = "—";
      if (activityEl) activityEl.textContent = "—";
      if (dietEl) dietEl.textContent = "—";
      if (avatarEl) avatarEl.textContent = "HI";
      if (bmiValue) bmiValue.textContent = "—";
      if (bmiBadge) { bmiBadge.textContent = tr("addDetails"); bmiBadge.dataset.en = "Add your details"; bmiBadge.dataset.ta = "உங்கள் விவரங்களைச் சேர்க்கவும்"; }
      if (marker) marker.style.left = "50%";
      return;
    }

    if (nameEl) nameEl.textContent = profile.name;
    if (metaEl) {
      metaEl.textContent = tr("profileSavedShort");
      metaEl.dataset.en = "Profile saved on this device";
      metaEl.dataset.ta = "சுயவிவரம் இந்த சாதனத்தில் சேமிக்கப்பட்டது";
    }
    if (ageEl) ageEl.textContent = String(profile.age);
    if (activityEl) activityEl.textContent = tr(profile.activity + "Activity");
    if (dietEl) dietEl.textContent = tr(profile.diet);
    if (avatarEl) {
      avatarEl.textContent = profile.name.trim().split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join("");
    }
    var bmi = calculateBMI(profile.weight, profile.height);
    var category = bmiCategory(bmi);
    if (bmiValue) bmiValue.textContent = bmi.toFixed(1);
    if (bmiBadge) {
      bmiBadge.textContent = tr(category);
      bmiBadge.dataset.en = { under: "Below standard range", healthy: "Standard range", above: "Above standard range", high: "Well above standard range" }[category];
      bmiBadge.dataset.ta = { under: "வழக்கமான வரம்பிற்கு கீழே", healthy: "வழக்கமான வரம்பு", above: "வழக்கமான வரம்பிற்கு மேலே", high: "வழக்கமான வரம்பை விட அதிகம்" }[category];
    }
    if (marker) marker.style.left = Math.max(2, Math.min(98, (bmi / 40) * 100)) + "%";
  }

  /* ---------- 9. Daily water tracker ---------- */
  function loadDaily(key, fallback) {
    var data = store.get(key, null);
    if (!data || data.date !== todayKey()) return fallback();
    return data;
  }

  var waterState = null;
  var renderWater = function () {};
  function resetWater() {
    waterState = { date: todayKey(), count: 0 };
    store.remove("water");
    renderWater();
  }
  function initWater() {
    waterState = loadDaily("water", function () { return { date: todayKey(), count: 0 }; });
    renderWater = function () {
      var count = Math.max(0, Math.min(20, waterState.count || 0));
      var pct = Math.min(100, Math.round((count / 8) * 100));
      var current = $("water-current");
      var percent = $("water-percent");
      var fill = $("water-fill");
      var bar = $("water-progress");
      if (current) current.textContent = String(count);
      if (percent) percent.textContent = pct + "%";
      if (fill) fill.style.height = pct + "%";
      if (bar) bar.style.width = pct + "%";
    };
    var add = $("add-water");
    var remove = $("remove-water");
    if (add) add.addEventListener("click", function () {
      if (waterState.count >= 20) { toast(tr("waterMax"), "warning"); return; }
      waterState.date = todayKey();
      waterState.count += 1;
      store.set("water", waterState);
      renderWater();
      toast(waterState.count === 8 ? tr("waterMax") : tr("waterAdded"));
    });
    if (remove) remove.addEventListener("click", function () {
      if (waterState.count <= 0) { toast(tr("waterEmpty"), "warning"); return; }
      waterState.count -= 1;
      store.set("water", waterState);
      renderWater();
      toast(tr("waterRemoved"));
    });
    renderWater();
  }

  /* ---------- 10. Meal check tracker ---------- */
  var mealTrackerState = null;
  var renderMealTracker = function () {};
  function resetMealTracker() {
    mealTrackerState = { date: todayKey(), items: { breakfast: false, lunch: false, snacks: false, dinner: false } };
    store.remove("trackerMeals");
    renderMealTracker();
  }
  function initMealTracker() {
    mealTrackerState = loadDaily("trackerMeals", function () {
      return { date: todayKey(), items: { breakfast: false, lunch: false, snacks: false, dinner: false } };
    });
    var boxes = $$("#meal-tracker input[data-meal]");
    renderMealTracker = function () {
      var done = 0;
      boxes.forEach(function (box) {
        box.checked = !!mealTrackerState.items[box.dataset.meal];
        if (box.checked) done += 1;
      });
      var count = $("meal-count");
      var bar = $("meal-progress");
      var tip = $("meal-tracker-tip");
      if (count) count.textContent = done + "/4";
      if (bar) bar.style.width = (done / 4) * 100 + "%";
      if (tip) {
        tip.textContent = done === 4 ? tr("mealsComplete") : (currentLang === "ta" ? "உணவு முடிந்ததும் டிக் செய்யவும்." : "Tick each meal as you finish it.");
        tip.dataset.en = "Tick each meal as you finish it.";
        tip.dataset.ta = "உணவு முடிந்ததும் டிக் செய்யவும்.";
      }
    };
    boxes.forEach(function (box) {
      box.addEventListener("change", function () {
        mealTrackerState.date = todayKey();
        mealTrackerState.items[box.dataset.meal] = box.checked;
        store.set("trackerMeals", mealTrackerState);
        renderMealTracker();
        if (Object.keys(mealTrackerState.items).every(function (k) { return mealTrackerState.items[k]; })) toast(tr("mealsComplete"));
      });
    });
    renderMealTracker();
  }

  /* ---------- 11. Activity tracker ---------- */
  var activityState = null;
  var renderActivities = function () {};
  function resetActivities() {
    activityState = { date: todayKey(), list: [] };
    store.remove("activities");
    renderActivities();
  }
  function initActivities() {
    activityState = loadDaily("activities", function () { return { date: todayKey(), list: [] }; });
    renderActivities = function () {
      var list = $("activity-list");
      var total = $("activity-total");
      var bar = $("activity-progress");
      var minutes = activityState.list.reduce(function (sum, a) { return sum + a.minutes; }, 0);
      if (total) total.innerHTML = minutes + " <span>" + (currentLang === "ta" ? "நிமி" : "min") + "</span>";
      if (bar) bar.style.width = Math.min(100, (minutes / 30) * 100) + "%";
      if (!list) return;
      list.innerHTML = "";
      if (!activityState.list.length) {
        var li = document.createElement("li");
        li.className = "empty-note";
        li.textContent = tr("noActivities");
        list.appendChild(li);
        return;
      }
      activityState.list.forEach(function (activity) {
        var li = document.createElement("li");
        var name = document.createElement("span");
        name.className = "act-name";
        name.textContent = activity.name;
        var min = document.createElement("span");
        min.className = "act-min";
        min.textContent = activity.minutes + (currentLang === "ta" ? " நிமி" : " min");
        var del = document.createElement("button");
        del.type = "button";
        del.className = "act-del";
        del.innerHTML = "&times;";
        del.setAttribute("aria-label", tr("delete"));
        del.addEventListener("click", function () {
          activityState.list = activityState.list.filter(function (a) { return a.id !== activity.id; });
          store.set("activities", activityState);
          renderActivities();
          toast(tr("activityRemoved"));
        });
        li.appendChild(name);
        li.appendChild(min);
        li.appendChild(del);
        list.appendChild(li);
      });
    };
    var form = $("activity-form");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("activity-name").value.trim();
      var minutes = Number($("activity-minutes").value);
      if (!name || !Number.isFinite(minutes) || minutes < 1 || minutes > 600) {
        toast(tr("activityInvalid"), "warning");
        return;
      }
      activityState.date = todayKey();
      activityState.list.push({ id: uniqueId(), name: name.slice(0, 40), minutes: minutes });
      store.set("activities", activityState);
      $("activity-name").value = "";
      $("activity-minutes").value = "";
      renderActivities();
      toast(tr("activityAdded"));
    });
    renderActivities();
  }

  /* ---------- 12. Condition info modal ---------- */
  var activeConditionKey = null;
  function initConditions() {
    $$(".condition-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var key = card.dataset.condition;
        activeConditionKey = key;
        var data = CONDITIONS[key] && CONDITIONS[key][currentLang];
        if (!data) return;
        var title = $("condition-modal-title");
        var body = $("condition-modal-body");
        if (title) title.textContent = data.title;
        if (body) {
          body.innerHTML = "";
          function section(heading, items) {
            var sec = document.createElement("div");
            sec.className = "modal-section";
            var h = document.createElement("h3");
            h.textContent = heading;
            var ul = document.createElement("ul");
            items.forEach(function (item) {
              var li = document.createElement("li");
              li.textContent = item;
              ul.appendChild(li);
            });
            sec.appendChild(h);
            sec.appendChild(ul);
            body.appendChild(sec);
          }
          var intro = document.createElement("p");
          intro.textContent = data.overview;
          var introWrap = document.createElement("div");
          introWrap.className = "modal-section";
          introWrap.appendChild(intro);
          body.appendChild(introWrap);
          section(tr("habits"), data.habits);
          section(tr("foodGuide"), data.foods);
          section(tr("consult"), [data.consult]);
        }
        openModal("condition-modal");
      });
    });
  }

  /* ---------- 13. Food category filters ---------- */
  function initFoodFilters() {
    var buttons = $$("[data-food-filter]");
    var cards = $$("#food-grid .food-card");
    var empty = $("food-no-results");
    function apply(filter) {
      var shown = 0;
      cards.forEach(function (card) {
        var match = filter === "all" || card.dataset.category === filter || card.dataset.diet === filter;
        card.classList.toggle("hidden", !match);
        if (match) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
    }
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        apply(btn.dataset.foodFilter);
      });
    });

    $$(".add-to-planner").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var card = btn.closest(".food-card");
        var food = card.dataset.food;
        var cat = card.dataset.category;
        var meal = (cat === "fruits" || cat === "snacks") ? "snacks" : ((cat === "protein" || cat === "vegetables") ? "lunch" : "breakfast");
        var input = $("planner-food");
        var select = $("planner-meal");
        if (input) input.value = food;
        if (select) select.value = meal;
        var planner = $("planner");
        if (planner) planner.scrollIntoView({ behavior: "smooth", block: "start" });
        toast(tr("addToPlanPrompt"), "warning");
      });
    });
  }

  /* ---------- 14. Recipe search & modal ---------- */
  function initRecipes() {
    var search = $("recipe-search");
    var cards = $$("#recipe-grid .recipe-card");
    var empty = $("recipe-no-results");
    function filter() {
      var term = (search ? search.value : "").toLowerCase().trim();
      var shown = 0;
      cards.forEach(function (card) {
        var haystack = (card.textContent + " " + (card.dataset.recipe || "")).toLowerCase();
        var match = !term || haystack.indexOf(term) !== -1;
        card.classList.toggle("hidden", !match);
        if (match) shown += 1;
      });
      if (empty) empty.hidden = shown !== 0;
    }
    if (search) search.addEventListener("input", filter);

    cards.forEach(function (card) {
      var btn = card.querySelector(".view-recipe");
      if (!btn) return;
      btn.addEventListener("click", function () {
        var key = card.dataset.recipe;
        var data = RECIPES[key] && RECIPES[key][currentLang];
        if (!data) return;
        var recipeModal = $("recipe-modal");
        if (recipeModal) recipeModal.dataset.recipeKey = key;
        var content = $("recipe-modal-content");
        if (!content) return;
        content.innerHTML = "";

        var img = document.createElement("img");
        img.className = "recipe-modal-image";
        var source = card.querySelector("img");
        img.src = source ? source.currentSrc || source.src : "assets/images/fallback.jpg";
        img.alt = data.title;
        img.dataset.fallback = "assets/images/fallback.jpg";
        content.appendChild(img);

        var h2 = document.createElement("h2");
        h2.id = "recipe-modal-title";
        h2.textContent = data.title;
        content.appendChild(h2);

        var meta = document.createElement("div");
        meta.className = "recipe-meta";
        [data.time, data.level].forEach(function (label) {
          var tag = document.createElement("span");
          tag.className = "tag tag-easy";
          tag.textContent = label;
          meta.appendChild(tag);
        });
        content.appendChild(meta);

        function listSection(heading, items) {
          var sec = document.createElement("div");
          sec.className = "modal-section";
          var h = document.createElement("h3");
          h.textContent = heading;
          var ul = document.createElement("ul");
          items.forEach(function (item) {
            var li = document.createElement("li");
            li.textContent = item;
            ul.appendChild(li);
          });
          sec.appendChild(h);
          sec.appendChild(ul);
          content.appendChild(sec);
        }
        listSection(tr("ingredients"), data.ingredients);
        listSection(tr("steps"), data.steps);
        var note = document.createElement("div");
        note.className = "modal-disclaimer";
        note.textContent = data.note;
        content.appendChild(note);
        attachImageFallbacks(content);
        openModal("recipe-modal");
      });
    });
  }

  /* ---------- 15. Daily meal planner (with inline edit) ---------- */
  var planState = store.get("plan", { items: [], savedAt: null });
  var editingPlanId = null;

  function mealLabel(value) { return tr(value); }

  function renderPlanner() {
    var meals = ["breakfast", "lunch", "snacks", "dinner"];
    meals.forEach(function (meal) {
      var list = $("planner-" + meal);
      if (!list) return;
      list.innerHTML = "";
      var items = planState.items.filter(function (i) { return i.meal === meal; });
      if (!items.length) {
        var empty = document.createElement("li");
        empty.className = "planner-empty";
        empty.textContent = currentLang === "ta" ? "இதுவரை உணவு இல்லை." : "No foods added yet.";
        list.appendChild(empty);
        return;
      }
      items.forEach(function (item) {
        var li = document.createElement("li");
        li.className = "planner-item";
        var content = document.createElement("div");
        content.className = "planner-item-content";
        var actions = document.createElement("div");
        actions.className = "planner-actions";

        if (editingPlanId === item.id) {
          var input = document.createElement("input");
          input.type = "text";
          input.value = item.food;
          input.maxLength = 60;
          input.setAttribute("aria-label", tr("plannerEditHint"));
          input.style.cssText = "width:100%;padding:6px 8px;border:1px solid #16a36a;border-radius:8px;font-size:.82rem";
          var qty = document.createElement("input");
          qty.type = "text";
          qty.value = item.qty || "";
          qty.placeholder = currentLang === "ta" ? "அளவு" : "Quantity";
          qty.maxLength = 40;
          qty.style.cssText = "width:100%;padding:6px 8px;border:1px solid #e3ece7;border-radius:8px;font-size:.75rem;margin-top:4px";
          content.appendChild(input);
          content.appendChild(qty);

          var saveBtn = document.createElement("button");
          saveBtn.type = "button";
          saveBtn.className = "icon-btn";
          saveBtn.innerHTML = "✓";
          saveBtn.title = tr("save");
          saveBtn.setAttribute("aria-label", tr("save"));
          saveBtn.addEventListener("click", function () {
            var value = input.value.trim();
            if (!value) { toast(tr("plannerInvalid"), "warning"); return; }
            item.food = value.slice(0, 60);
            item.qty = qty.value.trim().slice(0, 40);
            editingPlanId = null;
            persistPlan();
            toast(tr("plannerUpdated"));
          });
          var cancelBtn = document.createElement("button");
          cancelBtn.type = "button";
          cancelBtn.className = "icon-btn";
          cancelBtn.innerHTML = "×";
          cancelBtn.title = tr("cancel");
          cancelBtn.setAttribute("aria-label", tr("cancel"));
          cancelBtn.addEventListener("click", function () { editingPlanId = null; renderPlanner(); });
          actions.appendChild(saveBtn);
          actions.appendChild(cancelBtn);
          input.addEventListener("keydown", function (e) { if (e.key === "Enter") saveBtn.click(); });
        } else {
          var strong = document.createElement("strong");
          strong.textContent = item.food;
          content.appendChild(strong);
          if (item.qty) {
            var small = document.createElement("small");
            small.textContent = item.qty;
            content.appendChild(small);
          }
          var editBtn = document.createElement("button");
          editBtn.type = "button";
          editBtn.className = "icon-btn";
          editBtn.innerHTML = "✎";
          editBtn.title = tr("edit");
          editBtn.setAttribute("aria-label", tr("edit"));
          editBtn.addEventListener("click", function () { editingPlanId = item.id; renderPlanner(); });
          var delBtn = document.createElement("button");
          delBtn.type = "button";
          delBtn.className = "icon-btn delete";
          delBtn.innerHTML = "×";
          delBtn.title = tr("delete");
          delBtn.setAttribute("aria-label", tr("delete"));
          delBtn.addEventListener("click", function () {
            planState.items = planState.items.filter(function (i) { return i.id !== item.id; });
            persistPlan();
          });
          actions.appendChild(editBtn);
          actions.appendChild(delBtn);
        }
        li.appendChild(content);
        li.appendChild(actions);
        list.appendChild(li);
      });
    });

    var summary = $("planner-summary");
    if (summary) {
      var total = planState.items.length;
      var mealCount = new Set(planState.items.map(function (i) { return i.meal; })).size;
      var text = total ? tr("planSummary", { total: total, meals: mealCount }) : tr("emptyPlan");
      if (planState.savedAt) {
        var time = new Date(planState.savedAt);
        if (!isNaN(time.getTime())) text += " " + tr("savedAt", { time: time.toLocaleString(currentLang === "ta" ? "ta-IN" : "en-IN") });
      }
      summary.textContent = text;
    }
  }

  function persistPlan() {
    store.set("plan", planState);
    renderPlanner();
  }

  function initPlanner() {
    var form = $("planner-form");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var food = $("planner-food").value.trim();
      var meal = $("planner-meal").value;
      var qty = $("planner-qty").value.trim();
      if (!food) {
        setFieldState("planner-food", "error-planner", true);
        toast(tr("plannerInvalid"), "warning");
        return;
      }
      setFieldState("planner-food", "error-planner", false);
      planState.items.push({ id: uniqueId(), meal: meal, food: food.slice(0, 60), qty: qty.slice(0, 40) });
      $("planner-food").value = "";
      $("planner-qty").value = "";
      persistPlan();
      toast(tr("plannerAdded", { meal: mealLabel(meal) }));
    });
    var foodInput = $("planner-food");
    if (foodInput) foodInput.addEventListener("input", function () { setFieldState("planner-food", "error-planner", false); });

    var save = $("save-plan");
    if (save) save.addEventListener("click", function () {
      planState.savedAt = new Date().toISOString();
      persistPlan();
      toast(tr("mealSaved"));
    });
    var clear = $("clear-plan");
    if (clear) clear.addEventListener("click", function () {
      askConfirm(function () {
        planState.items = [];
        planState.savedAt = null;
        editingPlanId = null;
        persistPlan();
        toast(tr("planCleared"));
      });
    });
    renderPlanner();
  }

  /* ---------- 16. Expiry date reminders ---------- */
  var expiryState = store.get("expiry", []);
  if (!Array.isArray(expiryState)) expiryState = [];

  function daysUntil(dateString) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var target = new Date(dateString + "T00:00:00");
    return Math.round((target - today) / 86400000);
  }
  function expiryStatus(days) {
    if (days < 0) return { key: "expired", cls: "status-expired" };
    if (days <= 3) return { key: "soon", cls: "status-soon" };
    return { key: "fresh", cls: "status-fresh" };
  }
  function formatDate(value) {
    var d = new Date(value + "T00:00:00");
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString(currentLang === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  function renderExpiry() {
    var list = $("expiry-list");
    var summary = $("expiry-summary");
    if (summary) summary.textContent = tr("productsCount", { n: expiryState.length });
    if (!list) return;
    list.innerHTML = "";
    if (!expiryState.length) {
      var empty = document.createElement("p");
      empty.className = "expiry-empty";
      empty.textContent = tr("zeroProducts");
      list.appendChild(empty);
      return;
    }
    expiryState.slice().sort(function (a, b) { return a.expiry.localeCompare(b.expiry); }).forEach(function (product) {
      var days = daysUntil(product.expiry);
      var status = expiryStatus(days);
      var row = document.createElement("div");
      row.className = "expiry-item";
      var main = document.createElement("div");
      main.className = "expiry-item-main";
      var title = document.createElement("strong");
      title.textContent = product.name;
      var detail = document.createElement("span");
      detail.textContent = formatDate(product.purchase) + " → " + formatDate(product.expiry) + " · " +
        (days === 0 ? tr("today") : (days > 0 ? tr("daysLeft", { n: days }) : tr("expiredAgo", { n: Math.abs(days) })));
      main.appendChild(title);
      main.appendChild(detail);
      var pill = document.createElement("span");
      pill.className = "status-pill " + status.cls;
      pill.textContent = tr(status.key);
      var del = document.createElement("button");
      del.type = "button";
      del.className = "icon-btn delete";
      del.innerHTML = "×";
      del.title = tr("delete");
      del.setAttribute("aria-label", tr("delete"));
      del.addEventListener("click", function () {
        expiryState = expiryState.filter(function (p) { return p.id !== product.id; });
        store.set("expiry", expiryState);
        renderExpiry();
        toast(tr("expiryDeleted"));
      });
      row.appendChild(main);
      row.appendChild(pill);
      row.appendChild(del);
      list.appendChild(row);
    });
  }

  function initExpiry() {
    var form = $("expiry-form");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = $("expiry-name").value.trim();
      var purchase = $("expiry-purchase").value;
      var expiry = $("expiry-date").value;
      var invalidName = name.length < 2;
      var invalidPurchase = !purchase || isNaN(new Date(purchase + "T00:00:00").getTime());
      var invalidExpiry = !expiry || isNaN(new Date(expiry + "T00:00:00").getTime()) || expiry <= purchase;
      setFieldState("expiry-name", "error-expiry-name", invalidName);
      setFieldState("expiry-purchase", "error-expiry-purchase", invalidPurchase);
      setFieldState("expiry-date", "error-expiry-date", invalidExpiry);
      if (invalidName || invalidPurchase || invalidExpiry) {
        toast(tr("expiryInvalid"), "warning");
        return;
      }
      expiryState.push({ id: uniqueId(), name: name.slice(0, 60), purchase: purchase, expiry: expiry });
      store.set("expiry", expiryState);
      form.reset();
      renderExpiry();
      toast(tr("expiryAdded"));
    });
    ["expiry-name", "expiry-purchase", "expiry-date"].forEach(function (id) {
      $(id).addEventListener("input", function () {
        $(id).closest(".field").classList.remove("invalid");
        var map = { "expiry-name": "error-expiry-name", "expiry-purchase": "error-expiry-purchase", "expiry-date": "error-expiry-date" };
        if ($(map[id])) $(map[id]).hidden = true;
      });
    });
    var maxDate = todayKey();
    if ($("expiry-purchase")) $("expiry-purchase").max = maxDate;
    renderExpiry();
  }

  /* ---------- 17. Motivational quote ---------- */
  var quoteIndex = Math.floor(new Date().getFullYear() * 372 + new Date().getMonth() * 31 + new Date().getDate()) % QUOTES.length;
  function renderQuote() {
    var quote = QUOTES[quoteIndex] || QUOTES[0];
    var el = $("daily-quote");
    if (el) {
      el.textContent = currentLang === "ta" ? quote.ta : quote.en;
      el.dataset.en = quote.en;
      el.dataset.ta = quote.ta;
    }
    var date = $("quote-date");
    if (date) date.textContent = new Date().toLocaleDateString(currentLang === "ta" ? "ta-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long" });
  }
  function initQuote() {
    renderQuote();
    var btn = $("new-quote");
    if (btn) btn.addEventListener("click", function () {
      quoteIndex = (quoteIndex + 1 + Math.floor(Math.random() * (QUOTES.length - 1))) % QUOTES.length;
      renderQuote();
    });
  }

  /* ---------- 18. Contact form (local validation only) ---------- */
  function initContact() {
    var form = $("contact-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = $("contact-email").value.trim();
      var message = $("contact-message").value.trim();
      var valid = isEmail(email) && message.length >= 5;
      var field = $("contact-email").closest(".field") || $("contact-email").parentElement;
      if (field) field.classList.toggle("invalid", !valid);
      var error = $("error-contact");
      if (error) {
        error.hidden = valid;
        error.textContent = tr("contactInvalid");
      }
      var status = $("contact-status");
      if (!valid) {
        if (status) status.hidden = true;
        toast(tr("contactInvalid"), "warning");
        return;
      }
      if (status) {
        status.hidden = false;
        status.textContent = tr("contactOk");
      }
      form.reset();
      toast(tr("contactOk"));
    });
  }

  /* ---------- 19. Confirm dialog & reset ---------- */
  var confirmCallback = null;
  function askConfirm(callback) {
    confirmCallback = callback;
    openModal("confirm-modal");
  }
  function initConfirm() {
    var yes = $("confirm-yes");
    var no = $("confirm-no");
    if (yes) yes.addEventListener("click", function () {
      var cb = confirmCallback;
      confirmCallback = null;
      closeModal("confirm-modal");
      if (typeof cb === "function") cb();
    });
    if (no) no.addEventListener("click", function () {
      confirmCallback = null;
      closeModal("confirm-modal");
    });
    var reset = $("reset-data");
    if (reset) reset.addEventListener("click", function () {
      askConfirm(function () {
        store.clearAll();
        profile = null;
        planState = { items: [], savedAt: null };
        expiryState = [];
        editingPlanId = null;
        var form = $("profile-form");
        if (form) form.reset();
        renderDashboard();
        renderPlanner();
        renderExpiry();
        renderQuote();
        resetWater();
        resetMealTracker();
        resetActivities();
        $$("#food-grid .food-card, #recipe-grid .recipe-card").forEach(function (c) { c.classList.remove("hidden"); });
        $$("[data-food-filter]").forEach(function (b, i) { b.classList.toggle("active", i === 0); });
        var emptyFood = $("food-no-results");
        var emptyRecipe = $("recipe-no-results");
        if (emptyFood) emptyFood.hidden = true;
        if (emptyRecipe) emptyRecipe.hidden = true;
        var search = $("recipe-search");
        if (search) search.value = "";
        toast(tr("resetDone"));
      });
    });
  }

  /* ---------- 20. Modal close buttons, image fallbacks, language toggle ---------- */
  function initGlobalEvents() {
    $$("[data-modal-close]").forEach(function (el) {
      el.addEventListener("click", function () {
        var modal = el.closest(".modal");
        if (modal) closeModal(modal.id);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var open = $$(".modal").filter(function (m) { return !m.hidden; });
        if (open.length) { closeModal(open[open.length - 1].id); return; }
        var menu = $("nav-menu");
        var toggle = $("nav-toggle");
        if (menu && menu.classList.contains("open")) {
          menu.classList.remove("open");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
        }
      }
    });
    var langToggle = $("lang-toggle");
    if (langToggle) langToggle.addEventListener("click", function () {
      currentLang = currentLang === "en" ? "ta" : "en";
      store.set("lang", currentLang);
      applyLanguage();
      toast(currentLang === "ta" ? "தமிழ் மொழி இயக்கப்பட்டது." : "English language enabled.");
    });

    var year = $("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function attachImageFallbacks(root) {
    $$("img[data-fallback]", root).forEach(function (img) {
      if (img.dataset.bound) return;
      img.dataset.bound = "1";
      img.addEventListener("error", function () {
        var fallback = img.dataset.fallback;
        delete img.dataset.fallback;
        if (fallback && img.src.indexOf(fallback) === -1) img.src = fallback;
      });
    });
  }

  function applyLanguage() {
    translateStatic();
    renderDashboard();
    renderPlanner();
    renderExpiry();
    renderActivities();
    renderQuote();
    renderMealTracker();
    var openCondition = $("condition-modal");
    if (openCondition && !openCondition.hidden && activeConditionKey) {
      var card = $$(".condition-card").filter(function (c) { return c.dataset.condition === activeConditionKey; })[0];
      if (card) card.click();
    }
    var openRecipe = $("recipe-modal");
    if (openRecipe && !openRecipe.hidden && openRecipe.dataset.recipeKey) {
      var recipeCard = $$(".recipe-card").filter(function (c) { return c.dataset.recipe === openRecipe.dataset.recipeKey; })[0];
      if (recipeCard) {
        var view = recipeCard.querySelector(".view-recipe");
        if (view) view.click();
      }
    }
  }

  /* ---------- 21. Boot ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    document.body.classList.remove("no-js");
    $$(".error-text").forEach(function (el) { el.hidden = true; });
    attachImageFallbacks(document);
    initNavigation();
    initGlobalEvents();
    translateStatic();
    initProfile();
    renderDashboard();
    initWater();
    initMealTracker();
    initActivities();
    initConditions();
    initFoodFilters();
    initRecipes();
    initPlanner();
    initExpiry();
    initQuote();
    initContact();
    initConfirm();
    renderQuote();
  });
})();
