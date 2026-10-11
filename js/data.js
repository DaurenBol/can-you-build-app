// Preloaded rich quiz dataset
window.INITIAL_QUIZZES = [
    {
        id: "quiz-js-master",
        title: "JavaScript & Modern Web: Проверь себя",
        description: "Глубокое погружение в замыкания, Event Loop, промисы, прототипы и тонкости современного стандарта ECMAScript.",
        category: "it",
        categoryName: "IT и Разработка",
        difficulty: "medium", // easy, medium, hard
        difficultyName: "Средний",
        icon: "fa-brands fa-js",
        color: "from-amber-500 to-yellow-600",
        badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        timeLimitMinutes: 10,
        author: "Tech Academy",
        featured: true,
        tags: ["JavaScript", "Frontend", "Web", "ES6+"],
        questions: [
            {
                id: "js-q1",
                type: "single",
                text: "Что выведет следующий фрагмент кода в консоль?\n\n```javascript\nconsole.log(typeof (typeof null));\n```",
                options: [
                    "\"object\"",
                    "\"string\"",
                    "\"undefined\"",
                    "TypeError: null has no type"
                ],
                correctAnswer: 1,
                explanation: "`typeof null` возвращает строку `\"object\"` (исторический баг JS). Затем `typeof \"object\"` проверяет тип этой строки, что дает `\"string\"`.",
                points: 10,
                hint: "Обратите внимание на двойной typeof. Что возвращает оператор typeof всегда?"
            },
            {
                id: "js-q2",
                type: "single",
                text: "В каком порядке будут выведены цифры в Event Loop?\n\n```javascript\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);\n```",
                options: [
                    "1, 4, 3, 2",
                    "1, 2, 3, 4",
                    "1, 4, 2, 3",
                    "1, 3, 4, 2"
                ],
                correctAnswer: 0,
                explanation: "Сначала синхронно выполняются `console.log(1)` и `console.log(4)`. Затем микротаски (`Promise.then` -> 3), и только после них макротаски из очереди таймеров (`setTimeout` -> 2).",
                points: 15,
                hint: "Вспомните разницу между макротасками (setTimeout) и микротасками (Promises)."
            },
            {
                id: "js-q3",
                type: "multiple",
                text: "Какие из следующих выражений в JavaScript вычисляются как `true`? (Выберите ВСЕ верные)",
                options: [
                    "[] == false",
                    "null == undefined",
                    "NaN === NaN",
                    "Boolean('false') === true"
                ],
                correctAnswer: [0, 1, 3],
                explanation: "1) `[] == false` приводит массив к примитиву `\"\"`, а `\"\" == 0 == false` -> true. 2) `null == undefined` специфицировано как true. 3) `NaN` никогда не равен даже самому себе (`NaN === NaN` -> false). 4) Непустая строка `'false'` преобразуется в `true`.",
                points: 20,
                hint: "Помните ли вы особенности нестрогого равенства и уникальное свойство NaN?"
            },
            {
                id: "js-q4",
                type: "single",
                text: "Что вернет вызов функции `fn`?\n\n```javascript\nconst a = [1, 2, 3];\nconst b = a;\nb.push(4);\nconsole.log(a.length);\n```",
                options: [
                    "3",
                    "4",
                    "undefined",
                    "TypeError"
                ],
                correctAnswer: 1,
                explanation: "Массивы в JavaScript передаются по ссылке. `b` и `a` ссылаются на один и тот же участок памяти, поэтому мутация `b` меняет и `a`.",
                points: 10
            },
            {
                id: "js-q5",
                type: "boolean",
                text: "Правда или ложь:\nСтрелочные функции `() => {}` имеют собственный контекст `this` и объект `arguments`.",
                options: ["Правда", "Ложь"],
                correctAnswer: 1,
                explanation: "Ложь. Стрелочные функции лексически захватывают `this` и `arguments` из окружающего контекста в момент создания.",
                points: 10
            },
            {
                id: "js-q6",
                type: "text",
                text: "Какое ключевое слово в JavaScript используется для объявления переменной с блочной областью видимости, значение которой нельзя переназначить через знак `=`?",
                placeholder: "Введите ключевое слово (например: let)",
                correctAnswer: "const",
                explanation: "Ключевое слово `const` создает константу с блочной областью видимости. Её нельзя переприсвоить, хотя свойства объекта внутри неё изменять можно.",
                points: 15
            },
            {
                id: "js-q7",
                type: "single",
                text: "Что делает метод `Array.prototype.reduce`?",
                options: [
                    "Уменьшает размер массива, удаляя дубликаты",
                    "Последовательно обрабатывает элементы массива, накапливая единое результирующее значение",
                    "Фильтрует элементы массива по предикату",
                    "Переворачивает массив в обратном порядке"
                ],
                correctAnswer: 1,
                explanation: "`reduce` сворачивает массив в одно итоговое значение (число, объект, строку или новый массив) с помощью функции-аккумулятора.",
                points: 10
            },
            {
                id: "js-q8",
                type: "single",
                text: "Что будет результатом `0.1 + 0.2 === 0.3` в стандартном JavaScript?",
                options: [
                    "true",
                    "false",
                    "NaN",
                    "SyntaxError"
                ],
                correctAnswer: 1,
                explanation: "Из-за особенностей представления чисел с плавающей точкой в стандарте IEEE 754, `0.1 + 0.2` равно `0.30000000000000004`, поэтому строгое равенство возвращает `false`.",
                points: 15
            }
        ]
    },
    {
        id: "quiz-python-core",
        title: "Python: От основ до продвинутых трюков",
        description: "Проверьте свое знание Python: структуры данных, генераторы, декораторы, list comprehensions и фичи языка.",
        category: "it",
        categoryName: "IT и Разработка",
        difficulty: "medium",
        difficultyName: "Средний",
        icon: "fa-brands fa-python",
        color: "from-blue-600 to-indigo-700",
        badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        timeLimitMinutes: 8,
        author: "Python Guild",
        featured: true,
        tags: ["Python", "Backend", "Data Structures"],
        questions: [
            {
                id: "py-q1",
                type: "single",
                text: "Что вернет следующий код?\n\n```python\na = [1, 2, 3]\nb = a[:]\nprint(a is b, a == b)\n```",
                options: [
                    "True True",
                    "False True",
                    "True False",
                    "False False"
                ],
                correctAnswer: 1,
                explanation: "Срез `a[:]` создает поверхностную копию списка, поэтому объекты в памяти разные (`is` проверяет идентичность ссылок -> False), но их значения одинаковы (`==` проверяет эквивалентность -> True).",
                points: 10
            },
            {
                id: "py-q2",
                type: "single",
                text: "Какой тип данных является НЕИЗМЕНЯЕМЫМ (immutable) в Python?",
                options: [
                    "list",
                    "dict",
                    "set",
                    "tuple"
                ],
                correctAnswer: 3,
                explanation: "Кортеж (`tuple`), а также `int`, `float`, `str`, `frozenset` и `bytes` являются неизменяемыми типами данных в Python.",
                points: 10
            },
            {
                id: "py-q3",
                type: "multiple",
                text: "Какие методы или операторы используются для объединения двух словарей в Python 3.9+? (Выберите ВСЕ верные)",
                options: [
                    "dict1 | dict2",
                    "{**dict1, **dict2}",
                    "dict1.update(dict2)",
                    "dict1 + dict2"
                ],
                correctAnswer: [0, 1, 2],
                explanation: "Оператор `|` (merge) добавлен в Python 3.9. Распаковка `{**d1, **d2}` и метод `.update()` существовали ранее. Оператор сложения `+` для словарей не поддерживается.",
                points: 15
            },
            {
                id: "py-q4",
                type: "text",
                text: "Какое ключевое слово превращает обычную функцию в генератор, возвращающий значения по одному?",
                placeholder: "Введите ключевое слово (например: return)",
                correctAnswer: "yield",
                explanation: "`yield` приостанавливает выполнение функции и возвращает значение вызывающей стороне, сохраняя состояние выполнения генератора.",
                points: 15
            },
            {
                id: "py-q5",
                type: "single",
                text: "Что выведет данный генератор списка?\n\n```python\nprint([x for x in range(5) if x % 2 == 0])\n```",
                options: [
                    "[0, 2, 4]",
                    "[2, 4]",
                    "[1, 3]",
                    "[0, 1, 2, 3, 4]"
                ],
                correctAnswer: 0,
                explanation: "`range(5)` генерирует числа 0, 1, 2, 3, 4. Условие `x % 2 == 0` истинно для четных чисел 0, 2 и 4.",
                points: 10
            },
            {
                id: "py-q6",
                type: "boolean",
                text: "Правда или ложь:\nИспользование изменяемого объекта (например, пустого списка `def func(x=[])`) в качестве значения по умолчанию аргумента функции является рекомендуемой практикой в Python.",
                options: ["Правда", "Ложь"],
                correctAnswer: 1,
                explanation: "Ложь! Это классическая ловушка в Python. Значение по умолчанию вычисляется один раз при определении функции, поэтому список будет накапливать значения между всеми последующими вызовами.",
                points: 15
            }
        ]
    },
    {
        id: "quiz-logic-riddles",
        title: "Логика, головоломки и нестандартное мышление",
        description: "Тест на сообразительность, дедукцию и умение находить неочевидные решения в запутанных задачах.",
        category: "logic",
        categoryName: "Логика и Мышление",
        difficulty: "hard",
        difficultyName: "Сложный",
        icon: "fa-solid fa-brain",
        color: "from-purple-600 to-pink-600",
        badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
        timeLimitMinutes: 12,
        author: "Mind Club",
        featured: true,
        tags: ["Логика", "IQ", "Головоломки", "Мышление"],
        questions: [
            {
                id: "log-q1",
                type: "single",
                text: "Бита и мяч вместе стоят 1 доллар и 10 центов. Бита стоит на 1 доллар дороже, чем мяч. Сколько стоит мяч?",
                options: [
                    "10 центов",
                    "5 центов",
                    "1 цент",
                    "15 центов"
                ],
                correctAnswer: 1,
                explanation: "Пусть мяч = x, тогда бита = x + 1.00$. Всего x + (x + 1.00) = 1.10. Отсюда 2x = 0.10, значит x = 0.05$ (5 центов), а бита стоит 1.05$.",
                points: 15,
                hint: "Интуитивный ответ (10 центов) неверен, составьте простое уравнение."
            },
            {
                id: "log-q2",
                type: "single",
                text: "5 машин за 5 минут изготавливают 5 деталей. За сколько минут 100 машин изготовят 100 деталей?",
                options: [
                    "100 минут",
                    "5 минут",
                    "1 минуту",
                    "20 минут"
                ],
                correctAnswer: 1,
                explanation: "Если 5 машин делают 5 деталей за 5 минут, значит 1 машина делает 1 деталь за те же 5 минут. Соответственно, 100 машин сделают 100 деталей за те же 5 минут.",
                points: 15
            },
            {
                id: "log-q3",
                type: "single",
                text: "Врач прописал пациенту 3 таблетки и велел принимать по одной каждые полчаса. На сколько времени хватит этих таблеток?",
                options: [
                    "На 1.5 часа",
                    "На 1 час",
                    "На 2 часа",
                    "На 30 минут"
                ],
                correctAnswer: 1,
                explanation: "Первую таблетку пациент принимает сразу (0 мин), вторую — через 30 минут, третью — через 60 минут (1 час). Итого 1 час.",
                points: 10
            },
            {
                id: "log-q4",
                type: "text",
                text: "У фермера было 17 овец. Все, кроме девяти, сбежали. Сколько овец осталось у фермера?",
                placeholder: "Введите число",
                correctAnswer: "9",
                explanation: "Сказано: «все, кроме девяти, сбежали». Значит, ровно 9 овец и осталось!",
                points: 10
            },
            {
                id: "log-q5",
                type: "boolean",
                text: "Правда или ложь:\nНекоторые месяцы имеют 30 дней, а некоторые 31 день. Верно ли, что в каждом году есть ровно 12 месяцев, имеющих как минимум 28 дней?",
                options: ["Правда", "Ложь"],
                correctAnswer: 0,
                explanation: "Правда! Во всех 12 месяцах года есть как минимум 28 дней (включая февраль).",
                points: 10
            },
            {
                id: "log-q6",
                type: "single",
                text: "Вы участвуете в марафоне и обгоняете бегуна, бегущего на втором месте. Какую позицию вы теперь занимаете?",
                options: [
                    "Первую",
                    "Вторую",
                    "Третью",
                    "Зависит от дистанции"
                ],
                correctAnswer: 1,
                explanation: "Обогнав второго, вы заняли его вторую позицию. Лидер (первый) по-прежнему впереди вас!",
                points: 10
            }
        ]
    },
    {
        id: "quiz-english-b2",
        title: "English Grammar & Vocabulary (B1/B2)",
        description: "Test your command of English tenses, prepositions, phrasal verbs, idioms and tricky grammar structures.",
        category: "languages",
        categoryName: "Языки",
        difficulty: "easy",
        difficultyName: "Базовый / Средний",
        icon: "fa-solid fa-language",
        color: "from-emerald-600 to-teal-700",
        badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        timeLimitMinutes: 10,
        author: "Oxford Club",
        featured: true,
        tags: ["English", "Grammar", "Vocabulary", "B2"],
        questions: [
            {
                id: "en-q1",
                type: "single",
                text: "Choose the correct form:\n\n\"If I _____ you, I would take that opportunity immediately.\"",
                options: [
                    "was",
                    "were",
                    "am",
                    "would be"
                ],
                correctAnswer: 1,
                explanation: "In formal and standard English Conditional Type 2, the subjunctive 'were' is used with all persons ('If I were you').",
                points: 10
            },
            {
                id: "en-q2",
                type: "single",
                text: "Choose the sentence with the correct tense:\n\n\"By the time the train arrives, we _____ for two hours.\"",
                options: [
                    "will have been waiting",
                    "will wait",
                    "are waiting",
                    "waited"
                ],
                correctAnswer: 0,
                explanation: "Future Perfect Continuous ('will have been waiting') is used to emphasize the duration of an activity up to a specific point in the future.",
                points: 15
            },
            {
                id: "en-q3",
                type: "single",
                text: "What does the idiom \"to bite the bullet\" mean?",
                options: [
                    "To eat something spicy",
                    "To face a difficult or unpleasant situation with courage",
                    "To shoot accurately",
                    "To make an unforgivable mistake"
                ],
                correctAnswer: 1,
                explanation: "'To bite the bullet' means to force yourself to do something unpleasant or painful, or to be brave in a tough moment.",
                points: 10
            },
            {
                id: "en-q4",
                type: "single",
                text: "Fill in the blank with the correct preposition:\n\n\"She has been interested _____ astrophysics since childhood.\"",
                options: [
                    "on",
                    "in",
                    "about",
                    "for"
                ],
                correctAnswer: 1,
                explanation: "The adjective 'interested' is always paired with the preposition 'in' ('interested in something').",
                points: 10
            },
            {
                id: "en-q5",
                type: "text",
                text: "Complete the sentence with one word:\n\n\"Neither Sarah _____ her brother was able to attend the conference.\"",
                placeholder: "Type one word",
                correctAnswer: "nor",
                explanation: "The correlative conjunction pair is 'neither ... nor' (in contrast to 'either ... or').",
                points: 15
            },
            {
                id: "en-q6",
                type: "multiple",
                text: "Which of the following adjectives can be followed by the preposition 'of'? (Select all that apply)",
                options: [
                    "Afraid",
                    "Proud",
                    "Fond",
                    "Satisfied"
                ],
                correctAnswer: [0, 1, 2],
                explanation: "We say: 'afraid of', 'proud of', 'fond of'. But we say 'satisfied with'.",
                points: 15
            }
        ]
    },
    {
        id: "quiz-science-erudition",
        title: "Эрудиция: Великие открытия и Космос",
        description: "Увлекательный тест на общую эрудицию: фундаментальные законы природы, космос, история цивилизации и технологии.",
        category: "erudition",
        categoryName: "Эрудиция и Наука",
        difficulty: "medium",
        difficultyName: "Средний",
        icon: "fa-solid fa-atom",
        color: "from-cyan-500 to-blue-600",
        badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
        timeLimitMinutes: 8,
        author: "Science Daily",
        featured: false,
        tags: ["Наука", "Космос", "История", "Физика"],
        questions: [
            {
                id: "sci-q1",
                type: "single",
                text: "Какая планета Солнечной системы является самой горячей?",
                options: [
                    "Меркурий (ближайшая к Солнцу)",
                    "Венера",
                    "Марс",
                    "Юпитер"
                ],
                correctAnswer: 1,
                explanation: "Хотя Меркурий ближе к Солнцу, самой горячей планетой является Венера из-за мощного парникового эффекта плотной атмосферы из углекислого газа (~465°C).",
                points: 10
            },
            {
                id: "sci-q2",
                type: "single",
                text: "Кто сформулировал закон всемирного тяготения и три закона классической механики?",
                options: [
                    "Альберт Эйнштейн",
                    "Исаак Ньютон",
                    "Галилео Галилей",
                    "Никола Тесла"
                ],
                correctAnswer: 1,
                explanation: "Исаак Ньютон опубликовал фундаментальный труд «Математические начала натуральной философии» в 1687 году.",
                points: 10
            },
            {
                id: "sci-q3",
                type: "single",
                text: "Какая скорость света в вакууме (приблизительно)?",
                options: [
                    "300 000 км/с",
                    "150 000 км/с",
                    "30 000 км/с",
                    "3 000 000 км/с"
                ],
                correctAnswer: 0,
                explanation: "Скорость света в вакууме составляет ровно 299 792 458 м/с, то есть около 300 000 км/с.",
                points: 10
            },
            {
                id: "sci-q4",
                type: "multiple",
                text: "Какие химические элементы при нормальных условиях являются благородными (инертными) газами? (Выберите ВСЕ верные)",
                options: [
                    "Гелий (He)",
                    "Неон (Ne)",
                    "Аргон (Ar)",
                    "Азот (N)"
                ],
                correctAnswer: [0, 1, 2],
                explanation: "Гелий, Неон, Аргон, Криптон, Ксенон и Радон — благородные газы 18 группы. Азот — двухатомный неметалл 15 группы.",
                points: 15
            },
            {
                id: "sci-q5",
                type: "boolean",
                text: "Правда или ложь:\nДНК человека и шимпанзе совпадает более чем на 98%.",
                options: ["Правда", "Ложь"],
                correctAnswer: 0,
                explanation: "Правда. Генетические исследования показывают совпадение геномов человека и шимпанзе примерно на 98.6-99%.",
                points: 10
            }
        ]
    },
    {
        id: "quiz-soft-skills",
        title: "Soft Skills: Эмоциональный интеллект и Лидерство",
        description: "Оцените свои навыки разрешения конфликтов, критической обратной связи и командной коммуникации на реальных кейсах.",
        category: "business",
        categoryName: "Бизнес и Soft Skills",
        difficulty: "easy",
        difficultyName: "Базовый",
        icon: "fa-solid fa-users",
        color: "from-rose-500 to-red-600",
        badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
        timeLimitMinutes: 7,
        author: "Leadership Lab",
        featured: false,
        tags: ["Лидерство", "Коммуникации", "Карьера", "Soft Skills"],
        questions: [
            {
                id: "soft-q1",
                type: "single",
                text: "Кейс: Коллега постоянно срывает дедлайны по совместному проекту. Какая реакция наиболее конструктивна?",
                options: [
                    "Пожаловаться сразу вышестоящему руководству без предупреждения",
                    "Провести встречу 1-на-1: обозначить влияние задержек на общий результат с помощью «Я-сообщений» и спросить, с какими препятствиями он сталкивается",
                    "Молча сделать всю его работу самому, чтобы не портить отношения",
                    "Публично пристыдить на общем командном созвоне"
                ],
                correctAnswer: 1,
                explanation: "Конструктивная обратная связь строится на фактах, фокусе на процессах и взаимном поиске решения без перехода на личности.",
                points: 15
            },
            {
                id: "soft-q2",
                type: "single",
                text: "Что означает техника «активного слушания»?",
                options: [
                    "Быстрое прерывание собеседника, чтобы высказать свой совет",
                    "Концентрация на собеседнике, перефразирование его мыслей («Правильно ли я понимаю...») и уточняющие вопросы",
                    "Простое молчание и кивание головой без вникания в детали",
                    "Запись каждого слова в блокнот без зрительного контакта"
                ],
                correctAnswer: 1,
                explanation: "Активное слушание подтверждает понимание, снижает уровень стресса и помогает выявить истинные потребности собеседника.",
                points: 10
            },
            {
                id: "soft-q3",
                type: "boolean",
                text: "Правда или ложь:\nЭффективная конструктивная критика должна быть направлена на личностные черты человека, а не на конкретные действия или результат.",
                options: ["Правда", "Ложь"],
                correctAnswer: 1,
                explanation: "Ложь! Критика качеств личности («ты безответственный») вызывает защиту и отторжение. Критиковать следует факты и поведение («в отчете за среду были неточные цифры»).",
                points: 10
            },
            {
                id: "soft-q4",
                type: "single",
                text: "Что такое принцип «Win-Win» в переговорах?",
                options: [
                    "Стратегия, при которой побеждает сильнейший",
                    "Поиск взаимовыгодного решения, удовлетворяющего ключевые интересы обеих сторон",
                    "Компромисс, где обе стороны остались одинаково недовольны",
                    "Быстрая уступка оппоненту во избежание ссоры"
                ],
                correctAnswer: 1,
                explanation: "Гарвардская модель переговоров Win-Win ориентирована на взаимную ценность и долгосрочное партнерство.",
                points: 10
            }
        ]
    }
];

