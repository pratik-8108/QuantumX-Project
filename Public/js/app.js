
const editor = document.getElementById("code");
const response = document.getElementById("response");
const lineCount = document.getElementById("line-count");

const examples = {
    hello: `name = "Coder"\nprint("Hello,", name)`,
    loop: `for i in range(1, 6):\n    print(i)`,
    function: `def greet(name):\n    return "Hello, " + name\n\nprint(greet("Coder"))`,
    bug: `age = input("Enter your age: ")\nif age >= 18:\n    print("You are an adult")`
};

const topics = {
    variables: `name = "Alex"\nage = 18\n\nprint(name)\nprint(age)`,
    conditions: `age = 18\n\nif age >= 18:\n    print("You are an adult")\nelse:\n    print("You are under 18")`,
    loops: `for i in range(1, 6):\n    print("Number:", i)`,
    functions: `def greet(name):\n    print("Hello,", name)\n\ngreet("Alex")`
};

function updateLineCount() {
    const lines = editor.value.split("\n").length;
    lineCount.textContent = `${lines} ${lines === 1 ? "line" : "lines"}`;
}

function showResponse(title, message, items = [], type = "info") {
    response.replaceChildren();

    const avatar = document.createElement("div");
    avatar.className = "mentor-avatar";
    avatar.textContent = type === "error" ? "!" : type === "success" ? "✓" : "✦";

    const kicker = document.createElement("p");
    kicker.className = "response-kicker";
    kicker.textContent = type === "error"
        ? "LET'S FIX THIS"
        : type === "success"
        ? "LOOKING GOOD"
        : "YOUR PYTHON MENTOR";

    const heading = document.createElement("h2");
    heading.textContent = title;

    const description = document.createElement("p");
    description.className = "response-description";
    description.textContent = message;

    response.append(avatar, kicker, heading, description);

    if (items.length > 0) {
        const list = document.createElement("ul");
        list.style.paddingLeft = "20px";
        list.style.color = "#c4bfd8";
        list.style.fontSize = "12px";
        list.style.lineHeight = "1.9";

        items.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li);
        });

        response.appendChild(list);
    }

    const note = document.createElement("div");
    note.className = "welcome-tip";

    const icon = document.createElement("span");
    icon.className = "tip-icon";
    icon.textContent = "💡";

    const noteText = document.createElement("p");
    noteText.className = "response-description";
    noteText.textContent =
        "This mentor uses local rules and does not execute Python code. " +
        "Try your code in a Python interpreter to verify the result.";

    note.append(icon, noteText);
    response.appendChild(note);
}

