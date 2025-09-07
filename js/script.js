// Ожидание загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация навигационного меню
    initNavigation();

    // Инициализация функционала для страницы заметок
    if (document.getElementById('addNoteBtn')) {
        initNotesPage();
    }

    // Инициализация функционала для страницы предметов
    if (document.getElementById('addCourseBtn')) {
        initCoursesPage();
    }

    // Инициализация функционала для страницы контактов
    if (document.getElementById('sendMessageBtn')) {
        initContactsPage();
    }

    // Загрузка данных из локального хранилища
    loadData();
});

// Инициализация навигационного меню
function initNavigation() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const closeNav = document.getElementById('closeNav');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('open');
        });
    }

    if (closeNav && navMenu) {
        closeNav.addEventListener('click', function() {
            navMenu.classList.remove('open');
        });
    }

    // Закрытие меню при клике вне его области
    document.addEventListener('click', function(event) {
        if (navMenu && navToggle &&
            !navMenu.contains(event.target) &&
            !navToggle.contains(event.target) &&
            navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
        }
    });

    // Подсветка активной страницы в навигации
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Функционал для страницы заметок
function initNotesPage() {
    const addNoteBtn = document.getElementById('addNoteBtn');
    const noteText = document.getElementById('noteText');
    const noteDeadline = document.getElementById('noteDeadline');
    const notePriority = document.getElementById('notePriority');
    const notesContainer = document.getElementById('notesContainer');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    // Добавление новой заметки
    addNoteBtn.addEventListener('click', function() {
        if (noteText.value.trim() === '') {
            showNotification('Введите текст заметки!', 'error');
            return;
        }

        const note = {
            id: Date.now(),
            text: noteText.value,
            deadline: noteDeadline.value,
            priority: notePriority.value,
            timestamp: new Date().toLocaleString()
        };

        saveNote(note);
        renderNote(note);

        // Очистка формы
        noteText.value = '';
        noteDeadline.value = '';
        notePriority.value = 'medium';

        showNotification('Заметка успешно добавлена!', 'success');
    });

    // Поиск заметок
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', searchNotes);
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                searchNotes();
            }
        });
    }
}

// Функционал для страницы предметов
function initCoursesPage() {
    const addCourseBtn = document.getElementById('addCourseBtn');
    const courseName = document.getElementById('courseName');
    const courseLink = document.getElementById('courseLink');
    const courseDescription = document.getElementById('courseDescription');
    const coursesContainer = document.getElementById('coursesContainer');

    // Добавление нового предмета
    addCourseBtn.addEventListener('click', function() {
        if (courseName.value.trim() === '' || courseLink.value.trim() === '') {
            showNotification('Заполните название и ссылку!', 'error');
            return;
        }

        const course = {
            id: Date.now(),
            name: courseName.value,
            link: courseLink.value,
            description: courseDescription.value
        };

        saveCourse(course);
        renderCourse(course);

        // Очистка формы
        courseName.value = '';
        courseLink.value = '';
        courseDescription.value = '';

        showNotification('Предмет успешно добавлен!', 'success');
    });
}

// Функционал для страницы контактов
function initContactsPage() {
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const contactName = document.getElementById('contactName');
    const contactEmail = document.getElementById('contactEmail');
    const contactMessage = document.getElementById('contactMessage');

    // Отправка сообщения (заглушка)
    sendMessageBtn.addEventListener('click', function() {
        if (contactName.value.trim() === '' || contactEmail.value.trim() === '' || contactMessage.value.trim() === '') {
            showNotification('Заполните все поля формы!', 'error');
            return;
        }

        // В реальном приложении здесь был бы код отправки данных на сервер
        showNotification('Сообщение отправлено! Мы ответим вам в ближайшее время.', 'success');

        // Очистка формы
        contactName.value = '';
        contactEmail.value = '';
        contactMessage.value = '';
    });
}

// Функции для работы с заметками
function saveNote(note) {
    let notes = JSON.parse(localStorage.getItem('oracle_notes')) || [];
    notes.push(note);
    localStorage.setItem('oracle_notes', JSON.stringify(notes));
}

function renderNote(note) {
    const notesContainer = document.getElementById('notesContainer');
    if (!notesContainer) return;

    // Убираем сообщение о пустом списке
    const emptyState = document.getElementById('emptyNotesState');
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    const noteElement = document.createElement('div');
    noteElement.classList.add('note', `priority-${note.priority}`);
    noteElement.dataset.id = note.id;

    let deadlineText = '';
    if (note.deadline) {
        const deadlineDate = new Date(note.deadline);
        deadlineText = `<div class="note-deadline">Дедлайн: ${deadlineDate.toLocaleString()}</div>`;
    }

    noteElement.innerHTML = `
        <div class="note-content">${note.text}</div>
        ${deadlineText}
        <div class="note-timestamp">Создано: ${note.timestamp}</div>
        <div class="note-actions">
            <button class="delete-note" data-id="${note.id}">Удалить</button>
        </div>
    `;

    notesContainer.appendChild(noteElement);

    // Добавляем обработчик удаления
    const deleteBtn = noteElement.querySelector('.delete-note');
    deleteBtn.addEventListener('click', function() {
        deleteNote(note.id);
        noteElement.remove();

        // Проверяем, есть ли еще заметки
        const notes = JSON.parse(localStorage.getItem('oracle_notes')) || [];
        if (notes.length === 0 && emptyState) {
            emptyState.style.display = 'block';
        }
    });
}