window.CATEGORIES = [
    { id: "all", name: "Все категории", icon: "fa-solid fa-shapes", count: 0 },
    { id: "it", name: "IT и Разработка", icon: "fa-solid fa-code", count: 0 },
    { id: "logic", name: "Логика и Мышление", icon: "fa-solid fa-brain", count: 0 },
    { id: "languages", name: "Иностранные языки", icon: "fa-solid fa-language", count: 0 },
    { id: "erudition", name: "Эрудиция и Наука", icon: "fa-solid fa-atom", count: 0 },
    { id: "business", name: "Бизнес и Soft Skills", icon: "fa-solid fa-briefcase", count: 0 },
    { id: "custom", name: "Созданные мной", icon: "fa-solid fa-wand-magic-sparkles", count: 0 }
];

window.ACHIEVEMENTS_LIST = [
    {
        id: "first_blood",
        title: "Первый шаг",
        desc: "Пройти любой тест платформы",
        icon: "fa-solid fa-seedling",
        color: "from-emerald-400 to-green-600"
    },
    {
        id: "perfect_score",
        title: "Снайпер (100%)",
        desc: "Завершить любой тест без единой ошибки",
        icon: "fa-solid fa-crosshair",
        color: "from-amber-400 to-yellow-600"
    },
    {
        id: "polymath",
        title: "Эрудит",
        desc: "Пройти не менее 4 разных тестов",
        icon: "fa-solid fa-graduation-cap",
        color: "from-indigo-400 to-purple-600"
    },
    {
        id: "speedster",
        title: "Спидраннер",
        desc: "Пройти тест менее чем за 90 секунд с результатом от 80%",
        icon: "fa-solid fa-bolt",
        color: "from-orange-400 to-amber-600"
    },
    {
        id: "creator",
        title: "Архитектор знаний",
        desc: "Создать собственный тест в конструкторе",
        icon: "fa-solid fa-cube",
        color: "from-fuchsia-400 to-pink-600"
    },
    {
        id: "xp_master",
        title: "Магистр XP",
        desc: "Набрать суммарно 250+ очков опыта",
        icon: "fa-solid fa-crown",
        color: "from-yellow-400 to-amber-600"
    }
];