function debugCode() {
    const code = editor.value;
    const lines = code.split("\n");

    if (!code.trim()) {
        showResponse(
            "Your editor is empty",
            "Write a little Python code first, and I'll help you inspect it."
        );
        return;
    }

    const issues = [];

    if (/\bprint\s+[^(]/.test(code) && !/\bprint\s*\(/.test(code)) {
        issues.push("In Python 3, use print(...) with parentheses.");
    }

    if (/\binput\s*\([^)]*\)\s*(?:[<>=!]=?|>=)\s*\d/.test(code)) {
        issues.push("input() returns text. Convert numeric input with int() or float() before comparing it to a number.");
    }

    if (/^\s*(if|elif|else|for|while|def|class|try|except)\b.*[^:\s]\s*$/m.test(code)) {
        issues.push("Check that statements such as if, for, while, and def end with a colon (:).");
    }

    if (/^\s*(if|elif|else|for|while|def|class|try|except)\b[^:\n]*\n(?!\s|$)/m.test(code)) {
        issues.push("Check indentation after statements that begin a code block.");
    }

    if (/^\s*if\b.*:\s*\n\s*(?:else|elif)\b/m.test(code)) {
        issues.push("Check whether your if block has a body before else or elif.");
    }

    if (/\b(?:if|elif|while)\b[^\n]*\b=\s*[^=]/.test(code)) {
        issues.push("Inside a condition, use == to compare values. A single = assigns a value.");
    }

    if (/^\s*for\s+\w+\s+in\s+range\(\s*\d+\s*\)\s*:/m.test(code)) {
        issues.push("Remember that range(5) produces 0, 1, 2, 3, 4—not 1 through 5.");
    }

    const openCount = (code.match(/[\(\[\{]/g) || []).length;
    const closeCount = (code.match(/[\)\]\}]/g) || []).length;

    if (openCount !== closeCount) {
        issues.push("Check your parentheses, square brackets, and curly braces for a missing or extra character.");
    }

    const quoteCount = (code.match(/"/g) || []).length;
    const singleQuoteCount = (code.match(/'/g) || []).length;

    if (quoteCount % 2 !== 0 || singleQuoteCount % 2 !== 0) {
        issues.push("Check your quotation marks. Strings need matching opening and closing quotes.");
    }

    if (issues.length > 0) {
        showResponse(
            "Let's check these things",
            "I spotted some possible issues. Review these suggestions against your code:",
            [...new Set(issues)],
            "error"
        );
    } else {
        showResponse(
            "No obvious issues spotted",
            "My basic checks did not find a common problem. This does not guarantee that the code is correct.",
            [
                "Check the output you expect.",
                "Try a few different input values.",
                "Run the code with Python to find runtime errors."
            ],
            "success"
        );
    }
}

function explainCode() {
    const code = editor.value.trim();

    if (!code) {
        showResponse("Nothing to explain yet", "Write some Python code in the editor first.");
        return;
    }

    const explanations = [];

    code.split("\n").forEach((line) => {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#")) return;

        if (/^print\s*\(/.test(trimmed)) {
            explanations.push(`"${trimmed}" displays information in the console.`);
        } else if (/^input\s*\(/.test(trimmed) || /=\s*input\s*\(/.test(trimmed)) {
            explanations.push(`"${trimmed}" asks the user for input. The result is text unless converted.`);
        } else if (/^for\s+/.test(trimmed)) {
            explanations.push(`"${trimmed}" begins a for loop, which repeats code for items in a sequence.`);
        } else if (/^while\s+/.test(trimmed)) {
            explanations.push(`"${trimmed}" begins a while loop, which repeats while its condition is true.`);
        } else if (/^if\s+/.test(trimmed)) {
            explanations.push(`"${trimmed}" checks a condition and runs its block when the condition is true.`);
        } else if (/^elif\s+/.test(trimmed)) {
            explanations.push(`"${trimmed}" checks another condition if earlier if/elif conditions were false.`);
        } else if (trimmed === "else:") {
            explanations.push("else: begins a block that runs when the preceding if/elif conditions were false.");
        } else if (/^def\s+/.test(trimmed)) {
            explanations.push(`"${trimmed}" defines a function—a reusable block of code.`);
        } else if (/^return\b/.test(trimmed)) {
            explanations.push(`"${trimmed}" sends a result back from a function.`);
        } else if (/^import\s+/.test(trimmed) || /^from\s+/.test(trimmed)) {
            explanations.push(`"${trimmed}" imports code from a Python module.`);
        } else if (/^\w+\s*=\s*/.test(trimmed)) {
            explanations.push(`"${trimmed}" assigns a value to a variable.`);
        } else {
            explanations.push(`"${trimmed}" is a Python statement or expression. Its exact meaning depends on the surrounding code.`);
        }
    });

    showResponse(
        "Let's break it down",
        "Here is a simple, line-by-line explanation based on common Python patterns:",
        explanations.slice(0, 12)
    );
}

function giveHint() {
    const code = editor.value.trim();

    if (!code) {
        showResponse(
            "Start with one small step",
            "Try writing a variable and displaying it with print()."
        );
        return;
    }

    const hints = [];

    if (/\binput\s*\(/.test(code)) {
        hints.push("Ask yourself: does input() give me text or a number?");
    }

    if (/\b(if|elif|while)\b/.test(code)) {
        hints.push("Check the condition carefully. What happens when it is true, and what happens when it is false?");
    }

    if (/\b(for|while)\b/.test(code)) {
        hints.push("Trace the loop one step at a time. Does the loop stop when you expect?");
    }

    if (/\bdef\s+/.test(code)) {
        hints.push("Check what arguments the function receives and whether it needs to return a value.");
    }

    if (/^\s*#|#/.test(code)) {
        hints.push("Comments beginning with # help explain your reasoning. Write down what you expect each step to do.");
    }

    if (hints.length === 0) {
        hints.push("Identify each variable and the value it holds.");
        hints.push("Predict the output before running the code.");
        hints.push("Try changing one value and observe how the result changes.");
    }

    showResponse(
        "A hint, not the answer",
        "Try investigating these ideas before changing your code:",
        [...new Set(hints)]
    );
}

document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
        const action = button.dataset.action;

        if (action === "debug") debugCode();
        if (action === "explain") explainCode();
        if (action === "hint") giveHint();
    });
});

document.querySelectorAll("[data-example]").forEach((button) => {
    button.addEventListener("click", () => {
        const example = examples[button.dataset.example];

        if (example) {
            editor.value = example;
            updateLineCount();
            showResponse(
                "Example loaded",
                "The example is in your editor. Choose Debug, Explain, or Hint to explore it."
            );
        }
    });
});

document.querySelectorAll("[data-topic]").forEach((button) => {
    button.addEventListener("click", () => {
        const topic = topics[button.dataset.topic];

        if (topic) {
            editor.value = topic;
            updateLineCount();
            document.querySelector(".workspace").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            showResponse(
                `${button.querySelector(".topic-name").textContent} practice`,
                "A Python example is ready in your editor. Explore it, change it, and use the mentor buttons to learn more."
            );
        }
    });
});

editor.addEventListener("input", updateLineCount);

editor.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
        event.preventDefault();

        const start = editor.selectionStart;
        const end = editor.selectionEnd;

        editor.setRangeText("    ", start, end, "end");
        updateLineCount();
    }
});

updateLineCount();


const quizQuestionsByLevel = {
    easy: [
        {
            question: "1. Which command displays text in Python?",
            options: ["show()", "print()", "display()", "write()"],
            answer: "print()"
        },
        {
            question: "2. Which symbol starts a Python comment?",
            options: ["//", "<!--", "#", "**"],
            answer: "#"
        },
        {
            question: "3. What is the result of 2 + 3?",
            options: ["23", "5", "6", "Error"],
            answer: "5"
        },
        {
            question: "4. Which value is a Boolean?",
            options: ['"Hello"', "25", "True", "3.5"],
            answer: "True"
        },
        {
            question: "5. Which keyword defines a function?",
            options: ["function", "def", "fun", "define"],
            answer: "def"
        }
    ],

    medium: [
        {
            question: "1. What is the output of 10 % 3?",
            options: ["3", "1", "0", "3.33"],
            answer: "1"
        },
        {
            question: "2. What does range(3) produce?",
            options: ["1, 2, 3", "0, 1, 2", "0, 1, 2, 3", "3 only"],
            answer: "0, 1, 2"
        },
        {
            question: "3. What is len([4, 7, 9, 2])?",
            options: ["3", "4", "9", "22"],
            answer: "4"
        },
        {
            question: "4. Which keyword handles an alternative condition?",
            options: ["elseif", "otherwise", "elif", "then"],
            answer: "elif"
        },
        {
            question: "5. What is the output of 3 * 2 ** 2?",
            options: ["36", "12", "18", "24"],
            answer: "12"
        }
    ],

    hard: [
        {
            question: "1. What is the output of [x * 2 for x in range(3)]?",
            options: ["[2, 4, 6]", "[0, 2, 4]", "[0, 1, 2]", "[2, 3, 4]"],
            answer: "[0, 2, 4]"
        },
        {
            question: "2. What does this code print: print([1, 2, 3][1])?",
            options: ["1", "2", "3", "Error"],
            answer: "2"
        },
        {
            question: "3. What is the result of bool([])?",
            options: ["True", "False", "None", "Error"],
            answer: "False"
        },
        {
            question: "4. What does a function return if it has no return statement?",
            options: ["0", "False", "None", "An empty string"],
            answer: "None"
        },
        {
            question: "5. What is the output of 'Python'[1:4]?",
            options: ["Pyt", "yth", "tho", "ytho"],
            answer: "yth"
        }
    ]
};

let currentQuestions = quizQuestionsByLevel.easy;
let currentLevel = "easy";


let quizIndex = 0;
let quizScore = 0;
let quizStarted = false;

const questionElement = document.getElementById("quiz-question");
const optionsElement = document.getElementById("quiz-options");
const feedbackElement = document.getElementById("quiz-feedback");
const nextButton = document.getElementById("next-question");
const scoreElement = document.getElementById("quiz-score");

function showQuizQuestion() {
    const current = currentQuestions[quizIndex];


    questionElement.textContent = current.question;
    optionsElement.innerHTML = "";
    feedbackElement.textContent = "";
    nextButton.disabled = true;

    current.options.forEach(function(option) {
        const button = document.createElement("button");
        button.textContent = option;

        button.addEventListener("click", function() {
            if (nextButton.disabled === false) return;

            if (option === current.answer) {
                quizScore++;
                feedbackElement.textContent = "Correct! 🎉";
            } else {
                feedbackElement.textContent =
                    "Not quite! Correct answer: " + current.answer;
            }

            scoreElement.textContent =
                "Score: " + quizScore + " / " + (quizIndex + 1);

            nextButton.disabled = false;

            Array.from(optionsElement.children).forEach(function(btn) {
                btn.disabled = true;
            });
        });

        optionsElement.appendChild(button);
    });

    nextButton.textContent =
        quizIndex === currentQuestions.length - 1
            ? "See Results"
            : "Next Question";
}

if (nextButton && questionElement && optionsElement &&
    feedbackElement && scoreElement) {

    nextButton.addEventListener("click", function() {
        if (!quizStarted) {
            quizStarted = true;
            quizIndex = 0;
            quizScore = 0;
            scoreElement.textContent = "Score: 0 / 0";
            showQuizQuestion();
            return;
        }

        if (nextButton.disabled) return;

        if (quizIndex < currentQuestions.length - 1) {
            quizIndex++;
            showQuizQuestion();
        } else {
            questionElement.textContent =
                "Quiz complete! 🎓 You scored " +
                quizScore + " out of " + currentQuestions.length + ".";

            optionsElement.innerHTML = "";
            feedbackElement.textContent =
                quizScore === currentQuestions.length
                    ? "Perfect score! Excellent work!"
                    : "Keep practising — you're improving!";

            scoreElement.textContent =
                "Final Score: " + quizScore + " / " +
                currentQuestions.length;

            nextButton.textContent = "Play Again";
            nextButton.disabled = false;
            quizStarted = false;
        }
    });
}


const difficultyButtons = document.querySelectorAll("[data-quiz-level]");

difficultyButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        currentLevel = button.dataset.quizLevel;
        currentQuestions = quizQuestionsByLevel[currentLevel];

        quizIndex = 0;
        quizScore = 0;
        quizStarted = true;

        difficultyButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        scoreElement.textContent = "Score: 0 / 0";
        showQuizQuestion();
    });
});

