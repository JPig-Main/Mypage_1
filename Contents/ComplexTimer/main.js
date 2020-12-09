'use strict';
{
    // コンテンツ
    const contents = document.getElementById('contents');
    // タイマーIDを作るための番号
    let timer_id_source = -1;
    // タイマーの最大数
    const MAX_CONTENTS_NUM = 9; // 3(row) * 4(col)
    // 日本とイギリスの時差(絶対値)
    const JET_LAG = 32400000;
    // タイマーがスタートした時間
    const start_timer = [];
    // タイマーが鳴る時間(Timerのみ)
    const aim_timer = [];
    // タイマーの初期モード
    const INIT_MODE = 'stopwatch';
    // タイマーの初期モードでないモード
    const NOT_INIT_MODE = 'timer';
    // 現在の各タイマーのモード
    const now_mode = [];
    // 現在の各タイマーの状態
    const now_state = [];
    // 各タイマーのuseタイマーID
    const use_timer_id = [];
    // 各タイマーの経過時間
    const elapsed_time = [];
    // 各タイマーの初期スタート時間(Timerのみ)
    const timer_start_time = [];
    // 各タイマーのラップ
    const timer_lap = [];
    /* メッセージ */
    // メッセージの種類
    const INFORMATION_KIND_TEMPLATE = {
        TIMER_ADD: 'timer-add',
        TIMER_REMOVE: 'timer-remove',
        TIMER_TOO_MANY: 'timer-too-many',
        START: 'start',
        STOP: 'stop', 
        RESET: 'reset',
        GET_LAP: 'get-lap',
        RENDER_LAP: 'render-lap',
        MODE_CHANGE: 'mode-change',
        NAME_CHANGING: 'name-changing',
        NAME_CHANGED: 'name-changed',
        NAME_NOT_CHANGED: 'name-not-changed',
        ALARM: 'alarm',
    }
    // 情報の表示
    function informationRender (timer_id, info_kind, original_name = null) 
    {
        let focus_name;
        if (typeof(timer_id) !== 'number') {
            focus_name = timer_id;
        }
        else if (original_name !== null) {
            focus_name = original_name;
        }
        else {
            focus_name = document.getElementById(`name_${timer_id}`).textContent;
        }
        const TEMPLATE_LOG_STRING = `${focus_name}> `;
        let message_string = '| ';
        let log_string = `${focus_name}> `;
        switch(info_kind) {
            case INFORMATION_KIND_TEMPLATE.TIMER_ADD:
                message_string += '追加されました';
                log_string += `追加されました[${contents.childElementCount}/${MAX_CONTENTS_NUM}]`;
                break;
            case INFORMATION_KIND_TEMPLATE.TIMER_REMOVE: 
                log_string += `削除されました[${contents.childElementCount - 1}/${MAX_CONTENTS_NUM}]`; 
                break;
            case INFORMATION_KIND_TEMPLATE.TIMER_TOO_MANY: 
                log_string += 'これ以上タイマーを追加できません'; 
                break;
            case INFORMATION_KIND_TEMPLATE.START: 
                message_string += '開始しました';
                break;
            case INFORMATION_KIND_TEMPLATE.STOP: 
                message_string += '停止しました';
                break;
            case INFORMATION_KIND_TEMPLATE.RESET: 
                message_string += 'リセットしました';
                break;
            case INFORMATION_KIND_TEMPLATE.GET_LAP:
                message_string += `ラップを取りました[${timer_lap[timer_id].length + 1}]`;
                break;
            case INFORMATION_KIND_TEMPLATE.RENDER_LAP:
                message_string += `ラップを表示しました`;
                log_string += timerLapProcess(timer_id, INFORMATION_KIND_TEMPLATE.RENDER_LAP);
                break;
            case INFORMATION_KIND_TEMPLATE.MODE_CHANGE:
                message_string += `${now_mode[timer_id]}に変更されました`;
                break;
            case INFORMATION_KIND_TEMPLATE.NAME_CHANGING:
                message_string += '名前を変更中です';
                break;
            case INFORMATION_KIND_TEMPLATE.NAME_CHANGED:
                message_string += '名前が変更されました';
                break;
            case INFORMATION_KIND_TEMPLATE.NAME_NOT_CHANGED:
                message_string += '名前が変更されませんでした';
                break;
            case INFORMATION_KIND_TEMPLATE.ALARM:
                message_string += 'アラームが鳴っています';
                break;
        }
        if (typeof(timer_id) === 'number') {
            document.getElementById(`message-console_${timer_id}`).textContent = message_string;
        }
        if (log_string !== TEMPLATE_LOG_STRING) {
            const one_log = document.createElement('pre');
            one_log.textContent = log_string;
            const all_log = document.getElementById('all-log');
            all_log.insertBefore(one_log, all_log.firstChild);
        }
    }

    /* 状態の管理 */
    function stateManage (timer_id, change_state = 'not-change')
    {
        if (change_state !== 'not-change') {
            now_state[timer_id] = change_state;
        }

        const start_stop = document.getElementById(`start-stop_${timer_id}`);
        const reset_lap = document.getElementById(`reset-lap_${timer_id}`);
        const hour = document.getElementById(`hour_${timer_id}`);
        const minute = document.getElementById(`minute_${timer_id}`);
        const second = document.getElementById(`second_${timer_id}`);

        switch (now_state[timer_id]) {
            case 'preparing':
                start_stop.disabled = true;
                reset_lap.disabled = true;
                switch (now_mode[timer_id]) {
                    case 'timer':
                        hour.disabled = false;
                        minute.disabled = false;
                        second.disabled = false;
                        break;
                    case 'stopwatch':
                        hour.disabled = true;
                        minute.disabled = true;
                        second.disabled = true;
                        break;
                }
                break;
            case 'initial':
                start_stop.disabled = false;
                reset_lap.disabled = true;
                switch (now_mode[timer_id]) {
                    case 'timer':
                        hour.disabled = false;
                        minute.disabled = false;
                        second.disabled = false;
                        break;
                    case 'stopwatch':
                        hour.disabled = true;
                        minute.disabled = true;
                        second.disabled = true;
                        break;
                }
                break;
            case 'running':
                start_stop.disabled = false;
                reset_lap.disabled = false;
                switch (now_mode[timer_id]) {
                    case 'timer':
                        hour.disabled = true;
                        minute.disabled = true;
                        second.disabled = true;
                        break;
                    case 'stopwatch':
                        hour.disabled = true;
                        minute.disabled = true;
                        second.disabled = true;
                        break;
                }
                break;
            case 'stopped':
                start_stop.disabled = false;
                reset_lap.disabled = false;
                switch (now_mode[timer_id]) {
                    case 'timer':
                        hour.disabled = true;
                        minute.disabled = true;
                        second.disabled = true;
                        break;
                    case 'stopWatch':
                        hour.disabled = true;
                        minute.disabled = true;
                        second.disabled = true;
                        break;
                }
                break;
        }

        document.getElementById(`mode-information_${timer_id}`).textContent = `[${now_mode[timer_id]}]`;
    }
    
    /* 現在のタイマーの取得・表示 */
    function controlNowTimer (timer_id, do_mode, now_timer = null) {
        switch (do_mode) {
            case 'get':
                switch(now_mode[timer_id]) {
                    case 'stopwatch':
                        return new Date(Date.now() - start_timer[timer_id] + elapsed_time[timer_id] - JET_LAG);
                    case 'timer':
                        const NOW_TIMER_VALUE = aim_timer[timer_id] - Date.now() - elapsed_time[timer_id];
                        return [new Date(NOW_TIMER_VALUE - JET_LAG), NOW_TIMER_VALUE];
                }
            case 'change':
                const hour = String(now_timer.getHours()).padStart(2, '0');
                const minute = String(now_timer.getMinutes()).padStart(2, '0');
                const second = String(now_timer.getSeconds()).padStart(2, '0');
                const millisecond = String(now_timer.getMilliseconds()).padStart(3, '0');
                return `${hour}:${minute}:${second}.${millisecond}`;
        }
    }

    /* タイマーの追加 */
    function timerAdd (timer_id)
    {   
        /* タイマーの初期化 */
        function timerInit (timer_id)
        {
            now_state.push('initial');
            now_mode.push(INIT_MODE)
            stateManage(timer_id);
            elapsed_time.push(0);
            start_timer.push(0);
            aim_timer.push(0);
            timer_lap.push([]);
            timer_start_time.push({
                hour: 0,
                minute: 0,
                second: 0,
            });
            informationRender(timer_id, INFORMATION_KIND_TEMPLATE.TIMER_ADD);
        }
        
        const content = document.createElement('div');
        content.id = `content_${timer_id}`;
        content.classList.add('content');

        const name_contents = document.createElement('div');
        name_contents.id = `name-contents_${timer_id}`;
        name_contents.classList.add('name-contents');
        const name = document.createElement('div');
        name.id = `name_${timer_id}`;
        name.classList.add('name');
        name.textContent = `タイマー${timer_id + 1}`;
        name_contents.appendChild(name);
        const name_change = document.createElement('button');
        name_change.id = `name-change_${timer_id}`;
        name_change.classList.add('name-change');
        name_change.textContent = '変更';
        name_contents.appendChild(name_change);
        content.appendChild(name_contents);
        
        const information_contents = document.createElement('div');
        information_contents.id = `information-contents_${timer_id}`;
        information_contents.classList.add('information-contents');
        const mode_information = document.createElement('div');
        mode_information.id = `mode-information_${timer_id}`;
        mode_information.classList.add('mode-information');
        information_contents.appendChild(mode_information);
        const message_console = document.createElement('div');
        message_console.id = `message-console_${timer_id}`;
        message_console.classList.add('message-console');
        message_console.textContent = '';
        information_contents.appendChild(message_console);
        content.appendChild(information_contents);

        const timer = document.createElement('div');
        timer.classList.add('timer');
        timer.id = `timer_${timer_id}`;
        timer.textContent = controlNowTimer(timer_id, 'change', new Date(-JET_LAG));
        content.appendChild(timer);

        const controls = document.createElement('div');
        controls.classList.add('controls');
        const top_controls = document.createElement('div');
        top_controls.classList.add('top-controls')
        const start_stop = document.createElement('button');
        start_stop.id = `start-stop_${timer_id}`;
        start_stop.textContent = 'Start / Stop';
        top_controls.appendChild(start_stop);
        const reset_lap = document.createElement('button');
        reset_lap.id = `reset-lap_${timer_id}`;
        reset_lap.textContent = 'Reset / Lap';
        top_controls.appendChild(reset_lap);
        const mode_change = document.createElement('button');
        mode_change.id = `mode-change_${timer_id}`;
        mode_change.textContent = NOT_INIT_MODE;
        top_controls.appendChild(mode_change);
        const render_lap = document.createElement('button');
        render_lap.id = `render-lap_${timer_id}`;
        render_lap.textContent = 'Lap表示';
        top_controls.appendChild(render_lap);
        controls.appendChild(top_controls);

        const bottom_controls = document.createElement('div');
        bottom_controls.classList.add('bottom-controls');
        const hour = document.createElement('button');
        hour.id = `hour_${timer_id}`;
        hour.textContent = '時間';
        bottom_controls.appendChild(hour);
        const minute = document.createElement('button');
        minute.id = `minute_${timer_id}`;
        minute.textContent = '分';
        bottom_controls.appendChild(minute);
        const second = document.createElement('button');
        second.id = `second_${timer_id}`;
        second.textContent = '秒';
        bottom_controls.appendChild(second);
        const timer_remove = document.createElement('button');
        timer_remove.id = `timer-remove_${timer_id}`;
        timer_remove.textContent = '削除';
        bottom_controls.appendChild(timer_remove);
        controls.appendChild(bottom_controls);

        content.appendChild(controls);
        contents.appendChild(content);

        timerInit(timer_id);
    }

    /* タイマーの削除 */
    function timerRemove (timer_id) 
    {
        informationRender(timer_id, INFORMATION_KIND_TEMPLATE.TIMER_REMOVE);
        contents.removeChild(document.getElementById(`content_${timer_id}`));
    }

    /* タイマー名の変更 */
    function nameChange (timer_id) 
    {
        const name_contents = document.getElementById(`name-contents_${timer_id}`);
        const name_change = document.getElementById(`name-change_${timer_id}`);
        let now_name_changing = false;
        let original_name;
        
        function nameInputMake()
        {
            const name = document.getElementById(`name_${timer_id}`);
            name_contents.removeChild(name);
    
            original_name = name.textContent;
            const name_input_design = document.createElement('input');
            name_input_design.id = `name-input_${timer_id}`;
            name_input_design.type = 'text';
            name_input_design.classList.add('name-input');
            name_contents.insertBefore(name_input_design, name_change);
            name_change.textContent = '確定';
            now_name_changing = true;
            informationRender(timer_id, INFORMATION_KIND_TEMPLATE.NAME_CHANGING, original_name);
        }

        function nameDecide (new_name_value, changed='changed')  
        {
            const new_name = document.createElement('div')
            new_name.id = `name_${timer_id}`;
            new_name.classList.add('name');
            new_name.textContent = new_name_value;
            name_contents.removeChild(name_input);
            name_contents.insertBefore(new_name, name_change);
            name_change.textContent = '変更';
            if (new_name_value === original_name) {
                changed = 'not-Changed';
            }
            switch(changed) {
                case 'changed':
                    informationRender(timer_id, INFORMATION_KIND_TEMPLATE.NAME_CHANGED, original_name);
                    break;
                case 'not-changed':
                    informationRender(timer_id, INFORMATION_KIND_TEMPLATE.NAME_NOT_CHANGED, original_name);
                    break;
            }
        }

        /* 入力欄の作成 */
        nameInputMake();
        
        /* 入力前の処理 */
        const name_input = document.getElementById(`name-input_${timer_id}`);
        name_input.value = original_name;
        name_input.focus();
        name_input.select();

        /* 名前の確定 */
        name_input.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'Enter':
                    nameDecide(name_input.value);
                    break;
                case 'Escape':
                    nameDecide(original_name, 'not-changed');
                    break;
            }    
        });
        name_change.addEventListener('click', () => {
            if (now_name_changing){
                nameDecide(name_input.value);
            }
        });
    }

    /* タイマーのラップ処理 */
    function timerLapProcess (timer_id, process_kind)
    {
        switch(process_kind) {
            case 'get-lap':
                informationRender(timer_id, INFORMATION_KIND_TEMPLATE.GET_LAP)
                switch (now_mode[timer_id]) {
                    case 'stopwatch':
                        timer_lap[timer_id].push(controlNowTimer(timer_id, 'change', controlNowTimer(timer_id, 'get')));
                        break;
                    case 'timer':
                        timer_lap[timer_id].push(controlNowTimer(timer_id, 'change', controlNowTimer(timer_id, 'get')[0]));
                        break;
                }
                break;
            case 'render-lap':
                const name_value = document.getElementById(`name_${timer_id}`).textContent;
                let render_string = '';
                if (timer_lap[timer_id].length <= 0) {
                    render_string += `まだLapはありません。`;
                }
                else {
                    render_string += `Lapを表示します。\n`;
                    for(let i = 0; i < timer_lap[timer_id].length; i++){
                        render_string += `${i + 1}: ${timer_lap[timer_id][i]}\n`
                    }
                }
                return render_string;
            case 'reset_lap':
                timer_lap[timer_id].splice(0, timer_lap[timer_id].length);
        }
    }

    /* モードの変更 */
    function modeChange (timer_id) 
    {
        const mode_change = document.getElementById(`mode-change_${timer_id}`);
        clearTimeout(use_timer_id[timer_id]);
        document.getElementById(`timer_${timer_id}`).textContent = controlNowTimer(timer_id, 'change', new Date(-JET_LAG));
        switch (now_mode[timer_id]) {
            case 'stopwatch':
                now_mode[timer_id] = 'timer';
                mode_change.textContent = 'stopwatch'
                stateManage(timer_id, 'preparing');
                informationRender(timer_id, INFORMATION_KIND_TEMPLATE.MODE_CHANGE);
                break;
            case 'timer':
                document.getElementById(`timer_${timer_id}`).classList.remove('timer-alarm');
                now_mode[timer_id] = 'stopwatch';
                mode_change.textContent = 'timer'
                stateManage(timer_id, 'initial');
                informationRender(timer_id, INFORMATION_KIND_TEMPLATE.MODE_CHANGE);
                break;
        }
        timerLapProcess(timer_id, 'reset-lap');
        elapsed_time[timer_id] = 0;
        timer_start_time[timer_id].hour = 0;
        timer_start_time[timer_id].minute = 0;
        timer_start_time[timer_id].second = 0;
    }

    /* stopwatchの制御 */
    function stopwatchControl (timer_id) 
    {
        /* カウントアップ(stopwatch) */
        function countUp (timer_id)
        {
            const now_timer = controlNowTimer(timer_id, 'get');
            document.getElementById(`timer_${timer_id}`).textContent = controlNowTimer(timer_id, 'change', now_timer);
            use_timer_id[timer_id] = setTimeout( () => {
                countUp(timer_id);
            }, 10);
        }

        document.getElementById(`start-stop_${timer_id}`).addEventListener('click', () => {
            if (now_mode[timer_id] == 'stopwatch') {
                switch (now_state[timer_id]) {
                    case 'initial':
                    case 'stopped':
                        /* スタート処理 */
                        stateManage(timer_id, 'running');
                        informationRender(timer_id, INFORMATION_KIND_TEMPLATE.START);
                        start_timer[timer_id] = Date.now();
                        use_timer_id[timer_id] = setTimeout( () => {
                            countUp(timer_id);
                        }, 10);
                        break;
                    case 'running':
                        /* ストップ処理 */
                        stateManage(timer_id, 'stopped');
                        informationRender(timer_id, INFORMATION_KIND_TEMPLATE.STOP);
                        elapsed_time[timer_id] += Date.now() - start_timer[timer_id];
                        clearTimeout(use_timer_id[timer_id]);
                        break;
                }
            }
                
        });

        document.getElementById(`reset-lap_${timer_id}`).addEventListener('click', () => {
            if (now_mode[timer_id] == 'stopwatch') {
                switch (now_state[timer_id]) {
                    /* ラップ処理 */
                    case 'running':
                        timerLapProcess(timer_id, 'get-lap');
                        break;
                    /* リセット処理 */
                    case 'stopped':
                        stateManage(timer_id, 'initial');
                        informationRender(timer_id, INFORMATION_KIND_TEMPLATE.RESET);
                        elapsed_time[timer_id] = 0;
                        timerLapProcess(timer_id, 'reset-lap');
                        document.getElementById(`timer_${timer_id}`).textContent = controlNowTimer(timer_id, 'change', new Date(-JET_LAG));
                        break;
                }
            }
        });
    }

    /* Timerの制御 */
    function timerControl (timer_id) 
    {
        /* タイマーのスタート時間を決定しているときのタイマーの動き */
        const renderTimerStartTime = timeId => 
        {
            const hour = String(timer_start_time[timer_id].hour).padStart(2, '0');
            const minute = String(timer_start_time[timer_id].minute).padStart(2, '0');
            const second = String(timer_start_time[timer_id].second).padStart(2, '0');
            document.getElementById(`timer_${timer_id}`).textContent = `${hour}:${minute}:${second}.000`;
        }
        /* タイマーのスタート時間の条件を加味した調整 */
        function adjustTimerStartTime (timer_id)
        {
            if (timer_start_time[timer_id].second >= 60) {
                timer_start_time[timer_id].second -= 60;
            }
            if (timer_start_time[timer_id].minute >= 60) {
                timer_start_time[timer_id].minute -= 60;
            }
            if (timer_start_time[timer_id].hour >= 24) {
                timer_start_time[timer_id].hour -= 24;
            }
            if ((timer_start_time[timer_id].hour != 0 || timer_start_time[timer_id].minute != 0) || timer_start_time[timer_id].second != 0) {
                stateManage(timer_id, 'initial');
            }
            else {
                stateManage(timer_id, 'preparing');
            }
        }        

        /* タイマーのスタート時間を決定 */
        function timerStartTime (timer_id)
        {
            document.getElementById(`hour_${timer_id}`).addEventListener('click', () => {
                if (now_mode[timer_id] == 'timer'){
                    timer_start_time[timer_id].hour++;
                    adjustTimerStartTime(timer_id);
                    renderTimerStartTime(timer_id);
                }
            });
            document.getElementById(`minute_${timer_id}`).addEventListener('click', () => {
                if (now_mode[timer_id] == 'timer'){
                    timer_start_time[timer_id].minute++;
                    adjustTimerStartTime(timer_id);
                    renderTimerStartTime(timer_id);
                }
            });
            document.getElementById(`second_${timer_id}`).addEventListener('click', () => {
                if (now_mode[timer_id] == 'timer'){
                    timer_start_time[timer_id].second++;
                    adjustTimerStartTime(timer_id);
                    renderTimerStartTime(timer_id);
                }
            });
        }

        /* カウントダウン(timer) */
        function countDown (timer_id)
        {
            const timer = document.getElementById(`timer_${timer_id}`);
            const [now_timer, NOW_TIMER_VALUE] = controlNowTimer(timer_id, 'get');
            if (NOW_TIMER_VALUE <= 0) {
                stateManage(timer_id, 'stopped');
                clearTimeout(use_timer_id[timer_id]);
                timer.textContent = controlNowTimer(timer_id, 'change', new Date(-JET_LAG));
                timer.classList.add('timer-alarm');
                informationRender(timer_id, INFORMATION_KIND_TEMPLATE.ALARM);
            }
            else {
                timer.textContent = controlNowTimer(timer_id, 'change', now_timer);
                use_timer_id[timer_id] = setTimeout(() => {
                    countDown(timer_id);
                }, 10);
            }
        }

        timerStartTime(timer_id);
        document.getElementById(`start-stop_${timer_id}`).addEventListener('click', () => {
            if (now_mode[timer_id] == 'timer') {
                switch (now_state[timer_id]) {
                    case 'initial':
                    case 'stopped':
                        /* スタート処理 */
                        stateManage(timer_id, 'running');
                        informationRender(timer_id, INFORMATION_KIND_TEMPLATE.START);
                        const aimTime = ((timer_start_time[timer_id].hour * 60 + timer_start_time[timer_id].minute) * 60 + timer_start_time[timer_id].second) * 1000;
                        start_timer[timer_id] = Date.now();
                        aim_timer[timer_id] = start_timer[timer_id] + aimTime;
                        use_timer_id[timer_id] = setTimeout( () => {
                            countDown(timer_id);
                        }, 10);
                        break;
                    case 'running':
                        /* ストップ処理 */
                        stateManage(timer_id, 'stopped');
                        informationRender(timer_id, INFORMATION_KIND_TEMPLATE.STOP);
                        elapsed_time[timer_id] += Date.now() - start_timer[timer_id];
                        clearTimeout(use_timer_id[timer_id]);
                        break;
                }
            }
                
        });

        document.getElementById(`reset-lap_${timer_id}`).addEventListener('click', () => {
            if (now_mode[timer_id] == 'timer') {
                switch (now_state[timer_id]) {
                    /* ラップ処理 */
                    case 'running':
                        timerLapProcess(timer_id, 'get-lap');
                        break;
                    /* リセット処理 */
                    case 'stopped':
                        stateManage(timer_id, 'initial');
                        informationRender(timer_id, INFORMATION_KIND_TEMPLATE.RESET);
                        elapsed_time[timer_id] = 0;
                        timerLapProcess(timer_id, 'reset-lap');
                        document.getElementById(`timer_${timer_id}`).classList.remove('timer-alarm');
                        renderTimerStartTime(timer_id);
                        break;
                }
            }
        });
    }

    /* タイマーの操作 */
    function allTimerControl (timer_id)
    {
        const name_change = document.getElementById(`name-change_${timer_id}`);
        name_change.addEventListener('click', () => {
            if (name_change.textContent == '変更') {
                nameChange(timer_id);
            }
        });
        document.getElementById(`mode-change_${timer_id}`).addEventListener('click', () => {
            modeChange(timer_id);
        });
        document.getElementById(`timer-remove_${timer_id}`).addEventListener('click', () => {
            timerRemove(timer_id);
        });
        document.getElementById(`render-lap_${timer_id}`).addEventListener('click', () => {
            informationRender(timer_id, 'render-lap');
        })

        stopwatchControl(timer_id);
        timerControl(timer_id);
    }

    /* タイマー追加ボタンをクリックした場合 */
    document.getElementById('timer-add').addEventListener('click', () => {
        if (contents.childElementCount < MAX_CONTENTS_NUM) {
            timer_id_source++;
            timerAdd(timer_id_source);
            allTimerControl(timer_id_source);
        }
        else {
            informationRender('All', INFORMATION_KIND_TEMPLATE.TIMER_TOO_MANY)
        }
    });
}