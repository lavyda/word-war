export const APP_WIDTH_PX = 400;
export const APP_HEIGHT_PX = 600;
export const SHIP_POSITION_X_PX = APP_WIDTH_PX / 2;
export const SHIP_POSITION_Y_PX = APP_HEIGHT_PX - 30;
export const SHIP_FIRE_BOUNDRY_Y_PX = APP_HEIGHT_PX - 100;
export const ENEMY_POSITION_Y_PX = 30;
export const ENEMY_BOUNDRY_LEFT_PX = 100;
export const ENEMY_BOUNDRY_RIGHT_PX = APP_WIDTH_PX - ENEMY_BOUNDRY_LEFT_PX;
export const ENEMY_SPEED = 0.7;
export const ENEMY_EXPLOSIVE_SPEED = 1.2;
export const STATE_PLAYING = "PLAYING";
export const STATE_PAUSED = "PAUSED";
export const STATE_LOST = "LOST";
export const STATE_READY = "READY";
export const FRAMERATE = 60;
export const TEXT_GAP_PX = 4;
export const ENEMY_SPAWN_TIME_MS_MAX = 6000;
export const ENEMY_SPAWN_TIME_MS_INTERVAL = 3000;
export const ENEMY_EXPLOSIVE_SPAWN_TIME_MS_MIN = 30000;
export const ENEMY_EXPLOSIVE_SPAWN_TIME_MS_MAX = 60000;
export const ENEMY_WORD_LENGTH = 4;
export const ENEMY_WORD_INTERVAL = 2;
export const LEVEL_LENGTH_TIME_MS = 10000;
export const SCORE_HIT_PTS = 10;
export const SCORE_MISS_PTS = -5;
export const SCORE_TIME_PTS = 1;
export const SCORE_TIME_MS = 1000;
export const TEXT_STYLE = {
    fontFamily: "Roboto",
    fontSize: 16,
    fill: "#B3E5FC",
    align: "left",
    letterSpacing: 1
  };
  export const TEXT_STYLE_SCORE = {
    fontFamily: "Roboto",
    fontSize: 18,
    fill: "#FFCCBC",
    align: "left",
    fontWeight: "bold",
    letterSpacing: 1
  };
  export const TEXT_STYLE_GAME_OVER = {
    fontFamily: "Roboto",
    fontSize: 18,
    fill: "#FFCCBC",
    align: "center",
    fontWeight: "bold",
    letterSpacing: 1
  };
  export const TEXT_STYLE_FINAL_SCORE = {
    fontFamily: "Roboto",
    fontSize: 18,
    fill: "#F5F5F5",
    align: "center",
    fontWeight: "bold",
    letterSpacing: 1
  };
  export const TEXT_STYLE_FINAL_SCORE_VALUE = {
    fontFamily: "Roboto",
    fontSize: 28,
    fill: "#F5F5F5",
    align: "center",
    fontWeight: "bold",
    letterSpacing: 1
  };
  export const TEXT_STYLE_PLAY_AGAIN = {
    fontFamily: "Roboto",
    fontSize: 28,
    fill: "#B3E5FC",
    align: "center",
    fontWeight: "bold",
    letterSpacing: 1
  };