const progressTopButton = document.getElementById("progress-top-button");

if (progressTopButton) {
    progressTopButton.addEventListener("click", function () {
        document.getElementById("progress-tracker")?.scrollIntoView({
            behavior: "smooth"
        });
    });
}

const quizTopButton = document.getElementById("quiz-top-button");

if (quizTopButton) {
    quizTopButton.addEventListener("click", function () {
        document.getElementById("python-quiz")?.scrollIntoView({
            behavior: "smooth"
        });
    });
}

/* ===== CodeQuest AI: Interactive Python Lessons ===== */

(() => {
    const lessons = [
        {
            title: "Introduction to Python",
            explanation: "Python is a beginner-friendly programming language. The print() function displays information on the screen.",
            code: 'print("Hello, World!")',
            output: "Hello, World!",
            tip: "Python uses indentation to organize code blocks."
        },
        {
            title: "Variables",
            explanation: "Variables store information that you can use later in your program.",
            code: 'name = "Alex"\nage = 18\nprint(name)\nprint(age)',
            output: "Alex\n18",
            tip: "Use meaningful names for your variables."
        },
        {
            title: "Data Types",
            explanation: "Python has several data types, including strings (str), integers (int), floating-point numbers (float), and booleans (bool).",
            code: 'name = "Alex"\nage = 18\nheight = 5.8\nis_student = True\nprint(type(age))',
            output: "<class 'int'>",
            tip: "Use type() to find the data type of a value."
        },
        {
            title: "Input and Output",
            explanation: "The input() function accepts user input. The print() function displays information.",
            code: 'name = input("Enter your name: ")\nprint("Hello", name)',
            output: "Enter your name: Alex\nHello Alex",
            tip: "input() returns text, so convert it when you need a number."
        },
        {
            title: "If-Else Conditions",
            explanation: "Conditional statements let your program make decisions based on whether a condition is true or false.",
            code: 'age = 18\nif age >= 18:\n    print("Adult")\nelse:\n    print("Minor")',
            output: "Adult",
            tip: "Remember the colon and indentation after if and else."
        },
        {
            title: "Loops",
            explanation: "Loops repeat instructions. A for loop can iterate over a sequence or a range of numbers.",
            code: 'for i in range(1, 6):\n    print(i)',
            output: "1\n2\n3\n4\n5",
            tip: "range(1, 6) includes 1 but excludes 6."
        },
        {
            title: "Functions",
            explanation: "Functions are reusable blocks of code. Define a function using def and call it by its name.",
            code: 'def greet():\n    print("Hello!")\n\ngreet()',
            output: "Hello!",
            tip: "The indented statements belong to the function."
        },
        {
            title: "Lists",
            explanation: "Lists store multiple items in a single variable. List indexes start at zero.",
            code: 'fruits = ["apple", "banana", "mango"]\nprint(fruits[0])\nprint(len(fruits))',
            output: "apple\n3",
            tip: "Use append() to add an item to a list."
        },
        {
            title: "Python Operators",
            explanation: "Operators perform calculations and comparisons. Examples include +, -, *, /, ==, and >.",
            code: 'a = 10\nb = 3\nprint(a + b)\nprint(a > b)',
            output: "13\nTrue",
            tip: "Use == to compare values and = to assign a value."
        },
        {
            title: "Python Strings",
            explanation: "Strings represent text. You can join strings and use methods such as upper() to change their appearance.",
            code: 'message = "hello"\nprint(message.upper())\nprint(len(message))',
            output: "HELLO\n5",
            tip: "Strings are sequences of characters."
        },
        {
            title: "Python Dictionaries",
            explanation: "Dictionaries store information as key-value pairs. Access a value using its key.",
            code: 'student = {"name": "Alex", "age": 18}\nprint(student["name"])',
            output: "Alex",
            tip: "Dictionary keys must be unique."
        },
        {
            title: "Error Handling",
            explanation: "try and except let you handle certain errors without abruptly stopping your program.",
            code: 'try:\n    number = int("hello")\nexcept ValueError:\n    print("Invalid number")',
            output: "Invalid number",
            tip: "Handle the specific errors your program can reasonably encounter."
        }
    ];

    const lessonsSection = document.getElementById("python-lessons");
    const reader = document.getElementById("lesson-reader");

    if (!lessonsSection || !reader) {
        console.warn("Lesson section or lesson reader was not found.");
        return;
    }

    const title = document.getElementById("reader-title");
    const pageNumber = document.getElementById("reader-page-number");
    const explanation = document.getElementById("reader-explanation");
    const code = document.getElementById("reader-code");
    const output = document.getElementById("reader-output");
    const tip = document.getElementById("reader-tip");
    const backButton = document.getElementById("back-to-lessons");
    const previousButton = document.getElementById("previous-lesson");
    const nextButton = document.getElementById("next-lesson");
    const completeButton = document.getElementById("complete-lesson");
    const completionMessage = document.getElementById("reader-completion-message");
    const completedCount = document.getElementById("lessons-completed-count");

    let currentLesson = 0;
    const storageKey = "codequestCompletedLessons";

    function loadCompletedLessons() {
        try {
            const saved = JSON.parse(localStorage.getItem(storageKey) || "[]");
            return new Set(
                Array.isArray(saved)
                    ? saved.filter(index =>
                        Number.isInteger(index) &&
                        index >= 0 &&
                        index < lessons.length
                    )
                    : []
            );
        } catch {
            return new Set();
        }
    }

    const completedLessons = loadCompletedLessons();

    function saveProgress() {
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify([...completedLessons])
            );
        } catch (error) {
            console.warn("Could not save lesson progress.", error);
        }
    }

    function updateProgress() {
        if (completedCount) {
            completedCount.textContent =
                `${completedLessons.size} / ${lessons.length}`;
        }

        document.querySelectorAll(".lesson-card[data-lesson-index]")
            .forEach(card => {
                const index = Number(card.dataset.lessonIndex);
                const isCompleted = completedLessons.has(index);

                card.classList.toggle("lesson-completed", isCompleted);
                card.setAttribute("aria-label",
                    `${lessons[index]?.title || "Lesson"}${isCompleted ? ", completed" : ""}`
                );

                const badge = card.querySelector(".lesson-status");

                if (badge) {
                    badge.textContent = isCompleted ? "✓ Completed" : "";
                } else if (isCompleted) {
                    const status = document.createElement("span");
                    status.className = "lesson-status";
                    status.textContent = "✓ Completed";
                    card.appendChild(status);
                }
            });
    }

    function renderLesson() {
        const lesson = lessons[currentLesson];

        title.textContent = lesson.title;
        pageNumber.textContent =
            `Lesson ${currentLesson + 1} of ${lessons.length}`;

        explanation.textContent = lesson.explanation;
        code.textContent = lesson.code;
        output.textContent = lesson.output;
        tip.textContent = lesson.tip;

        previousButton.disabled = currentLesson === 0;
        nextButton.disabled = currentLesson === lessons.length - 1;
        nextButton.textContent =
            currentLesson === lessons.length - 1
                ? "Last Lesson"
                : "Next →";

        const isCompleted = completedLessons.has(currentLesson);

        completeButton.textContent = isCompleted
            ? "✓ Lesson Completed"
            : "Mark as Completed ✓";

        completeButton.disabled = isCompleted;

        completionMessage.textContent = isCompleted
            ? "Great work! You have completed this lesson."
            : "";

        updateProgress();
    }

    function openLesson(index) {
        if (index < 0 || index >= lessons.length) return;

        currentLesson = index;
        lessonsSection.hidden = true;
        reader.hidden = false;

        renderLesson();
        
    }

    function showLessons() {
        reader.hidden = true;
        lessonsSection.hidden = false;

        updateProgress();
        lessonsSection.scrollIntoView({ behavior: "smooth" });
    }

    lessonsSection.querySelectorAll(".lesson-card[data-lesson-index]")
        .forEach(card => {
            card.addEventListener("click", () => {
                openLesson(Number(card.dataset.lessonIndex));
            });
        });

    backButton.addEventListener("click", showLessons);

    previousButton.addEventListener("click", () => {
        if (currentLesson > 0) {
            openLesson(currentLesson - 1);
        }
    });

    nextButton.addEventListener("click", () => {
        if (currentLesson < lessons.length - 1) {
            openLesson(currentLesson + 1);
        }
    });

    completeButton.addEventListener("click", () => {
        completedLessons.add(currentLesson);
        saveProgress();
        renderLesson();
    });

    updateProgress();
})();
