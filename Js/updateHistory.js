"use strict";

// 更新履歴をJavaScriptで操作
{
  const addContent = (day, content) => {
    const update_history_contents = document.getElementById(
      "update-history-contents"
    );
    const update_history_content_li = document.createElement("li");
    update_history_content_li.classList.add("update-history-content-li");
    const update_history_content_frame = document.createElement("dl");
    update_history_content_frame.id = `update-history-content-frame-${update_history_contents.childElementCount}`;
    update_history_content_frame.classList.add("update-history-content-frame");

    // 更新日
    const update_history_day = document.createElement("dt");
    update_history_day.classList.add("update-history-day");
    update_history_day.textContent = `${day.year}.${day.month}.${day.date}`;
    update_history_content_frame.appendChild(update_history_day);

    // 更新内容
    const update_history_content = document.createElement("dd");
    update_history_content.classList.add("update-history-content");
    const update_history_content_pre = document.createElement("pre");
    update_history_content_pre.textContent = `${content}`;
    update_history_content.appendChild(update_history_content_pre);
    update_history_content_frame.appendChild(update_history_content);

    update_history_content_li.appendChild(update_history_content_frame);
    if (update_history_contents.childElementCount >= 1) {
      update_history_contents.insertBefore(
        update_history_content_li,
        update_history_contents.firstChild
      );
    } else {
      update_history_contents.appendChild(update_history_content_li);
    }
  };

  // 2020.9/4
  addContent(
    {
      year: 2020,
      month: 9,
      date: 4,
    },
    "Webページ「JPig」を公開しました."
  );

  // 2020.9/20
  addContent(
    {
      year: 2020,
      month: 9,
      date: 20,
    },
    "Contentsに複数タイマー追加しました."
  );

  // 2020.9/24
  addContent(
    {
      year: 2020,
      month: 9,
      date: 24,
    },
    "デザインを変更しました.\nカレンダーと世界時計を追加しました."
  );

  // 2020.10/11
  addContent(
    {
      year: 2020,
      month: 10,
      date: 11,
    },
    "Homeページを中心にデザインを変更しました.\nコードを少し整理しました."
  );

  // 2020.10/14
  addContent(
    {
      year: 2020,
      month: 10,
      date: 14,
    },
    "デザインをシンプルにしました.\nレスポンスデザインに対応しました."
  );

  // 2020.11/2
  addContent(
    {
      year: 2020,
      month: 11,
      date: 2,
    },
    "デザインを新しくして, よりシンプルにしました.\nContentsにタイピングゲームとToDoリストを追加しました.\n※デザインを新しくしたため, レスポンスデザインに対応していません."
  );

  // 2020.12/23
  addContent(
    {
      year: 2020,
      month: 12,
      date: 23,
    },
    "プロフィールを変更しました."
  );

  // 2021.1/2
  addContent(
    {
      year: 2021,
      month: 1,
      date: 2,
    },
    "ContentsにCalculator-tsを追加しました."
  );
}
