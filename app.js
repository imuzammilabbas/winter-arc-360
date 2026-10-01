// =====================================================
// WINTER ARC 360°
// Local working version
// =====================================================


// ================= DATA =================

let data = JSON.parse(
    localStorage.getItem("winterArcData")
) || {

    name: "Winter Warrior",

    habits: [
        {
            id: 1,
            name: "Study",
            category: "Growth"
        },

        {
            id: 2,
            name: "Workout",
            category: "Health"
        },

        {
            id: 3,
            name: "Read",
            category: "Mind"
        },

        {
            id: 4,
            name: "No Junk Food",
            category: "Discipline"
        },

        {
            id: 5,
            name: "Sleep On Time",
            category: "Health"
        }
    ],

    habitLogs: {},

    daily: {},

    goals: [
        {
            title: "Winter Arc Consistency",
            description:
                "Complete the system consistently.",
            current: 40,
            target: 100
        }
    ],

    journal: []
};


// ================= SAVE =================

function saveData() {

    localStorage.setItem(
        "winterArcData",
        JSON.stringify(data)
    );

}


// ================= DATE =================

function getToday() {

    return new Date()
        .toISOString()
        .split("T")[0];

}


function getDateLabel(date) {

    return new Date(date + "T12:00:00")
        .toLocaleDateString(
            undefined,
            {
                month: "short",
                day: "numeric"
            }
        );

}


// ================= DAILY DATA =================

function getDaily(date = getToday()) {

    if (!data.daily[date]) {

        data.daily[date] = {

            sleep: 0,

            study: 0,

            mood: 0,

            water: 0,

            reflection: ""

        };

    }

    return data.daily[date];

}


// ================= HABIT LOG =================

function getHabitLog(date) {

    if (!data.habitLogs[date]) {

        data.habitLogs[date] = {};

    }

    return data.habitLogs[date];

}


// ================= SCORE =================

function calculateScore(date = getToday()) {

    const daily = getDaily(date);

    const logs = getHabitLog(date);

    let completed = 0;

    data.habits.forEach(habit => {

        if (logs[habit.id]) {

            completed++;

        }

    });


    const habitScore =
        data.habits.length > 0
            ? (completed / data.habits.length) * 60
            : 0;


    const sleepScore =
        Math.min(
            Number(daily.sleep) / 8,
            1
        ) * 20;


    const studyScore =
        Math.min(
            Number(daily.study) / 120,
            1
        ) * 10;


    const moodScore =
        Math.min(
            Number(daily.mood) / 10,
            1
        ) * 10;


    return Math.round(
        habitScore +
        sleepScore +
        studyScore +
        moodScore
    );

}


// ================= STREAK =================

function calculateStreak() {

    let streak = 0;

    let date = new Date();


    for (let i = 0; i < 365; i++) {

        const key =
            date.toISOString().split("T")[0];

        if (calculateScore(key) >= 60) {

            streak++;

        } else {

            break;

        }

        date.setDate(
            date.getDate() - 1
        );

    }

    return streak;

}


// ================= XP =================

function calculateXP() {

    let xp = 0;


    Object.values(data.habitLogs)
        .forEach(day => {

            Object.values(day)
                .forEach(done => {

                    if (done) {

                        xp += 10;

                    }

                });

        });


    xp += data.goals.length * 25;

    xp += data.journal.length * 15;


    return xp;

}


// ================= NAVIGATION =================

document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const page =
                    button.dataset.page;

                showPage(page);

            }
        );

    });


function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    document
        .getElementById(page)
        .classList.add("active");


    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    const titles = {

        dashboard: "Dashboard",

        today: "Today's Progress",

        calendar: "Calendar",

        analytics: "Analytics",

        goals: "Goals",

        journal: "Journal",

        achievements: "Achievements"

    };


    document.getElementById(
        "pageTitle"
    ).textContent = titles[page];


    if (page === "calendar") {

        renderCalendar();

    }

    if (page === "analytics") {

        renderAnalytics();

    }

    if (page === "goals") {

        renderGoals();

    }

    if (page === "journal") {

        renderJournal();

    }

    if (page === "achievements") {

        renderAchievements();

    }

}


// ================= DASHBOARD =================

