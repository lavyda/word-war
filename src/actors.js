import * as Pixi from 'pixi.js'
import * as constants from './constants'

/**
 * Actor atlas URLs.
 */
const ENEMY_BIG = 'assets/images/enemy-big.json'
const ENEMY_MEDIUM = 'assets/images/enemy-medium.json'
const ENEMY_SMALL = 'assets/images/enemy-small.json'
const EXPLOSION = 'assets/images/explosion.json'
const LASER_BOLTS = 'assets/images/laser-bolts.json'
const SHIP = 'assets/images/ship.json'
const BACKGROUND = 'assets/images/background-small.png'

/**
 * Actors available. Composed from basic actor.
 */
const actor = (animation, type) => ({ animation, type })
const Bullet = (animation, target) => ({ ...actor(animation, 'bullet'), target})
const Enemy = (animation, word) => ({ ...actor(animation, 'enemy'), word })
const EnemyExplosive = (animation, word) => ({ ...actor(animation, 'enemy-explosive'), word })
const Ship = (animation, lives) => ({ ...actor(animation, 'ship'), lives })
const Explosion = (animation) => ({ ...actor(animation, 'explosion')})

/**
 * Actor Factory used to load assets and make actors.
 */
export const makeActorFactory = () => ({
    load: () => new Promise((resolve, reject) => Pixi.loader
        .add([
            ENEMY_BIG,
            ENEMY_MEDIUM,
            ENEMY_SMALL,
            EXPLOSION,
            LASER_BOLTS,
            SHIP,
            BACKGROUND
        ], { crossOrigin: true })
        .on('error', () => reject('Error loading resources.'))
        .load(() => resolve('All resources loaded.'))),
    makeBullet: (source, target) => {
        let bullet = new Bullet(makeAnimation(LASER_BOLTS, 2), target)
        bullet.animation.animationSpeed = 0.1
        /** Set position */
        bullet.animation.x = source.animation.x - source.animation.width / 2
        bullet.animation.y = source.animation.y - source.animation.height
        /** Set rotation */
        bullet.animation.anchor.set(0.5, 0.5)
        let angle = Math.atan2(source.animation.y - target.animation.y, source.animation.x - target.animation.x)
        bullet.animation.rotation = (Math.PI / 2 - angle) * -1
        /** Set speed based on distance between source and target */
        let speedRatio = constants.FRAMERATE / (constants.APP_HEIGHT_PX / (constants.APP_HEIGHT_PX - target.animation.y))
        bullet.animation.vx = (bullet.animation.x - target.animation.x - target.animation.width / 2) / speedRatio
        bullet.animation.vy = (bullet.animation.y - target.animation.y - target.animation.height) / speedRatio
        bullet.animation.play()
        return bullet
    },
    makeEnemy: (x, y, word) => {
        let wordAnim = makeWordAnimation(word)
        wordAnim.position.set(x, y - constants.TEXT_STYLE.fontSize - constants.TEXT_GAP_PX)
        let w = { animation: wordAnim, value: word }
        let enemy = new Enemy(makeAnimation(ENEMY_BIG, 2), w)
        enemy.animation.animationSpeed = 0.1
        enemy.animation.x = x
        enemy.animation.y = y
        enemy.animation.vy = constants.ENEMY_SPEED
        enemy.animation.play()
        return enemy
    },
    makeEnemyExplosive: (x, y, word) => {
        let wordAnim = makeWordAnimation(word)
        wordAnim.position.set(x, y - constants.TEXT_STYLE.fontSize - constants.TEXT_GAP_PX)
        let w = { animation: wordAnim, value: word }
        let enemy = new EnemyExplosive(makeAnimation(ENEMY_MEDIUM, 2), w)
        enemy.animation.animationSpeed = 0.1
        enemy.animation.x = x
        enemy.animation.y = y
        enemy.animation.vy = constants.ENEMY_EXPLOSIVE_SPEED
        enemy.animation.play()
        return enemy
    },
    makeShip: (x, y, lives) => {
        let ship = new Ship(makeAnimation(SHIP, 10), lives)
        ship.animation.animationSpeed = 0.1
        ship.animation.anchor.set(0.5)
        ship.animation.x = x
        ship.animation.y = y
        ship.animation.play()
        return ship
    },
    makeExplosion: (x, y, stage) => {
        let explosion = new Explosion(makeAnimation(EXPLOSION, 5))
        explosion.animation.animationSpeed = 0.1
        explosion.animation.x = x
        explosion.animation.y = y
        explosion.animation.loop = false
        explosion.animation.onComplete = () => stage.removeChild(explosion.animation)
        explosion.animation.play()
        return explosion
    }
})

/**
 * Create animation from atlas.
 * @param {*} url path to atlas
 * @param {*} frames number of animation frames
 */
const makeAnimation = (url, frames) => {
    // create an array of textures from an image path
    let textures = []
    let name = url.split('/')[url.split('/').length - 1].split('.')[0]
    for (let i = 1; i <= frames; i++) {
        // magically works since the spritesheet was loaded with the Pixi loader
        textures.push(Pixi.Texture.fromFrame(name + '-' + i + '.png'))
    }
    // create an AnimatedSprite
    let animation = new Pixi.extras.AnimatedSprite(textures);
    return animation
}

/**
 * Create animation text for word.
 * @param {} word 
 */
const makeWordAnimation = (word) => new Pixi.Text(word, constants.TEXT_STYLE)