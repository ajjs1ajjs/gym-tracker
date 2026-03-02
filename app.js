const trainingData = [
    {
        id: "chest",
        name: "Грудь",
        icon: "💪",
        exercises: [
            {
                id: 1,
                name: "Жим штанги лежачи",
                image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
                description: "Базовий комплексний вправ для розвитку грудних м'язів. Виконується на горизонтальній лаві.",
                difficulty: "Середній",
                instructions: [
                    "Ляжте на лаву, ноги міцно на підлозі",
                    "Візьміть штангу хватом трохи ширше за плечі",
                    "Зніміть штангу і утримуйте над грудьми",
                    "Повільно опустіть штангу до грудей",
                    "Вижміть штангу вгору, не блокуючи лікті"
                ],
                sets: "4 підходи по 8-12 повторів",
                muscle: "Великі грудні"
            },
            {
                id: 2,
                name: "Жим в тренажері",
                image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
                description: "Безпечна вправа для грудей в тренажері. Підходить для початківців.",
                difficulty: "Легкий",
                instructions: [
                    "Сядьте в тренажер, спина щільно притиснута",
                    "Візьміться за ручки",
                    "Виштовхуйте ручки вперед",
                    "Повільно поверніть у початкове положення"
                ],
                sets: "3 підходи по 12-15 повторів",
                muscle: "Грудні м'язи"
            },
            {
                id: 3,
                name: "Бабочка",
                image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop",
                description: "Ізоляційна вправа для грудних м'язів у тренажері.",
                difficulty: "Легкий",
                instructions: [
                    "Сядьте в тренажер, спина рівно",
                    "Руки на підлокітниках",
                    "Зведіть руки перед собою",
                    "Повільно розведіть назад"
                ],
                sets: "3 підходи по 12-15 повторів",
                muscle: "Зовнішня частина грудей"
            },
            {
                id: 4,
                name: "Віджимання на брусах",
                image: "https://images.unsplash.com/photo-1597347316205-36f6c451902a?w=600&h=400&fit=crop",
                description: "Вправа для нижньої частини грудей та триголового м'яза плеча.",
                difficulty: "Середній",
                instructions: [
                    "Сядьте на бруси, руки по боках",
                    "Підніміть тіло, випрямивши руки",
                    "Повільно опускайтесь вниз",
                    "Підніміться у початкове положення"
                ],
                sets: "3 підходи по 10-15 повторів",
                muscle: "Нижня частина грудей"
            },
            {
                id: 5,
                name: "Розведення гантелей",
                image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&h=400&fit=crop",
                description: "Ізоляційна вправа для розтягування грудних м'язів.",
                difficulty: "Легкий",
                instructions: [
                    "Ляжте на горизонтальну лаву з гантелями",
                    "Руки витягнуті вгору над грудьми",
                    "Злегка зігніть лікті",
                    "Повільно розведіть руки в сторони",
                    "Підніміть руки назад"
                ],
                sets: "3 підходи по 12-15 повторів",
                muscle: "Зовнішня частина грудей"
            }
        ]
    },
    {
        id: "back",
        name: "Спина",
        icon: "🔙",
        exercises: [
            {
                id: 6,
                name: "Тяга верхнього блоку",
                image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop",
                description: "Альтернатива підтягуванням для широчайших м'язів спини.",
                difficulty: "Легкий",
                instructions: [
                    "Сядьте на тренажер, зафіксуйте стегна",
                    "Візьміть ручку широким хватом",
                    "Підтягуйте ручку до грудей",
                    "Повільно поверніть у початкове положення"
                ],
                sets: "3 підходи по 10-15 повторів",
                muscle: "Широчайші"
            },
            {
                id: 7,
                name: "Тяга нижнього блоку",
                image: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=600&h=400&fit=crop",
                description: "Вправа для розвитку широчайших м'язів знизу.",
                difficulty: "Середній",
                instructions: [
                    "Сядьте перед нижнім блоком",
                    "Візьміть ручку обома руками",
                    "Тягніть ручку до живота",
                    "Повільно поверніть"
                ],
                sets: "3 підходи по 10-12 повторів",
                muscle: "Широчайші, низ спини"
            },
            {
                id: 8,
                name: "Підтягування",
                image: "https://images.unsplash.com/photo-1598266663439-2056e6900339?w=600&h=400&fit=crop",
                description: "Класична базова вправа для широчайших м'язів спини.",
                difficulty: "Середній",
                instructions: [
                    "Схопіться за перекладину хватом зверху",
                    "Повисніть на прямих руках",
                    "Підтягуйтесь вгору",
                    "Опускайтесь повільно вниз"
                ],
                sets: "4 підходи по 6-12 повторів",
                muscle: "Широчайші"
            },
            {
                id: 9,
                name: "Тяга штанги в нахилі",
                image: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=600&h=400&fit=crop",
                description: "Ефективна вправа для товщини спини.",
                difficulty: "Середній",
                instructions: [
                    "Ноги на ширині плечей, нахиліться вперед",
                    "Візьміть штангу хватом на ширині плечей",
                    "Тримайте спину прямою",
                    "Підтягуйте штангу до живота"
                ],
                sets: "4 підходи по 8-12 повторів",
                muscle: "Широчайші, трапеції"
            }
        ]
    },
    {
        id: "biceps",
        name: "Біцепс",
        icon: "💪",
        exercises: [
            {
                id: 10,
                name: "Згинання рук зі штангою",
                image: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600&h=400&fit=crop",
                description: "Класична вправа для біцепса.",
                difficulty: "Легкий",
                instructions: [
                    "Станьте прямо, штанга в руках",
                    "Хват на ширині плечей, долоні вгору",
                    "Згинайте руки, піднімаючи штангу",
                    "Опускайте повільно"
                ],
                sets: "4 підходи по 10-12 повторів",
                muscle: "Біцепс"
            },
            {
                id: 11,
                name: "Згинання рук з гантелями",
                image: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=600&h=400&fit=crop",
                description: "Вправа для біцепса з гантелями.",
                difficulty: "Легкий",
                instructions: [
                    "Станьте з гантелями, долоні вперед",
                    "Згинайте руки, піднімаючи гантелі",
                    "Тримайте передпліччя нерухомо",
                    "Опускайте з контролем"
                ],
                sets: "3 підходи по 12 повторів",
                muscle: "Біцепс"
            },
            {
                id: 12,
                name: "Біцепс в тренажері",
                image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
                description: "Ізоляційна вправа для біцепса в тренажері.",
                difficulty: "Легкий",
                instructions: [
                    "Сядьте в тренажер, лікті на підлокітниках",
                    "Візьміться за ручки",
                    "Згинайте руки",
                    "Повільно поверніть"
                ],
                sets: "3 підходи по 12-15 повторів",
                muscle: "Біцепс"
            }
        ]
    },
    {
        id: "triceps",
        name: "Тріцепс",
        icon: "🔥",
        exercises: [
            {
                id: 13,
                name: "Тріцепс в кросовері",
                image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
                description: "Вправа для трицепса з верхнім блоком.",
                difficulty: "Легкий",
                instructions: [
                    "Станьте спиною до кросоверу",
                    "Візьміть ручку зверху",
                    "Руки біля голови",
                    "Розгинайте руки вниз",
                    "Повільно поверніть"
                ],
                sets: "3 підходи по 12-15 повторів",
                muscle: "Трицепс"
            },
            {
                id: 14,
                name: "Розгинання на блоці",
                image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
                description: "Вправа для трицепса на верхньому блоці.",
                difficulty: "Легкий",
                instructions: [
                    "Встаньте біля верхнього блоку",
                    "Візьміть ручку хватом зверху",
                    "Руки біля голови",
                    "Розгинайте руки"
                ],
                sets: "3 підходи по 12-15 повторів",
                muscle: "Трицепс"
            },
            {
                id: 15,
                name: "Французький жим",
                image: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop",
                description: "Ефективна вправа для трицепса.",
                difficulty: "Середній",
                instructions: [
                    "Ляжте на лавку зі штангою",
                    "Штанга над грудьми, руки випрямлені",
                    "Опускайте штангу до лоба",
                    "Піднімайте у початкове положення"
                ],
                sets: "3 підходи по 10-12 повторів",
                muscle: "Трицепс"
            }
        ]
    },
    {
        id: "legs",
        name: "Ноги",
        icon: "🦵",
        exercises: [
            {
                id: 16,
                name: "Приседання зі штангою",
                image: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop",
                description: "Королева вправ для ніг. Розвиває квадрицепси та сідниці.",
                difficulty: "Складний",
                instructions: [
                    "Штанга на плечах, ноги на ширині плечей",
                    "Присідайте, відводячи стегна назад",
                    "Опускайтесь до паралелі стегон з підлогою",
                    "Піднімайтесь, випрямляючи ноги"
                ],
                sets: "4 підходи по 8-12 повторів",
                muscle: "Квадрицепси, сідниці"
            },
            {
                id: 17,
                name: "Жим ногами",
                image: "https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&h=400&fit=crop",
                description: "Безпечна альтернатива присіданням.",
                difficulty: "Середній",
                instructions: [
                    "Ляжте в тренажер, ноги на платформі",
                    "Опускайте платформу, згинаючи коліна",
                    "Не опускайте коліна занадто низько",
                    "Випрямляйте ноги"
                ],
                sets: "4 підходи по 10-15 повторів",
                muscle: "Квадрицепси"
            },
            {
                id: 18,
                name: "Розгинання ніг в тренажері",
                image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
                description: "Вправа для квадрицепсів.",
                difficulty: "Легкий",
                instructions: [
                    "Сядьте в тренажер, ноги під валиком",
                    "Розгинайте ноги",
                    "Тримайте верхнє положення",
                    "Повільно опускайте"
                ],
                sets: "3 підходи по 12-15 повторів",
                muscle: "Квадрицепси"
            },
            {
                id: 19,
                name: "Випади",
                image: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=600&h=400&fit=crop",
                description: "Вправа для квадрицепсів та сідниць.",
                difficulty: "Середній",
                instructions: [
                    "Станьте прямо",
                    "Крокніть вперед однією ногою",
                    "Опускайтесь, поки коліно під кутом 90°",
                    "Поверніться"
                ],
                sets: "3 підходи по 12 разів на ногу",
                muscle: "Квадрицепси, сідниці"
            },
            {
                id: 20,
                name: "Підйоми на носки",
                image: "https://images.unsplash.com/photo-1606890658317-7d14490b76fd?w=600&h=400&fit=crop",
                description: "Вправа для литкових м'язів.",
                difficulty: "Легкий",
                instructions: [
                    "Станьте на платформу тренажера",
                    "Піднімайтесь на носки",
                    "Тримайте верхнє положення",
                    "Повільно опускайтесь"
                ],
                sets: "4 підходи по 15-20 повторів",
                muscle: "Литки"
            }
        ]
    },
    {
        id: "shoulders",
        name: "Плечі",
        icon: "🎯",
        exercises: [
            {
                id: 21,
                name: "Розведення в боки",
                image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop",
                description: "Ізоляційна вправа для середньої частини дельт.",
                difficulty: "Легкий",
                instructions: [
                    "Станьте прямо, гантелі в руках",
                    "Трохи зігніть лікті",
                    "Підніміть руки в сторони до рівня плечей",
                    "Повільно опускайте вниз"
                ],
                sets: "3 підходи по 12-15 повторів",
                muscle: "Середні дельти"
            },
            {
                id: 22,
                name: "Махи з гантелями",
                image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop",
                description: "Вправа для дельтовидних м'язів.",
                difficulty: "Легкий",
                instructions: [
                    "Сядьте на лавку з підтримкою спини",
                    "Гантелі на рівні плечей",
                    "Піднімайте гантелі в сторони",
                    "Опускайте повільно"
                ],
                sets: "3 підходи по 12-15 повторів",
                muscle: "Дельтовидні"
            },
            {
                id: 23,
                name: "Жим гантелей над головою",
                image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop",
                description: "Базовий вправа для розвитку дельтовидних м'язів.",
                difficulty: "Середній",
                instructions: [
                    "Сядьте на лавку з підтримкою спини",
                    "Гантелі на рівні плечей",
                    "Вижміть гантелі вгору",
                    "Опускайте повільно до плечей"
                ],
                sets: "4 підходи по 8-12 повторів",
                muscle: "Дельтовидні"
            }
        ]
    },
    {
        id: "traps",
        name: "Трапеції",
        icon: "⛰️",
        exercises: [
            {
                id: 24,
                name: "Трапеції з гантелями",
                image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop",
                description: "Вправа для розвитку трапецієвидних м'язів.",
                difficulty: "Легкий",
                instructions: [
                    "Станьте з гантелями, руки внизу",
                    "Піднімайте плечі вгору",
                    "Тримайте верхнє положення",
                    "Повільно опускайте"
                ],
                sets: "3 підходи по 15-20 повторів",
                muscle: "Трапеції"
            },
            {
                id: 25,
                name: "Тяга до підборіддя",
                image: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=600&h=400&fit=crop",
                description: "Вправа для трапецій та дельт.",
                difficulty: "Середній",
                instructions: [
                    "Станьте зі штангою, хват вузький",
                    "Піднімайте штангу до підборіддя",
                    "Лікті йдуть вгору",
                    "Повільно опускайте"
                ],
                sets: "3 підходи по 10-12 повторів",
                muscle: "Трапеції, дельти"
            }
        ]
    },
    {
        id: "forearms",
        name: "Передпліччя",
        icon: "🤜",
        exercises: [
            {
                id: 26,
                name: "Передпліччя в кросовері",
                image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop",
                description: "Вправа для передпліччя в кросовері.",
                difficulty: "Легкий",
                instructions: [
                    "Станьте біля кросоверу",
                    "Візьміть ручку хватом знизу",
                    "Стискайте ручку",
                    "Повільно відпускайте"
                ],
                sets: "3 підходи по 15-20 повторів",
                muscle: "Передпліччя"
            }
        ]
    },
    {
        id: "abs",
        name: "Пресс",
        icon: "🔥",
        exercises: [
            {
                id: 27,
                name: "Скручування",
                image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop",
                description: "Класична вправа для прямого м'яза живота.",
                difficulty: "Легкий",
                instructions: [
                    "Ляжте на спину, ноги зігнуті",
                    "Руки за головою",
                    "Піднімайте корпус, скорочуючи прес",
                    "Опускайтесь з контролем"
                ],
                sets: "4 підходи по 20 повторів",
                muscle: "Прямі м'язи живота"
            },
            {
                id: 28,
                name: "Планка",
                image: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=600&h=400&fit=crop",
                description: "Статична вправа для зміцнення кора.",
                difficulty: "Середній",
                instructions: [
                    "Прийміть положення як для віджимання",
                    "Сперться на передпліччя",
                    "Тримайте тіло прямою лінією",
                    "Утримуйте положення"
                ],
                sets: "3 підходи по 30-60 секунд",
                muscle: "Пресс, коре"
            },
            {
                id: 29,
                name: "Підйоми ніг лежачи",
                image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop",
                description: "Вправа для нижнього преса.",
                difficulty: "Середній",
                instructions: [
                    "Ляжте на спину, руки під сідницями",
                    "Піднімайте ноги вгору",
                    "Опускайте ноги повільно, не торкаючись підлоги"
                ],
                sets: "3 підходи по 15-20 повторів",
                muscle: "Нижній прес"
            },
            {
                id: 30,
                name: "Велосипед",
                image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=400&fit=crop",
                description: "Вправа для косих м'язів живота.",
                difficulty: "Середній",
                instructions: [
                    "Ляжте на спину, руки за головою",
                    "Підніміть плечі та ноги",
                    "Рухайте ногами як на велосипеді",
                    "Тягніть лікоть до протилежного коліна"
                ],
                sets: "3 підходи по 20 повторів",
                muscle: "Косі м'язи"
            }
        ]
    }
];

