/* ===== BOOKING SYSTEM ===== */
let bookingShow = null;
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();
let selectedDate = null;
let selectedTime = null;
let currentBookingStep = 0;

const frenchMonths = ['Janvier','Février','Mars','Avril','Mai','Juin',
    'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const frenchDaysShort = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
const frenchDayMap = {
    'Lundi':1,'Mardi':2,'Mercredi':3,'Jeudi':4,
    'Vendredi':5,'Samedi':6,'Dimanche':0
};
const monthMap = {
    'Jan':0,'Fév':1,'Fev':1,'Mar':2,'Avr':3,'Mai':4,'Juin':5,
    'Juil':6,'Août':7,'Sep':8,'Oct':9,'Nov':10,'Déc':11,'Dec':11
};

function parseFrenchDate(s) {
    const p = s.trim().split(/\s+/);
    if (p.length < 3) return null;
    const d = parseInt(p[0]), m = monthMap[p[1]], y = parseInt(p[2]);
    if (isNaN(d) || m === undefined || isNaN(y)) return null;
    return new Date(y, m, d);
}

function getShowDateRange(show) {
    const ds = show.Dates || show.date || '';
    const parts = ds.split(/\s*-\s*/);
    if (parts.length < 2) return { start: null, end: null };
    return { start: parseFrenchDate(parts[0]), end: parseFrenchDate(parts[1]) };
}

function getShowTimeSlots(show) {
    const h = show.Horaires || show.time || '';
    const slots = [];
    const parts = h.split(/\s+/);
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];
        if (part.includes('-') && part.split('-').length === 2) {
            const [day, time] = part.split('-');
            if (frenchDayMap[day] !== undefined && time) {
                slots.push({ day: frenchDayMap[day], dayName: day, time: time });
            }
        } else if (frenchDayMap[part] !== undefined && i + 1 < parts.length) {
            const nextPart = parts[i + 1];
            if (/\d/.test(nextPart)) {
                slots.push({ day: frenchDayMap[part], dayName: part, time: nextPart });
                i++;
            }
        }
    }
    return slots;
}

function openBooking() {
    bookingShow = programs[current];
    currentBookingStep = 1;
    selectedDate = null;
    selectedTime = null;

    document.getElementById('bookingImage').src = bookingShow.image;
    document.getElementById('bookingTitle').textContent = bookingShow.title;
    document.getElementById('bookingDates').textContent = bookingShow.Dates || bookingShow.date || '-';
    document.getElementById('bookingHoraires').textContent = bookingShow.Horaires || bookingShow.time || '-';
    document.getElementById('bookingSalle').textContent = bookingShow.Salle || '-';
    document.getElementById('bookingTarif').textContent = bookingShow.Tarif || bookingShow.price || '-';
    document.getElementById('bookingDuree').textContent = bookingShow.Durée || bookingShow.duration || '-';
    document.getElementById('bookingDesc').innerHTML = bookingShow.desc || '';

    showBookingStep(1);
    document.getElementById('bookingOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeBooking() {
    const overlay = document.getElementById('bookingOverlay');
    overlay.style.animation = 'bookFadeOut 0.3s ease forwards';
    setTimeout(() => {
        overlay.classList.remove('active');
        overlay.style.animation = '';
        document.body.style.overflow = '';
    }, 300);
}

function bookingBack() {
    if (currentBookingStep === 2) showBookingStep(1);
    else if (currentBookingStep === 3) showBookingStep(2);
    else closeBooking();
}

function showBookingStep(step) {
    currentBookingStep = step;
    const s1 = document.getElementById('bookingStep1');
    const s2 = document.getElementById('bookingStep2');
    const s3 = document.getElementById('bookingStep3');

    s1.style.display = step === 1 ? 'flex' : 'none';
    s2.style.display = step === 2 ? 'block' : 'none';
    s2.classList.toggle('active', step === 2);
    s3.style.display = step === 3 ? 'block' : 'none';
    s3.classList.toggle('active', step === 3);
}

function showCalendarStep() {
    const range = getShowDateRange(bookingShow);
    if (range.start) {
        calendarMonth = range.start.getMonth();
        calendarYear = range.start.getFullYear();
    }
    document.getElementById('calendarShowTitle').textContent = bookingShow.title;
    selectedDate = null;
    selectedTime = null;
    document.getElementById('timeSlotsSection').classList.remove('active');
    document.getElementById('btnConfirm').classList.remove('active');
    renderCalendar();
    showBookingStep(2);
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    document.getElementById('calendarMonthLabel').textContent =
        frenchMonths[calendarMonth] + ' ' + calendarYear;

    frenchDaysShort.forEach(d => {
        const el = document.createElement('div');
        el.className = 'calendar-day-name';
        el.textContent = d;
        grid.appendChild(el);
    });

    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const range = getShowDateRange(bookingShow);
    const timeSlots = getShowTimeSlots(bookingShow);
    const availableDays = timeSlots.map(s => s.day);

    for (let i = 0; i < firstDay; i++) {
        const el = document.createElement('div');
        el.className = 'calendar-day empty';
        grid.appendChild(el);
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(calendarYear, calendarMonth, d);
        const el = document.createElement('div');
        el.className = 'calendar-day';
        el.textContent = d;

        const inRange = (!range.start || date >= range.start) &&
                        (!range.end || date <= range.end);
        const hasSlot = availableDays.includes(date.getDay());

        if (inRange && hasSlot) {
            el.classList.add('available');
            el.onclick = () => selectDate(d, date);
        }
        if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
            el.classList.add('selected');
        }
        grid.appendChild(el);
    }
}

