/*----- constants -----*/
const timer = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longbreakInterval: 4,
  sessions: 0,
}
/*----- app's state (variables) -----*/
let interval
let isPause = false
/*----- cached element references -----*/
const modeButtons = document.querySelector('#js-mode-buttons')
const min = document.getElementById('js-minutes')
const sec = document.getElementById('js-seconds')
const mainButton = document.getElementById('js-start')
const sessionNumber = document.querySelector('.session')
const reset = document.getElementById('js-reset')
const progress = document.getElementById('js-progress')
const buttonSound = new Audio('/assets/sound/Pop-sound-effect.mp3')

/*----- event listeners -----*/
modeButtons.addEventListener('click', handleMode)
mainButton.addEventListener('click', () => {
  buttonSound.currentTime = 0
  buttonSound.play()
  const { action } = mainButton.dataset
  if (action === 'start') {
    startTimer()
    isPause = false
  } else {
    stopTimer()
    isPause = true
  }
})

//set mode and remaining time properties on the time object
document.addEventListener('DOMContentLoaded', () => {
  switchMode('pomodoro')
})
reset.addEventListener('mousedown', () => {
  buttonSound.currentTime = 0
  buttonSound.play()
  stopTimer()
  sessionNumber.innerText = 'Session:'
  reset.classList.add('active')
  document.getElementById('js-pomodoro').click()
  timer.sessions = 0
  isPause = false
  updateClock()
})
reset.addEventListener('mouseup', () => {
  reset.classList.remove('active')
})
/*----- functions -----*/
function getRemainingTime(end) {
  //find the difference between the end time and currenttime, crucial for this app//
  const currentTime = Date.parse(new Date())
  const difference = end - currentTime

  const total = Number.parseInt(difference / 1000, 10)
  const minutes = Number.parseInt((total / 60) % 60, 10)
  const seconds = Number.parseInt(total % 60, 10)

  return {
    total,
    minutes,
    seconds,
  }
}

function startTimer() {
  document.querySelector(`[data-sound="${timer.mode}"]`).play()
  let { total } = timer.remainingTime
  //get the exact time in the future when the timer will end
  const end = Date.parse(new Date()) + total * 1000

  if (timer.mode === 'pomodoro' && isPause === false) timer.sessions++

  //visual//
  mainButton.dataset.action = 'pause'
  mainButton.innerText = 'pause'
  mainButton.classList.add('active')

  //session visual//
  if (
    timer.mode === 'pomodoro' &&
    timer.sessions % timer.longbreakInterval === 0
  ) {
    sessionNumber.innerText = `Session: ${timer.longbreakInterval}/${timer.longbreakInterval}`
  } else {
    sessionNumber.innerText = `Session: ${
      timer.sessions % timer.longbreakInterval
    }/${timer.longbreakInterval}`
  }

  //update the clock every second
  interval = setInterval(() => {
    timer.remainingTime = getRemainingTime(end)
    updateClock()

    total = timer.remainingTime.total
    if (total <= 0) {
      clearInterval(interval)

      //change to long break based on the session interval, default: 4//
      switch (timer.mode) {
        case 'pomodoro':
          if (timer.sessions % timer.longbreakInterval === 0) {
            switchMode('longBreak')
          } else {
            switchMode('shortBreak')
          }
          break
        default:
          switchMode('pomodoro')
      }
      startTimer()
    }
  }, 1000)
}

function stopTimer() {
  clearInterval(interval)
  //visual//
  mainButton.dataset.action = 'start'
  mainButton.innerText = 'start'
  mainButton.classList.remove('active')
}

function updateClock() {
  //destructuring object//
  const { remainingTime } = timer
  //padding the first digit with 0 if necessarry//
  const minutes = `${remainingTime.minutes}`.padStart(2, '0')
  const seconds = `${remainingTime.seconds}`.padStart(2, '0')

  min.innerText = minutes
  sec.innerText = seconds

  const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!'
  document.title = `${minutes}:${seconds} - ${text}`

  progress.value = timer[timer.mode] * 60 - timer.remainingTime.total
}

function switchMode(mode) {
  //initalise the clock to the corresponding mode
  timer.mode = mode
  //add the remaining time property to the corresponding mode
  timer.remainingTime = {
    total: timer[mode] * 60,
    minutes: timer[mode],
    seconds: 0,
  }
  //css visual//
  document
    .querySelectorAll('button[data-mode]')
    .forEach((e) => e.classList.remove('active'))
  document.querySelector(`[data-mode="${mode}"]`).classList.add('active')
  document.body.style.backgroundColor = `var(--${mode})`
  document
    .getElementById(`js-progress`)
    .setAttribute('max', timer.remainingTime.total)
  updateClock()
}

function handleMode(e) {
  //dataset is an object//
  const { mode } = e.target.dataset

  if (!mode) return
  switchMode(mode)
  stopTimer()
}
