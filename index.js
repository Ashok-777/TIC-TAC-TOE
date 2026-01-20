/* © Ashok-777 */
/* GitHub: https://github.com/Ashok-777 */
/* ---------- DOM ---------- */
const landing = document.getElementById('landing');
const startBtn = document.getElementById('startBtn');

const modeScreen = document.getElementById('modeScreen');
const modeSwitch = document.getElementById('modeSwitch');
const startGameBtn = document.getElementById('startGame');
const backToLanding = document.getElementById('backToLanding');
const winSlider = document.getElementById('winSlider');
const winVal = document.getElementById('winVal');
const volumeBtn = document.getElementById('volumeBtn');

const gameScreen = document.getElementById('gameScreen');
const boardEl = document.getElementById('board');
const cellEls = Array.from(document.querySelectorAll('.cell'));
const strikeLeft = document.getElementById('strikeLeft');
const strikeRight = document.getElementById('strikeRight');

const turnBox = document.getElementById('turnBox');
const backBtn = document.getElementById('backBtn');
const exitBtn = document.getElementById('exitBtn');
const resetBtn = document.getElementById('resetBtn');

const xLabel = document.getElementById('xLabel');
const oLabel = document.getElementById('oLabel');
const xScoreEl = document.getElementById('xScore');
const oScoreEl = document.getElementById('oScore');
const tieScoreEl = document.getElementById('tieScore');

const roundInfoEl = document.getElementById('roundInfo');

const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmText');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

const winnerOverlay = document.getElementById('winnerOverlay');
const winnerTitle = document.getElementById('winnerTitle');
const winnerText = document.getElementById('winnerText');
const playAgain = document.getElementById('playAgain');
const backMenu = document.getElementById('backMenu');

const confettiCanvas = document.getElementById('confettiCanvas');
let confettiCtx = confettiCanvas.getContext('2d');

/* ---------- State ---------- */
let twoPlayer = false;
let board = Array(9).fill(null);
let current = 'X';
let roundStarter = 'X'; // Tracks who starts the current round
let gameOver = false;
let scores = { X: 0, O: 0, T: 0 };
let WIN_GOAL = parseInt(winSlider.value, 10) || 3;
let roundNumber = 1;

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

/* ---------- Audio ---------- */
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let masterGain = null;
let soundOn = true;

function ensureAudio(){
  if(!audioCtx){
    audioCtx = new AudioCtx();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.9;
    masterGain.connect(audioCtx.destination);
  }
}

function clickSound(){
  if(!soundOn) return;
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "sine";
  o.frequency.value = 720;
  g.gain.setValueAtTime(0.001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.05, audioCtx.currentTime + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.12);
  o.connect(g);
  g.connect(masterGain);
  o.start();
  o.stop(audioCtx.currentTime + 0.13);
}

function winSound(){
  if(!soundOn) return;
  ensureAudio();
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = "triangle";
  o.frequency.value = 440;
  g.gain.setValueAtTime(0.001, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
  o.connect(g);
  g.connect(masterGain);
  o.start();
  o.stop(audioCtx.currentTime + 0.6);
}

function matchWinSound(){
  if(!soundOn) return;
  ensureAudio();
  const tones = [440,660,880];
  tones.forEach((freq,i)=>{
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime + i*0.03);
    g.gain.exponentialRampToValueAtTime(0.14, audioCtx.currentTime + 0.05 + i*0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6 + i*0.03);
    o.connect(g);
    g.connect(masterGain);
    o.start(audioCtx.currentTime + i*0.03);
    o.stop(audioCtx.currentTime + 0.6 + i*0.03);
  });
}

volumeBtn.addEventListener("click", () => {
  soundOn = !soundOn;
  volumeBtn.textContent = soundOn ? "🔊" : "🔇";
});

/* ---------- Labels ---------- */
function refreshLabels(){
  if(modeSwitch.checked){
    xLabel.textContent = "X (PLAYER 1)";
    oLabel.textContent = "O (PLAYER 2)";
  } else {
    xLabel.textContent = "X (YOU)";
    oLabel.textContent = "O (CPU)";
  }
}

function updateRoundInfo(){
  roundInfoEl.textContent = `ROUND ${roundNumber}   |   GOAL: ${WIN_GOAL}`;
}

