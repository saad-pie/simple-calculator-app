class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.overwriteCurrentOperand = true; // Next input should overwrite '0'
    }

    delete() {
        if (this.currentOperand.length === 1 && this.currentOperand !== '0') {
            this.currentOperand = '0';
            this.overwriteCurrentOperand = true; // After deleting last char, '0' is displayed, next input overwrites
        } else if (this.currentOperand !== '0') {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
            if (this.currentOperand === '') this.currentOperand = '0';
            this.overwriteCurrentOperand = false;
        }
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' || this.overwriteCurrentOperand) {
            this.currentOperand = number.toString();
            this.overwriteCurrentOperand = false;
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    appendConstant(constant) {
        if (constant === 'PI') {
            this.currentOperand = Math.PI.toString();
        } else if (constant === 'E') {
            this.currentOperand = Math.E.toString();
        }
        this.overwriteCurrentOperand = true; // Next number typed should overwrite the constant
    }

    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = ''; // Clear for next number input
        this.overwriteCurrentOperand = false; // Next number appended, not overwritten
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+': computation = prev + current; break;
            case '-': computation = prev - current; break;
            case '*': computation = prev * current; break;
            case '/': computation = prev / current; break;
            case '^': computation = Math.pow(prev, current); break; // Power
            case '%': computation = prev % current; break; // Modulo
            default: return;
        }
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.overwriteCurrentOperand = true; // Result is displayed, next number overwrites
    }

    performUnaryScientific(operation) {
        let operand = parseFloat(this.currentOperand);
        if (isNaN(operand)) return;

        let result;
        switch (operation) {
            case 'sin': result = Math.sin(operand * (Math.PI / 180)); break; // Convert degrees to radians
            case 'cos': result = Math.cos(operand * (Math.PI / 180)); break;
            case 'tan': result = Math.tan(operand * (Math.PI / 180)); break;
            case 'sqrt': result = Math.sqrt(operand); break;
            case 'log': result = Math.log10(operand); break; // Base 10 log
            case 'ln': result = Math.log(operand); break; // Natural log
            default: return;
        }
        this.currentOperand = result.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.overwriteCurrentOperand = true; // Result is displayed, next number overwrites
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const scientificUnaryOpButtons = document.querySelectorAll('[data-scientific-unary-op]');
const constantButtons = document.querySelectorAll('[data-constant]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const clearButton = document.querySelector('[data-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.innerText);
        calculator.updateDisplay();
    });
});

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.operation);
        calculator.updateDisplay();
    });
});

scientificUnaryOpButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.performUnaryScientific(button.dataset.scientificUnaryOp);
        calculator.updateDisplay();
    });
});

constantButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendConstant(button.dataset.constant);
        calculator.updateDisplay();
    });
});

equalsButton.addEventListener('click', button => {
    calculator.compute();
    calculator.updateDisplay();
});

clearButton.addEventListener('click', button => {
    calculator.clear();
    calculator.updateDisplay();
});

deleteButton.addEventListener('click', button => {
    calculator.delete();
    calculator.updateDisplay();
});

// Keyboard support
document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        calculator.appendNumber(e.key);
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '%' || e.key === '^') {
        e.preventDefault(); // Prevent default browser behavior for certain keys like '/'
        calculator.chooseOperation(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculator.compute();
    } else if (e.key === 'Backspace') {
        calculator.delete();
    } else if (e.key === 'Escape') {
        calculator.clear();
    } else if (e.key.toUpperCase() === 'P') { // For PI
        calculator.appendConstant('PI');
    } else if (e.key.toUpperCase() === 'E') { // For E
        calculator.appendConstant('E');
    }
    calculator.updateDisplay();
});