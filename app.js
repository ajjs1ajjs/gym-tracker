const trainingData = [
    {
        id: "chest",
        name: "Грудь",
        icon: "💪",
        exercises: [
            {
                id: 1,
                name: "Жим штанги лежачи",
                image: "images/Жим штанги лежачи.png",
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
                image: "images/Жим в тренажері.png",
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
                image: "images/Бабочка.png",
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
                image: "images/Віджимання на брусах.png",
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
                image: "images/Розведення гантелей.png",
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
                image: "images/Тяга верхнього блоку.png",
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
                image: "images/Тяга нижнього блоку.png",
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
                image: "images/Підтягування.png",
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
                image: "images/Тяга штанги в нахилі.png",
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
            },
            {
                id: 31,
                name: "Станова тяга",
                image: "images/Станова тяга.png",
                description: "Базова вправа для задньої ланцюга: спина, сідниці, задня поверхня стегна.",
                difficulty: "Складний",
                instructions: [
                    "Станьте біля штанги, ноги на ширині плечей",
                    "Штанга біля гомілок, спина пряма",
                    "Тримаючи спину, підніміть штангу",
                    "Підніміться, випрямивши корпус",
                    "Опускайте штангу контрольовано"
                ],
                sets: "4 підходи по 6-10 повторів",
                muscle: "Спина, сідниці, задня поверхня стегна"
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
                image: "images/Згинання рук зі штангою.png",
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
                image: "images/Згинання рук з гантелями.png",
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
                image: "images/Біцепс в тренажері.png",
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
                image: "images/Тріцепс в кросовері.png",
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
                image: "images/Розгинання на блоці.png",
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
                image: "images/Французький жим.png",
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
                image: "images/Приседання зі штангою.png",
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
                image: "images/Жим ногами.png",
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
                image: "images/Розгинання ніг в тренажері.png",
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
                id: 32,
                name: "Згинання ніг в тренажері",
                image: "images/Згинання ніг в тренажері.png",
                description: "Вправа для задньої поверхні стегна (біцепс стегна).",
                difficulty: "Легкий",
                instructions: [
                    "Ляжте в тренажер на животі",
                    "Валик під стегнами, ноги зачеплені",
                    "Згинайте ноги, піднімаючи п'яти до сідниць",
                    "Повільно опускайте"
                ],
                sets: "3 підходи по 12-15 повторів",
                muscle: "Задня поверхня стегна"
            },
            {
                id: 19,
                name: "Випади",
                image: "images/Випади.png",
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
                image: "images/Підйоми на носки.png",
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
                image: "images/Розведення в боки.png",
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
                image: "images/Махи з гантелями.png",
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
                image: "images/Жим гантелей над головою.png",
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
                image: "images/Трапеції з гантелями.png",
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
                image: "images/Тяга до підборіддя.png",
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
                image: "images/Передпліччя в кросовері.png",
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
                image: "images/Скручування.png",
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
                image: "images/Планка.png",
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
                image: "images/Підйоми ніг лежачи.png",
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
                image: "images/Велосипед.png",
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
let workoutPlans = [];
let timerInterval = null;
let timerSeconds = 90;
let timerRunning = false;
let timerDefaultSeconds = 90;
let exerciseLogs = {}; // { exId: [{ date, weight, reps }] }
let bodyWeightHistory = []; // [{ date, weight }]
let customExercises = [];
let wakeLock = null;
let progressionChart = null;
let bodyChart = null;


// Premium Helpers (Audio & Vibrate)
let audioCtx = null;

function initAudio() {
    if (audioCtx) return;
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
        
        // Play a silent buffer to unlock
        const buffer = audioCtx.createBuffer(1, 1, 22050);
        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(audioCtx.destination);
        if (source.start) source.start(0);
        
        // Clean up listeners
        ['touchstart', 'touchend', 'click'].forEach(evt => document.body.removeEventListener(evt, initAudio));
    } catch (e) { console.log('Audio init failed', e); }
}

// Listen to multiple interaction events for iOS reliability
['touchstart', 'touchend', 'click'].forEach(evt => document.body.addEventListener(evt, initAudio));

function vibrate(pattern = [50]) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

function playBeep() {
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    
    // iOS Safari often suspends the context, need to resume it
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    try {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        // Quick ramp to zero
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}
}

function requestNotifications() {
    if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}

function showNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: 'images/icon-192.png' });
    }
}