function updateScores(){
  xScoreEl.textContent = `${scores.X} / ${WIN_GOAL}`;
  oScoreEl.textContent = `${scores.O} / ${WIN_GOAL}`;
  tieScoreEl.textContent = scores.T;
}

/* ---------- Confirm Modal ---------- */
function showConfirm(msg, cb){
  confirmText.textContent = msg;
  confirmModal.style.display = "flex";
  confirmYes.onclick = ()=>{ confirmModal.style.display="none"; cb(true); };
  confirmNo.onclick = ()=>{ confirmModal.style.display="none"; cb(false); };
}

/* ---------- Landing ---------- */
startBtn.addEventListener("click", () => {
  landing.style.display = "none";
  modeScreen.style.display = "flex";
});

backToLanding.addEventListener("click", () => {
  modeScreen.style.display = "none";
  landing.style.display = "block";
});

winSlider.addEventListener("input", e => {
  winVal.textContent = e.target.value;
  WIN_GOAL = parseInt(e.target.value, 10);
  updateScores();
  updateRoundInfo();
});

/* ---------- Start Game ---------- */
startGameBtn.addEventListener("click", () => {
  twoPlayer = modeSwitch.checked;
  modeScreen.style.display = "none";
  gameScreen.style.display = "block";

  refreshLabels();
  resetMatch();
  roundNumber = 1;
  roundStarter = "X"; // First round always starts with X

  updateRoundInfo();
  buildBoard();
});

/* ---------- Build Board ---------- */
function buildBoard(){
  board = Array(9).fill(null);
  current = roundStarter; // Set to the player designated to start this round
  gameOver = false;
  hideStrike();

  cellEls.forEach((c,i)=>{
    c.textContent = "";
    c.className = "cell";
    c.onclick = ()=> onCellClick(i);
  });

  updateTurn();

  // If it's CPU's turn to start the round, trigger it
  if(!twoPlayer && current === "O") {
    setTimeout(() => {
        cpuPlay();
    }, 600);
  }
}

/* ---------- Cell Click ---------- */
function onCellClick(i){
  if(gameOver) return;
  if(board[i]) return;

  if(!twoPlayer && current !== "X") return;

  clickSound();
  makeMove(i, current);

  if(!twoPlayer && !gameOver && current === "O"){
    setTimeout(()=>{
      cpuPlay();
    }, 400);
  }
}

function cpuPlay() {
  if (gameOver) return;
  let mv = computeBestMove(board, "O");
  if(mv === undefined || mv === null) mv = chooseRandomEmpty(board);
  clickSound();
  makeMove(mv, "O");
}

/* ---------- MAIN GAME LOGIC ---------- */
function makeMove(i, player){
  if(board[i]) return;

  board[i] = player;
  const el = cellEls[i];
  el.textContent = player;
  el.classList.add(player === "X" ? "x" : "o","disabled");

  const res = checkBoard(board);

  /* ---- WIN ---- */
  if(res.win){
    gameOver = true;
    animateSplitStrike(res.line).then(()=>{
      res.line.forEach(idx=> cellEls[idx].classList.add("win"));
      winSound();
    });

    scores[res.player]++;
    updateScores();
    disableAll();

    if(scores.X >= WIN_GOAL || scores.O >= WIN_GOAL){
      const w = scores.X >= WIN_GOAL ? "X" : "O";
      setTimeout(()=> showMatchWinner(w), 520);
    } else {
      turnBox.textContent = res.player + " WINS";
      setTimeout(()=>{
        startNextRound();
      }, 1200);
    }
    return;
  }

  /* ---- TIE ---- */
  if(res.tie){
    gameOver = true;
    scores.T++;
    updateScores();
    turnBox.textContent = "TIE";
    setTimeout(()=>{
      startNextRound();
    }, 1200);
    return;
  }

  /* ---- CONTINUE ---- */
  current = player === "X" ? "O" : "X";
  updateTurn();
}

/* ---------- Auto Next Round Function ---------- */
function startNextRound(){
  roundNumber++;
  // Toggle the starter for the next round
  roundStarter = (roundStarter === "X") ? "O" : "X";
  updateRoundInfo();
  buildBoard();
}