function renderDashboard() {

    const today =
        getToday();

    const score =
        calculateScore(today);


    document.getElementById(
        "dashboardScore"
    ).textContent =
        score + "%";


    document.getElementById(
        "streak"
    ).textContent =
        calculateStreak();


    const logs =
        getHabitLog(today);


    const completed =
        data.habits.filter(
            habit => logs[habit.id]
        ).length;


    document.getElementById(
        "habitCount"
    ).textContent =
        `${completed}/${data.habits.length}`;


    document.getElementById(
        "sleepValue"
    ).textContent =
        getDaily(today).sleep || "—";


    document.getElementById(
        "xp"
    ).textContent =
        calculateXP();


    document.getElementById(
        "currentDate"
    ).textContent =
        new Date().toLocaleDateString(
            undefined,
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );


    document.getElementById(
        "greeting"
    ).textContent =
        `Build the version of yourself you want, ${
            data.name.split(" ")[0]
        }.`;


    renderDashboardHabits();

    createPerformanceChart();

    createBalanceChart();

}


// ================= HABITS =================

function renderDashboardHabits() {

    const container =
        document.getElementById(
            "dashboardHabits"
        );


    const logs =
        getHabitLog(getToday());


    container.innerHTML = "";


    data.habits.forEach(habit => {

        const row =
            document.createElement("div");

        row.className =
            "habit-row";


        const button =
            document.createElement("button");

        button.className =
            "check-btn";


        if (logs[habit.id]) {

            button.classList.add(
                "done"
            );

            button.textContent = "✓";

        }


        button.onclick = () => {

            toggleHabit(
                habit.id,
                getToday()
            );

        };


        const name =
            document.createElement("span");

        name.className =
            "habit-name";

        name.textContent =
            habit.name;


        const category =
            document.createElement("span");

        category.className =
            "habit-category";

        category.textContent =
            habit.category;


        row.appendChild(button);

        row.appendChild(name);

        row.appendChild(category);

        container.appendChild(row);

    });

}


function renderTodayHabits() {

    const container =
        document.getElementById(
            "todayHabits"
        );


    container.innerHTML = "";


    const logs =
        getHabitLog(getToday());


    data.habits.forEach(habit => {

        const row =
            document.createElement("div");

        row.className =
            "habit-row";


        const button =
            document.createElement("button");

        button.className =
            "check-btn";


        if (logs[habit.id]) {

            button.classList.add(
                "done"
            );

            button.textContent = "✓";

        }


        button.onclick = () => {

            toggleHabit(
                habit.id,
                getToday()
            );

        };


        const name =
            document.createElement("span");

        name.className =
            "habit-name";

        name.textContent =
            habit.name;


        const category =
            document.createElement("span");

        category.className =
            "habit-category";

        category.textContent =
            habit.category;


        row.appendChild(button);

        row.appendChild(name);

        row.appendChild(category);

        container.appendChild(row);

    });

}


function toggleHabit(
    habitId,
    date
) {

    const logs =
        getHabitLog(date);


    logs[habitId] =
        !logs[habitId];


    saveData();

    renderAll();

}


// ================= ADD HABIT =================

function addHabit() {

    openModal(`

        <h2>Add New Habit</h2>

        <br>

        <label>
            Habit Name

            <input
                id="newHabitName"
                placeholder="Example: Mathematics"
            >

        </label>


        <label>
            Category

            <input
                id="newHabitCategory"
                placeholder="Growth"
            >

        </label>


        <button
            class="primary-btn"
            onclick="createHabit()"
        >
            Create Habit
        </button>

    `);

}


function createHabit() {

    const name =
        document.getElementById(
            "newHabitName"
        ).value.trim();


    const category =
        document.getElementById(
            "newHabitCategory"
        ).value.trim() ||
        "General";


    if (!name) {

        alert(
            "Please enter a habit name."
        );

        return;

    }


    data.habits.push({

        id: Date.now(),

        name,

        category

    });


    saveData();

    closeModal();

    renderAll();

}


// ================= TODAY =================

function renderToday() {

    const daily =
        getDaily();


    document.getElementById(
        "sleepInput"
    ).value =
        daily.sleep || "";


    document.getElementById(
        "studyInput"
    ).value =
        daily.study || "";


    document.getElementById(
        "moodInput"
    ).value =
        daily.mood || "";


    document.getElementById(
        "waterInput"
    ).value =
        daily.water || "";


    document.getElementById(
        "reflectionInput"
    ).value =
        daily.reflection || "";


    renderTodayHabits();

}


