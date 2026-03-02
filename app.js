const exercises = [
    { 
        id: 1, 
        name: "Віджимання", 
        image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=250&fit=crop", 
        day: 1,
        description: "Ляжте на підлогу, руки на ширині плечей. Опускайте корпус вниз, поки груди не торкнуться підлоги, потім підніміться. Тримайте тіло прямою лінією.",
        approach: "3 підходи по 10-15 разів"
    },
    { 
        id: 2, 
        name: "Приседания", 
        image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=250&fit=crop", 
        day: 1,
        description: "Станьте ноги на ширині плечей, руки вперед. Опускайтесь вниз, згинаючи коліна, поки стегна не будуть паралельні підлозі. Підніміться назад.",
        approach: "3 підходи по 15-20 разів"
    },
    { 
        id: 3, 
        name: "Планка", 
        image: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=250&fit=crop", 
        day: 2,
        description: "Прийміть положення як для віджимання, але сперться на передпліччя. Тримайте тіло прямою лінією від голови до п'я. Не прогинайтесь і не піднімайте стегна.",
        approach: "3 підходи по 30-60 секунд"
    },
    { 
        id: 4, 
        name: "Підтягування", 
        image: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=400&h=250&fit=crop", 
        day: 2,
        description: "Схопіться за перекладину руками на ширині плечей, долонями від себе. Підтягуйтесь вгору, поки підборіддя не буде вище перекладини, потім повільно опустіться.",
        approach: "3 підходи по 5-10 разів"
    },
    { 
        id: 5, 
        name: "Біг", 
        image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400&h=250&fit=crop", 
        day: 3,
        description: "Біжіть у зручному для вас темпі. Тримайте спину прямою, руки зігнуті в ліктях. Дихайте ритмічно.",
        approach: "20-30 хвилин"
    },
    { 
        id: 6, 
        name: "Стрибки", 
        image: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=250&fit=crop", 
        day: 3,
        description: "Станьте прямо, ноги на ширині плечей. Стрибайте вгору, розводячи руки і ноги в сторони ( «зірка»), приземляйтесь м'яко.",
        approach: "3 підходи по 15 стрибків"
    },
    { 
        id: 7, 
        name: "Пресс", 
        image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop", 
        day: 4,
        description: "Ляжте на спину, зігніть коліна, руки за головою. Піднімайте корпус вгору, скорочуючи м'язи преса. Не тягніть шию руками.",
        approach: "3 підходи по 20-30 разів"
    },
    { 
        id: 8, 
        name: "Випади", 
        image: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=400&h=250&fit=crop", 
        day: 4,
        description: "Станьте прямо, крокніть однією ногою вперед. Опускайтесь вниз, поки переднє коліно не буде під кутом 90°, заднє майже торкнеться підлоги. Поверніться.",
        approach: "3 підходи по 12 разів на кожну ногу"
    },
    { 
        id: 9, 
        name: "Бурпі", 
        image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=250&fit=crop", 
        day: 5,
        description: "Почніть стоячи, присядьте, покладіть руки на підлогу, стрибніть ногами назад в планку, відтисніться, стрибніть ногами вперед і стрибніть вгору з руками.",
        approach: "3 підходи по 10-15 разів"
    },
    { 
        id: 10, 
        name: "Мости", 
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop", 
        day: 5,
        description: "Ляжте на спину, зігніть коліна, руки вздовж тіла. Піднімайте стегна вгору, спираючись на плечі та стопи. Тримайте положення.",
        approach: "3 підходи по 15-20 разів"
    },
    { 
        id: 11, 
        name: "Віджимання на брусах", 
        image: "https://images.unsplash.com/photo-1597347316205-36f6c451902a?w=400&h=250&fit=crop", 
        day: 6,
        description: "Сядьте на бруси, руки по боках. Опускайте корпус вниз, згинаючи лікті, потім піднімайтесь. Тримайте спину прямою.",
        approach: "3 підходи по 8-12 разів"
    },
    { 
        id: 12, 
        name: "Алфавіт", 
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop", 
        day: 6,
        description: "Ляжте на бік, ноги піднімайте вгору, намагаючись носками «малювати» літери. Працюють косі м'язи живота.",
        approach: "3 підходи по 10 літер на кожний бік"
    },
    { 
        id: 13, 
        name: "Велосипед", 
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=250&fit=crop", 
        day: 7,
        description: "Ляжте на спину, руки за головою. Піднімайте корпус і одночасно тягніть правий лікоть до лівого коліна, чергуючи сторони.",
        approach: "3 підходи по 20 разів (10 на кожен бік)"
    },
    { 
        id: 14, 
        name: "Скакалка", 
        image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=250&fit=crop", 
        day: 7,
        description: "Стрибайте через скакалку, тримаючи корпус прямо, стрибаючи на одній або двох ногах. Руки рухаються від плечей.",
        approach: "3 підходи по 50-100 стрибків"
    }
];

