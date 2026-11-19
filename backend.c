/* ==========================================================================
   HEALTHIFY — Educational C backend module
   Compile with: gcc backend.c -o healthify
   The web application mirrors these calculations in browser JavaScript.
   This program is educational only: it does not diagnose or prescribe.
   ========================================================================== */

#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <stdlib.h>
#include <errno.h>

#define NAME_LEN 60
#define QTY_LEN 40
#define LINE_LEN 128
#define MEAL_COUNT 4
#define MAX_MEAL_ITEMS 12
#define MAX_FOODS 13

static const char *MEAL_NAMES[MEAL_COUNT] = {
    "Breakfast", "Lunch", "Evening Snacks", "Dinner"
};

typedef struct {
    char name[NAME_LEN];
    int age;
    char gender[24];
    double heightCm;
    double weightKg;
    int activity;
    int diet;
} Profile;

typedef struct {
    const char *name;
    const char *category;
    const char *diet;
    const char *nutrients;
    const char *tip;
} Food;

typedef struct {
    char food[NAME_LEN];
    char qty[QTY_LEN];
} MealItem;

typedef struct {
    MealItem items[MEAL_COUNT][MAX_MEAL_ITEMS];
    int counts[MEAL_COUNT];
} MealPlan;

typedef struct {
    int glasses;
    int mealsDone[MEAL_COUNT];
    int activityMinutes;
} DailyLog;

typedef struct {
    const char *title;
    const char *overview;
    const char *habits;
    const char *foods;
} HealthTopic;

static const Food FOODS[MAX_FOODS] = {
    {"Apple", "fruits", "vegetarian", "Fibre, vitamin C", "A crunchy fruit with natural fibre."},
    {"Banana", "fruits", "vegetarian", "Potassium, energy", "Useful as a quick energy food for many people."},
    {"Spinach", "vegetables", "vegetarian", "Iron, folate", "A leafy green packed with micronutrients."},
    {"Broccoli", "vegetables", "vegetarian", "Fibre, vitamin K", "A cruciferous vegetable full of fibre."},
    {"Oats", "grains", "vegetarian", "Beta-glucan, fibre", "A whole grain that keeps you full longer."},
    {"Almonds", "snacks", "vegetarian", "Vitamin E, healthy fats", "A small handful makes a satisfying snack."},
    {"Ragi", "grains", "vegetarian", "Calcium, fibre", "A traditional millet rich in calcium."},
    {"Millets", "grains", "vegetarian", "Complex carbs, fibre", "Diverse grains for everyday meals."},
    {"Idli", "traditional", "vegetarian", "Steamed, low oil", "Light and easy to digest for many people."},
    {"Vegetable Dosa", "traditional", "vegetarian", "Fermented, vegetables", "Crisp pancake with a vegetable filling."},
    {"Boiled Egg", "protein", "nonvegetarian", "Protein, choline", "A simple, portable source of protein."},
    {"Grilled Chicken", "protein", "nonvegetarian", "Lean protein", "Lean protein prepared with little oil."},
    {"Greek Yogurt", "snacks", "vegetarian", "Protein, calcium", "Creamy snack with natural protein."}
};

static const HealthTopic TOPICS[] = {
    {"Diabetes / Blood Sugar",
     "Blood sugar is glucose carried in the blood. Food and routine can support everyday balance.",
     "Keep regular meal and sleep times; consider a short walk after meals; stay hydrated.",
     "Choose whole grains, pair carbohydrates with protein or fats, and keep sweets occasional."},
    {"Blood Pressure",
     "Blood pressure is the force of blood against artery walls. Long-term habits can influence it.",
     "Move regularly, rest well, practise slow breathing, and limit very salty packaged foods.",
     "Prefer fresh foods, read labels for sodium, and reduce excess salt added at the table."},
    {"Obesity",
     "Body weight is influenced by food, movement, sleep, medicines and genetics.",
     "Aim for achievable movement and steady habits rather than quick fixes.",
     "Build plates with vegetables, protein and whole grains; choose water over sugary drinks."},
    {"Heart Health",
     "Regular movement, enough sleep, not smoking and balanced food choices support heart wellbeing.",
     "Move most days, break up long sitting, and avoid smoke and second-hand smoke.",
     "Choose vegetables, fruits, whole grains and legumes; limit deep-fried foods and excess sodium."},
    {"Joint Pain",
     "Joints can feel stiff or sore for many reasons. Gentle movement and comfort matter.",
     "Warm up gently, avoid one position for too long, and use comfortable footwear.",
     "Include varied vegetables, fruits, whole grains and adequate protein; stay hydrated."},
    {"Cold & Fever",
     "Common colds are usually viral and often settle with rest and time.",
     "Rest, keep fluids nearby, wash hands often and return to routines gradually.",
     "Warm soups, porridge and easy-to-digest foods can feel soothing."},
    {"General Wellness",
     "Wellness combines movement, food, sleep, connection and mental wellbeing.",
     "Drink water regularly, take short movement breaks, and keep a steady sleep schedule.",
     "Aim for variety: grains, pulses, vegetables, fruits and healthy fats."}
};

