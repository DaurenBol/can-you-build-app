// Main Application Controller
class QuizApp {
    constructor() {
        this.currentView = 'catalog';
        this.activeCategory = 'all';
        this.searchQuery = '';
        this.difficultyFilter = 'all';
        this.currentQuiz = null;
        this.quizState = null;
        this.timerInterval = null;
        this.isZenMode = false;
        this.isTrainingMode = false; // immediate feedback
        this.lastCompletedResult = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateProfileWidget();
        this.renderCatalog();
        this.renderAchievementsGrid();
        this.updateAudioButtonState();
        this.updateThemeState();
    }

    bindEvents() {
        // Navigation links
        document.querySelectorAll('[data-view-nav]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const view = el.getAttribute('data-view-nav');
                this.navigate(view);
                if (window.soundManager) window.soundManager.playClick();
            });
        });

        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.renderCatalog();
            });
        }

        // Sound toggle button
        const soundBtn = document.getElementById('btn-sound-toggle');
        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const enabled = window.soundManager.toggle();
                this.updateAudioButtonState();
                this.showToast(enabled ? "Звуковые эффекты включены" : "Звуковые эффекты выключены", "info");
            });
        }

        // Theme toggle button
        const themeBtn = document.getElementById('btn-theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Keyboard navigation for quiz options
        window.addEventListener('keydown', (e) => {
            if (this.currentView !== 'runner' || !this.quizState) return;
            const key = e.key;
            if (['1', '2', '3', '4'].includes(key)) {
                const optIndex = parseInt(key) - 1;
                const optButtons = document.querySelectorAll('.option-btn');
                if (optButtons[optIndex]) {
                    optButtons[optIndex].click();
                }
            } else if (key === 'Enter') {
                const nextBtn = document.getElementById('btn-next-question');
                if (nextBtn && !nextBtn.disabled) {
                    nextBtn.click();
                }
            }
        });
    }

    updateThemeState() {
        const theme = localStorage.getItem('theme_mode') || 'dark';
        if (theme === 'light') {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light-mode');
        }
    }

    toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light-mode');
            localStorage.setItem('theme_mode', 'light');
            this.showToast("Светлая тема активирована", "info");
        } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light-mode');
            localStorage.setItem('theme_mode', 'dark');
            this.showToast("Темная тема активирована", "info");
        }
        if (window.soundManager) window.soundManager.playClick();
    }

    updateAudioButtonState() {
        const btn = document.getElementById('btn-sound-toggle');
        if (!btn) return;
        const enabled = window.soundManager.isEnabled();
        btn.innerHTML = enabled 
            ? `<i class="fa-solid fa-volume-high text-indigo-400"></i>` 
            : `<i class="fa-solid fa-volume-xmark text-slate-500"></i>`;
    }

    navigate(view) {
        if (this.currentView === 'runner' && view !== 'runner') {
            if (!confirm("Вы действительно хотите прервать прохождение теста? Текущий прогресс будет потерян.")) {
                return;
            }
            this.stopTimer();
        }

        this.currentView = view;

        // Hide all views
        document.querySelectorAll('.view-section').forEach(sec => sec.classList.add('hidden'));

        // Highlight active nav buttons
        document.querySelectorAll('[data-view-nav]').forEach(el => {
            const v = el.getAttribute('data-view-nav');
            if (v === view) {
                el.classList.add('text-indigo-400', 'border-indigo-500', 'bg-indigo-500/10');
                el.classList.remove('text-slate-400');
            } else {
                el.classList.remove('text-indigo-400', 'border-indigo-500', 'bg-indigo-500/10');
                el.classList.add('text-slate-400');
            }
        });

        // Show target view
        const target = document.getElementById(`view-${view}`);
        if (target) {
            target.classList.remove('hidden');
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (view === 'catalog') {
            this.renderCatalog();
        } else if (view === 'profile') {
            this.renderProfile();
        } else if (view === 'builder') {
            this.resetBuilderForm();
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        const bgColors = {
            success: 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200',
            error: 'bg-rose-950/90 border-rose-500/50 text-rose-200',
            info: 'bg-slate-900/95 border-indigo-500/40 text-slate-200'
        };
        const icons = {
            success: 'fa-check-circle text-emerald-400',
            error: 'fa-circle-exclamation text-rose-400',
            info: 'fa-circle-info text-indigo-400'
        };

        toast.className = `toast-msg flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md text-sm ${bgColors[type] || bgColors.info}`;
        toast.innerHTML = `
            <i class="fa-solid ${icons[type] || icons.info} text-base"></i>
            <span class="font-medium">${message}</span>
        `;

        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    updateProfileWidget() {
        const prof = window.storageManager.getProfile();
        const avatarEl = document.getElementById('user-avatar-badge');
        const nameEl = document.getElementById('user-name-badge');
        const levelEl = document.getElementById('user-level-badge');
        const xpEl = document.getElementById('user-xp-badge');

        if (avatarEl) avatarEl.textContent = prof.avatar;
        if (nameEl) nameEl.textContent = prof.name;
        if (levelEl) levelEl.textContent = `Ур. ${prof.level}`;
        if (xpEl) xpEl.textContent = `${prof.xp} XP`;
    }

    // ==========================================
    // CATALOG & FILTERING
    // ==========================================
    renderCategories() {
        const catContainer = document.getElementById('categories-bar');
        if (!catContainer) return;

        const allQuizzes = window.storageManager.getAllQuizzes();
        const counts = { all: allQuizzes.length };
        allQuizzes.forEach(q => {
            counts[q.category] = (counts[q.category] || 0) + 1;
        });

        catContainer.innerHTML = window.CATEGORIES.map(cat => {
            const count = cat.id === 'all' ? allQuizzes.length : (counts[cat.id] || 0);
            const active = this.activeCategory === cat.id;
            return `
                <button onclick="app.setCategory('${cat.id}')" 
                    class="whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center gap-2 border ${
                        active 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-600/30' 
                        : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-white/5'
                    }">
                    <i class="${cat.icon} ${active ? 'text-white' : 'text-indigo-400'}"></i>
                    <span>${cat.name}</span>
                    <span class="px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'}">${count}</span>
                </button>
            `;
        }).join('');
    }

    setCategory(catId) {
        this.activeCategory = catId;
        if (window.soundManager) window.soundManager.playClick();
        this.renderCatalog();
    }

    setDifficultyFilter(diff) {
        this.difficultyFilter = diff;
        this.renderCatalog();
    }

    renderCatalog() {
        this.renderCategories();
        this.updateProfileWidget();

        const grid = document.getElementById('quizzes-grid');
        const emptyState = document.getElementById('empty-catalog');
        if (!grid) return;

        let quizzes = window.storageManager.getAllQuizzes();

        // Filter category
        if (this.activeCategory !== 'all') {
            if (this.activeCategory === 'custom') {
                quizzes = quizzes.filter(q => q.isCustom);
            } else {
                quizzes = quizzes.filter(q => q.category === this.activeCategory);
            }
        }

        // Filter difficulty
        if (this.difficultyFilter !== 'all') {
            quizzes = quizzes.filter(q => q.difficulty === this.difficultyFilter);
        }

        // Filter search query
        if (this.searchQuery) {
            quizzes = quizzes.filter(q => 
                q.title.toLowerCase().includes(this.searchQuery) ||
                q.description.toLowerCase().includes(this.searchQuery) ||
                (q.tags && q.tags.some(t => t.toLowerCase().includes(this.searchQuery)))
            );
        }

        if (quizzes.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        grid.innerHTML = quizzes.map(quiz => {
            const isBookmarked = window.storageManager.isBookmarked(quiz.id);
            const questionCount = quiz.questions ? quiz.questions.length : 0;
            const timeEstimate = quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} мин` : 'Без лимита';

            const difficultyBadges = {
                easy: '<span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Базовый</span>',
                medium: '<span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">Средний</span>',
                hard: '<span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">Сложный</span>'
            };

            return `
                <div class="glass-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden group">
                    <div class="absolute -right-12 -top-12 w-32 h-32 rounded-full bg-gradient-to-br ${quiz.color || 'from-indigo-600 to-purple-600'} opacity-15 blur-2xl group-hover:opacity-30 transition-all duration-500"></div>

                    <div>
                        <!-- Header -->
                        <div class="flex items-start justify-between gap-3 mb-4">
                            <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${quiz.color || 'from-indigo-600 to-purple-600'} flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/20">
                                <i class="${quiz.icon || 'fa-solid fa-graduation-cap'}"></i>
                            </div>
                            <div class="flex items-center gap-1.5">
                                ${difficultyBadges[quiz.difficulty] || difficultyBadges.medium}
                                <button onclick="app.toggleBookmark('${quiz.id}')" title="В закладки" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-400 flex items-center justify-center transition-colors">
                                    <i class="${isBookmarked ? 'fa-solid fa-bookmark text-amber-400' : 'fa-regular fa-bookmark'} text-xs"></i>
                                </button>
                                ${quiz.isCustom ? `
                                    <button onclick="app.deleteCustomQuiz('${quiz.id}')" title="Удалить тест" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors">
                                        <i class="fa-solid fa-trash text-xs"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>

                        <!-- Title & Description -->
                        <h3 class="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors mb-2 line-clamp-1">${quiz.title}</h3>
                        <p class="text-slate-400 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">${quiz.description}</p>

                        <!-- Meta chips -->
                        <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-5">
                            <span class="flex items-center gap-1.5"><i class="fa-solid fa-list-check text-indigo-400"></i> ${questionCount} вопр.</span>
                            <span class="flex items-center gap-1.5"><i class="fa-solid fa-clock text-indigo-400"></i> ${timeEstimate}</span>
                            <span class="flex items-center gap-1.5"><i class="fa-solid fa-user-pen text-indigo-400"></i> ${quiz.author || 'Автор'}</span>
                        </div>
                    </div>

                    <!-- Actions -->
                    <div class="pt-4 border-t border-white/5 flex items-center gap-2">
                        <button onclick="app.startQuiz('${quiz.id}')" class="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                            <i class="fa-solid fa-play text-xs"></i>
                            <span>Начать тест</span>
                        </button>
                        <button onclick="app.exportQuizData('${quiz.id}')" title="Экспорт JSON" class="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors">
                            <i class="fa-solid fa-share-nodes text-xs"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    toggleBookmark(id) {
        const added = window.storageManager.toggleBookmark(id);
        if (window.soundManager) window.soundManager.playClick();
        this.showToast(added ? "Тест сохранен в избранное" : "Удалено из избранного", "info");
        this.renderCatalog();
    }

    exportQuizData(id) {
        const json = window.storageManager.exportQuiz(id);
        if (!json) return;
        navigator.clipboard.writeText(json).then(() => {
            this.showToast("JSON конфигурация теста скопирована в буфер!", "success");
        }).catch(() => {
            prompt("Скопируйте конфигурацию теста:", json);
        });
    }

    deleteCustomQuiz(id) {
        if (confirm("Вы уверены, что хотите удалить этот созданный тест?")) {
            window.storageManager.deleteCustomQuiz(id);
            this.showToast("Тест удален", "info");
            this.renderCatalog();
        }
    }

    // ==========================================
    // QUIZ RUNNER
    // ==========================================
    startQuiz(quizId, trainingMode = false) {
        const quiz = window.storageManager.getQuizById(quizId);
        if (!quiz) {
            this.showToast("Тест не найден", "error");
            return;
        }

        this.currentQuiz = quiz;
        this.isTrainingMode = trainingMode;
        this.isZenMode = false;

        // Initialize state
        this.quizState = {
            quizId: quiz.id,
            currentIndex: 0,
            answers: {}, // questionId -> answer
            flagged: new Set(),
            startTime: Date.now(),
            totalSecondsAllocated: (quiz.timeLimitMinutes || 10) * 60,
            secondsRemaining: (quiz.timeLimitMinutes || 10) * 60,
            completed: false
        };

        if (window.soundManager) window.soundManager.playClick();
        this.navigate('runner');
        this.setupQuizHeader();
        this.renderQuestionPills();
        this.renderCurrentQuestion();
        this.startTimer();
    }

    startMistakesOnlyQuiz() {
        if (!this.lastCompletedResult || !this.currentQuiz) return;
        const wrongQuestionIds = this.lastCompletedResult.answersDetail
            .filter(a => !a.isCorrect)
            .map(a => a.questionId);

        if (wrongQuestionIds.length === 0) {
            this.showToast("Ошибок не было! Отличный результат!", "success");
            return;
        }

        const filteredQuestions = this.currentQuiz.questions.filter(q => wrongQuestionIds.includes(q.id));
        const tempQuiz = {
            ...this.currentQuiz,
            id: this.currentQuiz.id + '-mistakes',
            title: `Работа над ошибками: ${this.currentQuiz.title}`,
            questions: filteredQuestions,
            timeLimitMinutes: Math.max(3, Math.round(filteredQuestions.length * 1.5))
        };

        // Temporarily register for runner
        this.currentQuiz = tempQuiz;
        this.isTrainingMode = true; // great for learning!
        this.quizState = {
            quizId: tempQuiz.id,
            currentIndex: 0,
            answers: {},
            flagged: new Set(),
            startTime: Date.now(),
            totalSecondsAllocated: tempQuiz.timeLimitMinutes * 60,
            secondsRemaining: tempQuiz.timeLimitMinutes * 60,
            completed: false
        };

        this.navigate('runner');
        this.setupQuizHeader();
        this.renderQuestionPills();
        this.renderCurrentQuestion();
        this.startTimer();
        this.showToast("Режим работы над ошибками запущен!", "info");
    }

    setupQuizHeader() {
        const titleEl = document.getElementById('runner-quiz-title');
        const countEl = document.getElementById('runner-total-count');
        if (titleEl) titleEl.textContent = this.currentQuiz.title;
        if (countEl) countEl.textContent = this.currentQuiz.questions.length;

        const trainingToggle = document.getElementById('btn-mode-training');
        if (trainingToggle) {
            trainingToggle.checked = this.isTrainingMode;
            trainingToggle.onchange = (e) => {
                this.isTrainingMode = e.target.checked;
                this.renderCurrentQuestion();
                this.showToast(this.isTrainingMode ? "Режим обучения: ответы проверяются сразу" : "Режим экзамена: результаты в конце", "info");
            };
        }
    }

    startTimer() {
        this.stopTimer();
        const timerEl = document.getElementById('runner-timer');
        if (!timerEl) return;

        const updateDisplay = () => {
            if (this.isZenMode) {
                timerEl.textContent = "Дзен режим";
                timerEl.classList.remove('timer-warning');
                return;
            }

            const mins = Math.floor(this.quizState.secondsRemaining / 60);
            const secs = this.quizState.secondsRemaining % 60;
            timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

            if (this.quizState.secondsRemaining <= 60) {
                timerEl.classList.add('timer-warning');
                if (this.quizState.secondsRemaining === 30 || this.quizState.secondsRemaining === 10) {
                    if (window.soundManager) window.soundManager.playTimerBeep();
                }
            } else {
                timerEl.classList.remove('timer-warning');
            }

            if (this.quizState.secondsRemaining <= 0) {
                this.stopTimer();
                this.showToast("Время вышло! Завершаем тест...", "error");
                this.finishQuiz(true);
            } else {
                this.quizState.secondsRemaining--;
            }
        };

        updateDisplay();
        this.timerInterval = setInterval(updateDisplay, 1000);
    }

    toggleZenMode() {
        this.isZenMode = !this.isZenMode;
        if (window.soundManager) window.soundManager.playClick();
        this.showToast(this.isZenMode ? "Дзен режим: таймер скрыт" : "Таймер снова активен", "info");
        const btn = document.getElementById('btn-zen-mode');
        if (btn) {
            btn.classList.toggle('text-amber-400', this.isZenMode);
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    renderQuestionPills() {
        const container = document.getElementById('question-pills-bar');
        if (!container || !this.currentQuiz) return;

        const total = this.currentQuiz.questions.length;
        container.innerHTML = this.currentQuiz.questions.map((q, idx) => {
            const isCurrent = idx === this.quizState.currentIndex;
            const hasAnswer = this.quizState.answers[q.id] !== undefined;
            const isFlagged = this.quizState.flagged.has(q.id);

            let bgClass = "bg-slate-800 text-slate-300 border-white/5 hover:border-slate-600";
            if (isCurrent) {
                bgClass = "bg-indigo-600 text-white font-bold ring-2 ring-indigo-400 border-transparent";
            } else if (isFlagged) {
                bgClass = "bg-amber-500/20 text-amber-400 border-amber-500/40";
            } else if (hasAnswer) {
                bgClass = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
            }

            return `
                <button onclick="app.jumpToQuestion(${idx})" class="w-8 h-8 rounded-lg text-xs flex items-center justify-center font-medium border transition-all ${bgClass} relative">
                    ${idx + 1}
                    ${isFlagged ? '<span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400"></span>' : ''}
                </button>
            `;
        }).join('');

        // Progress bar
        const progressBar = document.getElementById('runner-progress-bar');
        if (progressBar) {
            const answeredCount = Object.keys(this.quizState.answers).length;
            const pct = Math.round((answeredCount / total) * 100);
            progressBar.style.width = `${pct}%`;
        }
    }

    jumpToQuestion(index) {
        if (index < 0 || index >= this.currentQuiz.questions.length) return;
        this.quizState.currentIndex = index;
        if (window.soundManager) window.soundManager.playClick();
        this.renderQuestionPills();
        this.renderCurrentQuestion();
    }

    renderCurrentQuestion() {
        const container = document.getElementById('question-card-container');
        if (!container || !this.currentQuiz) return;

        const q = this.currentQuiz.questions[this.quizState.currentIndex];
        const isCurrentFlagged = this.quizState.flagged.has(q.id);
        const savedAnswer = this.quizState.answers[q.id];

        const typeBadges = {
            single: '<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"><i class="fa-solid fa-circle-dot mr-1.5"></i> Один ответ</span>',
            multiple: '<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30"><i class="fa-solid fa-square-check mr-1.5"></i> Несколько ответов</span>',
            boolean: '<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"><i class="fa-solid fa-scale-balanced mr-1.5"></i> Правда / Ложь</span>',
            text: '<span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"><i class="fa-solid fa-font mr-1.5"></i> Ввод ответа</span>'
        };

        // Format question text (converting markdown code blocks)
        let formattedText = this.formatMarkdownText(q.text);

        // Generate options markup
        let optionsMarkup = '';
        if (q.type === 'single' || q.type === 'boolean') {
            optionsMarkup = `
                <div class="grid grid-cols-1 gap-3">
                    ${q.options.map((opt, optIdx) => {
                        const isSelected = savedAnswer === optIdx;
                        let extraClass = '';
                        if (this.isTrainingMode && savedAnswer !== undefined) {
                            if (optIdx === q.correctAnswer) extraClass = 'correct-highlight';
                            else if (isSelected) extraClass = 'wrong-highlight';
                        }
                        return `
                            <div onclick="app.selectOption(${optIdx})" class="option-btn p-4 rounded-xl border border-white/10 bg-slate-900/60 flex items-center justify-between text-left ${isSelected ? 'selected' : ''} ${extraClass}">
                                <div class="flex items-center gap-3.5 pr-2">
                                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}">
                                        ${String.fromCharCode(65 + optIdx)}
                                    </div>
                                    <span class="text-slate-200 text-sm sm:text-base font-normal leading-relaxed">${this.escapeHtml(opt)}</span>
                                </div>
                                <div class="w-5 h-5 rounded-full border ${isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-600'} flex items-center justify-center">
                                    ${isSelected ? '<i class="fa-solid fa-check text-[10px] text-white"></i>' : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else if (q.type === 'multiple') {
            const selectedSet = new Set(Array.isArray(savedAnswer) ? savedAnswer : []);
            optionsMarkup = `
                <div class="grid grid-cols-1 gap-3">
                    ${q.options.map((opt, optIdx) => {
                        const isSelected = selectedSet.has(optIdx);
                        let extraClass = '';
                        if (this.isTrainingMode && savedAnswer !== undefined) {
                            if (q.correctAnswer.includes(optIdx)) extraClass = 'correct-highlight';
                            else if (isSelected) extraClass = 'wrong-highlight';
                        }
                        return `
                            <div onclick="app.toggleMultipleOption(${optIdx})" class="option-btn p-4 rounded-xl border border-white/10 bg-slate-900/60 flex items-center justify-between text-left ${isSelected ? 'selected' : ''} ${extraClass}">
                                <div class="flex items-center gap-3.5 pr-2">
                                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}">
                                        ${String.fromCharCode(65 + optIdx)}
                                    </div>
                                    <span class="text-slate-200 text-sm sm:text-base font-normal leading-relaxed">${this.escapeHtml(opt)}</span>
                                </div>
                                <div class="w-5 h-5 rounded-md border ${isSelected ? 'border-purple-400 bg-purple-500' : 'border-slate-600'} flex items-center justify-center">
                                    ${isSelected ? '<i class="fa-solid fa-check text-[10px] text-white"></i>' : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        } else if (q.type === 'text') {
            const textVal = savedAnswer !== undefined ? savedAnswer : '';
            let feedback = '';
            if (this.isTrainingMode && textVal) {
                const isMatch = textVal.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
                feedback = isMatch 
                    ? `<div class="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs mt-3 flex items-center gap-2"><i class="fa-solid fa-check-circle"></i> Верно!</div>`
                    : `<div class="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs mt-3 flex items-center gap-2"><i class="fa-solid fa-circle-xmark"></i> Неверно! Правильный ответ: <b>${this.escapeHtml(q.correctAnswer)}</b></div>`;
            }
            optionsMarkup = `
                <div class="space-y-3">
                    <input type="text" id="text-answer-input" value="${this.escapeHtml(textVal)}" 
                        onchange="app.saveTextAnswer(this.value)" 
                        placeholder="${this.escapeHtml(q.placeholder || 'Введите ваш ответ...')}" 
                        class="w-full px-4 py-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-base">
                    ${feedback}
                </div>
            `;
        }

        // Training mode explanation block
        let trainingExplanationMarkup = '';
        if (this.isTrainingMode && savedAnswer !== undefined && q.explanation) {
            trainingExplanationMarkup = `
                <div class="mt-5 p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs sm:text-sm">
                    <div class="font-bold flex items-center gap-2 mb-1.5 text-indigo-300">
                        <i class="fa-solid fa-lightbulb"></i> Объяснение:
                    </div>
                    <p class="leading-relaxed text-slate-300">${this.formatMarkdownText(q.explanation)}</p>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="glass-card rounded-2xl p-6 sm:p-8">
                <!-- Top Question Bar -->
                <div class="flex items-center justify-between gap-4 mb-5">
                    <div class="flex items-center gap-2.5">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Вопрос ${this.quizState.currentIndex + 1} из ${this.currentQuiz.questions.length}</span>
                        ${typeBadges[q.type] || typeBadges.single}
                    </div>
                    <div class="flex items-center gap-2">
                        ${q.hint ? `
                            <button onclick="app.showQuestionHint()" title="Подсказка" class="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs flex items-center gap-1.5 transition-colors">
                                <i class="fa-solid fa-lightbulb"></i>
                                <span class="hidden sm:inline">Подсказка</span>
                            </button>
                        ` : ''}
                        <button onclick="app.toggleFlagQuestion()" class="px-2.5 py-1.5 rounded-lg ${isCurrentFlagged ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'} text-xs flex items-center gap-1.5 transition-colors">
                            <i class="${isCurrentFlagged ? 'fa-solid fa-flag' : 'fa-regular fa-flag'}"></i>
                            <span class="hidden sm:inline">${isCurrentFlagged ? 'Помечен' : 'Пометить'}</span>
                        </button>
                    </div>
                </div>

                <!-- Question Text -->
                <div class="text-base sm:text-lg text-white font-medium mb-6 leading-relaxed">
                    ${formattedText}
                </div>

                <!-- Options -->
                ${optionsMarkup}

                <!-- Training Mode Explanation -->
                ${trainingExplanationMarkup}
            </div>
        `;

        this.updateRunnerButtons();
    }

    showQuestionHint() {
        const q = this.currentQuiz.questions[this.quizState.currentIndex];
        if (q && q.hint) {
            alert(`💡 Подсказка:\n\n${q.hint}`);
        }
    }

    toggleFlagQuestion() {
        const q = this.currentQuiz.questions[this.quizState.currentIndex];
        if (this.quizState.flagged.has(q.id)) {
            this.quizState.flagged.delete(q.id);
        } else {
            this.quizState.flagged.add(q.id);
        }
        if (window.soundManager) window.soundManager.playClick();
        this.renderQuestionPills();
        this.renderCurrentQuestion();
    }

    selectOption(optIdx) {
        const q = this.currentQuiz.questions[this.quizState.currentIndex];
        this.quizState.answers[q.id] = optIdx;

        if (window.soundManager) {
            if (this.isTrainingMode) {
                if (optIdx === q.correctAnswer) window.soundManager.playCorrect();
                else window.soundManager.playWrong();
            } else {
                window.soundManager.playSelect();
            }
        }

        this.renderQuestionPills();
        this.renderCurrentQuestion();
    }

    toggleMultipleOption(optIdx) {
        const q = this.currentQuiz.questions[this.quizState.currentIndex];
        let current = this.quizState.answers[q.id] || [];
        if (!Array.isArray(current)) current = [];

        const idx = current.indexOf(optIdx);
        if (idx >= 0) {
            current.splice(idx, 1);
        } else {
            current.push(optIdx);
        }
        current.sort();

        this.quizState.answers[q.id] = current;
        if (window.soundManager) window.soundManager.playSelect();

        this.renderQuestionPills();
        this.renderCurrentQuestion();
    }

    saveTextAnswer(val) {
        const q = this.currentQuiz.questions[this.quizState.currentIndex];
        const trimmed = val.trim();
        if (trimmed) {
            this.quizState.answers[q.id] = trimmed;
        } else {
            delete this.quizState.answers[q.id];
        }
        this.renderQuestionPills();
        this.renderCurrentQuestion();
    }

    prevQuestion() {
        if (this.quizState.currentIndex > 0) {
            this.quizState.currentIndex--;
            if (window.soundManager) window.soundManager.playClick();
            this.renderQuestionPills();
            this.renderCurrentQuestion();
        }
    }

    nextQuestion() {
        if (this.quizState.currentIndex < this.currentQuiz.questions.length - 1) {
            this.quizState.currentIndex++;
            if (window.soundManager) window.soundManager.playClick();
            this.renderQuestionPills();
            this.renderCurrentQuestion();
        } else {
            this.confirmFinishQuiz();
        }
    }

    updateRunnerButtons() {
        const prevBtn = document.getElementById('btn-prev-question');
        const nextBtn = document.getElementById('btn-next-question');
        if (!prevBtn || !nextBtn) return;

        const isFirst = this.quizState.currentIndex === 0;
        const isLast = this.quizState.currentIndex === this.currentQuiz.questions.length - 1;

        prevBtn.disabled = isFirst;
        prevBtn.classList.toggle('opacity-40', isFirst);
        prevBtn.classList.toggle('cursor-not-allowed', isFirst);

        if (isLast) {
            nextBtn.innerHTML = `<span>Завершить тест</span> <i class="fa-solid fa-flag-checkered text-xs"></i>`;
            nextBtn.classList.add('from-emerald-600', 'to-teal-600');
            nextBtn.classList.remove('from-indigo-600', 'to-indigo-700');
        } else {
            nextBtn.innerHTML = `<span>Далее</span> <i class="fa-solid fa-arrow-right text-xs"></i>`;
            nextBtn.classList.add('from-indigo-600', 'to-indigo-700');
            nextBtn.classList.remove('from-emerald-600', 'to-teal-600');
        }
    }

    confirmFinishQuiz() {
        const total = this.currentQuiz.questions.length;
        const answered = Object.keys(this.quizState.answers).length;
        const unanswered = total - answered;

        if (unanswered > 0) {
            if (confirm(`У вас осталось ${unanswered} неотвеченных вопросов. Вы уверены, что хотите завершить тест прямо сейчас?`)) {
                this.finishQuiz();
            }
        } else {
            this.finishQuiz();
        }
    }

    finishQuiz(forcedByTimeout = false) {
        this.stopTimer();
        const quiz = this.currentQuiz;
        const questions = quiz.questions;
        const answers = this.quizState.answers;
        const timeTakenSeconds = Math.max(1, Math.round((Date.now() - this.quizState.startTime) / 1000));

        let earnedScore = 0;
        let maxPossibleScore = 0;
        let correctCount = 0;

        const answersDetail = questions.map(q => {
            const pts = q.points || 10;
            maxPossibleScore += pts;
            const userAns = answers[q.id];
            let isCorrect = false;

            if (userAns !== undefined) {
                if (q.type === 'single' || q.type === 'boolean') {
                    isCorrect = userAns === q.correctAnswer;
                } else if (q.type === 'multiple') {
                    const sortedUser = Array.isArray(userAns) ? [...userAns].sort() : [];
                    const sortedCorrect = [...q.correctAnswer].sort();
                    isCorrect = JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect);
                } else if (q.type === 'text') {
                    isCorrect = String(userAns).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
                }
            }

            if (isCorrect) {
                earnedScore += pts;
                correctCount++;
            }

            return {
                questionId: q.id,
                questionText: q.text,
                type: q.type,
                options: q.options || [],
                userAnswer: userAns,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || "",
                points: pts,
                isCorrect: isCorrect
            };
        });

        const percentage = Math.round((correctCount / questions.length) * 100);

        const result = {
            quizId: quiz.id,
            quizTitle: quiz.title,
            category: quiz.category,
            categoryName: quiz.categoryName,
            score: earnedScore,
            maxPossibleScore: maxPossibleScore,
            correctCount: correctCount,
            totalQuestions: questions.length,
            percentage: percentage,
            timeTakenSeconds: timeTakenSeconds,
            answersDetail: answersDetail
        };

        this.lastCompletedResult = result;
        window.storageManager.saveQuizResult(result);

        if (window.soundManager) {
            if (percentage >= 70) window.soundManager.playVictory();
            else window.soundManager.playClick();
        }

        if (typeof confetti === 'function' && percentage >= 70) {
            try {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            } catch (e) {}
        }

        this.navigate('result');
        this.renderResultView(result);
    }

    // ==========================================
    // RESULT & REVIEW
    // ==========================================
    renderResultView(res) {
        const gaugeEl = document.getElementById('result-score-gauge');
        const titleEl = document.getElementById('result-quiz-title');
        const badgeEl = document.getElementById('result-grade-badge');
        const msgEl = document.getElementById('result-message');
        const correctEl = document.getElementById('result-correct-stat');
        const timeEl = document.getElementById('result-time-stat');
        const xpEl = document.getElementById('result-xp-stat');

        if (titleEl) titleEl.textContent = res.quizTitle;
        if (gaugeEl) gaugeEl.textContent = `${res.percentage}%`;

        // Format time
        const mins = Math.floor(res.timeTakenSeconds / 60);
        const secs = res.timeTakenSeconds % 60;
        const timeStr = `${mins > 0 ? `${mins}м ` : ''}${secs}с`;

        if (correctEl) correctEl.textContent = `${res.correctCount} / ${res.totalQuestions}`;
        if (timeEl) timeEl.textContent = timeStr;
        if (xpEl) xpEl.textContent = `+${Math.round((res.percentage / 100) * 50) + 10} XP`;

        // Grade messages
        let gradeText = "Отличный результат!";
        let gradeBadge = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
        let messageText = "Потрясающая работа! Вы продемонстрировали глубокое понимание темы.";

        if (res.percentage === 100) {
            gradeText = "Идеально (100%)! 🏆";
            gradeBadge = "bg-amber-500/20 text-amber-400 border-amber-500/30";
            messageText = "Абсолютный триумф! Ни одной ошибки. Вы настоящий мастер в этой сфере!";
        } else if (res.percentage >= 80) {
            gradeText = "Превосходно! 🌟";
            gradeBadge = "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
            messageText = "Высочайший балл! Большинство ответов даны безупречно.";
        } else if (res.percentage >= 60) {
            gradeText = "Хороший уровень 👍";
            gradeBadge = "bg-blue-500/20 text-blue-400 border-blue-500/30";
            messageText = "Твердый результат, но есть пара моментов, которые стоит повторить.";
        } else {
            gradeText = "Требуется практика 📚";
            gradeBadge = "bg-rose-500/20 text-rose-400 border-rose-500/30";
            messageText = "Не расстраивайтесь! Ошибки — лучший способ учиться. Изучите разбор ниже и попробуйте снова.";
        }

        if (badgeEl) {
            badgeEl.className = `px-3 py-1 rounded-full text-xs sm:text-sm font-bold border ${gradeBadge}`;
            badgeEl.textContent = gradeText;
        }
        if (msgEl) msgEl.textContent = messageText;

        // Render detailed answers review
        this.renderAnswersReview(res.answersDetail);
    }

    renderAnswersReview(details) {
        const container = document.getElementById('review-list-container');
        if (!container) return;

        container.innerHTML = details.map((item, idx) => {
            const isCorrect = item.isCorrect;
            const statusBadge = isCorrect 
                ? '<span class="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><i class="fa-solid fa-check mr-1"></i> Верно (+ ' + item.points + ' очков)</span>'
                : '<span class="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30"><i class="fa-solid fa-xmark mr-1"></i> Ошибка (0 очков)</span>';

            let answerContent = '';

            if (item.type === 'single' || item.type === 'boolean') {
                const userChoice = item.userAnswer !== undefined ? item.options[item.userAnswer] : 'Нет ответа';
                const correctChoice = item.options[item.correctAnswer];
                answerContent = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm mt-3">
                        <div class="p-3 rounded-xl border ${isCorrect ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-rose-950/20 border-rose-500/30 text-rose-200'}">
                            <span class="text-slate-400 block text-[11px] mb-1">Ваш ответ:</span>
                            <span class="font-medium">${this.escapeHtml(userChoice)}</span>
                        </div>
                        ${!isCorrect ? `
                            <div class="p-3 rounded-xl border bg-emerald-950/20 border-emerald-500/30 text-emerald-200">
                                <span class="text-slate-400 block text-[11px] mb-1">Правильный ответ:</span>
                                <span class="font-medium">${this.escapeHtml(correctChoice)}</span>
                            </div>
                        ` : ''}
                    </div>
                `;
            } else if (item.type === 'multiple') {
                const userChoices = Array.isArray(item.userAnswer) && item.userAnswer.length > 0 
                    ? item.userAnswer.map(i => item.options[i]).join(', ') 
                    : 'Нет ответа';
                const correctChoices = item.correctAnswer.map(i => item.options[i]).join(', ');
                answerContent = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm mt-3">
                        <div class="p-3 rounded-xl border ${isCorrect ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-rose-950/20 border-rose-500/30 text-rose-200'}">
                            <span class="text-slate-400 block text-[11px] mb-1">Ваш выбор:</span>
                            <span class="font-medium">${this.escapeHtml(userChoices)}</span>
                        </div>
                        ${!isCorrect ? `
                            <div class="p-3 rounded-xl border bg-emerald-950/20 border-emerald-500/30 text-emerald-200">
                                <span class="text-slate-400 block text-[11px] mb-1">Правильные варианты:</span>
                                <span class="font-medium">${this.escapeHtml(correctChoices)}</span>
                            </div>
                        ` : ''}
                    </div>
                `;
            } else if (item.type === 'text') {
                const userChoice = item.userAnswer !== undefined ? item.userAnswer : 'Нет ответа';
                answerContent = `
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm mt-3">
                        <div class="p-3 rounded-xl border ${isCorrect ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200' : 'bg-rose-950/20 border-rose-500/30 text-rose-200'}">
                            <span class="text-slate-400 block text-[11px] mb-1">Ваш ввод:</span>
                            <span class="font-medium">${this.escapeHtml(userChoice)}</span>
                        </div>
                        ${!isCorrect ? `
                            <div class="p-3 rounded-xl border bg-emerald-950/20 border-emerald-500/30 text-emerald-200">
                                <span class="text-slate-400 block text-[11px] mb-1">Правильный ответ:</span>
                                <span class="font-medium">${this.escapeHtml(item.correctAnswer)}</span>
                            </div>
                        ` : ''}
                    </div>
                `;
            }

            return `
                <div class="p-5 rounded-2xl border ${isCorrect ? 'border-emerald-500/20 bg-emerald-950/10' : 'border-rose-500/20 bg-rose-950/10'} mb-4">
                    <div class="flex items-start justify-between gap-3 mb-2">
                        <span class="text-xs font-bold text-slate-400">Вопрос ${idx + 1}</span>
                        ${statusBadge}
                    </div>
                    <div class="text-sm sm:text-base font-medium text-white mb-2 leading-relaxed">
                        ${this.formatMarkdownText(item.questionText)}
                    </div>
                    ${answerContent}
                    ${item.explanation ? `
                        <div class="mt-3 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300">
                            <span class="font-bold text-indigo-400"><i class="fa-solid fa-circle-info mr-1"></i> Пояснение:</span>
                            <div class="mt-1 text-slate-300">${this.formatMarkdownText(item.explanation)}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    // ==========================================
    // CERTIFICATE GENERATOR
    // ==========================================
    openCertificateModal() {
        if (!this.lastCompletedResult) {
            this.showToast("Сначала пройдите тест!", "error");
            return;
        }

        const modal = document.getElementById('modal-certificate');
        if (!modal) return;

        const prof = window.storageManager.getProfile();
        const res = this.lastCompletedResult;

        document.getElementById('cert-student-name').textContent = prof.name;
        document.getElementById('cert-quiz-name').textContent = res.quizTitle;
        document.getElementById('cert-score').textContent = `${res.percentage}% (${res.correctCount}/${res.totalQuestions})`;
        document.getElementById('cert-date').textContent = new Date().toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('cert-id').textContent = `CERT-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

        modal.classList.remove('hidden');
        if (window.soundManager) window.soundManager.playBadge();
    }

    closeCertificateModal() {
        const modal = document.getElementById('modal-certificate');
        if (modal) modal.classList.add('hidden');
    }

    printCertificate() {
        window.print();
    }

    // ==========================================
    // TEST BUILDER / CONSTRUCTOR
    // ==========================================
    resetBuilderForm() {
        this.builderQuestions = [
            {
                id: 'bq-1',
                type: 'single',
                text: '',
                options: ['', '', '', ''],
                correctAnswer: 0,
                explanation: '',
                points: 10
            }
        ];
        this.renderBuilderQuestions();
    }

    addBuilderQuestion() {
        this.builderQuestions.push({
            id: 'bq-' + Date.now(),
            type: 'single',
            text: '',
            options: ['', '', '', ''],
            correctAnswer: 0,
            explanation: '',
            points: 10
        });
        this.renderBuilderQuestions();
        if (window.soundManager) window.soundManager.playClick();
    }

    removeBuilderQuestion(idx) {
        if (this.builderQuestions.length <= 1) {
            this.showToast("В тесте должен быть хотя бы один вопрос", "error");
            return;
        }
        this.builderQuestions.splice(idx, 1);
        this.renderBuilderQuestions();
    }

    renderBuilderQuestions() {
        const container = document.getElementById('builder-questions-list');
        if (!container) return;

        container.innerHTML = this.builderQuestions.map((q, qIdx) => {
            return `
                <div class="glass-card rounded-2xl p-5 sm:p-6 mb-5 border border-white/10 relative">
                    <div class="flex items-center justify-between gap-3 mb-4">
                        <div class="flex items-center gap-2">
                            <span class="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                                ${qIdx + 1}
                            </span>
                            <span class="text-sm font-semibold text-white">Вопрос ${qIdx + 1}</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <select onchange="app.updateBuilderQuestionType(${qIdx}, this.value)" class="px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-200 focus:outline-none">
                                <option value="single" ${q.type === 'single' ? 'selected' : ''}>Один правильный ответ</option>
                                <option value="multiple" ${q.type === 'multiple' ? 'selected' : ''}>Несколько вариантов</option>
                                <option value="boolean" ${q.type === 'boolean' ? 'selected' : ''}>Правда / Ложь</option>
                                <option value="text" ${q.type === 'text' ? 'selected' : ''}>Ввод слова</option>
                            </select>
                            <button onclick="app.removeBuilderQuestion(${qIdx})" title="Удалить вопрос" class="text-slate-400 hover:text-rose-400 transition-colors">
                                <i class="fa-solid fa-trash text-sm"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Question text -->
                    <div class="mb-4">
                        <label class="block text-xs text-slate-400 mb-1 font-medium">Текст вопроса (поддерживает \`код\`):</label>
                        <textarea rows="2" placeholder="Например: Чему равен typeof NaN в JavaScript?" oninput="app.updateBuilderQuestionText(${qIdx}, this.value)" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500">${this.escapeHtml(q.text)}</textarea>
                    </div>

                    <!-- Options builder -->
                    ${this.renderBuilderOptionsMarkup(q, qIdx)}

                    <!-- Explanation -->
                    <div class="mt-4 pt-4 border-t border-white/5">
                        <label class="block text-xs text-slate-400 mb-1 font-medium">Объяснение правильного ответа (покажется при разборе):</label>
                        <input type="text" placeholder="Почему именно этот ответ верный..." value="${this.escapeHtml(q.explanation || '')}" oninput="app.updateBuilderQuestionExplanation(${qIdx}, this.value)" class="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500">
                    </div>
                </div>
            `;
        }).join('');
    }

    renderBuilderOptionsMarkup(q, qIdx) {
        if (q.type === 'single') {
            return `
                <div class="space-y-2">
                    <label class="block text-xs text-slate-400 font-medium">Варианты ответа (отметьте верный радио-кнопкой):</label>
                    ${q.options.map((opt, optIdx) => `
                        <div class="flex items-center gap-3">
                            <input type="radio" name="builder-correct-${qIdx}" ${q.correctAnswer === optIdx ? 'checked' : ''} onchange="app.setBuilderSingleCorrect(${qIdx}, ${optIdx})" class="w-4 h-4 text-indigo-600 focus:ring-0">
                            <input type="text" placeholder="Вариант ${optIdx + 1}" value="${this.escapeHtml(opt)}" oninput="app.updateBuilderOptionText(${qIdx}, ${optIdx}, this.value)" class="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500">
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (q.type === 'multiple') {
            const currentSelected = Array.isArray(q.correctAnswer) ? q.correctAnswer : [0];
            return `
                <div class="space-y-2">
                    <label class="block text-xs text-slate-400 font-medium">Варианты ответа (отметьте ВСЕ верные чекбоксами):</label>
                    ${q.options.map((opt, optIdx) => `
                        <div class="flex items-center gap-3">
                            <input type="checkbox" ${currentSelected.includes(optIdx) ? 'checked' : ''} onchange="app.toggleBuilderMultipleCorrect(${qIdx}, ${optIdx})" class="w-4 h-4 text-indigo-600 rounded focus:ring-0">
                            <input type="text" placeholder="Вариант ${optIdx + 1}" value="${this.escapeHtml(opt)}" oninput="app.updateBuilderOptionText(${qIdx}, ${optIdx}, this.value)" class="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500">
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (q.type === 'boolean') {
            return `
                <div class="flex items-center gap-4">
                    <label class="text-xs text-slate-400 font-medium">Правильный ответ:</label>
                    <label class="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                        <input type="radio" name="builder-bool-${qIdx}" ${q.correctAnswer === 0 ? 'checked' : ''} onchange="app.setBuilderSingleCorrect(${qIdx}, 0)" class="text-indigo-600">
                        Правда (True)
                    </label>
                    <label class="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                        <input type="radio" name="builder-bool-${qIdx}" ${q.correctAnswer === 1 ? 'checked' : ''} onchange="app.setBuilderSingleCorrect(${qIdx}, 1)" class="text-indigo-600">
                        Ложь (False)
                    </label>
                </div>
            `;
        } else if (q.type === 'text') {
            return `
                <div>
                    <label class="block text-xs text-slate-400 mb-1 font-medium">Правильное слово/фраза для ввода:</label>
                    <input type="text" placeholder="Например: number" value="${this.escapeHtml(q.correctAnswer || '')}" oninput="app.setBuilderTextCorrect(${qIdx}, this.value)" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500">
                </div>
            `;
        }
        return '';
    }

    updateBuilderQuestionType(qIdx, type) {
        const q = this.builderQuestions[qIdx];
        q.type = type;
        if (type === 'boolean') {
            q.options = ["Правда", "Ложь"];
            q.correctAnswer = 0;
        } else if (type === 'text') {
            q.options = [];
            q.correctAnswer = "";
        } else if (type === 'multiple') {
            if (!Array.isArray(q.options) || q.options.length === 0) {
                q.options = ['', '', '', ''];
            }
            q.correctAnswer = [0];
        } else {
            if (!Array.isArray(q.options) || q.options.length === 0) {
                q.options = ['', '', '', ''];
            }
            q.correctAnswer = 0;
        }
        this.renderBuilderQuestions();
    }

    updateBuilderQuestionText(qIdx, text) {
        this.builderQuestions[qIdx].text = text;
    }

    updateBuilderOptionText(qIdx, optIdx, text) {
        this.builderQuestions[qIdx].options[optIdx] = text;
    }

    updateBuilderQuestionExplanation(qIdx, text) {
        this.builderQuestions[qIdx].explanation = text;
    }

    setBuilderSingleCorrect(qIdx, optIdx) {
        this.builderQuestions[qIdx].correctAnswer = optIdx;
    }

    toggleBuilderMultipleCorrect(qIdx, optIdx) {
        const q = this.builderQuestions[qIdx];
        let cur = Array.isArray(q.correctAnswer) ? [...q.correctAnswer] : [];
        const idx = cur.indexOf(optIdx);
        if (idx >= 0) cur.splice(idx, 1);
        else cur.push(optIdx);
        cur.sort();
        q.correctAnswer = cur.length > 0 ? cur : [0];
    }

    setBuilderTextCorrect(qIdx, val) {
        this.builderQuestions[qIdx].correctAnswer = val.trim();
    }

    saveAndLaunchBuilderQuiz() {
        const titleInput = document.getElementById('builder-title');
        const descInput = document.getElementById('builder-desc');
        const categorySelect = document.getElementById('builder-category');
        const diffSelect = document.getElementById('builder-difficulty');
        const timeInput = document.getElementById('builder-time');

        const title = titleInput ? titleInput.value.trim() : '';
        const desc = descInput ? descInput.value.trim() : '';
        const category = categorySelect ? categorySelect.value : 'custom';
        const difficulty = diffSelect ? diffSelect.value : 'medium';
        const timeLimit = timeInput ? parseInt(timeInput.value) || 10 : 10;

        if (!title) {
            this.showToast("Пожалуйста, укажите название теста!", "error");
            titleInput.focus();
            return;
        }

        // Validate questions
        for (let i = 0; i < this.builderQuestions.length; i++) {
            const q = this.builderQuestions[i];
            if (!q.text.trim()) {
                this.showToast(`Вопрос #${i + 1} не содержит текста!`, "error");
                return;
            }
            if (q.type === 'single' || q.type === 'multiple') {
                const filledOptions = q.options.filter(o => o.trim().length > 0);
                if (filledOptions.length < 2) {
                    this.showToast(`Вопрос #${i + 1} должен содержать минимум 2 варианта ответа!`, "error");
                    return;
                }
            }
            if (q.type === 'text' && !q.correctAnswer) {
                this.showToast(`В вопросе #${i + 1} не указан правильный ответ!`, "error");
                return;
            }
        }

        const categoryObj = window.CATEGORIES.find(c => c.id === category);

        const newQuiz = {
            id: 'custom-' + Date.now(),
            title: title,
            description: desc || "Тест, созданный пользователем",
            category: category,
            categoryName: categoryObj ? categoryObj.name : "Пользовательский",
            difficulty: difficulty,
            timeLimitMinutes: timeLimit,
            author: window.storageManager.getProfile().name,
            icon: "fa-solid fa-wand-magic-sparkles",
            color: "from-indigo-600 to-fuchsia-600",
            questions: this.builderQuestions
        };

        window.storageManager.saveCustomQuiz(newQuiz);
        this.showToast("Тест успешно создан и сохранен!", "success");
        this.startQuiz(newQuiz.id);
    }

    importQuizPrompt() {
        const json = prompt("Вставьте JSON конфигурацию теста:");
        if (!json) return;
        try {
            const quiz = window.storageManager.importQuiz(json);
            this.showToast(`Тест "${quiz.title}" успешно импортирован!`, "success");
            this.renderCatalog();
        } catch (e) {
            this.showToast(e.message, "error");
        }
    }

    // ==========================================
    // PROFILE & ACHIEVEMENTS
    // ==========================================
    renderProfile() {
        this.updateProfileWidget();
        const prof = window.storageManager.getProfile();
        const history = window.storageManager.getHistory();
        const custom = window.storageManager.getCustomQuizzes();

        const nameInput = document.getElementById('profile-edit-name');
        if (nameInput) nameInput.value = prof.name;

        // Stats summary
        const totalTestsPassed = history.length;
        const avgPercentage = totalTestsPassed > 0 
            ? Math.round(history.reduce((acc, h) => acc + h.percentage, 0) / totalTestsPassed)
            : 0;

        document.getElementById('stat-total-passed').textContent = totalTestsPassed;
        document.getElementById('stat-avg-score').textContent = `${avgPercentage}%`;
        document.getElementById('stat-total-xp').textContent = prof.xp;
        document.getElementById('stat-created-count').textContent = custom.length;

        // Level bar
        document.getElementById('profile-rank-name').textContent = prof.rank;
        document.getElementById('profile-xp-progress-text').textContent = `${prof.xpInLevel} / 100 XP до след. уровня`;
        document.getElementById('profile-xp-progress-bar').style.width = `${prof.xpInLevel}%`;

        // History Table
        this.renderHistoryList(history);
        this.renderAchievementsGrid();
    }

    saveProfileName() {
        const input = document.getElementById('profile-edit-name');
        if (!input) return;
        const newName = input.value.trim();
        if (newName) {
            window.storageManager.updateProfile({ name: newName });
            this.showToast("Имя профиля обновлено!", "success");
            this.updateProfileWidget();
        }
    }

    setProfileAvatar(emoji) {
        window.storageManager.updateProfile({ avatar: emoji });
        if (window.soundManager) window.soundManager.playClick();
        this.updateProfileWidget();
        this.showToast(`Аватар обновлен на ${emoji}`, "info");
    }

    renderHistoryList(history) {
        const container = document.getElementById('profile-history-list');
        if (!container) return;

        if (history.length === 0) {
            container.innerHTML = `
                <div class="text-center py-10 text-slate-500 text-sm">
                    <i class="fa-solid fa-clock-rotate-left text-3xl mb-2 opacity-50"></i>
                    <p>Вы пока не прошли ни одного теста. Выберите тест в каталоге!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = history.slice(0, 15).map(item => {
            const dateStr = new Date(item.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            });

            const badgeColor = item.percentage >= 80 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : item.percentage >= 50 
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/30';

            return `
                <div class="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-4 mb-2">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400 text-sm">
                            <i class="fa-solid fa-graduation-cap"></i>
                        </div>
                        <div>
                            <div class="text-sm font-semibold text-white">${item.quizTitle}</div>
                            <div class="text-xs text-slate-400">${dateStr} • ${item.correctCount}/${item.totalQuestions} верных</div>
                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 rounded-lg text-xs font-bold border ${badgeColor}">
                            ${item.percentage}%
                        </span>
                        <button onclick="app.startQuiz('${item.quizId}')" title="Пройти снова" class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors">
                            <i class="fa-solid fa-rotate-right text-xs"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderAchievementsGrid() {
        const container = document.getElementById('achievements-grid');
        if (!container) return;

        const unlocked = window.storageManager.getUnlockedAchievements();

        container.innerHTML = window.ACHIEVEMENTS_LIST.map(ach => {
            const isUnlocked = unlocked.includes(ach.id);
            return `
                <div class="p-4 rounded-2xl border transition-all ${
                    isUnlocked 
                    ? 'bg-slate-900/90 border-indigo-500/40 shadow-lg shadow-indigo-500/10' 
                    : 'bg-slate-900/40 border-white/5 opacity-50 grayscale'
                } flex items-center gap-3.5">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${ach.color} flex items-center justify-center text-white text-lg shrink-0">
                        <i class="${ach.icon}"></i>
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h4 class="text-sm font-bold text-white">${ach.title}</h4>
                            ${isUnlocked ? '<i class="fa-solid fa-circle-check text-emerald-400 text-xs"></i>' : '<i class="fa-solid fa-lock text-slate-500 text-xs"></i>'}
                        </div>
                        <p class="text-xs text-slate-400 leading-snug mt-0.5">${ach.desc}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ==========================================
    // UTILITIES
    // ==========================================
    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    formatMarkdownText(text) {
        if (!text) return '';
        // Code blocks: ```javascript ... ```
        let formatted = text.replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<pre class="my-3 overflow-x-auto"><code class="language-${lang}">${this.escapeHtml(code.trim())}</code></pre>`;
        });
        // Inline code: `...`
        formatted = formatted.replace(/`([^`]+)`/g, (match, code) => {
            return `<code class="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-xs border border-white/10">${this.escapeHtml(code)}</code>`;
        });
        // Linebreaks
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    }
}

// Global bootstrap
document.addEventListener('DOMContentLoaded', () => {
    window.app = new QuizApp();
});