/* ---------- Utilities ---------- */
function disableAll(){ cellEls.forEach(c=> c.classList.add("disabled")); }

function updateTurn(){
  if(!gameOver) turnBox.textContent = `${current} TURN`;
}

resetBtn.addEventListener("click", () => {
  showConfirm("Restart this round?", ok=>{
    if(!ok) return;
    // If the round was already over, increment round count and flip starter
    if(gameOver) {
        startNextRound();
    } else {
        buildBoard(); // Just restart the same round
    }
  });
});

backBtn.addEventListener("click", () =>{
  showConfirm("Go back to mode select?", ok=>{
    if(!ok) return;
    gameScreen.style.display = "none";
    modeScreen.style.display = "flex";
  });
});

exitBtn.addEventListener("click", () =>{
  showConfirm("Exit to main menu?", ok=>{
    if(!ok) return;
    gameScreen.style.display = "none";
    landing.style.display = "block";
    resetMatch();
  });
});

/* ---------- Match Winner Overlay ---------- */
function showMatchWinner(player){
  winnerOverlay.style.display = "flex";
  const label = (player === "X") ? xLabel.textContent : oLabel.textContent;
  winnerTitle.textContent = "CONGRATULATIONS!";
  winnerText.textContent = `${label} reached ${WIN_GOAL} first — Match Won!`;
  matchWinSound();
  startConfetti();
}

playAgain.addEventListener("click", ()=>{
  stopConfetti();
  winnerOverlay.style.display = "none";
  resetMatch();
  roundNumber = 1;
  roundStarter = "X"; 
  updateRoundInfo();
  buildBoard();
});

backMenu.addEventListener("click", ()=>{
  stopConfetti();
  winnerOverlay.style.display = "none";
  gameScreen.style.display = "none";
  modeScreen.style.display = "flex";
  resetMatch();
});

/* ---------- Reset Match ---------- */
function resetMatch(){
  scores = {X:0,O:0,T:0};
  roundStarter = "X";
  updateScores();
}

/* ---------- Board Check ---------- */
function checkBoard(bd){
  for(const l of WIN_LINES){
    const [a,b,c] = l;
    if(bd[a] && bd[a]===bd[b] && bd[b]===bd[c]){
      return {win:true, player:bd[a], line:l};
    }
  }
  if(bd.every(v=>v!==null)) return {tie:true};
  return {win:false};
}

/* ---------- Strike Animation ---------- */
function hideStrike(){
  strikeLeft.classList.add("hidden");
  strikeRight.classList.add("hidden");
  strikeLeft.style.transform = "translate(-50%,-50%) scaleX(0)";
  strikeRight.style.transform = "translate(-50%,-50%) scaleX(0)";
}