/* ---------- General helpers ---------- */
static void copyText(char *dest, size_t size, const char *source) {
    if (dest == NULL || size == 0) return;
    snprintf(dest, size, "%s", source != NULL ? source : "");
}

static void trimWhitespace(char *text) {
    char *start = text;
    size_t length;

    if (text == NULL) return;
    while (*start != '\0' && isspace((unsigned char)*start)) start++;
    if (start != text) memmove(text, start, strlen(start) + 1);

    length = strlen(text);
    while (length > 0 && isspace((unsigned char)text[length - 1])) {
        text[length - 1] = '\0';
        length--;
    }
}

static int readLine(const char *prompt, char *buffer, size_t size) {
    if (prompt != NULL) printf("%s", prompt);
    if (fgets(buffer, (int)size, stdin) == NULL) return 0;
    buffer[strcspn(buffer, "\n")] = '\0';
    trimWhitespace(buffer);
    return 1;
}

static int readIntRange(const char *prompt, int minimum, int maximum) {
    char line[LINE_LEN];
    char *end = NULL;
    long value;

    while (1) {
        if (!readLine(prompt, line, sizeof(line))) return minimum;
        errno = 0;
        value = strtol(line, &end, 10);
        if (end != line && *end == '\0' && errno == 0 && value >= minimum && value <= maximum) {
            return (int)value;
        }
        printf("Please enter a whole number from %d to %d.\n", minimum, maximum);
    }
}

static double readDoubleRange(const char *prompt, double minimum, double maximum) {
    char line[LINE_LEN];
    char *end = NULL;
    double value;

    while (1) {
        if (!readLine(prompt, line, sizeof(line))) return minimum;
        errno = 0;
        value = strtod(line, &end);
        if (end != line && *end == '\0' && errno == 0 && value >= minimum && value <= maximum) {
            return value;
        }
        printf("Please enter a number from %.1f to %.1f.\n", minimum, maximum);
    }
}

static int validName(const char *name) {
    int letters = 0;
    size_t i;

    if (name == NULL) return 0;
    for (i = 0; name[i] != '\0'; i++) {
        unsigned char ch = (unsigned char)name[i];
        if (isalpha(ch)) letters++;
        else if (!isspace(ch) && ch != '-' && ch != '\'') return 0;
    }
    return letters >= 2;
}

static int sameTextIgnoreCase(const char *left, const char *right) {
    if (left == NULL || right == NULL) return 0;
    while (*left != '\0' && *right != '\0') {
        if (tolower((unsigned char)*left) != tolower((unsigned char)*right)) return 0;
        left++;
        right++;
    }
    return *left == '\0' && *right == '\0';
}

static const char *activityLabel(int activity) {
    switch (activity) {
        case 1: return "Low activity";
        case 2: return "Moderate activity";
        case 3: return "Very active";
        default: return "Not specified";
    }
}

static const char *dietLabel(int diet) {
    switch (diet) {
        case 1: return "Vegetarian";
        case 2: return "Non-vegetarian";
        case 3: return "Vegan / plant-based";
        default: return "Not specified";
    }
}

/* ---------- BMI and validation functions ---------- */
static double calculateBMI(double weightKg, double heightCm) {
    double metres = heightCm / 100.0;
    if (metres <= 0.0) return 0.0;
    return weightKg / (metres * metres);
}