function selectDate(day, date) {
    selectedDate = date;
    selectedTime = null;
    renderCalendar();
    showTimeSlots(date);
    document.getElementById('btnConfirm').classList.remove('active');
}

function showTimeSlots(date) {
    const timeSlots = getShowTimeSlots(bookingShow);
    const matching = timeSlots.filter(s => s.day === date.getDay());

    const section = document.getElementById('timeSlotsSection');
    const grid = document.getElementById('timeSlotsGrid');
    const title = document.getElementById('timeSlotsTitle');

    const dateStr = date.getDate() + ' ' + frenchMonths[date.getMonth()] + ' ' + date.getFullYear();
    title.textContent = 'Horaires disponibles — ' + dateStr;

    grid.innerHTML = '';
    matching.forEach(slot => {
        const btn = document.createElement('button');
        btn.className = 'time-slot';
        btn.textContent = slot.time;
        btn.onclick = () => selectTime(slot.time, btn);
        grid.appendChild(btn);
    });

    if (matching.length === 0) {
        grid.innerHTML = '<p style="color:#888;background:transparent">Aucun horaire disponible</p>';
    }
    section.classList.add('active');
}

function selectTime(time, btn) {
    selectedTime = time;
    document.querySelectorAll('.time-slot').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('btnConfirm').classList.add('active');
}

function calendarPrev() {
    calendarMonth--;
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
    renderCalendar();
}

function calendarNext() {
    calendarMonth++;
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    renderCalendar();
}

function confirmBooking() {
    if (!selectedDate || !selectedTime) return;

    const dateStr = selectedDate.getDate() + ' ' + frenchMonths[selectedDate.getMonth()] + ' ' + selectedDate.getFullYear();
    document.getElementById('confirmShowTitle').textContent = bookingShow.title;
    document.getElementById('confirmDateTime').textContent = dateStr + ' à ' + selectedTime;
    document.getElementById('confirmSalle').textContent = 'Salle ' + (bookingShow.Salle || '-');
    document.getElementById('confirmTarif').textContent = bookingShow.Tarif || bookingShow.price || '-';
    showBookingStep(3);
}