function animateSplitStrike(line){
  return new Promise(resolve=>{
    const first = cellEls[line[0]].getBoundingClientRect();
    const last = cellEls[line[2]].getBoundingClientRect();
    const parent = boardEl.getBoundingClientRect();

    const x1 = first.left + first.width/2 - parent.left;
    const y1 = first.top + first.height/2 - parent.top;
    const x2 = last.left + last.width/2 - parent.left;
    const y2 = last.top + last.height/2 - parent.top;

    const dx = x2-x1, dy=y2-y1;
    const len = Math.sqrt(dx*dx + dy*dy) + 14;
    const angle = Math.atan2(dy, dx) * 180/Math.PI;

    const cx = (x1+x2)/2;
    const cy = (y1+y2)/2;
    const half = len/2;

    strikeLeft.classList.remove("hidden");
    strikeLeft.style.width = half+"px";
    strikeLeft.style.left = (cx-half/2)+"px";
    strikeLeft.style.top = cy+"px";
    strikeLeft.style.transformOrigin = "right center";
    strikeLeft.style.transition = "transform .36s";
    strikeLeft.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scaleX(0)`;

    strikeRight.classList.remove("hidden");
    strikeRight.style.width = half+"px";
    strikeRight.style.left = (cx+half/2)+"px";
    strikeRight.style.top = cy+"px";
    strikeRight.style.transformOrigin = "left center";
    strikeRight.style.transition = "transform .36s";
    strikeRight.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scaleX(0)`;

    void strikeLeft.offsetWidth;

    requestAnimationFrame(()=>{
      strikeLeft.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scaleX(1)`;
      strikeRight.style.transform = `translate(-50%,-50%) rotate(${angle}deg) scaleX(1)`;
    });

    strikeLeft.addEventListener("transitionend", ()=> resolve(), {once:true});
  });
}

/* ---------- CPU (Minimax) ---------- */
function computeBestMove(bd, player){
  if(bd.every(v=>v===null)) return 4;
  const best = minimax(bd, player);
  return best.index;
}

function minimax(bd, player){
  const res = checkMin(bd);
  if(res.win){
    if(res.player==="O") return {score:10};
    if(res.player==="X") return {score:-10};
  }
  if(res.tie) return {score:0};

  const avail = bd.map((v,i)=>v===null?i:null).filter(v=>v!==null);
  const moves = [];

  for(const idx of avail){
    const move = {index:idx};
    bd[idx] = player;
    const r = minimax(bd, player==="O"?"X":"O");
    move.score = r.score;
    bd[idx] = null;
    moves.push(move);
  }

  let bestMove;
  if(player === "O"){
    let bestScore = -Infinity;
    for(const m of moves) if(m.score > bestScore){ bestScore = m.score; bestMove = m; }
  } else {
    let bestScore = Infinity;
    for(const m of moves) if(m.score < bestScore){ bestScore = m.score; bestMove = m; }
  }
  return bestMove;
}

function checkMin(bd){
  for(const l of WIN_LINES){
    const [a,b,c] = l;
    if(bd[a] && bd[a]===bd[b] && bd[b]===bd[c]){
      return {win:true, player:bd[a]};
    }
  }
  if(bd.every(v=>v!==null)) return {tie:true};
  return {};
}

function chooseRandomEmpty(bd){
  const arr = bd.map((v,i)=>v===null?i:null).filter(v=>v!==null);
  return arr[Math.floor(Math.random()*arr.length)];
}

/* ---------- Confetti ---------- */
let confettiPieces=[];
let confettiAnim=null;

function startConfetti(){
  confettiCanvas.style.display = "block";
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiCtx = confettiCanvas.getContext("2d");
  confettiPieces=[];
  for(let i=0;i<140;i++){
    confettiPieces.push({
      x:Math.random()*confettiCanvas.width,
      y:Math.random()*-confettiCanvas.height,
      w:6+Math.random()*10,
      h:8+Math.random()*12,
      s:1+Math.random()*4,
      c:["#2ec4b6","#ffca3a","#ffffff","#ff6b6b","#ffd166"][Math.floor(Math.random()*5)],
      r:Math.random()*360
    });
  }
  function loop(){
    confettiCtx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    for(const p of confettiPieces){
      p.y += p.s;
      p.x += Math.sin(p.y*0.01)*2;
      p.r += 5;
      confettiCtx.save();
      confettiCtx.translate(p.x,p.y);
      confettiCtx.rotate(p.r * Math.PI/180);
      confettiCtx.fillStyle = p.c;
      confettiCtx.fillRect(-p.w/2,-p.h/2,p.w,p.h);
      confettiCtx.restore();
      if(p.y > confettiCanvas.height + 20){
        p.y = Math.random()*-confettiCanvas.height;
        p.x = Math.random()*confettiCanvas.width;
      }
    }
    confettiAnim = requestAnimationFrame(loop);
  }
  loop();
}

function stopConfetti(){
  if(confettiAnim) cancelAnimationFrame(confettiAnim);
  confettiCanvas.style.display = "none";
}

/* ---------- Keyboard Shortcuts ---------- */
document.addEventListener("keydown", e=>{
  if(e.key.toLowerCase()==="r") resetBtn.click();
  if(e.key.toLowerCase()==="s"){
    showConfirm("Return to mode select?", ok=>{
      if(!ok) return;
      gameScreen.style.display = "none";
      modeScreen.style.display = "flex";
    });
  }
});

/* ---------- Init ---------- */
(function init(){
  volumeBtn.textContent = soundOn ? "🔊" : "🔇";
  winVal.textContent = winSlider.value;
  refreshLabels();
  resetMatch();
  updateRoundInfo();
  updateScores();
})();
/* © Ashok-777 */
/* GitHub: https://github.com/Ashok-777 */