static const char *classifyBMI(double bmi) {
    if (bmi <= 0.0) return "Not available";
    if (bmi < 18.5) return "Below standard range";
    if (bmi < 25.0) return "Standard range";
    if (bmi < 30.0) return "Above standard range";
    return "Well above standard range";
}

static int inputProfile(Profile *profile) {
    char line[LINE_LEN];
    int genderChoice;

    if (profile == NULL) return 0;
    printf("\n--- Save your profile ---\n");

    line[0] = '\0';
    do {
        if (!readLine("Name: ", line, sizeof(line))) return 0;
        if (!validName(line)) printf("Enter a name with at least 2 letters.\n");
    } while (!validName(line));
    copyText(profile->name, sizeof(profile->name), line);

    profile->age = readIntRange("Age (2-120): ", 2, 120);

    printf("Gender: 1) Female  2) Male  3) Other  4) Prefer not to say\n");
    genderChoice = readIntRange("Choose gender: ", 1, 4);
    switch (genderChoice) {
        case 1: copyText(profile->gender, sizeof(profile->gender), "Female"); break;
        case 2: copyText(profile->gender, sizeof(profile->gender), "Male"); break;
        case 3: copyText(profile->gender, sizeof(profile->gender), "Other"); break;
        default: copyText(profile->gender, sizeof(profile->gender), "Prefer not to say"); break;
    }

    profile->heightCm = readDoubleRange("Height in cm (80-250): ", 80.0, 250.0);
    profile->weightKg = readDoubleRange("Weight in kg (10-300): ", 10.0, 300.0);

    printf("Activity level: 1) Low  2) Moderate  3) Very active\n");
    profile->activity = readIntRange("Choose activity level: ", 1, 3);

    printf("Diet preference: 1) Vegetarian  2) Non-vegetarian  3) Vegan / plant-based\n");
    profile->diet = readIntRange("Choose diet preference: ", 1, 3);

    puts("Profile saved in this C program session.");
    return 1;
}

static void printProfile(const Profile *profile) {
    if (profile == NULL || profile->name[0] == '\0') {
        puts("No profile saved yet.");
        return;
    }
    printf("Name: %s\n", profile->name);
    printf("Age: %d\n", profile->age);
    printf("Gender: %s\n", profile->gender);
    printf("Height: %.1f cm\n", profile->heightCm);
    printf("Weight: %.1f kg\n", profile->weightKg);
    printf("Activity: %s\n", activityLabel(profile->activity));
    printf("Diet: %s\n", dietLabel(profile->diet));
}

static void printBMIPanel(const Profile *profile) {
    double bmi;
    if (profile == NULL || profile->name[0] == '\0') {
        puts("Save a profile first to calculate BMI.");
        return;
    }
    bmi = calculateBMI(profile->weightKg, profile->heightCm);
    printf("\nBMI: %.1f kg/m^2\n", bmi);
    printf("Educational category: %s\n", classifyBMI(bmi));
    puts("BMI does not measure muscle, bone or overall health. Ask a professional for personal advice.");
}

/* ---------- Food and topic displays ---------- */
static void printFoodLibrary(void) {
    size_t i;
    puts("\n--- Food library ---");
    for (i = 0; i < MAX_FOODS; i++) {
        printf("%2zu. %-18s | %-12s | %-15s | %s\n",
               i + 1, FOODS[i].name, FOODS[i].category, FOODS[i].diet, FOODS[i].nutrients);
    }
}

static void printFoodDetails(void) {
    char line[NAME_LEN];
    size_t i;
    int found = 0;

    line[0] = '\0';
    if (!readLine("\nEnter a food name to look up: ", line, sizeof(line))) return;
    for (i = 0; i < MAX_FOODS; i++) {
        if (sameTextIgnoreCase(line, FOODS[i].name)) {
            printf("\n%s\n", FOODS[i].name);
            printf("Category: %s\n", FOODS[i].category);
            printf("Diet: %s\n", FOODS[i].diet);
            printf("Key nutrients: %s\n", FOODS[i].nutrients);
            printf("Tip: %s\n", FOODS[i].tip);
            found = 1;
            break;
        }
    }
    if (!found) puts("Food not found in this sample library. Try Apple, Oats, Ragi or Eggs.");
}

