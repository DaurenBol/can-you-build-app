// LocalStorage & State Management
class StorageManager {
    constructor() {
        this.CUSTOM_QUIZZES_KEY = 'quiz_platform_custom_v1';
        this.HISTORY_KEY = 'quiz_platform_history_v1';
        this.PROFILE_KEY = 'quiz_platform_profile_v1';
        this.ACHIEVEMENTS_KEY = 'quiz_platform_achievements_v1';
        this.BOOKMARKS_KEY = 'quiz_platform_bookmarks_v1';
        this.THEME_KEY = 'quiz_platform_theme_v1';

        this.initProfile();
    }

    initProfile() {
        if (!localStorage.getItem(this.PROFILE_KEY)) {
            const initial = {
                name: "Исследователь знаний",
                avatar: "🎓",
                xp: 0,
                joinedDate: new Date().toISOString()
            };
            localStorage.setItem(this.PROFILE_KEY, JSON.stringify(initial));
        }
    }

    getProfile() {
        try {
            const raw = localStorage.getItem(this.PROFILE_KEY);
            const prof = raw ? JSON.parse(raw) : {};
            const xp = prof.xp || 0;
            const level = Math.floor(xp / 100) + 1;
            const xpInLevel = xp % 100;

            let rank = "Новичок";
            if (level >= 3) rank = "Ученик";
            if (level >= 5) rank = "Специалист";
            if (level >= 8) rank = "Эксперт";
            if (level >= 12) rank = "Магистр Знаний";
            if (level >= 20) rank = "Гроссмейстер";

            return {
                ...prof,
                level,
                xpInLevel,
                rank
            };
        } catch (e) {
            return { name: "Исследователь", avatar: "🎓", xp: 0, level: 1, xpInLevel: 0, rank: "Новичок" };
        }
    }

    updateProfile(updated) {
        const cur = this.getProfile();
        const merged = { ...cur, ...updated };
        localStorage.setItem(this.PROFILE_KEY, JSON.stringify(merged));
        return this.getProfile();
    }

    addXP(amount) {
        const prof = this.getProfile();
        const newXP = (prof.xp || 0) + amount;
        this.updateProfile({ xp: newXP });
        this.checkAchievements();
        return newXP;
    }

    // Quizzes (Default + Custom)
    getAllQuizzes() {
        const custom = this.getCustomQuizzes();
        return [...custom, ...(window.INITIAL_QUIZZES || [])];
    }

    getQuizById(id) {
        const all = this.getAllQuizzes();
        return all.find(q => q.id === id) || null;
    }

    getCustomQuizzes() {
        try {
            const raw = localStorage.getItem(this.CUSTOM_QUIZZES_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    saveCustomQuiz(quiz) {
        const list = this.getCustomQuizzes();
        if (!quiz.id) {
            quiz.id = 'custom-' + Date.now();
        }
        quiz.isCustom = true;
        quiz.author = quiz.author || 'Вы';
        quiz.category = quiz.category || 'custom';
        quiz.categoryName = quiz.categoryName || 'Пользовательский';

        const existingIdx = list.findIndex(q => q.id === quiz.id);
        if (existingIdx >= 0) {
            list[existingIdx] = quiz;
        } else {
            list.unshift(quiz);
        }

        localStorage.setItem(this.CUSTOM_QUIZZES_KEY, JSON.stringify(list));
        this.unlockAchievement('creator');
        return quiz;
    }

    deleteCustomQuiz(id) {
        const list = this.getCustomQuizzes().filter(q => q.id !== id);
        localStorage.setItem(this.CUSTOM_QUIZZES_KEY, JSON.stringify(list));
    }

    // Bookmarks
    getBookmarks() {
        try {
            const raw = localStorage.getItem(this.BOOKMARKS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    isBookmarked(id) {
        return this.getBookmarks().includes(id);
    }

    toggleBookmark(id) {
        const list = this.getBookmarks();
        let added = false;
        const idx = list.indexOf(id);
        if (idx >= 0) {
            list.splice(idx, 1);
        } else {
            list.push(id);
            added = true;
        }
        localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(list));
        return added;
    }

    // History
    getHistory() {
        try {
            const raw = localStorage.getItem(this.HISTORY_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    saveQuizResult(result) {
        const history = this.getHistory();
        result.id = 'res-' + Date.now();
        result.date = new Date().toISOString();
        history.unshift(result);
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));

        // Award XP
        const baseXP = Math.round((result.score / (result.maxPossibleScore || 100)) * 50) + 10;
        this.addXP(baseXP);

        // Check achievements
        this.checkAchievements(result);

        return result;
    }

    // Achievements
    getUnlockedAchievements() {
        try {
            const raw = localStorage.getItem(this.ACHIEVEMENTS_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    unlockAchievement(id) {
        const list = this.getUnlockedAchievements();
        if (!list.includes(id)) {
            list.push(id);
            localStorage.setItem(this.ACHIEVEMENTS_KEY, JSON.stringify(list));
            
            // Trigger sound & banner
            if (window.soundManager) window.soundManager.playBadge();
            const achObj = (window.ACHIEVEMENTS_LIST || []).find(a => a.id === id);
            if (achObj && window.app && window.app.showToast) {
                window.app.showToast(`🏆 Достижение разблокировано: ${achObj.title}!`, "success");
            }
        }
    }

    checkAchievements(latestResult = null) {
        const history = this.getHistory();
        const profile = this.getProfile();

        // First test
        if (history.length >= 1) {
            this.unlockAchievement('first_blood');
        }

        // 100% score
        if (latestResult && latestResult.percentage === 100) {
            this.unlockAchievement('perfect_score');
        } else if (history.some(h => h.percentage === 100)) {
            this.unlockAchievement('perfect_score');
        }

        // Speedster: < 90s and >= 80%
        if (latestResult && latestResult.timeTakenSeconds <= 90 && latestResult.percentage >= 80) {
            this.unlockAchievement('speedster');
        }

        // Polymath: 4 different quizzes passed
        const uniqueQuizIds = new Set(history.map(h => h.quizId));
        if (uniqueQuizIds.size >= 4) {
            this.unlockAchievement('polymath');
        }

        // XP Master: 250+ XP
        if (profile.xp >= 250) {
            this.unlockAchievement('xp_master');
        }
    }

    // JSON export / import
    exportQuiz(quizId) {
        const quiz = this.getQuizById(quizId);
        if (!quiz) return null;
        return JSON.stringify(quiz, null, 2);
    }

    importQuiz(jsonString) {
        try {
            const quiz = JSON.parse(jsonString);
            if (!quiz.title || !quiz.questions || !Array.isArray(quiz.questions)) {
                throw new Error("Неверная структура теста");
            }
            quiz.id = 'imported-' + Date.now();
            quiz.isCustom = true;
            return this.saveCustomQuiz(quiz);
        } catch (e) {
            throw new Error("Ошибка чтения JSON: " + e.message);
        }
    }
}

window.storageManager = new StorageManager();