function celebration() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#00d4ff', '#28a745', '#ffc107']
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#00d4ff', '#28a745', '#ffc107']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
    vibrate([200, 100, 200, 100, 200]);
}

// Wake Lock API
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
            console.log('Wake Lock is active');
        }
    } catch (err) {
        console.log(`${err.name}, ${err.message}`);
    }
}

function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release();
        wakeLock = null;
    }
}

// Theme Logic
function initTheme() {
    const saved = localStorage.getItem('theme');
    const toggle = document.getElementById('theme-toggle');
    
    if (saved === 'light') {
        document.body.classList.add('light-theme');
        toggle.textContent = '☀️';
    }
    
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        toggle.textContent = isLight ? '☀️' : '🌙';
        vibrate(30);
    });
}
function loadState() {
    const saved = localStorage.getItem('trainingProgress');
    if (saved) {
        completionState = JSON.parse(saved);
    }
    
    // Phase 2: Load new data
    const logs = localStorage.getItem('exerciseLogs');
    if (logs) exerciseLogs = JSON.parse(logs);
    
    const bw = localStorage.getItem('bodyWeightHistory');
    if (bw) bodyWeightHistory = JSON.parse(bw);
    
    const ce = localStorage.getItem('customExercises');
    if (ce) {
        customExercises = JSON.parse(ce);
        mergeCustomExercises();
    }
}

function saveState() {
    localStorage.setItem('trainingProgress', JSON.stringify(completionState));
    localStorage.setItem('exerciseLogs', JSON.stringify(exerciseLogs));
    localStorage.setItem('bodyWeightHistory', JSON.stringify(bodyWeightHistory));
    localStorage.setItem('customExercises', JSON.stringify(customExercises));
}