let completionState = {};
let selectedMuscleGroup = null;
let selectedExerciseId = null;

function loadState() {
    const saved = localStorage.getItem('trainingProgress');
    if (saved) {
        completionState = JSON.parse(saved);
    }
}

function saveState() {
    localStorage.setItem('trainingProgress', JSON.stringify(completionState));
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString('uk-UA', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getAllExercises() {
    return trainingData.flatMap(group => group.exercises);
}

function updateStats() {
    const allExercises = getAllExercises();
    const total = allExercises.length;
    let completed = 0;
    const workoutDates = new Set();

    allExercises.forEach(ex => {
        if (completionState[ex.id]) {
            completed++;
            if (completionState[ex.id].date) {
                workoutDates.add(new Date(completionState[ex.id].date).toDateString());
            }
        }
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('total-exercises').textContent = total;
    document.getElementById('completed-exercises').textContent = completed;
    document.getElementById('progress-percent').textContent = percent + '%';
    document.getElementById('total-workouts').textContent = workoutDates.size;
}

function renderMuscleGroups() {
    const container = document.getElementById('muscle-groups');

    container.innerHTML = trainingData.map(group => {
        const groupExercises = group.exercises.length;
        let groupCompleted = 0;
        group.exercises.forEach(ex => {
            if (completionState[ex.id]) groupCompleted++;
        });

        const isActive = selectedMuscleGroup === group.id;
        const isComplete = groupCompleted === groupExercises;
        
        return `
            <div class="muscle-group ${isActive ? 'active' : ''} ${isComplete ? 'completed' : ''}" 
                 onclick="filterByGroup('${group.id}')">
                <span class="muscle-icon">${group.icon}</span>
                <span class="muscle-name">${group.name}</span>
                <span class="muscle-progress">${groupCompleted}/${groupExercises}</span>
            </div>
        `;
    }).join('');
}

function filterByGroup(groupId) {
    selectedMuscleGroup = selectedMuscleGroup === groupId ? null : groupId;
    renderMuscleGroups();
    renderExercises();
}

function renderExercises() {
    const container = document.getElementById('exercises-list');
    
    const filteredGroups = selectedMuscleGroup 
        ? trainingData.filter(g => g.id === selectedMuscleGroup)
        : trainingData;

    container.innerHTML = filteredGroups.map(group => `
        <div class="exercise-group">
            <h2 class="group-title">${group.icon} ${group.name}</h2>
            <div class="exercises-grid">
                ${group.exercises.map(ex => {
                    const state = completionState[ex.id];
                    const isCompleted = !!state;
                    
                    return `
                        <div class="exercise-card ${isCompleted ? 'completed' : ''}" onclick="openModal(${ex.id})">
                            <div class="card-image">
                                <img src="${ex.image}" alt="${ex.name}">
                                ${isCompleted ? '<div class="completed-badge">✓</div>' : ''}
                            </div>
                            <div class="card-content">
                                <h3>${ex.name}</h3>
                                <div class="card-meta">
                                    <span class="muscle-tag">${ex.muscle}</span>
                                    <span class="difficulty-tag ${ex.difficulty.toLowerCase()}">${ex.difficulty}</span>
                                </div>
                                ${state ? `<p class="completed-date">Виконано: ${formatDate(state.date)}</p>` : ''}
                                <button class="check-btn ${isCompleted ? 'checked' : ''}" onclick="event.stopPropagation(); toggleExercise(${ex.id})">
                                    ${isCompleted ? '✓ Виконано' : '○ Відмітити'}
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `).join('');
}

function toggleExercise(id) {
    const allExercises = getAllExercises();
    const exercise = allExercises.find(ex => ex.id === id);
    
    if (completionState[id]) {
        delete completionState[id];
    } else {
        completionState[id] = {
            completed: true,
            date: new Date().toISOString(),
            name: exercise.name
        };
    }
    
    saveState();
    updateStats();
    renderMuscleGroups();
    renderExercises();
    updateModalState();
}

function openModal(id) {
    selectedExerciseId = id;
    const allExercises = getAllExercises();
    const exercise = allExercises.find(ex => ex.id === id);
    
    if (!exercise) return;

    const state = completionState[id];
    const isCompleted = !!state;

    document.getElementById('modal-image').src = exercise.image;
    document.getElementById('modal-title').textContent = exercise.name;
    document.getElementById('modal-muscle').textContent = exercise.muscle;
    document.getElementById('modal-difficulty').textContent = exercise.difficulty;
    document.getElementById('modal-description').textContent = exercise.description;
    document.getElementById('modal-sets').textContent = exercise.sets;
    
    document.getElementById('modal-instructions').innerHTML = exercise.instructions
        .map(i => `<li>${i}</li>`)
        .join('');

    document.getElementById('modal-checkin-btn').textContent = isCompleted ? '✓ Виконано' : '○ Відмітити';
    document.getElementById('modal-checkin-btn').className = isCompleted ? 'btn-completed' : '';
    document.getElementById('checkin-date').textContent = state ? `Дата: ${formatDate(state.date)}` : '';

    document.getElementById('exercise-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('exercise-modal').style.display = 'none';
    selectedExerciseId = null;
}

function updateModalState() {
    if (!selectedExerciseId) return;
    openModal(selectedExerciseId);
}

function toggleFromModal() {
    if (selectedExerciseId) {
        toggleExercise(selectedExerciseId);
    }
}

function resetProgress() {
    if (confirm('Скинути весь прогрес? Цю дію не можна відновити.')) {
        completionState = {};
        saveState();
        updateStats();
        renderMuscleGroups();
        renderExercises();
        closeModal();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateStats();
    renderMuscleGroups();
    renderExercises();

    document.getElementById('exercise-modal').addEventListener('click', (e) => {
        if (e.target.id === 'exercise-modal') {
            closeModal();
        }
    });
});
