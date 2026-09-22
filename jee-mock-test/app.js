/* =====================================================
   JEE MOCK TEST - VERSION 1
   Vanilla JavaScript
   ===================================================== */


/* ================= GLOBAL VARIABLES ================= */

let questions = [];
let currentQuestion = 0;

let totalSeconds = 180 * 60;
let remainingSeconds = totalSeconds;

let timerInterval = null;

let questionStartTime = null;
let lastQuestionTime = null;

let testStarted = false;
let testSubmitted = false;

let testTitle = "JEE Mock Test";


/* ================= DOM ELEMENTS ================= */

const importScreen = document.getElementById("importScreen");
const testScreen = document.getElementById("testScreen");
const resultScreen = document.getElementById("resultScreen");

const questionInput = document.getElementById("questionInput");
const loadTestBtn = document.getElementById("loadTestBtn");
const importError = document.getElementById("importError");

const durationSelect = document.getElementById("duration");
const testTitleInput = document.getElementById("testTitle");

const testTitleDisplay = document.getElementById("testTitleDisplay");

const timerElement = document.getElementById("timer");

const questionNumber = document.getElementById("questionNumber");
const questionStatus = document.getElementById("questionStatus");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");

const previousBtn = document.getElementById("previousBtn");
const nextBtn = document.getElementById("nextBtn");

const clearBtn = document.getElementById("clearBtn");
const reviewBtn = document.getElementById("reviewBtn");

const questionPalette = document.getElementById("questionPalette");

const submitBtn = document.getElementById("submitBtn");

const resultTestTitle = document.getElementById("resultTestTitle");
const totalMarks = document.getElementById("totalMarks");
const maximumMarks = document.getElementById("maximumMarks");

const correctCount = document.getElementById("correctCount");
const wrongCount = document.getElementById("wrongCount");
const notAttemptedCount = document.getElementById("notAttemptedCount");

const resultTable = document.getElementById("resultTable");

const copyResultBtn = document.getElementById("copyResultBtn");
const newTestBtn = document.getElementById("newTestBtn");
const copyMessage = document.getElementById("copyMessage");


/* ================= QUESTION FORMAT =================

[MCQ]
Question: What is 2 + 2?
A: 3
B: 4
C: 5
D: 6
Answer: B

====================================================== */


/* ================= PARSER ================= */

function parseQuestions(text) {

    const blocks = text
        .split(/\[MCQ\]/i)
        .map(block => block.trim())
        .filter(block => block.length > 0);

    const parsedQuestions = [];

    for (let i = 0; i < blocks.length; i++) {

        const block = blocks[i];

        const questionMatch =
            block.match(/Question\s*:\s*([\s\S]*?)(?=\nA\s*:)/i);

        const optionAMatch =
            block.match(/\nA\s*:\s*([\s\S]*?)(?=\nB\s*:)/i);

        const optionBMatch =
            block.match(/\nB\s*:\s*([\s\S]*?)(?=\nC\s*:)/i);

        const optionCMatch =
            block.match(/\nC\s*:\s*([\s\S]*?)(?=\nD\s*:)/i);

        const optionDMatch =
            block.match(/\nD\s*:\s*([\s\S]*?)(?=\nAnswer\s*:)/i);

        const answerMatch =
            block.match(/\nAnswer\s*:\s*([ABCD])/i);


        if (
            !questionMatch ||
            !optionAMatch ||
            !optionBMatch ||
            !optionCMatch ||
            !optionDMatch ||
            !answerMatch
        ) {
            continue;
        }


        const question = {

            id: i + 1,

            text: questionMatch[1].trim(),

            options: [
                optionAMatch[1].trim(),
                optionBMatch[1].trim(),
                optionCMatch[1].trim(),
                optionDMatch[1].trim()
            ],

            correctAnswer:
                answerMatch[1].trim().toUpperCase(),

            selectedAnswer: null,

            markedForReview: false,

            timeSpent: 0,

            lastVisited: 0
        };


        parsedQuestions.push(question);
    }


    return parsedQuestions;
}


