import * as Pixi from 'pixi.js'
import { words } from './words'
import { makeActorFactory } from './actors'
import * as constants from './constants'

/** 
 * Hold game data and perform core operations
 * @return game
 */
export const makeGame = () => {
    /** Pixi application instance */
    let app = new Pixi.Application(constants.APP_WIDTH_PX, constants.APP_HEIGHT_PX)
    /** Factory for actors with animations */
    let actorFactory = makeActorFactory()
    /** List of all bullets */
    let bullets = []
    /** List of all spawned enemies */
    let enemies = []
    /** Enemy beiing currently destroyed */
    let selected = null
    /** Players ship */
    let ship = null
    /** Game state */
    let state = constants.STATE_READY
    /** Current max time for enemy spawn in ms*/
    let spawnMax = constants.ENEMY_SPAWN_TIME_MS_MAX
    /** Time needed to elapse to spawn new enemy in ms */
    let spawnCounter = 0
    /** Time needed to elapse to spawn new explosive enemy in ms */
    let spawnEnemyExplosiveCounter = Math.random() * 
        (constants.ENEMY_EXPLOSIVE_SPAWN_TIME_MS_MAX - constants.ENEMY_EXPLOSIVE_SPAWN_TIME_MS_MIN) + 
        constants.ENEMY_EXPLOSIVE_SPAWN_TIME_MS_MIN
    /** Current level */
    let level = 1
    /** Level length counter */
    let levelCounter = constants.LEVEL_LENGTH_TIME_MS
    /** Total time elapsed since game start in ms */
    let totalTimeElapsed = 0
    /** Maximum word length to spawn */
    let maxWordLength = constants.ENEMY_WORD_LENGTH
    /** Score */
    let score = { animation: null, value: 0, counter: 0 }

    /** 
     * Create bullet and add it to stage and game
     */   
    const fire = () => {
        let bullet = actorFactory.makeBullet(ship, selected)
        selected.word.value = selected.word.value.substr(1)
        app.stage.removeChild(selected.word.animation)
        selected.word.animation = new Pixi.Text(selected.word.value, constants.TEXT_STYLE)
        app.stage.addChild(selected.word.animation)
        app.stage.addChild(bullet.animation)
        bullets = [...bullets, bullet]
    }

    /** 
     * Move enemies 
     */    
    const moveEnemies = () => enemies.map(enemy => {
        enemy.word.animation.position.set(
            enemy.animation.x - (enemy.word.animation.width - enemy.animation.width) / 2, 
            enemy.animation.y - constants.TEXT_STYLE.fontSize - constants.TEXT_GAP_PX + enemy.animation.vy)
        enemy.animation.y += enemy.animation.vy
    })

    /**
     * Move bullets
     */
    const moveBullets = () => bullets.map(bullet => {
            bullet.animation.y -= bullet.animation.vy
            bullet.animation.x -= bullet.animation.vx
        })
    
    /** 
     * Check bullets collision with enemies
     */
    const checkCollsions = () => {
        bullets.map(bullet => {
            if (bullet.animation.x < bullet.target.animation.x + bullet.target.animation.width &&
                bullet.animation.x + bullet.animation.width > bullet.target.animation.x &&
                bullet.animation.y < bullet.target.animation.y + bullet.target.animation.height &&
                bullet.animation.y + bullet.animation.height > bullet.target.animation.y) {
                /** Remove bullet from stage */
                    app.stage.removeChild(bullet.animation)
             }
        })
        /** Remove hit bullets from game */
        bullets = bullets.filter(bullet => bullet.target)
    }

    /**
     * Check if given character is hit
     * @param char char
     */
    const checkHit = (char) => {
        if (selected) {
            /** Don't fire if enemy is too close to ship */
            if(selected.animation.y > constants.SHIP_FIRE_BOUNDRY_Y_PX) {
                return
            }
            /** Remove first selected character if eqauls given character */
            if (selected.word.value[0] === char) {
                editScore(constants.SCORE_HIT_PTS)
                fire()
            } else {
                editScore(constants.SCORE_MISS_PTS)
            }
            if (selected.word.value.length === 0) {
                switch(selected.type) {
                    case 'enemy':
                        /** Deselect enemy and remove it from stage and game */
                        app.stage.removeChild(selected.animation)
                        app.stage.removeChild(selected.word.animation)
                        let explosion = actorFactory.makeExplosion(selected.animation.x, selected.animation.y, app.stage)
                        app.stage.addChild(explosion.animation)
                        enemies = enemies.filter((enemy) => enemy.word.value.length > 0)
                        break
                    case 'enemy-explosive':
                        /** Deselect enemy, remove all enemies from stage and game, add score and lower level */
                        enemies.map(enemy => {
                            editScore(enemy.word.value.length * constants.SCORE_HIT_PTS)
                            app.stage.removeChild(enemy.animation)
                            app.stage.removeChild(enemy.word.animation)
                            let explosion = actorFactory.makeExplosion(enemy.animation.x, enemy.animation.y, app.stage)
                            app.stage.addChild(explosion.animation)
                        })
                        enemies = []
                        levelDown()
                    break
                    default:
                }
                selected = null
            }
        } else {
            /** Select new enemy from list based on given character */
            for(let enemy of enemies) {
                if(enemy.word.value[0] === char && enemy.animation.y <= constants.SHIP_FIRE_BOUNDRY_Y_PX) {
                    selected = enemy
                    editScore(constants.SCORE_HIT_PTS)
                    fire()
                    break
                }
            }
        }
    }

    /** 
     * Set game state to lost when game over
     */
    const checkLost = () => {
        for(let enemy of enemies) {
            if(enemy.animation.y + enemy.animation.height >= constants.APP_HEIGHT_PX) {
                state = constants.STATE_LOST
                break
            }
        }
    }

    /**
     *  Main game loop 
     */
    const loop = (delta) => {
        switch(state) {
            case constants.STATE_READY:
                renderReady()
                break
            case constants.STATE_PLAYING:
                handleCounters()
                renderScore()
                spawnEnemies()
                moveEnemies()
                moveBullets()
                checkCollsions()
                checkLost()
                break
            case constants.STATE_PAUSED:
                break
            case constants.STATE_LOST:
                renderLost()
                break
            default:
        }
    }

    /**
     * Spawn enemy with random word on random x position
     * @param enemy string type of enemy to spawn (enemy or enemy-explosive)
     */
    const spawnEnemy = (type) => {
        /** Get random word for enemy that isn't already in use */
        let index, word, canSpawn
        do {
            canSpawn = true
            index = Math.floor(Math.random() * words.length)
            word = words[index].toLowerCase()
            if(word.length > maxWordLength) {
                canSpawn = false
                continue
            }
            for(let enemy of enemies) {
                if(enemy.word.value[0] === word[0] || enemy.word.value === word) {
                    canSpawn = false
                    break
                }
            }
        } while(!canSpawn)
        /** Add created enemy to game */
        const x = Math.floor(Math.random() * (constants.ENEMY_BOUNDRY_RIGHT_PX - constants.ENEMY_BOUNDRY_LEFT_PX)) + constants.ENEMY_BOUNDRY_LEFT_PX
        let enemy
        switch(type) {
            case 'enemy':
                enemy = actorFactory.makeEnemy(x, constants.ENEMY_POSITION_Y_PX, word)
                break
            case 'enemy-explosive':
                enemy = actorFactory.makeEnemyExplosive(x, constants.ENEMY_POSITION_Y_PX, word)
                break
            default:
        }
        enemies = [...enemies, enemy]
        app.stage.addChild(enemy.animation)
        app.stage.addChild(enemy.word.animation)
    }

    /**
     * Spawn all enemies
     */
    const spawnEnemies = () => {
        if(spawnCounter <= 0) {
            /** Get random spawn time for next enemy, can't be less than one second */
            let min = spawnMax - constants.ENEMY_SPAWN_TIME_MS_INTERVAL
            if(min < 1000) {
                min = 1000
            }
            spawnCounter = Math.random() * (spawnMax - min) + min
            spawnEnemy('enemy')
        }
        if(spawnEnemyExplosiveCounter <= 0) {
            /** Get random spawn time for next explosive enemy */
            spawnEnemyExplosiveCounter = 
                Math.random() * 
                (constants.ENEMY_EXPLOSIVE_SPAWN_TIME_MS_MAX - constants.ENEMY_EXPLOSIVE_SPAWN_TIME_MS_MIN) + 
                constants.ENEMY_EXPLOSIVE_SPAWN_TIME_MS_MIN
            spawnEnemy('enemy-explosive')
        }
    }

    /** 
     * Initialize game 
     * @returns promise with game view or error
     */
    const init = () => {
        handleInput()
        /** Start Pixi application */
        app.start()
        /** Load assets */
        return new Promise((resolve, reject) =>
            actorFactory.load().then(() => {
                app.ticker.add(delta => loop(delta))
                resolve(app.view)
            }).catch(() => reject('Error loading assets.'))
        )
    }

    /** 
     * Start new game
     */
    const start = () => {
        /** Set starting values */
        bullets = []
        enemies = []
        selected = null
        ship = null
        state = constants.STATE_PLAYING
        spawnMax = constants.ENEMY_SPAWN_TIME_MS_MAX
        spawnCounter = 0
        level = 1
        levelCounter = constants.LEVEL_LENGTH_TIME_MS
        totalTimeElapsed = 0
        maxWordLength = constants.ENEMY_WORD_LENGTH
        score = { animation: null, value: 0, counter: 0 }
        /** Remove all children */
        app.stage.children.map(c => app.stage.removeChild(c))
        /** Add background to stage */
        const background = new Pixi.Sprite(Pixi.utils.TextureCache['assets/images/background-small.png'])
        app.stage.addChild(background)
        /** Add created ship to game */
        ship = actorFactory.makeShip(constants.SHIP_POSITION_X_PX + 8, constants.SHIP_POSITION_Y_PX, 1)
        app.stage.addChild(ship.animation)
    }

    /**
     * Puase or resume game
     */
    const togglePause = () => {
        switch(state) {
            case constants.STATE_PLAYING:
                state = constants.STATE_PAUSED
                /** Stop animations */
                enemies.map(enemy => enemy.animation.stop())
                bullets.map(bullet => bullet.animation.stop())
                ship.animation.stop()
                break
            case constants.STATE_PAUSED:
                /** Start animations */
                state = constants.STATE_PLAYING
                enemies.map(enemy => enemy.animation.play())
                bullets.map(bullet => bullet.animation.play())
                ship.animation.play()
                break
            default:
        }
    }

    /**
     * Add level and
     * decrease enemy spawn range if odd level or increase max word length if even level
     */
    const levelUp = () => {
        level++
        /** Enemy spawn range can't be less than one second */
        if(level % 2 && spawnMax - 1000 > 1000 ) {
            spawnMax -= 1000
        } else {
            maxWordLength += constants.ENEMY_WORD_INTERVAL
        }
    }

     /**
     * Remove level and
     * decrease enemy spawn time if odd level or increase max word length if even level
     */
    const levelDown = () => {
        /** Level can't be less than one */
        if(level === 1) {
            return
        }
        level--
        if(level % 2) {
            maxWordLength -= constants.ENEMY_WORD_INTERVAL
        } else {
            spawnMax += 1000
        }
    }
    
    /**
     * Increase or decrease score 
     */
    const editScore = value => {
        if(score.value + value <= 0) {
            score.value = 0
        } else {
            score.value += value
        }
    }

    /**
     * Render score
     */
    const renderScore = () => {
        app.stage.removeChild(score.animation)
        score.animation = new Pixi.Text(score.value, constants.TEXT_STYLE_SCORE)
        score.animation.position.set((constants.APP_WIDTH_PX - score.animation.width) / 2, 10)
        app.stage.addChild(score.animation)
    }

    /** Render lost screen */
    const renderLost = () => {
        app.stage.children.map(c => app.stage.removeChild(c))
        const background = new Pixi.Sprite(Pixi.utils.TextureCache['assets/images/background-small.png'])        
        app.stage.addChild(background)
        const t = new Pixi.Text('Game Over', constants.TEXT_STYLE_GAME_OVER)
        t.position.set(constants.APP_WIDTH_PX / 2 - t.width / 2, 50)
        app.stage.addChild(t)
        const s = new Pixi.Text('Final Score ', constants.TEXT_STYLE_FINAL_SCORE)
        s.position.set(constants.APP_WIDTH_PX / 2 - s.width / 2, 170)
        app.stage.addChild(s)
        const v = new Pixi.Text(score.value, constants.TEXT_STYLE_FINAL_SCORE_VALUE)
        v.position.set(constants.APP_WIDTH_PX / 2 - v.width / 2, 230)
        app.stage.addChild(v)
        const p = new Pixi.Text('Play Again', constants.TEXT_STYLE_PLAY_AGAIN)
        p.position.set(constants.APP_WIDTH_PX / 2 - p.width / 2, constants.APP_HEIGHT_PX / 2)
        p.buttonMode = true
        p.interactive = true
        p.on('pointerup', () => start())
        app.stage.addChild(p)
    }

    const renderReady = () => {
        const background = new Pixi.Sprite(Pixi.utils.TextureCache['assets/images/background-small.png'])   
        app.stage.addChild(background)
        const s = new Pixi.Text('Word War', constants.TEXT_STYLE_FINAL_SCORE_VALUE)
        s.position.set(constants.APP_WIDTH_PX / 2 - s.width / 2, 200)
        app.stage.addChild(s)
        const p = new Pixi.Text('Play', constants.TEXT_STYLE_PLAY_AGAIN)
        p.position.set(constants.APP_WIDTH_PX / 2 - p.width / 2, constants.APP_HEIGHT_PX / 2)
        p.buttonMode = true
        p.interactive = true
        p.on('pointerup', () => start())
        app.stage.addChild(p)
        const t = new Pixi.Text('Retype text to survive and \n gain the highest score',constants.TEXT_STYLE_FINAL_SCORE)
        t.position.set(constants.APP_WIDTH_PX / 2 - t.width / 2, 400)
        app.stage.addChild(t)
    }

    /** 
     * Manage spawn and score counters
     */
    const handleCounters = () => {
        totalTimeElapsed += app.ticker.elapsedMS
        spawnCounter -= app.ticker.elapsedMS
        spawnEnemyExplosiveCounter -= app.ticker.elapsedMS
        score.counter += app.ticker.elapsedMS
        if(score.counter >= constants.SCORE_TIME_MS) {
            score.counter = 0
            editScore(constants.SCORE_TIME_PTS)
        }
        levelCounter -= app.ticker.elapsedMS
        if(levelCounter <= 0) {
            levelUp()
            levelCounter = constants.LEVEL_LENGTH_TIME_MS
        }
    }

    /**
     * Handle user input
     */
    const handleInput = () =>
        window.addEventListener('keydown', event => {
            if(event.key.toLowerCase() === 'escape') {
                event.preventDefault()
                togglePause()
            } else if(/[a-zA-Z]/.test(event.key)) {
                event.preventDefault()
                checkHit(event.key.toLowerCase())
            } else {
            }
        }, false)
    
    return {init}
}