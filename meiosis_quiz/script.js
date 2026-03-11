let quizData;
let current = 0;
let questions = [];
let correctCount = 0;
let answeredCount = 0;

const draggable = document.getElementById('draggable');
const staticInstruction = document.getElementById('static-instruction')
const promptBox = document.getElementById('prompt');
const categoriesContainer = document.getElementById('categories');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const totalDisplay = document.getElementById('total');
const progressBar = document.getElementById('progress-bar');
const continueBtn = document.getElementById('continue-btn');
const finalScreen = document.getElementById('final-screen');
const finalScore = document.getElementById('final-score');
const retryBtn = document.getElementById('retry-btn');

// Load JSON
fetch('questions.json')
    .then(res => res.json())
    .then(data => {
      quizData = data;
      questions = shuffle([...quizData.questions]);
      createCategories();
      loadQuestion();
    })
    .catch(err => console.error('JSON load error:', err));

// Shuffle
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
  return array;
}

// Create dropzones
function createCategories() {
  quizData.categories.forEach(cat => {
    const zone = document.createElement('div');
    zone.className = 'dropzone';
    zone.textContent = cat;
    zone.dataset.category = cat;

    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('dragover');
    });

    zone.addEventListener('drop', () => {
      zone.classList.remove('dragover');
      checkAnswer(cat);
    });

    categoriesContainer.appendChild(zone);
  });
}

// Drag events
draggable.addEventListener('dragstart', () => {
  draggable.classList.add('dragging');
});
draggable.addEventListener('dragend', () => {
  draggable.classList.remove('dragging');
});

// Touch support
draggable.addEventListener('touchstart', () => {
  draggable.classList.add('dragging');
});
document.addEventListener('touchend', e => {
  if (!draggable.classList.contains('dragging')) return;
  const touch = e.changedTouches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);
  if (element && element.classList.contains('dropzone'))
    checkAnswer(element.dataset.category);
  draggable.classList.remove('dragging');
});

// Load question
function loadQuestion() {
  if (current === 0) {
    correctCount = 0;
    answeredCount = 0;
    scoreDisplay.textContent = 0;
    totalDisplay.textContent = 0;
    draggable.style.display = 'flex';
    feedback.style.display = 'block';
  }

  if (current >= questions.length) {
    draggable.style.display = 'none';
    categoriesContainer.style.display = 'none';
    feedback.style.display = 'none';
    continueBtn.style.display = 'none';
    finalScreen.style.display = 'block';
    staticInstruction.style.display = 'none'
    finalScore.textContent =
        `You got ${correctCount} out of ${answeredCount} correct!`;
    progressBar.style.width = '100%';
    return;
  }

  updateProgress();

  const question = questions[current];
  const prompt = question.prompt;
  promptBox.innerHTML = '';

  if (prompt.text) {
    const text = document.createElement('div');
    text.textContent = prompt.text;
    promptBox.appendChild(text);
  }
  if (prompt.image) {
    /* small prompt */
    const instruction = document.createElement('div');
    instruction.textContent =
        prompt.instruction || 'What stage of meiosis does this image depict?';
    instruction.className = 'image-instruction';
    promptBox.appendChild(instruction);
    /* image */
    const img = document.createElement('img');
    img.src = prompt.image;
    img.className = 'quiz-image';
    promptBox.appendChild(img);
  }
  draggable.setAttribute('draggable', 'true');
}

// Update progress
function updateProgress() {
  const percent = (current / questions.length) * 100;
  progressBar.style.width = percent + '%';
}

// Check answer
function checkAnswer(category) {
  const correct = questions[current].answer;
  document.querySelectorAll('.dropzone')
      .forEach(z => z.classList.remove('correct', 'incorrect'));
  feedback.classList.remove('show');

  answeredCount++;

  if (category === correct) {
    correctCount++;
    feedback.textContent = 'Correct!';
    document.querySelector(`[data-category="${category}"]`)
        .classList.add('correct');
  } else {
    feedback.textContent = 'Wrong!\nCorrect Answer: ' + correct;
    document.querySelector(`[data-category="${category}"]`)
        .classList.add('incorrect');
  }

  scoreDisplay.textContent = correctCount;
  totalDisplay.textContent = answeredCount;

  feedback.classList.add('show');

  continueBtn.style.display = 'inline-block';
  draggable.setAttribute('draggable', 'false');
}

// Continue button
continueBtn.addEventListener('click', () => {
  current++;
  loadQuestion();
  feedback.textContent = '';
  feedback.classList.remove('show');
  continueBtn.style.display = 'none';
  document.querySelectorAll('.dropzone')
      .forEach(z => z.classList.remove('correct', 'incorrect'));
});

// Retry button
retryBtn.addEventListener('click', () => {
  current = 0;
  correctCount = 0;
  answeredCount = 0;
  finalScreen.style.display = 'none';
  draggable.style.display = 'flex';
  categoriesContainer.style.display = 'flex'
  staticInstruction.style.display = 'block'
  feedback.style.display = 'block';
  scoreDisplay.textContent = '0';
  totalDisplay.textContent = '0';
  questions = shuffle([...quizData.questions]);
  loadQuestion();
});