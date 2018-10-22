export default class playerStats{
    constructor(){
        this.maxHealth = 100.0;
        this.currentHealth = this.maxHealth;
        this.moveSpeed = 0.002;
        this.points = 0;
        this.invincible = false;
    }
    removeHealth(){
        this.currentHealth -= 10;
    }
    checkLose(){
        if(this.currentHealth <= 0){
            return true;
        }
        return false;
    }
}