/* ================= LOAD TEST ================= */

loadTestBtn.addEventListener("click", () => {

    importError.textContent = "";

    const text = questionInput.value.trim();

    if (!text) {

        importError.textContent =
            "Please paste your question paper first.";

        return;
    }


    const parsed = parseQuestions(text);


    if (parsed.length === 0) {

        importError.textContent =
            "No valid questions were found. Please check the format.";

        return;
    }


    questions = parsed;

    testTitle =
        testTitleInput.value.trim() ||
        "JEE Mock Test";


    const selectedMinutes =
        Number(durationSelect.value);

    totalSeconds = selectedMinutes * 60;

    remainingSeconds = totalSeconds;


    currentQuestion = 0;

    testStarted = true;

    testSubmitted = false;


    importScreen.classList.add("hidden");

    resultScreen.classList.add("hidden");

    testScreen.classList.remove("hidden");


    testTitleDisplay.textContent = testTitle;


    startTimer();

    startQuestionTimer();

    renderPalette();

    renderQuestion();

});


/* ================= TIMER ================= */

function startTimer() {

    clearInterval(timerInterval);

    updateTimerDisplay();


    timerInterval = setInterval(() => {

        if (remainingSeconds <= 0) {

            remainingSeconds = 0;

            updateTimerDisplay();

            clearInterval(timerInterval);

            submitTest(true);

            return;
        }


        remainingSeconds--;

        updateTimerDisplay();

    }, 1000);
}


/* ================= TIMER DISPLAY ================= */

function updateTimerDisplay() {

    const hours =
        Math.floor(remainingSeconds / 3600);

    const minutes =
        Math.floor((remainingSeconds % 3600) / 60);

    const seconds =
        remainingSeconds % 60;


    const formatted =
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");


    timerElement.textContent = formatted;


    if (remainingSeconds <= 300) {

        timerElement.classList.add("warning");

    } else {

        timerElement.classList.remove("warning");
    }
}


/* ================= QUESTION TIMING ================= */

function startQuestionTimer() {

    questionStartTime = Date.now();

    lastQuestionTime = questionStartTime;
}


function saveCurrentQuestionTime() {

    if (!testStarted || testSubmitted) {
        return;
    }


    if (lastQuestionTime === null) {
        lastQuestionTime = Date.now();
        return;
    }


    const now = Date.now();

    const elapsed =
        Math.floor((now - lastQuestionTime) / 1000);


    if (elapsed > 0) {

        questions[currentQuestion].timeSpent += elapsed;
    }


    lastQuestionTime = now;
}


/* ================= RENDER QUESTION ================= */

function renderQuestion() {

    if (questions.length === 0) {
        return;
    }


    const q = questions[currentQuestion];


    questionNumber.textContent =
        "Question " + (currentQuestion + 1);


    questionText.textContent = q.text;


    optionsContainer.innerHTML = "";


    const optionLetters = ["A", "B", "C", "D"];


    for (let i = 0; i < 4; i++) {

        const button =
            document.createElement("button");

        button.className = "option";


        if (q.selectedAnswer === optionLetters[i]) {

            button.classList.add("selected");
        }


        button.textContent =
            optionLetters[i] +
            ". " +
            q.options[i];


        button.addEventListener("click", () => {

            selectAnswer(optionLetters[i]);

        });


        optionsContainer.appendChild(button);
    }


    updateQuestionStatus();

    updateNavigationButtons();

    updatePalette();
}


/* ================= SELECT ANSWER ================= */

function selectAnswer(answer) {

    saveCurrentQuestionTime();


    questions[currentQuestion].selectedAnswer =
        answer;


    renderQuestion();
}


/* ================= CLEAR ANSWER ================= */

