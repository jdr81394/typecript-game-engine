import { Component as ReactComponent } from "react";
import RigidBodyComponent from "../Components/RigidBodyComponent";
import { Entity, Component, System, Registry, ComponentType } from "../ECS/ECS";

interface GameState {
    isRunning: boolean;
    registry: Registry;
    windowHeight: number,
    windowWidth: number
};

export class Game extends ReactComponent {
    
    state : GameState = {
        isRunning: false,
        registry : new Registry(),
        windowHeight: 0,
        windowWidth: 0
    }


    constructor(props: any = null) {
        super(props);
        this.Run();
        this.handleResize = this.handleResize.bind(this);

    }

    componentDidMount() {
        console.log("component did mount, state: " , this.state);
        if(this.state.isRunning === false ) 
            this.setState({
                isRunning: true
            });

        this.setListeners();
    }

    componentDidUpdate() {

    }

    private setListeners() {
        window.addEventListener("resize", this.handleResize);
    }

    private removeListeners(){
        window.removeEventListener("resize", this.handleResize);
    }

    public handleResize() {
        const { innerHeight, innerWidth } = window;
        this.setState({
            windowHeight: innerHeight,
            windowWidth: innerWidth
        })
    }

    private Run(){
        console.log("Running");

        const car : Entity = this.state.registry.CreateEntity();
        car.AddComponent("RigidBodyComponent", 32,32, 32,32);
        console.log(car);
        // this.registry.AddComponent<RigidBodyComponent, any>("RigidBodyComponent",car, 1,2);
        // const rigidBodyComponent : RigidBodyComponent = new Component<RigidBodyComponent>(1,1);
        // while(this.isRunning) {
        //     // this.Render();
        //     // this.Update();
        // }
    }

    private Destroy (){
        this.removeListeners();
    }

    render() {
        return(<div>
            game
        </div>)
    }
}

// var instance = Object.create(this.context[name].prototype);
// instance.constructor.apply(instance, args);
// return instance;