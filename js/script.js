// Ожидание загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация навигационного меню
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('open');
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

    // Функционал для страницы заметок
    if (document.getElementById('addNoteBtn')) {
        const addNoteBtn = document.getElementById('addNoteBtn');
        const noteText = document.getElementById('noteText');
        const noteDeadline = document.getElementById('noteDeadline');
        const notesContainer = document.getElementById('notesContainer');
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');

        // Загрузка заметок из localStorage
        loadNotes();

        // Добавление новой заметки
        addNoteBtn.addEventListener('click', function() {
            if (noteText.value.trim() === '') {
                alert('Введите текст заметки!');
                return;
            }

            const note = {
                id: Date.now(),
                text: noteText.value,
                deadline: noteDeadline.value,
                timestamp: new Date().toLocaleString()
            };

            saveNote(note);
            renderNote(note);

            // Очистка формы
            noteText.value = '';
            noteDeadline.value = '';
        });

        // Поиск заметок
        searchBtn.addEventListener('click', searchNotes);
        searchInput.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                searchNotes();
            }
        });
    }

    // Функционал для страницы предметов
    if (document.getElementById('addCourseBtn')) {
        const addCourseBtn = document.getElementById('addCourseBtn');
        const courseName = document.getElementById('courseName');
        const courseLink = document.getElementById('courseLink');
        const coursesContainer = document.getElementById('coursesContainer');

        // Загрузка предметов из localStorage
        loadCourses();

        // Добавление нового предмета
        addCourseBtn.addEventListener('click', function() {
            if (courseName.value.trim() === '' || courseLink.value.trim() === '') {
                alert('Заполните все поля!');
                return;
            }

            const course = {
                id: Date.now(),
                name: courseName.value,
                link: courseLink.value
            };

            saveCourse(course);
            renderCourse(course);

            // Очистка формы
            courseName.value = '';
            courseLink.value = '';
        });
    }
});

// Функции для работы с заметками
function saveNote(note) {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.push(note);
    localStorage.setItem('notes', JSON.stringify(notes));
}

function loadNotes() {
    const notesContainer = document.getElementById('notesContainer');
    if (!notesContainer) return;

    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notesContainer.innerHTML = '';

    if (notes.length === 0) {
        notesContainer.innerHTML = '<p class="no-notes">Заметок пока нет</p>';
        return;
    }

    notes.forEach(note => {
        renderNote(note);
    });
}

function renderNote(note) {
    const notesContainer = document.getElementById('notesContainer');
    if (!notesContainer) return;

    // Убираем сообщение о пустом списке
    if (notesContainer.querySelector('.no-notes')) {
        notesContainer.innerHTML = '';
    }

    const noteElement = document.createElement('div');
    noteElement.classList.add('note');
    noteElement.dataset.id = note.id;

    let deadlineText = '';
    if (note.deadline) {
        const deadlineDate = new Date(note.deadline);
        deadlineText = `<div class="note-deadline">Дедлайн: ${deadlineDate.toLocaleDateString()}</div>`;
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
        const notes = JSON.parse(localStorage.getItem('notes')) || [];
        if (notes.length === 0) {
            notesContainer.innerHTML = '<p class="no-notes">Заметок пока нет</p>';
        }
    });
}

function deleteNote(id) {
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes = notes.filter(note => note.id !== id);
    localStorage.setItem('notes', JSON.stringify(notes));
}

function searchNotes() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.toLowerCase();
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const notesContainer = document.getElementById('notesContainer');

    if (!notesContainer) return;

    notesContainer.innerHTML = '';

    const filteredNotes = notes.filter(note =>
        note.text.toLowerCase().includes(searchTerm)
    );

    if (filteredNotes.length === 0) {
        notesContainer.innerHTML = '<p class="no-notes">Заметки не найдены</p>';
        return;
    }

    filteredNotes.forEach(note => {
        renderNote(note);
    });
}

// Функции для работы с предметами
function saveCourse(course) {
    let courses = JSON.parse(localStorage.getItem('courses')) || [];
    courses.push(course);
    localStorage.setItem('courses', JSON.stringify(courses));
}

function loadCourses() {
    const coursesContainer = document.getElementById('coursesContainer');
    if (!coursesContainer) return;

    const courses = JSON.parse(localStorage.getItem('courses')) || [];
    coursesContainer.innerHTML = '';

    if (courses.length === 0) {
        coursesContainer.innerHTML = '<p class="no-courses">Предметов пока нет</p>';
        return;
    }

    courses.forEach(course => {
        renderCourse(course);
    });
}

function renderCourse(course) {
    const coursesContainer = document.getElementById('coursesContainer');
    if (!coursesContainer) return;

    // Убираем сообщение о пустом списке
    if (coursesContainer.querySelector('.no-courses')) {
        coursesContainer.innerHTML = '';
    }

    const courseElement = document.createElement('div');
    courseElement.classList.add('course-item');
    courseElement.dataset.id = course.id;

    courseElement.innerHTML = `
        <div class="course-name">${course.name}</div>
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
        const courses = JSON.parse(localStorage.getItem('courses')) || [];
        if (courses.length === 0) {
            coursesContainer.innerHTML = '<p class="no-courses">Предметов пока нет</p>';
        }
    });
}

function deleteCourse(id) {
    let courses = JSON.parse(localStorage.getItem('courses')) || [];
    courses = courses.filter(course => course.id !== id);
    localStorage.setItem('courses', JSON.stringify(courses));
}