function mergeCustomExercises() {
    // Add custom exercises to trainingData structure
    customExercises.forEach(ce => {
        const group = trainingData.find(g => g.name === ce.muscleGroup);
        if (group && !group.exercises.some(ex => ex.id === ce.id)) {
            group.exercises.push(ce);
        }
    });
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
    let totalVolume = 0;

    allExercises.forEach(ex => {
        if (completionState[ex.id]) {
            completed++;
            if (completionState[ex.id].date) {
                workoutDates.add(new Date(completionState[ex.id].date).toDateString());
            }
        }
    });

    // Calculate total lifetime volume from logs
    Object.values(exerciseLogs).forEach(logs => {
        logs.forEach(s => {
            totalVolume += (s.weight || 0) * (s.reps || 0);
        });
    });

    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    document.getElementById('total-exercises').textContent = total;
    document.getElementById('completed-exercises').textContent = completed;
    document.getElementById('progress-percent').textContent = percent + '%';
    document.getElementById('total-workouts').textContent = workoutDates.size;
    
    const volumeEl = document.getElementById('total-volume');
    if (volumeEl) {
        volumeEl.textContent = totalVolume > 1000 
            ? (totalVolume / 1000).toFixed(1) + 'т' 
            : totalVolume + 'кг';
    }
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

// Plate Calculator
function openPlateModal() {
    document.getElementById('plate-modal').style.display = 'flex';
    calculatePlates();
}

function closePlateModal() {
    document.getElementById('plate-modal').style.display = 'none';
}

function calculatePlates() {
    const totalWeight = parseFloat(document.getElementById('plate-weight-input').value) || 0;
    const barWeight = 20;
    let weightToDistribute = (totalWeight - barWeight) / 2;
    
    if (weightToDistribute < 0) weightToDistribute = 0;
    
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const result = [];
    
    let temp = weightToDistribute;
    availablePlates.forEach(p => {
        const count = Math.floor(temp / p);
        if (count > 0) {
            for(let i=0; i<count; i++) result.push(p);
            temp %= p;
        }
    });

    // Visualizer
    const visualizer = document.getElementById('plate-visualizer');
    visualizer.innerHTML = `
        <div class="barbell">
            <div class="plates-stack">
                ${result.map(p => `<div class="plate p${p.toString().replace('.', '_')}" title="${p}kg">${p}</div>`).join('')}
            </div>
        </div>
    `;
    
    const resultsArea = document.getElementById('plate-results');
    resultsArea.innerHTML = result.length > 0 
        ? `<p>З кожного боку: ${result.join('kg, ')}kg</p>`
        : `<p>Тільки гриф (20кг)</p>`;
}

// Heatmap Logic
function renderHeatmap() {
    const container = document.getElementById('activity-heatmap');
    if (!container) return;
    
    const activity = {};
    const allExercises = getAllExercises();
    
    // Aggregate by date
    Object.values(completionState).forEach(val => {
        if (val.date) {
            const d = new Date(val.date).toDateString();
            activity[d] = (activity[d] || 0) + 1;
        }
    });

    const now = new Date();
    const days = [];
    
    // Generate last 365 days
    for (let i = 364; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayStr = d.toDateString();
        const count = activity[dayStr] || 0;
        let level = 0;
        if (count > 0) level = 1;
        if (count > 3) level = 2;
        if (count > 6) level = 3;
        if (count > 9) level = 4;
        
        days.push(`<div class="heatmap-day level-${level}" title="${d.toLocaleDateString()}: ${count} вправ"></div>`);
    }
    
    container.innerHTML = days.join('');
}

function switchTab(tabId) {
    selectedMuscleGroup = null;
    
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[onclick="switchTab('${tabId}')"]`).classList.add('active');
    
    const exercisesLayout = document.querySelector('.main-layout');
    const historySection = document.getElementById('history-section');
    const plansSection = document.getElementById('plans-section');
    
    exercisesLayout.style.display = 'none';
    historySection.style.display = 'none';
    plansSection.style.display = 'none';
    
    if (tabId === 'exercises') {
        exercisesLayout.style.display = 'flex';
        renderMuscleGroups();
        renderExercises();
    } else if (tabId === 'history') {
        historySection.style.display = 'block';
        renderHistory();
        renderHeatmap();
    } else if (tabId === 'plans') {
        plansSection.style.display = 'block';
        renderPlans();
    } else if (tabId === 'body') {
        document.getElementById('body-section').style.display = 'block';
        renderBodyStats();
    }
    
    // Auto Wake Lock on Exercise tab
    if (tabId === 'exercises') requestWakeLock();
    else releaseWakeLock();
    
    vibrate(20);
}

// Phase 2: Custom Exercises
function openCustomExerciseModal() {
    document.getElementById('custom-exercise-modal').style.display = 'flex';
}

function closeCustomExerciseModal() {
    document.getElementById('custom-exercise-modal').style.display = 'none';
}

function saveCustomExercise() {
    const name = document.getElementById('ce-name').value.trim();
    const muscleGroup = document.getElementById('ce-muscle').value;
    const description = document.getElementById('ce-desc').value.trim();
    
    if (!name) {
        alert('Введіть назву вправи');
        return;
    }
    
    const newEx = {
        id: Date.now(),
        name,
        muscle: muscleGroup,
        muscleGroup: muscleGroup,
        difficulty: 'Середній',
        description: description,
        instructions: ['Користувацька вправа'],
        sets: '3 x 10',
        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop'
    };
    
    customExercises.push(newEx);
    mergeCustomExercises();
    saveState();
    renderExercises();
    closeCustomExerciseModal();
    celebration();
}

// Phase 2: Body Stats
function saveBodyWeight() {
    const weight = parseFloat(document.getElementById('body-weight-input').value);
    if (!weight || weight <= 0) {
        alert('Введіть коректну вагу');
        return;
    }
    
    const date = new Date().toISOString();
    bodyWeightHistory.push({ date, weight });
    saveState();
    renderBodyStats();
    vibrate(50);
    document.getElementById('body-weight-input').value = '';
}

function renderBodyStats() {
    const historyList = document.getElementById('body-history-list');
    if (!historyList) return;
    
    const sortedHistory = [...bodyWeightHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    historyList.innerHTML = sortedHistory.map(item => `
        <div class="body-history-item">
            <span>${formatDate(item.date)}</span>
            <span style="color:var(--accent); font-weight:bold;">${item.weight} кг</span>
        </div>
    `).join('');
    
    renderBodyChart();
}

function renderBodyChart() {
    const ctx = document.getElementById('body-chart');
    if (!ctx) return;
    
    if (bodyChart) bodyChart.destroy();
    
    const data = bodyWeightHistory.slice(-15);
    
    bodyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(i => new Date(i.date).toLocaleDateString()),
            datasets: [{
                label: 'Вага тіла (кг)',
                data: data.map(i => i.weight),
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display: false } }
            }
        }
    });
}

// Cloud Sync Logic
function openSettingsModal() {
    document.getElementById('settings-modal').style.display = 'flex';
    document.getElementById('github-token').value = localStorage.getItem('gym_github_token') || '';
    document.getElementById('gist-id').value = localStorage.getItem('gym_gist_id') || '';
}

function closeSettingsModal() {
    document.getElementById('settings-modal').style.display = 'none';
}

function saveSettings() {
    const token = document.getElementById('github-token').value.trim();
    const gistId = document.getElementById('gist-id').value.trim();
    
    if (token) localStorage.setItem('gym_github_token', token);
    if (gistId) localStorage.setItem('gym_gist_id', gistId);
    
    alert('Налаштування збережено!');
    vibrate(50);
}

async function syncToCloud() {
    const token = localStorage.getItem('gym_github_token');
    const gistId = localStorage.getItem('gym_gist_id');
    
    if (!token) {
        alert('Будь ласка, введіть GitHub Token у налаштуваннях');
        openSettingsModal();
        return;
    }

    const data = {
        completionState,
        workoutPlans,
        exerciseLogs,
        bodyWeightHistory,
        customExercises,
        lastSync: new Date().toISOString()
    };

    const body = {
        description: "Gym Tracker Backup",
        public: false,
        files: {
            "gym-data.json": {
                content: JSON.stringify(data, null, 2)
            }
        }
    };

    try {
        const url = gistId ? `https://api.github.com/gists/${gistId}` : 'https://api.github.com/gists';
        const method = gistId ? 'PATCH' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            const result = await response.json();
            if (!gistId) {
                localStorage.setItem('gym_gist_id', result.id);
                document.getElementById('gist-id').value = result.id;
            }
            alert('Синхронізація успішна! ✅');
            vibrate([50, 100, 50]);
        } else {
            const err = await response.json();
            alert('Помилка синхронізації: ' + (err.message || 'Unknown error'));
        }
    } catch (e) {
        alert('Помилка мережі: ' + e.message);
    }
}

