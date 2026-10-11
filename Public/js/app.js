
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

/* CodeQuest AI: Python runner addition */
(() => {
    const editor = document.querySelector("#code");
    if (!editor) {
        console.warn("Python runner: code editor #code was not found.");
        return;
    }

    // Add the runner controls without replacing the existing page.
    if (document.querySelector("#cq-python-runner")) return;

    const runner = document.createElement("section");
    runner.id = "cq-python-runner";
    runner.style.cssText =
        "margin-top:20px;padding:16px;border:1px solid #8b5cf6;border-radius:10px;";

    runner.innerHTML = `
        <button type="button" id="cq-run-python" disabled>
            Loading Python...
        </button>
        <button type="button" id="cq-clear-python">Clear Output</button>
        <h3>Python Output</h3>
        <pre id="cq-python-output" aria-live="polite"
             style="min-height:60px;white-space:pre-wrap;overflow-wrap:anywhere;"></pre>
        <p id="cq-python-status">Preparing Python interpreter...</p>
    `;

    editor.insertAdjacentElement("afterend", runner);

    const runButton = runner.querySelector("#cq-run-python");
    const clearButton = runner.querySelector("#cq-clear-python");
    const output = runner.querySelector("#cq-python-output");
    const status = runner.querySelector("#cq-python-status");

    let pyodide = null;
    let running = false;

    clearButton.addEventListener("click", () => {
        output.textContent = "";
        status.textContent = "Output cleared.";
    });

    runButton.addEventListener("click", async () => {
        if (!pyodide || running) return;

        running = true;
        runButton.disabled = true;
        output.textContent = "";
        status.textContent = "Running Python...";

        try {
            // Capture print() output from Python.
            pyodide.setStdout({
                batched: text => {
                    output.textContent += text + "\n";
                }
            });

            await pyodide.runPythonAsync(editor.value);

            if (!output.textContent) {
                output.textContent = "Code executed successfully (no output).";
            }
            status.textContent = "Execution finished.";
        } catch (error) {
            output.textContent += String(error);
            status.textContent = "Python execution failed.";
        } finally {
            running = false;
            runButton.disabled = false;
        }
    });

    async function loadPython() {
        try {
            if (typeof loadPyodide !== "function") {
                throw new Error("Pyodide script did not load. Check your internet connection.");
            }

            pyodide = await loadPyodide();
            runButton.disabled = false;
            runButton.textContent = "▶ Run Python";
            status.textContent = "Python interpreter ready.";
        } catch (error) {
            status.textContent = error.message;
            console.error("Python runner:", error);
        }
    }

    loadPython();
})();
