# HEALTHIFY

HEALTHIFY is a responsive, premium health-tech one-page website focused on everyday food and wellness habits. It includes an interactive browser application written in vanilla JavaScript and a separate educational C command-line module.

> HEALTHIFY is for education and personal organisation only. It does not diagnose, treat, prescribe medicine, replace professional advice, or send data to a server.

## Project structure

```text
HEALTHIFY/
├── index.html
├── style.css
├── script.js
├── backend.c
├── README.md
└── assets/
    ├── images/
    │   ├── about.jpg
    │   ├── almonds.jpg
    │   ├── apple.jpg
    │   ├── banana.jpg
    │   ├── broccoli.jpg
    │   ├── dosa.jpg
    │   ├── eggs.jpg
    │   ├── fallback.jpg
    │   ├── hero.jpg
    │   ├── idli.jpg
    │   ├── millets.jpg
    │   ├── oats.jpg
    │   ├── ragi.jpg
    │   ├── smoothie.jpg
    │   ├── soup.jpg
    │   ├── spinach.jpg
    │   └── upma.jpg
    └── icons/
        ├── activity.svg
        ├── clock.svg
        ├── droplet.svg
        ├── food.svg
        ├── glucose.svg
        ├── heart-pulse.svg
        ├── joint.svg
        ├── leaf.svg
        ├── logo.svg
        ├── moon.svg
        ├── pressure.svg
        ├── scale.svg
        ├── shield.svg
        ├── sparkles.svg
        └── thermometer.svg
```

## Run the website

The website uses no build step and no external packages.

### Option 1: open directly

Open `index.html` in a modern browser.

### Option 2: local server (recommended)

From the project directory:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

A local server is recommended because some browsers restrict `localStorage` on pages opened with the `file://` scheme.

## Website features

- Responsive premium layout with mobile navigation and sticky header.
- English / தமிழ் language toggle across static content, placeholders, modals, recipes, trackers, and notifications.
- About section with feature highlights.
- Seven educational health condition cards with accessible detail modals.
- Profile form with field-level validation.
- Dashboard with name, age, activity, diet, BMI calculation, and educational BMI category.
- Water tracker with visual glass and daily goal.
- Daily meal checklist and activity logger.
- Food library with category and diet filters.
- Healthy recipe search and detailed recipe modals.
- Meal planner with add, edit, remove, save, clear, and daily summary.
- Food expiry reminder with purchase/expiry dates and status.
- Motivational quote section.
- Contact form with validation and an honest no-server explanation.
- Toast notifications, scroll reveal animations, back-to-top button, and reset with confirmation.
- All user data is stored in browser `localStorage` under the `healthify_v1_` prefix.
- No fake login, payment, prescription, diagnosis, or server submission.

## Browser data

Data saved locally includes:

- Language preference.
- Profile details.
- Water glasses, meal checkboxes, and activity entries for the current day.
- Meal planner items.
- Expiry reminder products.

Use the **Reset Data** button in the dashboard to clear all HEALTHIFY data after confirmation. Clearing browser site data will also remove it.

## C backend module

`backend.c` is a stand-alone console program that mirrors the educational calculations and data structures used by the browser version.

### Compile with GCC or MinGW

```powershell
gcc backend.c -o healthify
```

Run:

```powershell
.\healthify.exe
```

On macOS or Linux:

```bash
gcc backend.c -o healthify
./healthify
```

If `gcc` is not found, install a C compiler such as MinGW-w64 on Windows, Xcode Command Line Tools on macOS, or GCC from your Linux package manager.

### C concepts included

- `struct` types for profile, foods, meal items, meal plan, and daily log.
- Arrays for food records, health topics, meals, and meal plan items.
- Loops for menus, validation, filtering displays, summaries, and list operations.
- `switch` menus for profile, water, meals, activity, planner, and expiry flows.
- Functions for BMI, BMI category, name/date validation, water goal, meal insertion/removal, and date differences.
- Safe `fgets`-based input with range checking.
- Educational disclaimers and no medical recommendations.

The browser cannot directly execute ordinary C files. For that reason, `script.js` provides the live browser behaviour, while `backend.c` is a separate compilable learning module.

## Medical safety note

BMI is a simple screening calculation. It does not measure muscle mass, bone density, body composition, or overall health. Food and lifestyle information in this project is general education. Consult a qualified healthcare professional for personal advice, persistent symptoms, severe pain, breathing difficulty, before changing treatment, or before major diet and supplement changes.

## Recommended checks

```powershell
node --check script.js
```

Manual browser checks:

1. Toggle language and reload the page; the selected language should persist.
2. Submit an empty profile form; inline errors should appear.
3. Save a valid profile and confirm dashboard values update.
4. Add/remove water, tick meals, and add an activity; refresh and confirm persistence.
5. Filter foods and search recipes.
6. Open condition and recipe modals; close using the button, backdrop, and Escape.
7. Add, edit, remove, save, and clear meal plan items.
8. Add expiry products with valid and invalid dates.
9. Test the mobile menu at narrow viewport widths.
10. Use reset and confirm that data clears.
