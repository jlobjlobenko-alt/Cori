export type Language = 'en' | 'uk' | 'ru';

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    stats: 'Stats',
    goals: 'Goals',
    coach: 'Coach',
    more: 'More',
    
    // Home Screen
    welcome: 'Welcome, Courier!',
    startShift: 'Start Shift',
    endShift: 'End Shift',
    shiftActive: 'Shift Active',
    shiftDuration: 'Duration',
    currentStreak: 'Current Streak',
    longestStreak: 'Longest Streak',
    days: 'days',
    day: 'day',
    todayEarnings: "Today's Earnings",
    todayDeliveries: "Today's Deliveries",
    
    // End Shift Modal
    endShiftTitle: 'End Your Shift',
    deliveries: 'Deliveries',
    earnings: 'Earnings',
    confirm: 'Confirm',
    cancel: 'Cancel',
    
    // Stats Screen
    statistics: 'Statistics',
    totalDaysWorked: 'Total Days Worked',
    skippedDays: 'Skipped Days',
    totalDeliveries: 'Total Deliveries',
    totalEarnings: 'Total Earnings',
    totalHours: 'Total Hours',
    weeklyIncome: 'Weekly Income',
    monthlyIncome: 'Monthly Income',
    productivityScore: 'Productivity Score',
    consistency: 'Consistency',
    calendar: 'Calendar',
    profitableHours: 'Most Profitable Hours',
    
    // Goals Screen
    dailyGoals: 'Daily Goals',
    setGoals: 'Set Goals',
    deliveryTarget: 'Delivery Target',
    earningsTarget: 'Earnings Target',
    hoursTarget: 'Hours Target',
    achievements: 'Achievements',
    locked: 'Locked',
    unlocked: 'Unlocked',
    
    // Coach Screen
    aiCoach: 'Iron Coach',
    askCoach: 'Ask your coach...',
    send: 'Send',
    coachIntro: "I'm your Iron Coach! Ask me for motivation, productivity tips, or insights about your work patterns.",
    
    // Leaderboard
    leaderboard: 'Leaderboard',
    rank: 'Rank',
    byStreak: 'By Streak',
    byDeliveries: 'By Deliveries',
    byEarnings: 'By Earnings',
    
    // Settings
    settings: 'Settings',
    language: 'Language',
    currency: 'Currency',
    disciplineMode: 'Discipline Mode',
    disciplineModeDesc: 'Reset streak if you skip a day',
    displayName: 'Display Name',
    notifications: 'Notifications',
    about: 'About',
    
    // Discipline
    streakLost: 'You lost your streak!',
    streakLostMsg: 'Start again and beat your previous record.',
    lostEarnings: 'Estimated earnings lost today',
    
    // Monthly Ranks
    bronzeCourier: 'Bronze Courier',
    silverCourier: 'Silver Courier',
    goldCourier: 'Gold Courier',
    ironCourier: 'Iron Courier',
    
    // Achievements
    firstWorkDay: 'First Work Day',
    streak3: '3 Day Streak',
    streak7: '7 Day Streak',
    streak14: '14 Day Streak',
    streak30: '30 Day Streak',
    streak50: '50 Day Discipline',
    streak100: '100 Day Iron Discipline',
    deliveries100: '100 Deliveries',
    deliveries500: '500 Deliveries',
    deliveries1000: '1000 Deliveries',
    earnings100: 'First $100',
    earnings1000: '$1000 Earned',
    earnings5000: '$5000 Earned',
  },
  uk: {
    // Navigation
    home: 'Головна',
    stats: 'Статистика',
    goals: 'Цілі',
    coach: 'Тренер',
    more: 'Більше',
    
    // Home Screen
    welcome: 'Вітаю, Кур\'єр!',
    startShift: 'Почати зміну',
    endShift: 'Завершити зміну',
    shiftActive: 'Зміна активна',
    shiftDuration: 'Тривалість',
    currentStreak: 'Поточна серія',
    longestStreak: 'Найдовша серія',
    days: 'днів',
    day: 'день',
    todayEarnings: 'Заробіток сьогодні',
    todayDeliveries: 'Доставки сьогодні',
    
    // End Shift Modal
    endShiftTitle: 'Завершити зміну',
    deliveries: 'Доставки',
    earnings: 'Заробіток',
    confirm: 'Підтвердити',
    cancel: 'Скасувати',
    
    // Stats Screen
    statistics: 'Статистика',
    totalDaysWorked: 'Всього робочих днів',
    skippedDays: 'Пропущені дні',
    totalDeliveries: 'Всього доставок',
    totalEarnings: 'Загальний заробіток',
    totalHours: 'Всього годин',
    weeklyIncome: 'Тижневий дохід',
    monthlyIncome: 'Місячний дохід',
    productivityScore: 'Продуктивність',
    consistency: 'Стабільність',
    calendar: 'Календар',
    profitableHours: 'Найприбутковіші години',
    
    // Goals Screen
    dailyGoals: 'Щоденні цілі',
    setGoals: 'Встановити цілі',
    deliveryTarget: 'Ціль доставок',
    earningsTarget: 'Ціль заробітку',
    hoursTarget: 'Ціль годин',
    achievements: 'Досягнення',
    locked: 'Заблоковано',
    unlocked: 'Розблоковано',
    
    // Coach Screen
    aiCoach: 'Залізний тренер',
    askCoach: 'Запитай тренера...',
    send: 'Надіслати',
    coachIntro: 'Я твій Залізний тренер! Запитай мене про мотивацію, поради щодо продуктивності або аналіз твоєї роботи.',
    
    // Leaderboard
    leaderboard: 'Рейтинг',
    rank: 'Місце',
    byStreak: 'За серією',
    byDeliveries: 'За доставками',
    byEarnings: 'За заробітком',
    
    // Settings
    settings: 'Налаштування',
    language: 'Мова',
    currency: 'Валюта',
    disciplineMode: 'Режим дисципліни',
    disciplineModeDesc: 'Скинути серію при пропуску дня',
    displayName: "Ім'я користувача",
    notifications: 'Сповіщення',
    about: 'Про додаток',
    
    // Discipline
    streakLost: 'Ви втратили серію!',
    streakLostMsg: 'Почніть знову і побийте свій попередній рекорд.',
    lostEarnings: 'Орієнтовний втрачений заробіток сьогодні',
    
    // Monthly Ranks
    bronzeCourier: "Бронзовий кур'єр",
    silverCourier: "Срібний кур'єр",
    goldCourier: "Золотий кур'єр",
    ironCourier: "Залізний кур'єр",
    
    // Achievements
    firstWorkDay: 'Перший робочий день',
    streak3: 'Серія 3 дні',
    streak7: 'Серія 7 днів',
    streak14: 'Серія 14 днів',
    streak30: 'Серія 30 днів',
    streak50: '50 днів дисципліни',
    streak100: '100 днів залізної дисципліни',
    deliveries100: '100 доставок',
    deliveries500: '500 доставок',
    deliveries1000: '1000 доставок',
    earnings100: 'Перші 100',
    earnings1000: 'Зароблено 1000',
    earnings5000: 'Зароблено 5000',
  },
  ru: {
    // Navigation
    home: 'Главная',
    stats: 'Статистика',
    goals: 'Цели',
    coach: 'Тренер',
    more: 'Ещё',
    
    // Home Screen
    welcome: 'Привет, Курьер!',
    startShift: 'Начать смену',
    endShift: 'Завершить смену',
    shiftActive: 'Смена активна',
    shiftDuration: 'Длительность',
    currentStreak: 'Текущая серия',
    longestStreak: 'Лучшая серия',
    days: 'дней',
    day: 'день',
    todayEarnings: 'Заработок сегодня',
    todayDeliveries: 'Доставки сегодня',
    
    // End Shift Modal
    endShiftTitle: 'Завершить смену',
    deliveries: 'Доставки',
    earnings: 'Заработок',
    confirm: 'Подтвердить',
    cancel: 'Отмена',
    
    // Stats Screen
    statistics: 'Статистика',
    totalDaysWorked: 'Всего рабочих дней',
    skippedDays: 'Пропущенные дни',
    totalDeliveries: 'Всего доставок',
    totalEarnings: 'Общий заработок',
    totalHours: 'Всего часов',
    weeklyIncome: 'Недельный доход',
    monthlyIncome: 'Месячный доход',
    productivityScore: 'Продуктивность',
    consistency: 'Стабильность',
    calendar: 'Календарь',
    profitableHours: 'Самые прибыльные часы',
    
    // Goals Screen
    dailyGoals: 'Ежедневные цели',
    setGoals: 'Установить цели',
    deliveryTarget: 'Цель доставок',
    earningsTarget: 'Цель заработка',
    hoursTarget: 'Цель часов',
    achievements: 'Достижения',
    locked: 'Заблокировано',
    unlocked: 'Разблокировано',
    
    // Coach Screen
    aiCoach: 'Железный тренер',
    askCoach: 'Спроси тренера...',
    send: 'Отправить',
    coachIntro: 'Я твой Железный тренер! Спроси меня о мотивации, советах по продуктивности или анализе твоей работы.',
    
    // Leaderboard
    leaderboard: 'Рейтинг',
    rank: 'Место',
    byStreak: 'По серии',
    byDeliveries: 'По доставкам',
    byEarnings: 'По заработку',
    
    // Settings
    settings: 'Настройки',
    language: 'Язык',
    currency: 'Валюта',
    disciplineMode: 'Режим дисциплины',
    disciplineModeDesc: 'Сбросить серию при пропуске дня',
    displayName: 'Имя пользователя',
    notifications: 'Уведомления',
    about: 'О приложении',
    
    // Discipline
    streakLost: 'Вы потеряли серию!',
    streakLostMsg: 'Начните снова и побейте свой предыдущий рекорд.',
    lostEarnings: 'Примерный потерянный заработок сегодня',
    
    // Monthly Ranks
    bronzeCourier: 'Бронзовый курьер',
    silverCourier: 'Серебряный курьер',
    goldCourier: 'Золотой курьер',
    ironCourier: 'Железный курьер',
    
    // Achievements
    firstWorkDay: 'Первый рабочий день',
    streak3: 'Серия 3 дня',
    streak7: 'Серия 7 дней',
    streak14: 'Серия 14 дней',
    streak30: 'Серия 30 дней',
    streak50: '50 дней дисциплины',
    streak100: '100 дней железной дисциплины',
    deliveries100: '100 доставок',
    deliveries500: '500 доставок',
    deliveries1000: '1000 доставок',
    earnings100: 'Первые 100',
    earnings1000: 'Заработано 1000',
    earnings5000: 'Заработано 5000',
  },
};

export const getTranslation = (lang: Language, key: keyof typeof translations.en): string => {
  return translations[lang]?.[key] || translations.en[key] || key;
};