clearBtn.addEventListener("click", () => {

    saveCurrentQuestionTime();

    questions[currentQuestion].selectedAnswer = null;

    renderQuestion();

});


/* ================= MARK REVIEW ================= */

reviewBtn.addEventListener("click", () => {

    saveCurrentQuestionTime();

    questions[currentQuestion].markedForReview =
        !questions[currentQuestion].markedForReview;

    renderQuestion();

});


/* ================= NEXT ================= */

nextBtn.addEventListener("click", () => {

    saveCurrentQuestionTime();


    if (currentQuestion < questions.length - 1) {

        currentQuestion++;

        lastQuestionTime = Date.now();

        renderQuestion();

    }

});


/* ================= PREVIOUS ================= */

previousBtn.addEventListener("click", () => {

    saveCurrentQuestionTime();


    if (currentQuestion > 0) {

        currentQuestion--;

        lastQuestionTime = Date.now();

        renderQuestion();

    }

});


/* ================= NAVIGATION BUTTONS ================= */

function updateNavigationButtons() {

    previousBtn.disabled =
        currentQuestion === 0;

    nextBtn.disabled =
        currentQuestion === questions.length - 1;
}


/* ================= QUESTION STATUS ================= */

function updateQuestionStatus() {

    const q = questions[currentQuestion];


    if (q.selectedAnswer) {

        if (q.markedForReview) {

            questionStatus.textContent =
                "Answered + Review";

        } else {

            questionStatus.textContent =
                "Answered";
        }

    } else if (q.markedForReview) {

        questionStatus.textContent =
            "Marked for Review";

    } else {

        questionStatus.textContent =
            "Not Attempted";
    }
}


/* ================= QUESTION PALETTE ================= */

function renderPalette() {

    questionPalette.innerHTML = "";


    questions.forEach((q, index) => {

        const button =
            document.createElement("button");


        button.className =
            "question-number-btn";


        button.textContent =
            index + 1;


        button.addEventListener("click", () => {

            saveCurrentQuestionTime();

            currentQuestion = index;

            lastQuestionTime = Date.now();

            renderQuestion();

        });


        questionPalette.appendChild(button);

    });


    updatePalette();
}


/* ================= UPDATE PALETTE ================= */

function updatePalette() {

    const buttons =
        questionPalette.querySelectorAll(
            ".question-number-btn"
        );


    buttons.forEach((button, index) => {

        const q = questions[index];


        button.classList.remove(
            "answered",
            "review",
            "current"
        );


        if (q.selectedAnswer) {

            button.classList.add("answered");

        }


        if (q.markedForReview) {

            button.classList.add("review");

        }


        if (index === currentQuestion) {

            button.classList.add("current");

        }

    });
}


/* ================= SUBMIT TEST ================= */

submitBtn.addEventListener("click", () => {

    const unanswered =
        questions.filter(
            q => !q.selectedAnswer
        ).length;


    const message =
        unanswered > 0
            ? `You have ${unanswered} unanswered question(s). Submit anyway?`
            : "Submit the test?";


    if (confirm(message)) {

        submitTest(false);
    }

});


/* ================= CALCULATE RESULT ================= */

function submitTest(autoSubmit = false) {

    if (testSubmitted) {
        return;
    }


    saveCurrentQuestionTime();


    testSubmitted = true;

    testStarted = false;


    clearInterval(timerInterval);


    let correct = 0;
    let wrong = 0;
    let notAttempted = 0;


    questions.forEach(q => {

        if (!q.selectedAnswer) {

            notAttempted++;

        } else if (
            q.selectedAnswer === q.correctAnswer
        ) {

            correct++;

        } else {

            wrong++;
        }

    });


    /*
       V1 scoring:
       Correct = +4
       Wrong = -1
       Not Attempted = 0
    */

    const marks =
        correct * 4 -
        wrong;


    showResult(
        correct,
        wrong,
        notAttempted,
        marks,
        autoSubmit
    );

}