static void printHealthTopics(void) {
    size_t i;
    size_t count = sizeof(TOPICS) / sizeof(TOPICS[0]);
    puts("\n--- Health topics (education only) ---");
    for (i = 0; i < count; i++) {
        printf("\n%zu. %s\n", i + 1, TOPICS[i].title);
        printf("Overview: %s\n", TOPICS[i].overview);
        printf("Habits: %s\n", TOPICS[i].habits);
        printf("Food guidance: %s\n", TOPICS[i].foods);
    }
    puts("\nSeek professional care for persistent symptoms, severe pain, breathing trouble or before changing treatment.");
}

/* ---------- Daily tracking functions ---------- */
static int waterGoal(const Profile *profile) {
    if (profile != NULL && profile->activity == 3) return 10;
    if (profile != NULL && profile->activity == 2) return 9;
    return 8;
}

static void printMealLog(const DailyLog *log) {
    int i;
    if (log == NULL) return;
    printf("Meals completed: ");
    for (i = 0; i < MEAL_COUNT; i++) {
        printf("%s=%s ", MEAL_NAMES[i], log->mealsDone[i] ? "done" : "pending");
    }
    putchar('\n');
}

static void waterMenu(const Profile *profile, DailyLog *log) {
    int choice;
    if (log == NULL) return;

    do {
        int goal = waterGoal(profile);
        printf("\n--- Water tracker ---\n");
        printf("Glasses today: %d / %d\n", log->glasses, goal);
        printf("Progress: %d%%\n", goal > 0 ? (log->glasses * 100) / goal : 0);
        puts("1) Add one glass   2) Remove one glass   0) Back");
        choice = readIntRange("Choose: ", 0, 2);

        if (choice == 1) {
            if (log->glasses >= goal) puts("That is already a full day of water. Great work!");
            else { log->glasses++; puts("One glass added."); }
        } else if (choice == 2) {
            if (log->glasses == 0) puts("No glasses to remove yet.");
            else { log->glasses--; puts("One glass removed."); }
        }
    } while (choice != 0);
}

static void mealTrackerMenu(DailyLog *log) {
    int choice;
    if (log == NULL) return;

    do {
        puts("\n--- Meal checklist ---");
        printMealLog(log);
        printf("1) %s   2) %s   3) %s   4) %s   0) Back\n",
               MEAL_NAMES[0], MEAL_NAMES[1], MEAL_NAMES[2], MEAL_NAMES[3]);
        choice = readIntRange("Toggle a meal: ", 0, MEAL_COUNT);
        if (choice > 0) {
            int index = choice - 1;
            log->mealsDone[index] = !log->mealsDone[index];
            printf("%s marked %s.\n", MEAL_NAMES[index], log->mealsDone[index] ? "done" : "pending");
        }
    } while (choice != 0);
}

static void activityMenu(DailyLog *log) {
    int minutes;
    if (log == NULL) return;
    printf("\nActivity minutes recorded today: %d\n", log->activityMinutes);
    minutes = readIntRange("Add minutes (1-600, or 0 to cancel): ", 0, 600);
    if (minutes > 0) {
        log->activityMinutes += minutes;
        printf("Added %d minutes. Total: %d minutes.\n", minutes, log->activityMinutes);
    }
}

/* ---------- Meal planner functions ---------- */
static int addMealItem(MealPlan *plan, int meal, const char *food, const char *qty) {
    int index;
    if (plan == NULL || meal < 0 || meal >= MEAL_COUNT || food == NULL) return 0;
    if (plan->counts[meal] >= MAX_MEAL_ITEMS) return 0;
    index = plan->counts[meal]++;
    copyText(plan->items[meal][index].food, NAME_LEN, food);
    copyText(plan->items[meal][index].qty, QTY_LEN, qty != NULL ? qty : "1 serving");
    return 1;
}

static int removeMealItem(MealPlan *plan, int meal, int itemNumber) {
    int index;
    if (plan == NULL || meal < 0 || meal >= MEAL_COUNT) return 0;
    if (itemNumber < 1 || itemNumber > plan->counts[meal]) return 0;
    index = itemNumber - 1;
    for (; index < plan->counts[meal] - 1; index++) {
        plan->items[meal][index] = plan->items[meal][index + 1];
    }
    plan->counts[meal]--;
    return 1;
}