function deleteNote(id) {
    let notes = JSON.parse(localStorage.getItem('oracle_notes')) || [];
    notes = notes.filter(note => note.id !== id);
    localStorage.setItem('oracle_notes', JSON.stringify(notes));
}

function searchNotes() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();
    const notes = JSON.parse(localStorage.getItem('oracle_notes')) || [];
    const notesContainer = document.getElementById('notesContainer');
    const emptyState = document.getElementById('emptyNotesState');

    if (!notesContainer) return;

    notesContainer.innerHTML = '';

    const filteredNotes = notes.filter(note =>
        note.text.toLowerCase().includes(searchTerm)
    );

    if (filteredNotes.length === 0) {
        if (emptyState) {
            emptyState.textContent = 'Заметки не найдены';
            emptyState.style.display = 'block';
        }
        return;
    }

    if (emptyState) {
        emptyState.style.display = 'none';
    }

    filteredNotes.forEach(note => {
        renderNote(note);
    });
}

// Функции для работы с предметами
function saveCourse(course) {
    let courses = JSON.parse(localStorage.getItem('oracle_courses')) || [];
    courses.push(course);
    localStorage.setItem('oracle_courses', JSON.stringify(courses));
}

function renderCourse(course) {
    const coursesContainer = document.getElementById('coursesContainer');
    if (!coursesContainer) return;

    // Убираем сообщение о пустом списке
    const emptyState = document.getElementById('emptyCoursesState');
    if (emptyState) {
        emptyState.style.display = 'none';
    }

    const courseElement = document.createElement('div');
    courseElement.classList.add('course-item');
    courseElement.dataset.id = course.id;

    let descriptionHtml = '';
    if (course.description) {
        descriptionHtml = `<div class="course-description">${course.description}</div>`;
    }

    courseElement.innerHTML = `
        <div class="course-name">${course.name}</div>
        ${descriptionHtml}
        <div class="course-link"><a href="${course.link}" target="_blank">${course.link}</a></div>
        <div class="course-actions">
            <button class="delete-course" data-id="${course.id}">Удалить</button>
        </div>
    `;

    coursesContainer.appendChild(courseElement);

    // Добавляем обработчик удаления
    const deleteBtn = courseElement.querySelector('.delete-course');
    deleteBtn.addEventListener('click', function() {
        deleteCourse(course.id);
        courseElement.remove();

        // Проверяем, есть ли еще предметы
        const courses = JSON.parse(localStorage.getItem('oracle_courses')) || [];
        if (courses.length === 0 && emptyState) {
            emptyState.style.display = 'block';
        }
    });
}

function deleteCourse(id) {
    let courses = JSON.parse(localStorage.getItem('oracle_courses')) || [];
    courses = courses.filter(course => course.id !== id);
    localStorage.setItem('oracle_courses', JSON.stringify(courses));
}

// Загрузка данных из localStorage
function loadData() {
    // Загрузка заметок
    if (document.getElementById('notesContainer')) {
        const notes = JSON.parse(localStorage.getItem('oracle_notes')) || [];
        const notesContainer = document.getElementById('notesContainer');
        const emptyState = document.getElementById('emptyNotesState');

        if (notes.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'block';
            }
        } else {
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            notes.forEach(note => {
                renderNote(note);
            });
        }
    }

    // Загрузка предметов
    if (document.getElementById('coursesContainer')) {
        const courses = JSON.parse(localStorage.getItem('oracle_courses')) || [];
        const coursesContainer = document.getElementById('coursesContainer');
        const emptyState = document.getElementById('emptyCoursesState');

        if (courses.length === 0) {
            if (emptyState) {
                emptyState.style.display = 'block';
            }
        } else {
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            courses.forEach(course => {
                renderCourse(course);
            });
        }
    }
}

// Показать уведомление
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">${message}</div>
        <button class="notification-close">×</button>
    `;

    // Добавляем стили для уведомления
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            min-width: 300px;
            max-width: 500px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        .notification-success {
            background-color: #4CAF50;
        }
        .notification-error {
            background-color: #F44336;
        }
        .notification-info {
            background-color: #2196F3;
        }
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin-left: 15px;
        }
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;

    document.head.appendChild(style);
    document.body.appendChild(notification);

    // Добавляем обработчик закрытия
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', function() {
        notification.remove();
    });

    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Синхронизация между вкладками (если поддерживается)
if (window.addEventListener) {
    window.addEventListener('storage', function(e) {
        if (e.key === 'oracle_notes' || e.key === 'oracle_courses') {
            loadData();
        }
    });
}