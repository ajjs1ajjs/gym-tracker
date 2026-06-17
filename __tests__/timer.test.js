/**
 * Timer tests — module-level state testing
 * Timer functions mutate module-scoped variables
 */

describe("Timer state transitions", () => {
  let startBtn, pauseBtn, timerDisplay, headerBtn, timer;

  function mockDocGet(id) {
    if (id === "timer-start-btn") return startBtn;
    if (id === "timer-pause-btn") return pauseBtn;
    if (id === "timer-display") return timerDisplay;
    if (id === "header-timer-btn") return headerBtn;
    return null;
  }

  beforeEach(async () => {
    jest.useFakeTimers();
    jest.spyOn(global, "setInterval");
    jest.spyOn(global, "clearInterval");
    jest.spyOn(Date, "now").mockReturnValue(1000000);

    startBtn = { style: { display: "inline-block" } };
    pauseBtn = { style: { display: "none" } };
    timerDisplay = { textContent: "" };
    headerBtn = { textContent: "" };

    document.getElementById = mockDocGet;

    timer = await import("../src/timer.js");
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test("imports timer functions", () => {
    expect(timer.setTimer).toBeDefined();
    expect(timer.startTimer).toBeDefined();
    expect(timer.pauseTimer).toBeDefined();
    expect(timer.resetTimer).toBeDefined();
    expect(timer.updateTimerDisplay).toBeDefined();
  });

  test("timer display format is MM:SS", () => {
    timer.setTimer(125, { target: { classList: { remove() {}, add() {} } } });
    timer.updateTimerDisplay();
    expect(timerDisplay.textContent).toBe("02:05");
  });

  test("timer displays 00:00 for zero seconds", () => {
    timer.setTimer(0, { target: { classList: { remove() {}, add() {} } } });
    timer.updateTimerDisplay();
    expect(timerDisplay.textContent).toBe("00:00");
  });

  test("startTimer creates interval", () => {
    timer.setTimer(90, { target: { classList: { remove() {}, add() {} } } });
    timer.startTimer();

    expect(setInterval).toHaveBeenCalled();
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 200);
    expect(startBtn.style.display).toBe("none");
    expect(pauseBtn.style.display).toBe("inline-block");
  });

  test("pauseTimer clears interval and shows start button", () => {
    timer.setTimer(30, { target: { classList: { remove() {}, add() {} } } });
    timer.startTimer();
    timer.pauseTimer();

    expect(clearInterval).toHaveBeenCalled();
    expect(startBtn.style.display).toBe("inline-block");
    expect(pauseBtn.style.display).toBe("none");
  });

  test("resetTimer resets to default and shows start button", () => {
    timer.setTimer(120, { target: { classList: { remove() {}, add() {} } } });
    timer.startTimer();
    timer.resetTimer();

    expect(clearInterval).toHaveBeenCalled();
    expect(timerDisplay.textContent).toBe("02:00");
    expect(startBtn.style.display).toBe("inline-block");
    expect(pauseBtn.style.display).toBe("none");
  });

  test("setTimer updates display and marks active button", () => {
    const btn = { classList: { remove: jest.fn(), add: jest.fn() } };
    timer.setTimer(60, { target: btn });
    timer.updateTimerDisplay();
    expect(timerDisplay.textContent).toBe("01:00");
    expect(btn.classList.add).toHaveBeenCalledWith("active");
  });
});