function saveToday() {

    const daily =
        getDaily();


    daily.sleep =
        Number(
            document.getElementById(
                "sleepInput"
            ).value
        ) || 0;


    daily.study =
        Number(
            document.getElementById(
                "studyInput"
            ).value
        ) || 0;


    daily.mood =
        Number(
            document.getElementById(
                "moodInput"
            ).value
        ) || 0;


    daily.water =
        Number(
            document.getElementById(
                "waterInput"
            ).value
        ) || 0;


    daily.reflection =
        document.getElementById(
            "reflectionInput"
        ).value;


    saveData();

    renderAll();

    alert(
        "Today's progress has been saved."
    );

}


// ================= GRAPHS =================

let performanceChart;
let balanceChart;
let habitChart;
let sleepChart;
let studyChart;
let moodChart;


function lastDays(number) {

    const dates = [];

    const today =
        new Date();


    for (
        let i = number - 1;
        i >= 0;
        i--
    ) {

        const d =
            new Date(today);

        d.setDate(
            today.getDate() - i
        );


        dates.push(
            d.toISOString()
                .split("T")[0]
        );

    }


    return dates;

}


function createPerformanceChart() {

    const dates =
        lastDays(14);


    const values =
        dates.map(
            date =>
                calculateScore(date)
        );


    if (performanceChart) {

        performanceChart.destroy();

    }


    performanceChart =
        new Chart(
            document.getElementById(
                "performanceChart"
            ),
            {

                type: "line",

                data: {

                    labels:
                        dates.map(
                            getDateLabel
                        ),

                    datasets: [

                        {

                            label:
                                "Daily Score",

                            data:
                                values,

                            borderWidth: 3,

                            tension: .35,

                            fill: true

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        y: {

                            min: 0,

                            max: 100

                        }

                    }

                }

            }
        );

}


function createBalanceChart() {

    const health =
        averageHabitCategory(
            "Health"
        );


    const growth =
        averageHabitCategory(
            "Growth"
        );


    const mind =
        averageHabitCategory(
            "Mind"
        );


    const discipline =
        averageHabitCategory(
            "Discipline"
        );


    if (balanceChart) {

        balanceChart.destroy();

    }


    balanceChart =
        new Chart(
            document.getElementById(
                "balanceChart"
            ),
            {

                type: "radar",

                data: {

                    labels: [

                        "Health",

                        "Growth",

                        "Mind",

                        "Discipline"

                    ],

                    datasets: [

                        {

                            label:
                                "Progress",

                            data: [

                                health,

                                growth,

                                mind,

                                discipline

                            ],

                            borderWidth: 2

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        r: {

                            min: 0,

                            max: 100

                        }

                    }

                }

            }
        );

}


function averageHabitCategory(
    category
) {

    const habits =
        data.habits.filter(
            habit =>
                habit.category === category
        );


    if (!habits.length) {

        return 0;

    }


    let total = 0;


    habits.forEach(habit => {

        let completed = 0;


        Object.values(
            data.habitLogs
        ).forEach(day => {

            if (day[habit.id]) {

                completed++;

            }

        });


        total +=
            Math.min(
                completed / 30,
                1
            ) * 100;

    });


    return Math.round(
        total / habits.length
    );

}


// ================= ANALYTICS =================

function renderAnalytics() {

    const dates =
        lastDays(14);


    const labels =
        dates.map(
            getDateLabel
        );


    const habitValues =
        dates.map(
            date => {

                const logs =
                    getHabitLog(date);


                const done =
                    data.habits.filter(
                        habit =>
                            logs[habit.id]
                    ).length;


                return data.habits.length
                    ? Math.round(
                        done /
                        data.habits.length *
                        100
                    )
                    : 0;

            }
        );


    const sleepValues =
        dates.map(
            date =>
                getDaily(date).sleep
        );


    const studyValues =
        dates.map(
            date =>
                getDaily(date).study
        );


    const moodValues =
        dates.map(
            date =>
                getDaily(date).mood
        );


    createChart(
        "habitChart",
        "line",
        labels,
        habitValues,
        "Habit Completion %"
    );


    createChart(
        "sleepChart",
        "line",
        labels,
        sleepValues,
        "Sleep Hours"
    );


    createChart(
        "studyChart",
        "bar",
        labels,
        studyValues,
        "Study Minutes"
    );


    createChart(
        "moodChart",
        "line",
        labels,
        moodValues,
        "Mood"
    );

}


function createChart(
    canvasId,
    type,
    labels,
    values,
    label
) {

    const canvas =
        document.getElementById(
            canvasId
        );


    if (canvas._chart) {

        canvas._chart.destroy();

    }


    canvas._chart =
        new Chart(
            canvas,
            {

                type,

                data: {

                    labels,

                    datasets: [

                        {

                            label,

                            data: values,

                            borderWidth: 2,

                            tension: .3

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false

                }

            }
        );

}


// ================= CALENDAR =================

function renderCalendar() {

    const container =
        document.getElementById(
            "calendarGrid"
        );


    container.innerHTML = "";


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        today.getMonth();


    const days =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for (
        let i = 1;
        i <= days;
        i++
    ) {

        const date =
            new Date(
                year,
                month,
                i
            );


        const key =
            date.toISOString()
                .split("T")[0];


        const day =
            document.createElement(
                "div"
            );


        day.className =
            "calendar-day";


        if (
            key === getToday()
        ) {

            day.classList.add(
                "today"
            );

        }


        day.innerHTML = `

            <strong>
                ${i}
            </strong>

            <div class="calendar-score">

                Score:
                ${calculateScore(key)}%

            </div>

        `;


        container.appendChild(day);

    }

}


// ================= GOALS =================

function renderGoals() {

    const container =
        document.getElementById(
            "goalsList"
        );


    container.innerHTML = "";


    data.goals.forEach(
        (goal, index) => {

            const percent =
                Math.min(
                    100,
                    Math.round(
                        goal.current /
                        goal.target *
                        100
                    )
                );


            container.innerHTML += `

                <div class="goal-card">

                    <h3>
                        ${goal.title}
                    </h3>

                    <p>
                        ${goal.description}
                    </p>

                    <div class="progress">

                        <span
                            style="
                                width:${percent}%
                            "
                        ></span>

                    </div>

                    <small>

                        ${goal.current}
                        /
                        ${goal.target}

                        —
                        ${percent}%

                    </small>

                    <br><br>

                    <button
                        class="small-btn"
                        onclick="
                            increaseGoal(${index})
                        "
                    >
                        + Progress

                    </button>

                </div>

            `;

        }
    );

}


function addGoal() {

    openModal(`

        <h2>New Goal</h2>

        <br>

        <label>

            Goal Title

            <input
                id="goalTitle"
                placeholder="Example: Master Python"
            >

        </label>


        <label>

            Description

            <textarea
                id="goalDescription"
            ></textarea>

        </label>


        <label>

            Target

            <input
                id="goalTarget"
                type="number"
                value="100"
            >

        </label>


        <button
            class="primary-btn"
            onclick="createGoal()"
        >

            Create Goal

        </button>

    `);

}


function createGoal() {

    const title =
        document.getElementById(
            "goalTitle"
        ).value.trim();


    const description =
        document.getElementById(
            "goalDescription"
        ).value;


    const target =
        Number(
            document.getElementById(
                "goalTarget"
            ).value
        ) || 100;


    if (!title) {

        alert(
            "Enter a goal title."
        );

        return;

    }


    data.goals.push({

        title,

        description,

        current: 0,

        target

    });


    saveData();

    closeModal();

    renderAll();

}


function increaseGoal(index) {

    data.goals[index].current += 5;


    if (
        data.goals[index].current >
        data.goals[index].target
    ) {

        data.goals[index].current =
            data.goals[index].target;

    }


    saveData();

    renderGoals();

}


// ================= JOURNAL =================

function renderJournal() {

    const container =
        document.getElementById(
            "journalList"
        );


    container.innerHTML = "";


    data.journal
        .slice()
        .reverse()
        .forEach(entry => {

            container.innerHTML += `

                <div class="journal">

                    <h3>
                        ${entry.title}
                    </h3>

                    <small>
                        ${entry.date}
                    </small>

                    <p>
                        ${entry.text}
                    </p>

                </div>

            `;

        });

}


function addJournal() {

    openModal(`

        <h2>New Journal Entry</h2>

        <br>

        <label>

            Title

            <input
                id="journalTitle"
                placeholder="Today's Reflection"
            >

        </label>


        <label>

            Entry

            <textarea
                id="journalText"
                rows="8"
            ></textarea>

        </label>


        <button
            class="primary-btn"
            onclick="createJournal()"
        >

            Save Entry

        </button>

    `);

}


function createJournal() {

    const title =
        document.getElementById(
            "journalTitle"
        ).value.trim();


    const text =
        document.getElementById(
            "journalText"
        ).value;


    if (!title || !text) {

        alert(
            "Please complete the entry."
        );

        return;

    }


    data.journal.push({

        title,

        text,

        date: getToday()

    });


    saveData();

    closeModal();

    renderJournal();

    renderAchievements();

}


// ================= ACHIEVEMENTS =================

function renderAchievements() {

    const container =
        document.getElementById(
            "achievementList"
        );


    const totalHabits =
        Object.values(
            data.habitLogs
        )
        .reduce(
            (total, day) =>
                total +
                Object.values(day)
                    .filter(Boolean)
                    .length,
            0
        );


    const achievements = [

        {
            icon: "❄️",

            title: "First Step",

            description:
                "Complete your first habit.",

            unlocked:
                totalHabits >= 1

        },

        {
            icon: "🔥",

            title: "7 Day Flame",

            description:
                "Build a 7 day streak.",

            unlocked:
                calculateStreak() >= 7

        },

        {
            icon: "💯",

            title: "100 Checks",

            description:
                "Complete 100 habits.",

            unlocked:
                totalHabits >= 100

        },

        {
            icon: "📚",

            title: "Deep Worker",

            description:
                "Study for 1,000 minutes.",

            unlocked:
                Object.values(data.daily)
                    .reduce(
                        (a,b) =>
                            a +
                            Number(
                                b.study || 0
                            ),
                        0
                    ) >= 1000

        },

        {
            icon: "🌙",

            title: "Sleep Keeper",

            description:
                "Log sleep for 14 days.",

            unlocked:
                Object.values(data.daily)
                    .filter(
                        d =>
                            d.sleep > 0
                    ).length >= 14

        },

        {
            icon: "🎯",

            title: "Goal Setter",

            description:
                "Create 3 goals.",

            unlocked:
                data.goals.length >= 3

        },

        {
            icon: "✍️",

            title: "Reflector",

            description:
                "Write 10 journal entries.",

            unlocked:
                data.journal.length >= 10

        },

        {
            icon: "⚡",

            title: "Winter Arc",

            description:
                "Reach 90% daily score.",

            unlocked:
                Object.keys(
                    data.daily
                ).some(
                    date =>
                        calculateScore(
                            date
                        ) >= 90
                )

        }

    ];


    container.innerHTML = "";


    achievements.forEach(
        achievement => {

            container.innerHTML += `

                <div class="
                    achievement
                    ${
                        achievement.unlocked
                            ? "unlocked"
                            : ""
                    }
                ">

                    <div class="icon">

                        ${achievement.icon}

                    </div>

                    <h3>
                        ${achievement.title}
                    </h3>

                    <p>
                        ${achievement.description}
                    </p>

                </div>

            `;

        }
    );

}


// ================= QUICK ADD =================

function openQuickAdd() {

    openModal(`

        <h2>Quick Add</h2>

        <br>

        <button
            class="primary-btn"
            onclick="
                closeModal();
                showPage('today')
            "
        >

            ✓ Today's Progress

        </button>

        <br><br>

        <button
            class="primary-btn"
            onclick="
                closeModal();
                addHabit()
            "
        >

            + New Habit

        </button>

        <br><br>

        <button
            class="primary-btn"
            onclick="
                closeModal();
                addGoal()
            "
        >

            🎯 New Goal

        </button>

        <br><br>

        <button
            class="primary-btn"
            onclick="
                closeModal();
                addJournal()
            "
        >

            ✍ Journal Entry

        </button>

    `);

}


// ================= MODAL =================

function openModal(content) {

    document.getElementById(
        "modalContent"
    ).innerHTML = content;


    document.getElementById(
        "modal"
    ).classList.remove(
        "hidden"
    );

}


function closeModal() {

    document.getElementById(
        "modal"
    ).classList.add(
        "hidden"
    );

}


// ================= RENDER ALL =================

function renderAll() {

    renderDashboard();

    renderToday();

    renderGoals();

    renderJournal();

    renderAchievements();

}


// ================= INITIALIZE =================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        document.getElementById(
            "sideName"
        ).textContent =
            data.name;


        renderAll();

    }
);