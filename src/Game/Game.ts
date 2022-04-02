

export class Game {
    
    public isRunning: boolean;
    

    constructor() {
        this.isRunning = true;
    }


    public Run(){
        console.log("Running");
        while(this.isRunning) {
            // this.Render();
            // this.Update();
        }
    }

    public Render(){}

    public Update(){}

    public Deconstructor(){}
}