/* ================= SHOW RESULT ================= */

function showResult(
    correct,
    wrong,
    notAttempted,
    marks,
    autoSubmit
) {

    testScreen.classList.add("hidden");

    resultScreen.classList.remove("hidden");


    resultTestTitle.textContent =
        testTitle;


    totalMarks.textContent =
        marks;


    maximumMarks.textContent =
        questions.length * 4;


    correctCount.textContent =
        correct;


    wrongCount.textContent =
        wrong;


    notAttemptedCount.textContent =
        notAttempted;


    resultTable.innerHTML = "";


    questions.forEach((q, index) => {

        let status = "Not Attempted";


        if (q.selectedAnswer) {

            if (
                q.selectedAnswer ===
                q.correctAnswer
            ) {

                status = "Correct";

            } else {

                status = "Wrong";
            }
        }


        const row =
            document.createElement("tr");


        const questionCell =
            document.createElement("td");


        const statusCell =
            document.createElement("td");


        const timeCell =
            document.createElement("td");


        questionCell.textContent =
            "Q" + (index + 1);


        statusCell.textContent =
            status;


        timeCell.textContent =
            formatTime(q.timeSpent);


        row.appendChild(questionCell);

        row.appendChild(statusCell);

        row.appendChild(timeCell);


        resultTable.appendChild(row);

    });


    if (autoSubmit) {

        copyMessage.textContent =
            "Time ended. Test submitted automatically.";

    } else {

        copyMessage.textContent = "";
    }
}


/* ================= FORMAT TIME ================= */

function formatTime(totalSeconds) {

    const minutes =
        Math.floor(totalSeconds / 60);

    const seconds =
        totalSeconds % 60;


    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
    );
}


/* ================= COPY RESULT ================= */

copyResultBtn.addEventListener("click", async () => {

    let correct = 0;
    let wrong = 0;
    let notAttempted = 0;


    questions.forEach(q => {

        if (!q.selectedAnswer) {

            notAttempted++;

        } else if (
            q.selectedAnswer === q.correctAnswer
        ) {

            correct++;

        } else {

            wrong++;
        }

    });


    const marks =
        correct * 4 - wrong;


    let output = "";

    output += "JEE MOCK TEST RESULT\n";
    output += "====================\n\n";

    output += "Test: " + testTitle + "\n\n";

    output +=
        "Total Marks: " +
        marks +
        "/" +
        (questions.length * 4) +
        "\n\n";

    output +=
        "Correct: " +
        correct +
        "\n";

    output +=
        "Wrong: " +
        wrong +
        "\n";

    output +=
        "Not Attempted: " +
        notAttempted +
        "\n\n";


    output += "Question-wise data:\n\n";


    questions.forEach((q, index) => {

        let status = "Not Attempted";


        if (q.selectedAnswer) {

            if (
                q.selectedAnswer ===
                q.correctAnswer
            ) {

                status = "Correct";

            } else {

                status = "Wrong";
            }
        }


        output +=
            "Q" +
            (index + 1) +
            " - " +
            status +
            " - " +
            formatTime(q.timeSpent) +
            "\n";

    });


    try {

        await navigator.clipboard.writeText(output);

        copyMessage.textContent =
            "Result copied! You can now paste it into ChatGPT or Gemini.";

    } catch (error) {

        copyMessage.textContent =
            "Copy failed. Please copy the result manually.";

        console.error(error);
    }

});


/* ================= NEW TEST ================= */

newTestBtn.addEventListener("click", () => {

    clearInterval(timerInterval);


    questions = [];

    currentQuestion = 0;

    testStarted = false;

    testSubmitted = false;


    resultScreen.classList.add("hidden");

    testScreen.classList.add("hidden");

    importScreen.classList.remove("hidden");


    copyMessage.textContent = "";

    importError.textContent = "";

});