async function fetchFromCloud() {
    const token = localStorage.getItem('gym_github_token');
    const gistId = localStorage.getItem('gym_gist_id');
    
    if (!token || !gistId) {
        alert('Налаштуйте Token та Gist ID для імпорту');
        return;
    }

    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: { 'Authorization': `token ${token}` }
        });

        if (response.ok) {
            const result = await response.json();
            const content = result.files["gym-data.json"].content;
            const data = JSON.parse(content);
            
            if (confirm('Дані завантажено. Перезаписати поточний прогрес?')) {
                completionState = data.completionState || {};
                workoutPlans = data.workoutPlans || [];
                exerciseLogs = data.exerciseLogs || {};
                bodyWeightHistory = data.bodyWeightHistory || [];
                customExercises = data.customExercises || [];
                
                mergeCustomExercises();
                saveState();
                savePlans();
                updateStats();
                renderMuscleGroups();
                renderExercises();
                alert('Дані оновлено!');
                vibrate([300, 100, 300]);
            }
        } else {
            alert('Не вдалося завантажити дані');
        }
    } catch (e) {
        alert('Помилка: ' + e.message);
    }
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
    
    if (completionState[id]) {
        vibrate(80);
        // Check if group is complete
        const group = trainingData.find(g => g.exercises.some(ex => ex.id === id));
        if (group && group.exercises.every(ex => completionState[ex.id])) {
            celebration();
        }
    }
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

    renderExerciseSetsLog(id);
    document.getElementById('exercise-modal').style.display = 'flex';
    document.getElementById('progression-chart-wrapper').style.display = 'none';
}