static void printMealPlan(const MealPlan *plan) {
    int meal;
    int item;
    int total = 0;
    int used = 0;

    if (plan == NULL) return;
    puts("\n--- Meal plan ---");
    for (meal = 0; meal < MEAL_COUNT; meal++) {
        printf("%s:\n", MEAL_NAMES[meal]);
        if (plan->counts[meal] == 0) {
            puts("  (empty)");
        } else {
            for (item = 0; item < plan->counts[meal]; item++) {
                printf("  %d) %s — %s\n", item + 1,
                       plan->items[meal][item].food, plan->items[meal][item].qty);
            }
            used++;
        }
        total += plan->counts[meal];
    }
    printf("Summary: %d food item(s) across %d meal(s).\n", total, used);
}

static void mealPlannerMenu(MealPlan *plan) {
    int choice;
    if (plan == NULL) return;

    do {
        puts("\n--- Meal planner ---");
        puts("1) Add food   2) Remove food   3) View plan   0) Back");
        choice = readIntRange("Choose: ", 0, 3);

        if (choice == 1) {
            char food[NAME_LEN];
            char qty[QTY_LEN];
            int meal;
            printMealPlan(plan);
            printf("Meal: 1) Breakfast  2) Lunch  3) Evening Snacks  4) Dinner\n");
            meal = readIntRange("Choose meal: ", 1, MEAL_COUNT) - 1;
            readLine("Food item: ", food, sizeof(food));
            if (!validName(food)) {
                puts("Enter a valid food name.");
            } else {
                readLine("Quantity (e.g. 1 bowl): ", qty, sizeof(qty));
                if (addMealItem(plan, meal, food, qty)) puts("Food added to your plan.");
                else puts("This meal is full. Remove an item first.");
            }
        } else if (choice == 2) {
            int meal;
            int itemNumber;
            printMealPlan(plan);
            printf("Meal: 1) Breakfast  2) Lunch  3) Evening Snacks  4) Dinner\n");
            meal = readIntRange("Choose meal: ", 1, MEAL_COUNT) - 1;
            itemNumber = readIntRange("Enter item number to remove: ", 1, MAX_MEAL_ITEMS);
            if (removeMealItem(plan, meal, itemNumber)) puts("Food removed.");
            else puts("That item does not exist.");
        } else if (choice == 3) {
            printMealPlan(plan);
        }
    } while (choice != 0);
}

/* ---------- Expiry reminder functions ---------- */
static int isLeapYear(int year) {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
}

