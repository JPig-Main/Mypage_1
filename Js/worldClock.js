'use strict';

{
    const world_clock = document.getElementById('world-clock');
    let timeout_id;
    const place_hour_difference_template = {};
    let current_place = 'Tokyo';

    function newPlaceAdd (new_place, new_place_name, hour_difference) 
    {
        place_hour_difference_template[new_place] = hour_difference;
        const new_place_choice = document.createElement('button');
        new_place_choice.id = `place-choice_${new_place}`;
        new_place_choice.textContent = new_place_name;
        document.getElementById('world-clock-place-choices').appendChild(new_place_choice);
    }

    function renderClock (hour_difference) {
        const millisecond_difference = (hour_difference + 9) * 3600000;
        const worldTime = new Date(Date.now() - millisecond_difference);
        const hour = String(worldTime.getHours()).padStart(2, '0');
        const minute = String(worldTime.getMinutes()).padStart(2, '0');
        const second = String(worldTime.getSeconds()).padStart(2, '0');
        world_clock.textContent = `${hour}:${minute}:${second}`;

        timeout_id = setTimeout(() => {
            renderClock(hour_difference);
        }, 1000);
    }

    function placeButtonState(change_place) {
        document.querySelectorAll('#world-clock-place-choices > button').forEach((place_choice) => {
            const place = place_choice.id.split('_')[1];
            place_choice.disabled = (place === change_place) ? true : false;
            if (!place_choice.disabled) {
                place_choice.classList.add('button-usable')
            }
            else {
                place_choice.classList.remove('button-usable')
            }
        });
    }

    // 地点を追加
    newPlaceAdd('Tokyo', '東京', -9);
    newPlaceAdd('Beijing', '北京', -8);
    newPlaceAdd('Delhi', 'デリー', -5);
    newPlaceAdd('Dubai', 'ドバイ', -4);
    newPlaceAdd('Moscow', 'モスクワ', -3);
    newPlaceAdd('Rome', 'ローマ', -2);
    newPlaceAdd('Paris', 'パリ', -2);
    newPlaceAdd('Madrid', 'マドリード', -2);
    newPlaceAdd('London', 'ロンドン', -1);
    newPlaceAdd('NewYork', 'ニューヨーク', 4);
    newPlaceAdd('Los angeles', 'ロサンジェルス', 7);
    newPlaceAdd('Honolulu', 'ホノルル', 10);

    placeButtonState(current_place);

    Object.keys(place_hour_difference_template).forEach((place) => {
        document.getElementById(`place-choice_${place}`).addEventListener('click', () => {
            placeButtonState(place);
            clearTimeout(timeout_id);
            renderClock(place_hour_difference_template[place]);
        });
    });
    document.getElementById(`place-choice_${current_place}`).disabled = true;
    renderClock(place_hour_difference_template[current_place]);
}