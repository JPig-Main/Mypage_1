'use strict';

{
    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth();

    function getCalendarHead() 
    {
        const dates = [];
        const d = new Date(year, month, 0).getDate();
        const n = new Date(year, month, 1).getDay();

        for (let i = 0; i < n; i++) {
            dates.unshift({
            date: d - i,
            is_today: false,
            is_disabled: true,
            });
        }

        return dates;
    }

    function getCalendarBody() 
    {
        const dates = []; 
        const last_date = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= last_date; i++) {
            dates.push({
            date: i,
            is_today: false,
            is_disabled: false,
            });
        }

        if (year === today.getFullYear() && month === today.getMonth()) {
            dates[today.getDate() - 1].is_today = true;
        }

        return dates;
    }

    function getCalendarTail() 
    {
        const dates = [];
        const last_day = new Date(year, month + 1, 0).getDay();

        for (let i = 1; i < 7 - last_day; i++) {
            dates.push({
            date: i,
            is_today: false,
            is_disabled: true,
            });
        }

        return dates;
    }

    function clearCalendar() 
    {
        const tbody = document.querySelector('#calender-container > tbody');

        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
    }

    function renderTitle() 
    {
        const title = `${year}/${String(month + 1).padStart(2, '0')}`;
        document.querySelector('#calender-container #calender-title').textContent = title;
    }

    function renderWeeks() {
        const dates = [
            ...getCalendarHead(),
            ...getCalendarBody(),
            ...getCalendarTail(),
        ];
        const weeks = [];
        const weeks_count = dates.length / 7;

        for (let i = 0; i < weeks_count; i++) {
            weeks.push(dates.splice(0, 7));
        }

        weeks.forEach(week => {
            const tr = document.createElement('tr');
            week.forEach(date => {
            const td = document.createElement('td');

            td.textContent = date.date;
            if (date.is_today) {
                td.classList.add('today');
            }
            if (date.is_disabled) {
                td.classList.add('disabled');
            }

            tr.appendChild(td);
            });
            document.querySelector('#calender-container > tbody').appendChild(tr);
        });
    }

    function createCalendar() {
        clearCalendar();
        renderTitle();
        renderWeeks();
    }

    document.getElementById('calender-prev').addEventListener('click', () => {
        month--;
        if (month < 0) {
            year--;
            month = 11;
    }

    createCalendar();
    });

    document.getElementById('calender-next').addEventListener('click', () => {
        month++;
        if (month > 11) {
            year++;
            month = 0;
    }

    createCalendar();
    });

    document.getElementById('calender-today').addEventListener('click', () => {
        year = today.getFullYear();
        month = today.getMonth();

        createCalendar();
    });

    createCalendar();
}