static int daysInMonth(int year, int month) {
    static const int days[] = {31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
    if (month < 1 || month > 12) return 0;
    if (month == 2 && isLeapYear(year)) return 29;
    return days[month - 1];
}

static int parseDate(const char *text, int *year, int *month, int *day) {
    size_t i;
    char *end = NULL;
    long y;
    long m;
    long d;
    const int digitPositions[] = {0, 1, 2, 3, 5, 6, 8, 9};

    if (text == NULL || strlen(text) != 10) return 0;
    if (text[4] != '-' || text[7] != '-') return 0;
    for (i = 0; i < sizeof(digitPositions) / sizeof(digitPositions[0]); i++) {
        if (!isdigit((unsigned char)text[digitPositions[i]])) return 0;
    }

    y = strtol(text, &end, 10);
    if (end != text + 4) return 0;
    m = strtol(text + 5, &end, 10);
    if (end != text + 7) return 0;
    d = strtol(text + 8, &end, 10);
    if (end != text + 10) return 0;

    if (m < 1 || m > 12 || d < 1 || d > daysInMonth((int)y, (int)m)) return 0;
    *year = (int)y;
    *month = (int)m;
    *day = (int)d;
    return 1;
}

static long dateToSerial(int year, int month, int day) {
    long adjustedYear = year - (month <= 2);
    long era = (adjustedYear >= 0 ? adjustedYear : adjustedYear - 399) / 400;
    long yearOfEra = adjustedYear - era * 400;
    long shiftedMonth = month + (month > 2 ? -3 : 9);
    long dayOfYear = (153 * shiftedMonth + 2) / 5 + day - 1;
    long dayOfEra = yearOfEra * 365 + yearOfEra / 4 - yearOfEra / 100 + dayOfYear;
    return era * 146097 + dayOfEra;
}

static void expiryMenu(void) {
    char name[NAME_LEN];
    char purchase[LINE_LEN];
    char expiry[LINE_LEN];
    char today[LINE_LEN];
    int py, pm, pd, ey, em, ed, ty, tm, td;
    long difference;

    puts("\n--- Expiry reminder ---");
    readLine("Product name: ", name, sizeof(name));
    if (!validName(name)) {
        puts("Enter a valid product name.");
        return;
    }
    readLine("Purchase date (YYYY-MM-DD): ", purchase, sizeof(purchase));
    readLine("Expiry date (YYYY-MM-DD): ", expiry, sizeof(expiry));
    readLine("Today's date (YYYY-MM-DD): ", today, sizeof(today));

    if (!parseDate(purchase, &py, &pm, &pd) ||
        !parseDate(expiry, &ey, &em, &ed) ||
        !parseDate(today, &ty, &tm, &td)) {
        puts("One or more dates are invalid. Use YYYY-MM-DD.");
        return;
    }
    if (dateToSerial(ey, em, ed) <= dateToSerial(py, pm, pd)) {
        puts("Expiry date must be after the purchase date.");
        return;
    }

    difference = dateToSerial(ey, em, ed) - dateToSerial(ty, tm, td);
    printf("Product: %s\n", name);
    if (difference < 0) printf("Status: expired %ld day(s) ago.\n", -difference);
    else if (difference == 0) puts("Status: expires today.");
    else if (difference <= 7) printf("Status: expiring soon — %ld day(s) left.\n", difference);
    else printf("Status: fresh — %ld day(s) left.\n", difference);
}

/* ---------- Main menu ---------- */
static void printDailySummary(const Profile *profile, const DailyLog *log, const MealPlan *plan) {
    puts("\n--- Daily summary ---");
    printProfile(profile);
    printBMIPanel(profile);
    if (log != NULL) {
        printf("Water: %d / %d glasses\n", log->glasses, waterGoal(profile));
        printf("Activity: %d minute(s)\n", log->activityMinutes);
        printMealLog(log);
    }
    printMealPlan(plan);
}

static void printMenu(void) {
    puts("\n================ HEALTHIFY MENU ================");
    puts("1) Save or update profile");
    puts("2) Calculate BMI");
    puts("3) Browse food library");
    puts("4) Look up one food");
    puts("5) Read health topics");
    puts("6) Track water");
    puts("7) Track meals");
    puts("8) Track activity minutes");
    puts("9) Meal planner");
    puts("10) Check expiry reminder");
    puts("11) View daily summary");
    puts("0) Exit");
}

int main(void) {
    Profile profile;
    DailyLog log;
    MealPlan plan;
    int choice;

    memset(&profile, 0, sizeof(profile));
    memset(&log, 0, sizeof(log));
    memset(&plan, 0, sizeof(plan));

    puts("HEALTHIFY — educational health and food manager");
    puts("For learning and organisation only. Not medical advice.");

    do {
        printMenu();
        choice = readIntRange("Choose an option: ", 0, 11);

        switch (choice) {
            case 1:
                inputProfile(&profile);
                break;
            case 2:
                printBMIPanel(&profile);
                break;
            case 3:
                printFoodLibrary();
                break;
            case 4:
                printFoodDetails();
                break;
            case 5:
                printHealthTopics();
                break;
            case 6:
                waterMenu(&profile, &log);
                break;
            case 7:
                mealTrackerMenu(&log);
                break;
            case 8:
                activityMenu(&log);
                break;
            case 9:
                mealPlannerMenu(&plan);
                break;
            case 10:
                expiryMenu();
                break;
            case 11:
                printDailySummary(&profile, &log, &plan);
                break;
            case 0:
                puts("Thank you for using HEALTHIFY. Small steps matter.");
                break;
            default:
                puts("Unknown option.");
                break;
        }
    } while (choice != 0);

    return 0;
}