// Phase 3: Ultimate Logic
function calculate1RM(weight, reps) {
    if (reps === 1) return weight;
    // Epley Formula
    return Math.round(weight * (1 + reps / 30));
}

function renderExerciseSetsLog(id) {
    const logContainer = document.getElementById('exercise-sets-log');
    const logs = exerciseLogs[id] || [];
    const today = new Date().toDateString();
    
    const todaySets = logs.filter(l => new Date(l.date).toDateString() === today);
    
    let max1RM = 0;
    if (todaySets.length > 0) {
        max1RM = Math.max(...todaySets.map(s => calculate1RM(s.weight, s.reps)));
    }

    logContainer.innerHTML = todaySets.length > 0
        ? `
            <div style="margin-bottom:10px; color:var(--success); font-weight:bold; font-size:0.9rem;">
                🏆 Кращий 1RM сьогодні: ${max1RM}кг
            </div>
            ${todaySets.map((s, i) => {
                const oneRM = calculate1RM(s.weight, s.reps);
                return `
                    <div class="exercise-set-item">
                        <span>Підхід ${i + 1} <small style="color:#888;">(1RM: ${oneRM}кг)</small></span>
                        <span>${s.weight} кг x ${s.reps}</span>
                    </div>
                `;
            }).join('')}
        `
        : '<p style="color:var(--text-secondary); font-size:0.8rem;">Підходів за сьогодні немає</p>';
}

function logSet() {
    if (!selectedExerciseId) return;
    const weight = parseFloat(document.getElementById('set-weight').value);
    const reps = parseInt(document.getElementById('set-reps').value);
    
    if (isNaN(weight) || isNaN(reps)) {
        alert('Введіть вагу та повтори');
        return;
    }
    
    if (!exerciseLogs[selectedExerciseId]) exerciseLogs[selectedExerciseId] = [];
    
    exerciseLogs[selectedExerciseId].push({
        date: new Date().toISOString(),
        weight,
        reps
    });
    
    saveState();
    renderExerciseSetsLog(selectedExerciseId);
    updateStats();
    vibrate(30);
    
    document.getElementById('set-weight').value = '';
    document.getElementById('set-reps').value = '';

    // Phase 3: Smart Timer Auto-start
    const isSmartTimer = document.getElementById('smart-timer-toggle').checked;
    if (isSmartTimer) {
        openTimerModal();
        startTimer();
    }
}