let currentDay = null;

function loadProgress() {
    const saved = localStorage.getItem("trainingProgress");
    return saved ? JSON.parse(saved) : {};
}

function saveProgress(progress) {
    localStorage.setItem("trainingProgress", JSON.stringify(progress));
}

function updateDayProgress() {
    const progress = loadProgress();
    const dayItems = document.querySelectorAll(".progress-item");

    dayItems.forEach(item => {
        const day = parseInt(item.dataset.day);
        const dayExercises = exercises.filter(e => e.day === day);
        const completed = dayExercises.filter(e => progress[e.id]).length;
        const total = dayExercises.length;

        item.classList.remove("not-started", "partially-completed", "fully-completed");
        if (completed === 0) {
            item.classList.add("not-started");
        } else if (completed === total) {
            item.classList.add("fully-completed");
        } else {
            item.classList.add("partially-completed");
        }
    });
}

function filterByDay(day) {
    currentDay = day;
    const dayItems = document.querySelectorAll(".progress-item");
    dayItems.forEach(item => item.classList.remove("active"));
    
    if (day !== null) {
        document.querySelector(`[data-day="${day}"]`).classList.add("active");
    }
    
    renderExercises();
}

function renderExercises() {
    const container = document.getElementById("exercises-list");
    const progress = loadProgress();
    
    const filteredExercises = currentDay 
        ? exercises.filter(ex => ex.day === currentDay)
        : exercises;

    container.innerHTML = filteredExercises.map(ex => `
        <div class="exercise-card ${progress[ex.id] ? 'completed' : ''}" data-id="${ex.id}">
            <img src="${ex.image}" alt="${ex.name}">
            <div class="exercise-content">
                <h3>${ex.name}</h3>
                <span class="day-badge">День ${ex.day}</span>
                <p class="description">${ex.description}</p>
                <p class="approach"><strong>Підходи:</strong> ${ex.approach}</p>
                <div class="card-footer">
                    <button onclick="toggleExercise(${ex.id})" class="${progress[ex.id] ? 'btn-completed' : ''}">
                        ${progress[ex.id] ? '✓ Виконано' : '○ Відмітити'}
                    </button>
                </div>
            </div>
        </div>
    `).join("");
}

function toggleExercise(id) {
    const progress = loadProgress();
    progress[id] = !progress[id];
    saveProgress(progress);
    renderExercises();
    updateDayProgress();
}

function resetProgress() {
    if (confirm("Скинути весь прогрес?")) {
        localStorage.removeItem("trainingProgress");
        renderExercises();
        updateDayProgress();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderExercises();
    updateDayProgress();
    
    document.querySelectorAll(".progress-item").forEach(item => {
        item.addEventListener("click", () => {
            const day = parseInt(item.dataset.day);
            filterByDay(currentDay === day ? null : day);
        });
    });
});
