import RigidBodyComponent from "../Components/RigidBodyComponent";
import { Entity, Component, System, Registry, ComponentType } from "../ECS/ECS";

export class Game {
    
    public isRunning: boolean;
    public registry : Registry;

    constructor() {
        this.isRunning = true;
        this.registry = new Registry();
    }


    public Run(){
        console.log("Running");

        const car : Entity = this.registry.CreateEntity();
        
        car.AddComponent("RigidBodyComponent", 1,2);
        // this.registry.AddComponent<RigidBodyComponent, any>("RigidBodyComponent",car, 1,2);
        // const rigidBodyComponent : RigidBodyComponent = new Component<RigidBodyComponent>(1,1);
        // while(this.isRunning) {
        //     // this.Render();
        //     // this.Update();
        // }
    }

    public Render(){}

    public Update(){}

    public Deconstructor(){}
}