import { makeGame } from './main'

(canvas => {
    /** Create, start and add game to DOM */
    const game = makeGame()
    game.init()
        .then(view => canvas.appendChild(view))
        .catch(error => canvas.innerHTML = `<h3>${error}</h3>`)
})(document.getElementById('canvas'))