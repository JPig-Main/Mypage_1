"use strict";

{
  const words_kind = [
    "red",
    "blue",
    "green",
    "yellow",
    "black",
    "white",
    "orange",
    "purple",
    "brown",
    "pink",
    "lemon",
    "peach",
    "apple",
    "banana",
    "melon",
    "grape",
    "river",
    "sea",
    "hill",
    "lake",
    "forest",
    "mountain",
    "city",
    "town",
    "village",
    "desk",
    "chair",
    "bed",
    "dining",
    "door",
    "floor",
    "kitchen",
    "knife",
    "shelf",
    "english",
    "japanese",
    "math",
    "science",
    "history",
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
    "spring",
    "summer",
    "fall",
    "winter",
    // 'use strict',
    // 'const',
    // 'let',
    // 'console.log',
    // 'function',
    // 'for',
    // 'switch',
    // 'while',
    // 'break',
    // 'case',
    // 'continue',
    // 'default',
    // 'src',
    // 'parseInt',
    // 'length',
    // 'unshift',
    // 'shift',
    // 'push',
    // 'pop',
    // 'splice',
    // 'forEach',
    // 'every',
    // 'some',
    // 'filter',
    // 'includes',
    // 'indexOf',
    // 'slice',
    // 'concat',
    // 'find',
    // 'flat',
    // 'map',
    // 'flatMap',
    // 'set',
    // 'delete',
    // 'Object.keys',
    // 'split',
    // 'join',
    // 'substring',
    // 'Date',
    // 'Date.now',
    // 'alert',
    // 'confirm',
    // 'prompt',
    // 'setTimeout',
    // 'clearTimeout',
    // 'setInterval',
    // 'clearInterval',
    // 'try',
    // 'catch',
    // 'throw',
    // 'finally',
    // 'message',
    // 'typeof',
    // 'instanceof',
    // 'class',
    // 'extends',
    // 'constructor',
    // 'super',
    // 'async',
    // 'this',
    // 'await',
    // 'type',
  ];
  const words = [];

  let word;
  let location = 0;

  const STATUS_TEMPLATE = {
    INIT: "init",
    READY: "ready",
    START: "start",
    FINISH: "finish",
  };
  let status = STATUS_TEMPLATE.INIT;

  let start_time;
  let mistake_count;
  const word_typing_num = 20;
  let rest_word_num;

  /* 要素の取得 */
  const target = document.getElementById("target");
  const elapsed_time_render = document.getElementById("elapsed-time-render");
  const rest_word_num_render = document.getElementById("rest-word-num-render");
  const mistake_render = document.getElementById("mistake-render");
  const result = document.getElementById("result");

  /* 単語をセット */
  function setWord() {
    word = words[Math.floor(Math.random() * words.length)];
    target.textContent = word;
    location = 0;
  }

  /* 1ゲームの準備 */
  function oneGamePrepare() {
    /* 単語を準備する */
    words.splice(0, words.length, ...words_kind);
    setWord();

    /* ミスタッチをクリアする */
    mistake_count = 0;
    rest_word_num = word_typing_num;

    /* 下部分の表示を準備する */
    renderElapsedTime(0);
    rest_word_num_render.textContent = `残り単語数: ${word_typing_num}`;
    mistake_render.textContent = `ミスタッチ: ${mistake_count}`;
    result.textContent = "単語の頭文字から打っていってください。";

    /* ステータスを準備完了にする */
    status = STATUS_TEMPLATE.READY;
  }

  /* 経過時間の表示
        ・引数: <int manual_time> 手動の場合の経過時間。自動の場合はnull(初期値)
    */
  function renderElapsedTime(manual_time = null) {
    let minute;
    let second;
    let millisecond;

    /* 経過時間を決定する */
    // 手動で決定する場合
    if (manual_time !== null) {
      minute = String(manual_time / 60000).padStart(2, "0");
      second = String((manual_time / 1000) % 60).padStart(2, "0");
      millisecond = String(manual_time % 1000).padStart(2, "0");
    }
    // 自動で決定する場合
    else {
      const elapsed_time = new Date(Date.now() - start_time);
      minute = String(elapsed_time.getMinutes()).padStart(2, "0");
      second = String(elapsed_time.getSeconds()).padStart(2, "0");
      millisecond = String(elapsed_time.getMilliseconds()).padStart(3, "0");
    }

    /* 経過時間を表示する */
    elapsed_time_render.textContent = `経過時間: ${minute}:${second}.${millisecond}`;
  }

  /* 一定時間で表示する処理 */
  function renderByRegularTime() {
    /*  */
    if (status === STATUS_TEMPLATE.FINISH) {
      return;
    }

    renderElapsedTime();
    rest_word_num_render.textContent = `残り単語数: ${rest_word_num}`;

    setTimeout(() => {
      renderByRegularTime();
    }, 10);
  }

  oneGamePrepare();

  document.addEventListener("keydown", (e) => {
    /* 開始していない場合 */
    if (status === STATUS_TEMPLATE.READY) {
      /* 開始しない場合 */
      if (e.key !== word[location]) {
        return;
      }

      /* 開始前の処理 */
      result.textContent = "";
      status = STATUS_TEMPLATE.START;
      renderByRegularTime();
      start_time = Date.now();
    }

    /* 終了している場合 */
    if (status === STATUS_TEMPLATE.FINISH) {
      /* リセット処理しない場合 */
      if (e.key !== "Enter") {
        return;
      }

      /* リセット処理 */
      oneGamePrepare();

      return;
    }

    /* ミスタッチをした場合 */
    if (e.key !== word[location]) {
      if (e.key === "Shift") {
        return;
      }
      /* ミスタッチをした場合の処理 */
      if (!target.classList.contains("mistake")) {
        target.classList.add("mistake");
      }

      mistake_count++;

      mistake_render.textContent = `ミスタッチ: ${mistake_count}`;
      return;
    }

    /* 正常に入力された場合の処理 */
    location++;
    target.textContent = "_".repeat(location) + word.substring(location);
    if (target.classList.contains("mistake")) {
      target.classList.remove("mistake");
    }

    /* 1単語を打ち終わっていない場合 */
    if (location !== word.length) {
      return;
    }

    /* 1単語を打ち終わった場合の処理 */
    rest_word_num--;
    setWord();

    /* 全ての単語を打ち終わっていない場合 */
    if (rest_word_num > 0) {
      return;
    }

    /* 全ての単語を打ち終わった場合の処理 */
    status = STATUS_TEMPLATE.FINISH;
    renderElapsedTime();
    target.textContent = "";
    rest_word_num_render.textContent = `残り単語数: ${rest_word_num}`;
    mistake_render.textContent = `ミスタッチ: ${mistake_count}`;
    result.textContent =
      "終了しました\nもう一度やるにはエンターキーを押して下さい。";
  });
}