function exportToCSV() {
    let csv = "Дата,Вправа,Група,Вага,Повтори,1RM\n";
    const allEx = getAllExercises();

    Object.keys(exerciseLogs).forEach(id => {
        const ex = allEx.find(e => e.id == id);
        const name = ex ? ex.name : "Вправа " + id;
        const group = ex ? ex.muscle : "-";
        
        exerciseLogs[id].forEach(s => {
            const date = new Date(s.date).toLocaleDateString();
            const oneRM = calculate1RM(s.weight, s.reps);
            csv += `${date},"${name}",${group},${s.weight},${s.reps},${oneRM}\n`;
        });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `gym_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


function toggleProgressionChart() {
    const wrapper = document.getElementById('progression-chart-wrapper');
    const btn = document.querySelector('.btn-toggle-chart');
    
    if (wrapper.style.display === 'none') {
        wrapper.style.display = 'block';
        btn.textContent = '▲ Сховати прогрес';
        renderProgressionChart(selectedExerciseId);
    } else {
        wrapper.style.display = 'none';
        btn.textContent = '📈 Показати прогрес';
    }
}

function renderProgressionChart(id) {
    const ctx = document.getElementById('progression-chart');
    if (!ctx) return;
    
    const logs = exerciseLogs[id] || [];
    if (logs.length === 0) {
        ctx.getContext('2d').clearRect(0, 0, ctx.width, ctx.height);
        return;
    }
    
    if (progressionChart) progressionChart.destroy();
    
    // Group by date, get max weight for each day
    const entries = {};
    logs.forEach(l => {
        const d = new Date(l.date).toLocaleDateString();
        if (!entries[d] || l.weight > entries[d]) entries[d] = l.weight;
    });
    
    const labels = Object.keys(entries).slice(-7); // Last 7 days
    const datasets = labels.map(l => entries[l]);
    
    progressionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Максимальна вага (кг)',
                data: datasets,
                borderColor: '#28a745',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' } },
                x: { grid: { display : false } }
            }
        }
    });
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
    loadPlans();
    updateStats();
    renderMuscleGroups();
    renderExercises();
    initTheme();
    requestNotifications();

    document.getElementById('exercise-modal').addEventListener('click', (e) => {
        if (e.target.id === 'exercise-modal') {
            closeModal();
        }
    });
});

function exportData() {
    const data = {
        version: 2,
        exportDate: new Date().toISOString(),
        completionState,
        workoutPlans,
        exerciseLogs,
        bodyWeightHistory,
        customExercises
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-tracker-full-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            completionState = data.completionState || {};
            workoutPlans = data.workoutPlans || [];
            exerciseLogs = data.exerciseLogs || {};
            bodyWeightHistory = data.bodyWeightHistory || [];
            customExercises = data.customExercises || [];
            
            mergeCustomExercises();
            saveState();
            savePlans();
            
            updateStats();
            renderMuscleGroups();
            renderExercises();
            renderPlans();
            alert('Дані успішно імпортовано!');
        } catch (err) {
            alert('Помилка при читанні файлу. Перевірте формат.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// Original switchTab removed in favor of the enhanced one above

function openTimerModal() {
    document.getElementById('timer-modal').style.display = 'flex';
    vibrate(30);
    resetTimer();
}

function closeTimerModal() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerRunning = false;
    document.getElementById('timer-modal').style.display = 'none';
    vibrate(20);
}

function setTimer(seconds) {
    timerDefaultSeconds = seconds;
    timerSeconds = seconds;
    updateTimerDisplay();
    document.querySelectorAll('.timer-preset').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

function updateTimerDisplay() {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    document.getElementById('timer-display').textContent = 
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (timerRunning) return;
    timerRunning = true;
    document.getElementById('timer-start-btn').style.display = 'none';
    document.getElementById('timer-pause-btn').style.display = 'inline-block';
    
    timerInterval = setInterval(() => {
        if (timerSeconds > 0) {
            timerSeconds--;
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            timerRunning = false;
            if (Notification.permission === 'granted') {
                new Notification('GymProgress', { body: 'Час відпочинку закінчився!' });
            }
            playBeep();
            vibrate([500, 200, 500]);
            
            document.getElementById('timer-start-btn').style.display = 'inline-block';
            document.getElementById('timer-pause-btn').style.display = 'none';
        }
    }, 1000);
}

function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerRunning = false;
    document.getElementById('timer-start-btn').style.display = 'inline-block';
    document.getElementById('timer-pause-btn').style.display = 'none';
}

function resetTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timerRunning = false;
    timerSeconds = timerDefaultSeconds;
    updateTimerDisplay();
    document.getElementById('timer-start-btn').style.display = 'inline-block';
    document.getElementById('timer-pause-btn').style.display = 'none';
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    const period = document.getElementById('history-period').value;
    
    const workouts = getWorkoutHistory(period);
    
    if (workouts.length === 0) {
        historyList.innerHTML = '<div class="history-item"><p>Історія тренувань порожня</p></div>';
        return;
    }
    
    const allExercises = getAllExercises();
    historyList.innerHTML = workouts.map(w => {
        const exerciseNames = w.exercises.map(id => {
            const ex = allExercises.find(e => e.id === id);
            return ex ? ex.name : '';
        }).filter(n => n).join(', ');
        
        // Calculate session volume
        let sessionVolume = 0;
        w.exercises.forEach(exId => {
            const logs = exerciseLogs[exId] || [];
            logs.forEach(s => {
                if (new Date(s.date).toDateString() === new Date(w.date).toDateString()) {
                    sessionVolume += (s.weight || 0) * (s.reps || 0);
                }
            });
        });
        
        return `
            <div class="history-item">
                <div>
                    <div class="history-item-date">${formatDate(w.date)}</div>
                    <div class="history-item-exercises">${exerciseNames.substring(0, 100)}${exerciseNames.length > 100 ? '...' : ''}</div>
                </div>
                <div style="text-align:right;">
                    <div class="history-item-count">${w.count} вправ</div>
                    <div style="font-size:0.8rem; color:var(--success);">${sessionVolume} кг</div>
                </div>
            </div>
        `;
    }).join('');
    
    renderHistoryChart(workouts);
}

function getWorkoutHistory(period) {
    const exerciseDates = {};
    const allExercises = getAllExercises();
    
    allExercises.forEach(ex => {
        if (completionState[ex.id] && completionState[ex.id].date) {
            const dateStr = new Date(completionState[ex.id].date).toDateString();
            if (!exerciseDates[dateStr]) {
                exerciseDates[dateStr] = {
                    date: completionState[ex.id].date,
                    exercises: [],
                    count: 0
                };
            }
            exerciseDates[dateStr].exercises.push(ex.id);
            exerciseDates[dateStr].count++;
        }
    });
    
    let workouts = Object.values(exerciseDates);
    
    if (period === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        workouts = workouts.filter(w => new Date(w.date) >= weekAgo);
    } else if (period === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        workouts = workouts.filter(w => new Date(w.date) >= monthAgo);
    }
    
    return workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function filterHistory() {
    renderHistory();
}

function renderHistoryChart(workouts) {
    const canvas = document.getElementById('history-chart');
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    canvas.width = container.clientWidth;
    canvas.height = 200;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (workouts.length === 0) return;
    
    const last7 = workouts.slice(0, 7).reverse();
    const maxCount = Math.max(...last7.map(w => w.count || 1));
    const barWidth = (canvas.width - 40) / Math.max(last7.length, 1);
    const scale = (canvas.height - 40) / Math.max(maxCount, 1);
    
    last7.forEach((w, i) => {
        const x = 20 + i * barWidth;
        const height = (w.count || 0) * scale;
        const y = canvas.height - 20 - height;
        
        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(x, y, barWidth - 10, height);
        
        ctx.fillStyle = '#888';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        const date = new Date(w.date);
        ctx.fillText(`${date.getDate()}.${date.getMonth() + 1}`, x + (barWidth - 10) / 2, canvas.height - 5);
        
        ctx.fillStyle = '#fff';
        ctx.fillText(w.count.toString(), x + (barWidth - 10) / 2, y - 5);
    });
}

function loadPlans() {
    const saved = localStorage.getItem('workoutPlans');
    if (saved) {
        workoutPlans = JSON.parse(saved);
    }
}

function savePlans() {
    localStorage.setItem('workoutPlans', JSON.stringify(workoutPlans));
}

function renderPlans() {
    const container = document.getElementById('plans-list');
    
    if (workoutPlans.length === 0) {
        container.innerHTML = '<div class="plan-card"><h3>Немає планів</h3><p>Створіть свій перший план тренувань!</p></div>';
        return;
    }
    
    const allExercises = getAllExercises();
    
    container.innerHTML = workoutPlans.map((plan, planIndex) => {
        const exerciseNames = plan.exercises.map(id => {
            const ex = allExercises.find(e => e.id === id);
            return ex ? { id, name: ex.name } : null;
        }).filter(Boolean);
        
        return `
            <div class="plan-card">
                <h3>${plan.name}</h3>
                <div class="plan-card-exercises">
                    ${exerciseNames.slice(0, 5).map(ex => `<span class="plan-exercise-mini">${ex.name}</span>`).join('')}
                    ${exerciseNames.length > 5 ? `<span class="plan-exercise-mini">+${exerciseNames.length - 5}</span>` : ''}
                </div>
                <div class="plan-card-actions">
                    <button class="btn-start-plan" onclick="startWorkout(${planIndex})">▶ Почати тренування</button>
                    <button class="btn-delete-plan" onclick="deletePlan(${planIndex})">🗑 Видалити</button>
                </div>
            </div>
        `;
    }).join('');
}

function openPlanModal() {
    document.getElementById('plan-modal').style.display = 'flex';
    document.getElementById('plan-name').value = '';
    
    const allExercises = getAllExercises();
    const container = document.getElementById('plan-exercises-select');
    
    container.innerHTML = allExercises.map(ex => `
        <label class="plan-exercise-option" onclick="toggleExerciseOption(this)">
            <input type="checkbox" value="${ex.id}">
            <span>${ex.name} (${ex.muscle})</span>
        </label>
    `).join('');
}

function closePlanModal() {
    document.getElementById('plan-modal').style.display = 'none';
}

function toggleExerciseOption(element) {
    element.classList.toggle('selected');
}

function savePlan() {
    const name = document.getElementById('plan-name').value.trim();
    if (!name) {
        alert('Введіть назву плану');
        return;
    }
    
    const selected = document.querySelectorAll('#plan-exercises-select input:checked');
    const exerciseIds = Array.from(selected).map(cb => parseInt(cb.value));
    
    if (exerciseIds.length === 0) {
        alert('Оберіть хоча б одну вправу');
        return;
    }
    
    celebration();
    
    workoutPlans.push({
        id: Date.now(),
        name,
        exercises: exerciseIds
    });
    
    savePlans();
    renderPlans();
    closePlanModal();
}

function deletePlan(index) {
    if (confirm('Видалити цей план?')) {
        workoutPlans.splice(index, 1);
        savePlans();
        renderPlans();
    }
}

function startWorkout(planIndex) {
    const plan = workoutPlans[planIndex];
    if (!plan) return;
    
    const allExercises = getAllExercises();
    const planExIds = plan.exercises;
    
    selectedExerciseId = planExIds[0];
    openModal(selectedExerciseId);
    
    const planInfo = document.createElement('div');
    planInfo.className = 'workout-progress';
    planInfo.innerHTML = `
        <p style="margin: 10px 20px; color: #00d4ff;">План: ${plan.name} (${planExIds.length} вправ)</p>
    `;
    
    document.querySelector('.modal-content').insertBefore(planInfo, document.querySelector('.modal-checkin'));
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered:', registration.scope);
            })
            .catch(error => {
                console.log('SW registration failed:', error);
            });
    });
}
