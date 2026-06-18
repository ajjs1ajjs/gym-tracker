import { t } from "../i18n.js";
import { completionState, completionArchive } from "../data.js";
import { getDateKey } from "../utils.js";
import type { CompletionEntry } from "../types.js";

function renderHeatmap(): void {
  const container = document.getElementById("activity-heatmap");
  if (!container) return;

  const activity: Record<string, number> = {};

  Object.values(completionState).forEach((val: CompletionEntry) => {
    if (val.date) {
      const d = getDateKey(new Date(val.date));
      activity[d] = (activity[d] || 0) + 1;
    }
  });

  Object.keys(completionArchive).forEach((dateStr) => {
    const d = getDateKey(new Date(dateStr));
    const completedExercises = Object.values(completionArchive[dateStr]);
    activity[d] =
      (activity[d] || 0) +
      completedExercises.filter((val) => val.completed).length;
  });

  const now = new Date();
  const ukLocale = new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  container.textContent = "";
  const fragment = document.createDocumentFragment();

  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const dayStr = getDateKey(d);
    const count = activity[dayStr] || 0;
    let level = 0;
    if (count > 0) level = 1;
    if (count > 3) level = 2;
    if (count > 6) level = 3;
    if (count > 9) level = 4;

    const el = document.createElement("div");
    el.className = `heatmap-day level-${level}`;
    el.title = `${ukLocale.format(d)}: ${count} ${t('history.exercises_label')}`;
    fragment.appendChild(el);
  }

  container.appendChild(fragment);
}

export { renderHeatmap };
